// ═══════════════════════════════════════════════════════════════════════
// S3E — Storage Efficient Substring Searchable Symmetric Encryption
// Based on Leontiadis & Li (2017): https://eprint.iacr.org/2017/153.pdf
//
// All crypto runs CLIENT-SIDE. Server only stores/searches encrypted data.
// ═══════════════════════════════════════════════════════════════════════

const S3E_SECRET = "vault-encryption-secret-key-2026"; // Same master secret
const WIN = 2; // Bucket window size (reduced for broader match support)

// ─── HELPER: Derive HMAC key via PBKDF2 ─────────────────────────────
async function deriveHMACKey(secret, salt) {
    const enc = new TextEncoder();
    const km = await crypto.subtle.importKey(
        "raw", enc.encode(secret), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
        km, { name: "HMAC", hash: "SHA-256", length: 256 }, false, ["sign"]
    );
}

// ─── HELPER: Derive AES-GCM key via PBKDF2 ──────────────────────────
async function deriveAESKey(secret, salt) {
    const enc = new TextEncoder();
    const km = await crypto.subtle.importKey(
        "raw", enc.encode(secret), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
        km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
}

// ─── HELPER: HMAC-SHA256 sign → hex string ──────────────────────────
function bufToHex(buf) {
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function prfHMAC(key, message) {
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    return bufToHex(sig);
}

// ─── HELPER: AES-GCM encrypt string → base64 ────────────────────────
async function skeEncrypt(key, plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)
    );
    const combined = new Uint8Array(iv.length + new Uint8Array(ct).length);
    combined.set(iv);
    combined.set(new Uint8Array(ct), iv.length);
    return btoa(String.fromCharCode(...combined));
}

// ─── HELPER: AES-GCM decrypt base64 → string ────────────────────────
async function skeDecrypt(key, b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const ct = raw.slice(12);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(pt);
}

// ═══════════════════════════════════════════════════════════════════════
// KEY GENERATION (Paper: Algorithm 1 — KeyGen)
// Derives sub-keys from master secret for different S3E operations.
// ═══════════════════════════════════════════════════════════════════════
async function s3eKeyGen() {
    return {
        kf: await deriveHMACKey(S3E_SECRET, "s3e-prf-fm"),      // PRF for FM-index tags
        ke: await deriveAESKey(S3E_SECRET, "s3e-ske-positions"), // SKE for SA positions
        kd: await deriveAESKey(S3E_SECRET, "s3e-ske-dummy"),     // SKE for dummy metadata
    };
}

// ═══════════════════════════════════════════════════════════════════════
// BUCKETIZE: Split string into overlapping windows of size `win`
// "hackathon" → ["ha","ac","ck","ka","at","th","ho","on"]
// ═══════════════════════════════════════════════════════════════════════
function bucketize(str, win = WIN) {
    const s = str.toLowerCase();
    if (s.length < win) return [s.padEnd(win, "\x00")];
    const out = [];
    for (let i = 0; i <= s.length - win; i++) out.push(s.substring(i, i + win));
    return out;
}

// ═══════════════════════════════════════════════════════════════════════
// ADD DUMMIES: APPEND ~20% random dummy buckets at the END
// CRITICAL: Dummies must go at the end, not between real buckets,
// otherwise contiguous bucket sequences break and multi-bucket
// (long) queries will never match. (Paper Section 4.1 — simplified)
// ═══════════════════════════════════════════════════════════════════════
function addDummies(buckets, ratio = 0.2) {
    const num = Math.max(1, Math.ceil(buckets.length * ratio));
    const result = [...buckets];
    const dummyPositions = [];
    const chars = "!@#$%^&*0123456789";
    for (let i = 0; i < num; i++) {
        let d = "\x01";
        for (let j = 0; j < WIN - 1; j++) d += chars[Math.floor(Math.random() * chars.length)];
        dummyPositions.push(result.length); // Track position before pushing
        result.push(d);                      // Append at end — preserves real bucket order
    }
    return { padded: result, dummyPositions, dummyCount: num };
}

// ═══════════════════════════════════════════════════════════════════════
// SUFFIX ARRAY: Basic sort-based O(n² log n) — fine for n ≤ 10k
// ═══════════════════════════════════════════════════════════════════════
function buildSuffixArray(buckets) {
    const n = buckets.length;
    const idx = Array.from({ length: n }, (_, i) => i);
    idx.sort((a, b) => {
        for (let k = 0; k < n; k++) {
            const ia = a + k, ib = b + k;
            if (ia >= n && ib >= n) return 0;
            if (ia >= n) return -1;
            if (ib >= n) return 1;
            if (buckets[ia] < buckets[ib]) return -1;
            if (buckets[ia] > buckets[ib]) return 1;
        }
        return 0;
    });
    return idx;
}

// ═══════════════════════════════════════════════════════════════════════
// FM-INDEX: Build F (sorted first col) and L (BWT last col) columns
// ═══════════════════════════════════════════════════════════════════════
function buildFMIndex(buckets, sa) {
    const n = buckets.length;
    const F = sa.map(i => buckets[i]);
    const L = sa.map(i => buckets[(i - 1 + n) % n]);
    return { F, L };
}

// ═══════════════════════════════════════════════════════════════════════
// PREPROCESS (Paper: Algorithm 2 — PreProcess)
//
// Input:  plaintext string
// Output: SES (Searchable Encrypted Structure) — JSON-safe object
//
// Flow: bucketize → add dummies → suffix array → FM-index →
//       encrypt FM with PRF → encrypt SA with SKE → package
// ═══════════════════════════════════════════════════════════════════════
export async function s3ePreProcess(plaintext, win = WIN) {
    const keys = await s3eKeyGen();

    // 1. Bucketize into overlapping windows
    const rawBuckets = bucketize(plaintext, win);

    // 2. Add ~20% random dummy buckets (paper Section 4.1)
    const { padded, dummyPositions, dummyCount } = addDummies(rawBuckets);
    const n = padded.length;

    // 3. Build suffix array (paper Section 3.2)
    const sa = buildSuffixArray(padded);

    // 4. Build FM-index: F and L columns (paper Section 3.3)
    const { F, L } = buildFMIndex(padded, sa);

    // 5. Encrypt FM-index with PRF (HMAC-SHA256)
    //    enc_fm[i].f = PRF(kf, F[i]) — allows token-based equality check
    //    enc_fm[i].l = PRF(kf, L[i]) — server compares without knowing plaintext
    const enc_fm = [];
    for (let i = 0; i < n; i++) {
        enc_fm.push({
            f: await prfHMAC(keys.kf, F[i]),
            l: await prfHMAC(keys.kf, L[i]),
        });
    }

    // 6. Encrypt SA positions with SKE (AES-256-GCM)
    //    Server cannot read actual positions
    const enc_sa = [];
    for (let i = 0; i < n; i++) {
        enc_sa.push(await skeEncrypt(keys.ke, String(sa[i])));
    }

    // 7. Encrypt dummy metadata so client can later filter results
    const enc_dummy = await skeEncrypt(
        keys.kd,
        JSON.stringify({ positions: dummyPositions, count: dummyCount })
    );

    // 8. Return SES
    return { n, win, enc_fm, enc_sa, enc_dummy };
}

// ═══════════════════════════════════════════════════════════════════════
// SEARCH TOKEN GENERATION (Paper: Algorithm 3 — SrchToken)
//
// Input:  query string (>= 2 chars with WIN=2)
// Output: array of PRF tokens (one per query bucket)
//
// These tokens let the server do FM backward search by comparing
// against enc_fm entries — without ever seeing plaintext buckets.
// Supports: substring, startsWith, endsWith, exact — all via FM-index.
// ═══════════════════════════════════════════════════════════════════════
export async function s3eSrchToken(query, win = WIN) {
    if (query.length < win) {
        // For very short queries (1 char with WIN=2), pad to min window
        query = query.padEnd(win, "\x00");
    }
    const keys = await s3eKeyGen();
    const qBuckets = bucketize(query, win);
    const tokens = [];
    for (const b of qBuckets) {
        tokens.push(await prfHMAC(keys.kf, b));
    }
    return tokens;
}

// ═══════════════════════════════════════════════════════════════════════
// DECRYPT RESULTS (Paper: Algorithm 5 — DecryptResults)
//
// Input:  encrypted SA positions from server + encrypted dummy info
// Output: real character positions in the original plaintext
// ═══════════════════════════════════════════════════════════════════════
export async function s3eDecryptResults(encPositions, encDummy) {
    const keys = await s3eKeyGen();

    // 1. Decrypt each SA position
    const rawPositions = [];
    for (const ep of encPositions) {
        rawPositions.push(parseInt(await skeDecrypt(keys.ke, ep), 10));
    }

    // 2. Decrypt dummy metadata
    const dummyInfo = JSON.parse(await skeDecrypt(keys.kd, encDummy));
    const dummySet = new Set(dummyInfo.positions);

    // 3. Filter out dummy positions and adjust offsets
    const adjusted = [];
    for (const pos of rawPositions) {
        if (dummySet.has(pos)) continue;
        let dBefore = 0;
        for (const dp of dummyInfo.positions) {
            if (dp < pos) dBefore++;
        }
        adjusted.push(pos - dBefore);
    }

    return adjusted; // character positions in original plaintext
}
