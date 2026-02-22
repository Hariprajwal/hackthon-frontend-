import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiRequest } from "./api";
import { encryptField, decryptField } from "./crypto";
import { s3ePreProcess, s3eSrchToken, s3eDecryptResults } from "./s3e";

export default function Vault() {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
  });

  // ─── S3E Search State ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = no search yet
  const [searchMetrics, setSearchMetrics] = useState(null);
  const [matchedVaultIds, setMatchedVaultIds] = useState(new Set());

  // ─── Edit / Delete State ───────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", age: "", gender: "", bio: "" });

  // ─── Fetch + decrypt vaults on mount ──────────────────────
  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const { response, data } = await apiRequest("/vault/", { method: "GET" });
      if (response.ok && data.data) {
        const decrypted = await Promise.all(
          data.data.map(async (vault) => ({
            id: vault.id,
            name: vault.name ? await decryptField(vault.name) : "",
            age: vault.age ? await decryptField(vault.age) : "",
            gender: vault.gender ? await decryptField(vault.gender) : "",
            bio: vault.bio ? await decryptField(vault.bio) : "",
            has_ses: !!vault.ses_data,
            created_at: vault.created_at,
          }))
        );
        setVaults(decrypted);
      }
    } catch (err) {
      console.error("Error fetching vaults:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Encrypt + S3E PreProcess + submit ──────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.gender) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const encryptedData = {
        name: await encryptField(formData.name),
        age: await encryptField(formData.age),
        gender: await encryptField(formData.gender),
        bio: await encryptField(formData.bio || ""),
      };
      let ses_data = null;
      const bioText = formData.bio || "";
      if (bioText.length >= 2) {
        ses_data = await s3ePreProcess(bioText);
      }
      const { response, data } = await apiRequest("/vault/", {
        method: "POST",
        body: JSON.stringify({ ...encryptedData, ses_data }),
      });
      if (response.ok) {
        alert("Saved with S3E index! 🔐");
        setFormData({ name: "", age: "", gender: "", bio: "" });
        fetchVaults();
      } else {
        alert(data.error ? JSON.stringify(data.error) : "Failed to save");
      }
    } catch (err) {
      alert("Error encrypting or saving data.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete vault entry ───────────────────────────────────
  const handleDelete = async (vaultId) => {
    if (!confirm("Delete this vault entry?")) return;
    try {
      const { response } = await apiRequest("/vault/", {
        method: "DELETE",
        body: JSON.stringify({ vault_id: vaultId }),
      });
      if (response.ok) fetchVaults();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Start editing a row ──────────────────────────────────
  const startEdit = (v) => {
    setEditingId(v.id);
    setEditData({ name: v.name, age: v.age, gender: v.gender, bio: v.bio });
  };

  // ─── Save edited row (re-encrypt + PUT) ───────────────────
  const handleUpdate = async () => {
    try {
      const encryptedData = {
        vault_id: editingId,
        name: await encryptField(editData.name),
        age: await encryptField(editData.age),
        gender: await encryptField(editData.gender),
        bio: await encryptField(editData.bio || ""),
      };
      let ses_data = null;
      if ((editData.bio || "").length >= 2) {
        ses_data = await s3ePreProcess(editData.bio);
      }
      const { response } = await apiRequest("/vault/", {
        method: "PUT",
        body: JSON.stringify({ ...encryptedData, ses_data }),
      });
      if (response.ok) {
        setEditingId(null);
        fetchVaults();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── S3E live search: fires automatically as user types ───
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(query.trim() ? [] : null);
      setSearchMetrics(null);
      setMatchedVaultIds(new Set());
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const tokens = await s3eSrchToken(query);
      const { response, data } = await apiRequest("/vault-search/", {
        method: "POST",
        body: JSON.stringify({ tokens }),
      });

      if (response.ok && data.data?.results) {
        if (data.metrics) setSearchMetrics(data.metrics);
        const decoded = [];
        const ids = new Set();
        for (const match of data.data.results) {
          const positions = await s3eDecryptResults(
            match.enc_positions,
            match.enc_dummy
          );
          const vault = vaults.find((v) => v.id === match.vault_id);
          ids.add(match.vault_id);
          decoded.push({
            vault_id: match.vault_id,
            vault_name: vault ? vault.name : `Vault #${match.vault_id}`,
            positions,
            match_count: match.match_count,
          });
        }
        setSearchResults(decoded);
        setMatchedVaultIds(ids);
      } else {
        setSearchResults([]);
        setMatchedVaultIds(new Set());
        if (data.metrics) setSearchMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }, [vaults]);

  // Debounce: wait 300ms after last keystroke before searching
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchMetrics(null);
      setMatchedVaultIds(new Set());
      return;
    }

    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, doSearch]);

  // Which rows to show: all vaults, or only matched ones when searching
  const isSearchActive = searchResults !== null;
  const displayVaults = isSearchActive
    ? vaults.filter((v) => matchedVaultIds.has(v.id))
    : vaults;

  // Get match info for a specific vault
  const getMatchInfo = (vaultId) =>
    searchResults?.find((r) => r.vault_id === vaultId);

  return (
    <>
      <h2>Vault 🔐</h2>
      <p style={{ opacity: 0.6, marginBottom: "5px" }}>
        Data encrypted in browser (AES-256-GCM). Bio indexed with S3E for
        encrypted substring search.
      </p>
      <hr style={{ margin: "15px 0", opacity: "0.3" }} />

      {/* ───── Form ───── */}
      <form className="vault-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Your age"
            required
          />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Bio (searchable with S3E):</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="A short bio (min 4 chars for S3E indexing)..."
            rows={3}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button type="submit" className="add-btn" disabled={submitting}>
          {submitting ? "Encrypting & Indexing..." : "Save to Vault"}
        </button>
      </form>

      {/* ───── Records Section ───── */}
      <div style={{ marginTop: "40px" }}>
        {/* Header + Search bar on same row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, whiteSpace: "nowrap" }}>
            {isSearchActive
              ? `🔍 Results for "${searchQuery}"`
              : "Saved Records"}
          </h3>

          {/* Search input — no button, triggers on Enter */}
          <div style={{ position: "relative", flex: "0 1 340px", minWidth: "220px" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
                fontSize: "16px",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searching ? "Searching…" : "Type to search encrypted bio…"}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "10px",
                border: searching
                  ? "1px solid rgba(255,200,0,0.4)"
                  : "1px solid rgba(0,198,255,0.25)",
                outline: "none",
                background: searching
                  ? "rgba(255,200,0,0.06)"
                  : "rgba(0,198,255,0.06)",
                color: "white",
                fontSize: "14px",
                transition: "border 0.3s, background 0.3s",
              }}
            />
          </div>
        </div>

        <hr style={{ margin: "0 0 16px 0", opacity: "0.15" }} />

        {loading && <p>Loading & decrypting...</p>}

        {!loading && vaults.length === 0 && (
          <p style={{ opacity: 0.6 }}>No records yet. Add one above!</p>
        )}

        {!loading && isSearchActive && displayVaults.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "30px 20px",
              background: "rgba(255,100,100,0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(255,100,100,0.15)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚫</div>
            <p style={{ opacity: 0.7, margin: 0 }}>
              No matches found for <strong>"{searchQuery}"</strong> in any
              encrypted bio.
            </p>
          </div>
        )}

        {!loading && displayVaults.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: isSearchActive
                      ? "rgba(0,255,120,0.12)"
                      : "rgba(0,198,255,0.15)",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Gender</th>
                  <th style={thStyle}>Bio</th>
                  {isSearchActive && <th style={thStyle}>Match</th>}
                  {!isSearchActive && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayVaults.map((v, idx) => {
                  const match = isSearchActive ? getMatchInfo(v.id) : null;
                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: match
                          ? "rgba(0,255,120,0.05)"
                          : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      <td style={tdStyle}>{idx + 1}</td>
                      {editingId === v.id ? (
                        <>
                          <td style={tdStyle}><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={inlineInput} /></td>
                          <td style={tdStyle}><input type="number" value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} style={{ ...inlineInput, width: "60px" }} /></td>
                          <td style={tdStyle}>
                            <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} style={inlineInput}>
                              <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                          </td>
                          <td style={tdStyle}><input value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} style={inlineInput} /></td>
                        </>
                      ) : (
                        <>
                          <td style={tdStyle}>{v.name}</td>
                          <td style={tdStyle}>{v.age}</td>
                          <td style={tdStyle}>{v.gender}</td>
                          <td style={tdStyle}>
                            {match ? highlightBio(v.bio, searchQuery) : v.bio}
                          </td>
                        </>
                      )}
                      {isSearchActive && (
                        <td style={tdStyle}>
                          {match ? (
                            <span style={{ background: "rgba(0,255,120,0.15)", border: "1px solid rgba(0,255,120,0.3)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", whiteSpace: "nowrap" }}>
                              ✅ pos [{match.positions.join(", ")}]
                            </span>
                          ) : "—"}
                        </td>
                      )}
                      {!isSearchActive && (
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {editingId === v.id ? (
                            <>
                              <button onClick={handleUpdate} style={actionBtn}>💾</button>
                              <button onClick={() => setEditingId(null)} style={{ ...actionBtn, opacity: 0.6 }}>✕</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(v)} style={actionBtn}>✏️</button>
                              <button onClick={() => handleDelete(v.id)} style={{ ...actionBtn, opacity: 0.7 }}>🗑️</button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ───── Metrics Dashboard ───── */}
        {searchMetrics && (
          <div
            style={{
              marginTop: "20px",
              background: "rgba(128,90,255,0.06)",
              border: "1px solid rgba(128,90,255,0.2)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#b48eff" }}>
              📊 Performance Metrics
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <MetricCard
                title="⏱ Timing"
                items={[
                  ["Execution", searchMetrics.timing?.execution_time_readable],
                  [
                    "CPU Time",
                    `${searchMetrics.timing?.cpu_time_ms?.toFixed(3)} ms`,
                  ],
                ]}
              />
              <MetricCard
                title="💾 Memory"
                items={[
                  ["Peak", searchMetrics.memory?.peak_memory_readable],
                  [
                    "Current",
                    `${searchMetrics.memory?.current_memory_kb?.toFixed(2)} KB`,
                  ],
                ]}
              />
              <MetricCard
                title="🔄 Operations"
                items={[
                  ["Comparisons", searchMetrics.operations?.comparisons],
                  ["Iterations", searchMetrics.operations?.iterations],
                  ["Vaults Scanned", searchMetrics.operations?.vaults_scanned],
                  ["Matches Found", searchMetrics.operations?.matches_found],
                ]}
              />
              <MetricCard
                title="📐 Input Sizes"
                items={[
                  [
                    "FM-Index (n)",
                    searchMetrics.input_sizes?.n_fm_index_size,
                  ],
                  ["Tokens (m)", searchMetrics.input_sizes?.m_query_tokens],
                  ["Vaults", searchMetrics.input_sizes?.total_vaults],
                ]}
              />
            </div>

            {/* Complexity */}
            {searchMetrics.complexity?.time &&
              typeof searchMetrics.complexity.time === "object" && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "14px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                >
                  <strong style={{ color: "#b48eff" }}>
                    🧮 Complexity Analysis
                  </strong>
                  <div style={{ marginTop: "8px", lineHeight: 1.8 }}>
                    <div>
                      <strong>Algorithm:</strong>{" "}
                      {searchMetrics.complexity.time.algorithm}
                    </div>
                    <div>
                      <strong>Per Vault:</strong>{" "}
                      <code style={codeStyle}>
                        {searchMetrics.complexity.time.per_vault}
                      </code>
                    </div>
                    <div>
                      <strong>Total:</strong>{" "}
                      <code style={codeStyle}>
                        {searchMetrics.complexity.time.total}
                      </code>
                    </div>
                    <div
                      style={{
                        opacity: 0.7,
                        fontStyle: "italic",
                        marginTop: "4px",
                      }}
                    >
                      {searchMetrics.complexity.time.note}
                    </div>
                    {searchMetrics.complexity.space &&
                      typeof searchMetrics.complexity.space === "object" && (
                        <div style={{ marginTop: "8px" }}>
                          <strong>Space:</strong>{" "}
                          <code style={codeStyle}>
                            {
                              searchMetrics.complexity.space
                                .fm_index_per_vault
                            }
                          </code>
                          {" | "}
                          <strong>Working:</strong>{" "}
                          <code style={codeStyle}>
                            {
                              searchMetrics.complexity.space
                                .search_working_memory
                            }
                          </code>
                        </div>
                      )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Highlight matching substring in bio text ───────────────
function highlightBio(bio, query) {
  if (!bio || !query) return bio;
  const lowerBio = bio.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lowerBio.indexOf(lowerQ);
  if (idx === -1) return bio;

  return (
    <span>
      {bio.slice(0, idx)}
      <mark
        style={{
          background: "rgba(0,255,120,0.25)",
          color: "white",
          borderRadius: "3px",
          padding: "1px 2px",
        }}
      >
        {bio.slice(idx, idx + query.length)}
      </mark>
      {bio.slice(idx + query.length)}
    </span>
  );
}

const thStyle = {
  padding: "12px 16px",
  fontWeight: 600,
  fontSize: "14px",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "10px 16px",
  fontSize: "14px",
};

const inlineInput = {
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "13px",
  width: "100%",
  outline: "none",
};

const actionBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  padding: "4px 6px",
};

const codeStyle = {
  background: "rgba(255,255,255,0.1)",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "12px",
  fontFamily: "monospace",
};

function MetricCard({ title, items }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.2)",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>
        {title}
      </div>
      {items.map(([label, value], i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            padding: "3px 0",
            borderBottom:
              i < items.length - 1
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
          }}
        >
          <span style={{ opacity: 0.7 }}>{label}</span>
          <span style={{ fontWeight: 500 }}>{value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}