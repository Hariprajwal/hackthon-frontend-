// ─── Client-Side AES-GCM Encryption ─────────────────────────────────
// Encrypts data in the browser BEFORE sending to Django.
// Django only ever stores/sees encrypted base64 strings.

const VAULT_SECRET = "vault-encryption-secret-key-2026";  // 32 chars
const SALT = "hackathon-vault-salt";

/**
 * Derives an AES-256-GCM key from the secret using PBKDF2.
 */
async function getEncryptionKey() {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(VAULT_SECRET),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(SALT),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypt a plaintext string → base64-encoded (IV + ciphertext).
 */
export async function encryptField(plaintext) {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    // Combine IV (12 bytes) + ciphertext
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64-encoded string → original plaintext.
 */
export async function decryptField(base64Data) {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}
