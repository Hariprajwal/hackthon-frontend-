import React, { useState, useEffect } from "react";
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
  const [searchResults, setSearchResults] = useState(null);
  const [searchMetrics, setSearchMetrics] = useState(null);

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

  // ─── Handle form input ──────────────────────────────────
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
      // 1. AES-GCM encrypt all fields (existing)
      const encryptedData = {
        name: await encryptField(formData.name),
        age: await encryptField(formData.age),
        gender: await encryptField(formData.gender),
        bio: await encryptField(formData.bio || ""),
      };

      // 2. S3E PreProcess on bio (if bio has >= 4 chars)
      let ses_data = null;
      const bioText = formData.bio || "";
      if (bioText.length >= 4) {
        ses_data = await s3ePreProcess(bioText);
      }

      // 3. POST to Django
      const { response, data } = await apiRequest("/vault/", {
        method: "POST",
        body: JSON.stringify({ ...encryptedData, ses_data }),
      });

      if (response.ok) {
        alert("Personal info saved with S3E index! 🔐🔍");
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

  // ─── S3E Substring Search ─────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 4) {
      alert("Search query must be at least 4 characters (bucket window size).");
      return;
    }

    setSearching(true);
    setSearchResults(null);
    setSearchMetrics(null);

    try {
      // 1. Generate PRF tokens (client-side)
      const tokens = await s3eSrchToken(searchQuery);

      // 2. Send tokens to server for blind search
      const { response, data } = await apiRequest("/vault-search/", {
        method: "POST",
        body: JSON.stringify({ tokens }),
      });

      if (response.ok && data.data?.results) {
        // 3. Capture server-side metrics
        if (data.metrics) setSearchMetrics(data.metrics);

        // 4. Decrypt results (client-side)
        const decoded = [];
        for (const match of data.data.results) {
          const positions = await s3eDecryptResults(
            match.enc_positions,
            match.enc_dummy
          );
          const vault = vaults.find((v) => v.id === match.vault_id);
          decoded.push({
            vault_id: match.vault_id,
            vault_name: vault ? vault.name : `Vault #${match.vault_id}`,
            positions,
            match_count: match.match_count,
          });
        }
        setSearchResults(decoded);
      } else {
        setSearchResults([]);
        if (data.metrics) setSearchMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed. Check console for details.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <h2>Vault 🔐</h2>
      <p style={{ opacity: 0.6, marginBottom: "5px" }}>
        Data encrypted in browser (AES-256-GCM). Bio indexed with S3E for
        substring search.
      </p>
      <hr style={{ margin: "15px 0", opacity: "0.3" }} />

      {/* ───── S3E Search ───── */}
      <div
        style={{
          background: "rgba(0,198,255,0.08)",
          padding: "20px",
          borderRadius: "14px",
          marginBottom: "30px",
          border: "1px solid rgba(0,198,255,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>
          🔍 S3E Substring Search (on encrypted bio)
        </h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bio... (min 4 chars, e.g. 'hack')"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />
          <button
            type="submit"
            className="add-btn"
            disabled={searching}
            style={{ whiteSpace: "nowrap" }}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Search Results */}
        {searchResults !== null && (
          <div style={{ marginTop: "15px" }}>
            {searchResults.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No matches found.</p>
            ) : (
              searchResults.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(0,255,100,0.1)",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    border: "1px solid rgba(0,255,100,0.2)",
                  }}
                >
                  <strong>✅ Match in: {r.vault_name}</strong>
                  <br />
                  <span style={{ fontSize: "13px", opacity: 0.8 }}>
                    Found "{searchQuery}" at position
                    {r.positions.length > 1 ? "s" : ""}: [
                    {r.positions.join(", ")}]
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ───── Metrics Dashboard ───── */}
        {searchMetrics && (
          <div
            style={{
              marginTop: "20px",
              background: "rgba(128,90,255,0.08)",
              border: "1px solid rgba(128,90,255,0.25)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#b48eff" }}>
              📊 Performance Metrics (Server-Side)
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {/* Timing */}
              <MetricCard
                title="⏱ Timing"
                items={[
                  ["Execution", searchMetrics.timing?.execution_time_readable],
                  ["CPU Time", `${searchMetrics.timing?.cpu_time_ms?.toFixed(3)} ms`],
                ]}
              />
              {/* Memory */}
              <MetricCard
                title="💾 Memory"
                items={[
                  ["Peak", searchMetrics.memory?.peak_memory_readable],
                  ["Current", `${searchMetrics.memory?.current_memory_kb?.toFixed(2)} KB`],
                ]}
              />
              {/* Operations */}
              <MetricCard
                title="🔄 Operations"
                items={[
                  ["Comparisons", searchMetrics.operations?.comparisons],
                  ["Iterations", searchMetrics.operations?.iterations],
                  ["Vaults Scanned", searchMetrics.operations?.vaults_scanned],
                  ["Matches Found", searchMetrics.operations?.matches_found],
                ]}
              />
              {/* Input Sizes */}
              <MetricCard
                title="📐 Input Sizes"
                items={[
                  ["FM-Index Size (n)", searchMetrics.input_sizes?.n_fm_index_size],
                  ["Query Tokens (m)", searchMetrics.input_sizes?.m_query_tokens],
                  ["Total Vaults", searchMetrics.input_sizes?.total_vaults],
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
                  <strong style={{ color: "#b48eff" }}>🧮 Complexity Analysis</strong>
                  <div style={{ marginTop: "8px", lineHeight: 1.8 }}>
                    <div>
                      <strong>Algorithm:</strong>{" "}
                      {searchMetrics.complexity.time.algorithm}
                    </div>
                    <div>
                      <strong>Per Vault:</strong>{" "}
                      <code style={codeStyle}>{searchMetrics.complexity.time.per_vault}</code>
                    </div>
                    <div>
                      <strong>Total:</strong>{" "}
                      <code style={codeStyle}>{searchMetrics.complexity.time.total}</code>
                    </div>
                    <div style={{ opacity: 0.7, fontStyle: "italic", marginTop: "4px" }}>
                      {searchMetrics.complexity.time.note}
                    </div>
                    {searchMetrics.complexity.space &&
                      typeof searchMetrics.complexity.space === "object" && (
                        <div style={{ marginTop: "8px" }}>
                          <strong>Space (per vault):</strong>{" "}
                          <code style={codeStyle}>{searchMetrics.complexity.space.fm_index_per_vault}</code>
                          {" | "}
                          <strong>Working:</strong>{" "}
                          <code style={codeStyle}>{searchMetrics.complexity.space.search_working_memory}</code>
                        </div>
                      )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

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

      {/* ───── Data Table ───── */}
      <div style={{ marginTop: "40px" }}>
        <h3>Saved Records</h3>
        <hr style={{ margin: "10px 0 20px 0", opacity: "0.2" }} />

        {loading && <p>Loading & decrypting...</p>}

        {!loading && vaults.length === 0 && (
          <p style={{ opacity: 0.6 }}>No records yet. Add one above!</p>
        )}

        {!loading && vaults.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(0,198,255,0.2)",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Gender</th>
                  <th style={thStyle}>Bio</th>
                  <th style={thStyle}>S3E</th>
                </tr>
              </thead>
              <tbody>
                {vaults.map((v, idx) => (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{v.name}</td>
                    <td style={tdStyle}>{v.age}</td>
                    <td style={tdStyle}>{v.gender}</td>
                    <td style={tdStyle}>{v.bio}</td>
                    <td style={tdStyle}>{v.has_ses ? "🔍" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
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
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <span style={{ opacity: 0.7 }}>{label}</span>
          <span style={{ fontWeight: 500 }}>{value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}