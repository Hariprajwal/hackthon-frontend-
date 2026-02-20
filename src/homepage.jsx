export default function HomePage({ user }) {
  return (
    <>
      <h2>Welcome {user} 👋</h2>

      <div className="search-bar">
        <input type="text" placeholder="Search files..." />
      </div>

      <div className="quick-actions">
        <div className="card"></div>
        <div className="card"></div>
        <div className="card"></div>
      </div>

      <div className="vault-section">
        <h3>Vault</h3>
      </div>
    </>
  );
}