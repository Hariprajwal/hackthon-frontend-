import React, { useState, useEffect } from "react";
import { apiRequest } from "./api";
import { encryptField, decryptField } from "./crypto";

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

  // ─── Fetch + decrypt vaults on mount ──────────────────────
  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const { response, data } = await apiRequest("/vault/", { method: "GET" });
      if (response.ok && data.data) {
        // Decrypt each vault's fields on the client
        const decrypted = await Promise.all(
          data.data.map(async (vault) => ({
            id: vault.id,
            name: vault.name ? await decryptField(vault.name) : "",
            age: vault.age ? await decryptField(vault.age) : "",
            gender: vault.gender ? await decryptField(vault.gender) : "",
            bio: vault.bio ? await decryptField(vault.bio) : "",
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

  // ─── Encrypt + submit ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.gender) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      // Encrypt every field BEFORE sending to Django
      const encryptedData = {
        name: await encryptField(formData.name),
        age: await encryptField(formData.age),
        gender: await encryptField(formData.gender),
        bio: await encryptField(formData.bio || ""),
      };

      const { response, data } = await apiRequest("/vault/", {
        method: "POST",
        body: JSON.stringify(encryptedData),
      });

      if (response.ok) {
        alert("Personal info saved securely! 🔐");
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

  return (
    <>
      <h2>Vault 🔐</h2>
      <p style={{ opacity: 0.6, marginBottom: "5px" }}>
        Your data is encrypted in the browser before being sent to the server.
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
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="A short bio about yourself..."
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
          {submitting ? "Encrypting & Saving..." : "Save to Vault"}
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
                </tr>
              </thead>
              <tbody>
                {vaults.map((v, idx) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{v.name}</td>
                    <td style={tdStyle}>{v.age}</td>
                    <td style={tdStyle}>{v.gender}</td>
                    <td style={tdStyle}>{v.bio}</td>
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