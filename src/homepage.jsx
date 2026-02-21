import { useState } from "react";
import { apiRequest } from "./api";

export default function HomePage({ user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [uploadContent, setUploadContent] = useState("");
  const [uploading, setUploading] = useState(false);

  // ─── Search encrypted documents ──────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const { response, data } = await apiRequest("/search/", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery.trim().toLowerCase() }),
      });

      if (response.ok) {
        setSearchResults(data.data?.results || []);
      } else {
        alert(data.error || "Search failed");
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setSearching(false);
    }
  };

  // ─── Upload document for SSE ──────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadContent.trim()) return;
    setUploading(true);

    try {
      const { response, data } = await apiRequest("/upload/", {
        method: "POST",
        body: JSON.stringify({ content: uploadContent }),
      });

      if (response.ok) {
        alert(data.message || "Document stored securely! 🔐");
        setUploadContent("");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h2>Welcome {user} 👋</h2>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search encrypted documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="add-btn"
            style={{ marginLeft: "10px" }}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Search Results</h3>
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              {result}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginTop: "30px" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 500 }}>
          📄 Docs
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 500 }}>
          🔐 Vault
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 500 }}>
          🔍 Search
        </div>
      </div>

      {/* Upload Section */}
      <div className="vault-section">
        <h3>Upload Secure Document</h3>
        <form onSubmit={handleUpload} className="vault-form">
          <div className="form-group">
            <label>Document Content:</label>
            <textarea
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              placeholder="Enter document content to encrypt and store..."
              rows={4}
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
          <button type="submit" className="add-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload & Encrypt"}
          </button>
        </form>
      </div>
    </>
  );
}