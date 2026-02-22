import React, { useState } from "react";
import { apiRequest, clearTokens } from "./api";

export default function Settings({ user, setUser }) {
  const [deleting, setDeleting] = useState(false);
  const [clearingVaults, setClearingVaults] = useState(false);

  // ─── Clear all vault entries ──────────────────────────────
  const handleClearVaults = async () => {
    if (!confirm("⚠️ Delete ALL your vault entries? This cannot be undone."))
      return;
    setClearingVaults(true);
    try {
      // Fetch all vaults then delete each
      const { response, data } = await apiRequest("/vault/", { method: "GET" });
      if (response.ok && data.data) {
        for (const vault of data.data) {
          await apiRequest("/vault/", {
            method: "DELETE",
            body: JSON.stringify({ vault_id: vault.id }),
          });
        }
        alert("All vault entries deleted.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to clear vaults.");
    } finally {
      setClearingVaults(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────
  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("user_name");
    setUser();
  };

  return (
    <>
      <h2>Settings ⚙️</h2>
      <p style={{ opacity: 0.6, marginBottom: "5px" }}>
        Manage your account and vault preferences.
      </p>
      <hr style={{ margin: "15px 0", opacity: "0.3" }} />

      {/* ─── Account Info ─── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>👤 Account</h3>
        <div style={rowStyle}>
          <span style={{ opacity: 0.7 }}>Username</span>
          <span style={{ fontWeight: 600 }}>{user}</span>
        </div>
        <div style={rowStyle}>
          <span style={{ opacity: 0.7 }}>Encryption</span>
          <span style={badgeGreen}>AES-256-GCM</span>
        </div>
        <div style={rowStyle}>
          <span style={{ opacity: 0.7 }}>Search Protocol</span>
          <span style={badgeBlue}>S3E (FM-Index)</span>
        </div>
        <div style={rowStyle}>
          <span style={{ opacity: 0.7 }}>Bucket Window</span>
          <span>WIN = 2</span>
        </div>
      </div>

      {/* ─── Security Info ─── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>🔐 Security</h3>
        <div style={infoBox}>
          <strong>Client-side encryption</strong> — your data is encrypted in
          the browser before it reaches the server. The server never sees
          plaintext.
        </div>
        <div style={{ ...infoBox, marginTop: "10px" }}>
          <strong>S3E substring search</strong> — search queries are converted
          to HMAC tokens. The server performs FM-index backward search on
          encrypted tags without decrypting anything.
        </div>
      </div>

      {/* ─── Danger Zone ─── */}
      <div
        style={{
          ...sectionStyle,
          borderColor: "rgba(255,80,80,0.25)",
          background: "rgba(255,80,80,0.04)",
        }}
      >
        <h3 style={{ ...sectionTitle, color: "#ff6b6b" }}>⚠️ Danger Zone</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>Clear all vaults</div>
            <div style={{ fontSize: "13px", opacity: 0.6 }}>
              Permanently delete all your encrypted vault entries.
            </div>
          </div>
          <button
            onClick={handleClearVaults}
            disabled={clearingVaults}
            style={dangerBtn}
          >
            {clearingVaults ? "Deleting..." : "Clear All"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>Logout</div>
            <div style={{ fontSize: "13px", opacity: 0.6 }}>
              Sign out and clear your session tokens.
            </div>
          </div>
          <button onClick={handleLogout} style={dangerBtn}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

const sectionStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "20px",
};

const sectionTitle = {
  marginBottom: "14px",
  fontSize: "16px",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  fontSize: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const badgeGreen = {
  background: "rgba(0,255,120,0.12)",
  border: "1px solid rgba(0,255,120,0.25)",
  borderRadius: "6px",
  padding: "3px 10px",
  fontSize: "12px",
  fontWeight: 600,
};

const badgeBlue = {
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.25)",
  borderRadius: "6px",
  padding: "3px 10px",
  fontSize: "12px",
  fontWeight: 600,
};

const infoBox = {
  background: "rgba(0,0,0,0.15)",
  borderRadius: "10px",
  padding: "14px",
  fontSize: "13px",
  lineHeight: 1.6,
};

const dangerBtn = {
  background: "rgba(255,80,80,0.15)",
  border: "1px solid rgba(255,80,80,0.3)",
  borderRadius: "8px",
  color: "#ff6b6b",
  padding: "8px 16px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};