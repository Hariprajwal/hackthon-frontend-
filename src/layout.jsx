import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Database, Settings } from "lucide-react";
import "./homepage.css";

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="home-container" style={{ display: "flex", minHeight: "100vh" }}>

      {/* Dynamic Background Elements */}
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb" style={{ top: "-10%", left: "-10%", filter: "blur(120px)" }}></div>

      <div style={{ display: "flex", width: "100%", zIndex: 1, padding: "20px", gap: "20px" }}>

        {/* Cyber Sidebar */}
        <div
          className="cyber-search-glass"
          style={{
            width: "280px",
            flexDirection: "column",
            padding: "30px 20px",
            justifyContent: "space-between",
            alignItems: "stretch",
            position: "sticky",
            top: "20px",
            height: "calc(100vh - 40px)",
            borderRight: "1px solid rgba(0, 245, 255, 0.15)"
          }}
        >
          <div>
            {/* Unique User Profile Card */}
            <div className="cyber-profile-card">
              <div className="hex-avatar">
                <div className="hex-inner">
                  <User size={38} color="#00f5ff" />
                </div>
                <div className="status-indicator"></div>
              </div>
              <div className="profile-info">
                <p className="neon-text" style={{ fontSize: "16px", margin: 0, fontWeight: "bold", letterSpacing: "1px" }}>
                  {user || "GHOST_USER"}
                </p>
                <div className="profile-badges">
                  <span className="badge admin-badge">LVL.42</span>
                  <span className="badge clearance-badge">SYS_ADMIN</span>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)", margin: "30px 0" }}></div>

            {/* Navigation Menu */}
            <div className="cyber-nav-menu">
              <button
                className={`cyber-nav-btn ${location.pathname === "/" ? "active" : ""}`}
                onClick={() => navigate("/")}
              >
                <LayoutDashboard size={18} /> OVERVIEW
              </button>

              <button
                className={`cyber-nav-btn ${location.pathname === "/vault" ? "active" : ""}`}
                onClick={() => navigate("/vault")}
              >
                <Database size={18} /> THE VAULT
              </button>

              <button
                className={`cyber-nav-btn ${location.pathname === "/settings" ? "active" : ""}`}
                onClick={() => navigate("/settings")}
              >
                <Settings size={18} /> ADVANCED
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="logout-section">
            <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,77,77,0.3), transparent)", marginBottom: "20px" }}></div>
            <button
              className="cyber-btn"
              onClick={() => setUser(null)}
              style={{ width: "100%", justifyContent: "center", border: "1px solid rgba(255, 77, 77, 0.4)", color: "#ff4d4d", background: "rgba(255, 77, 77, 0.05)" }}
            >
              <LogOut size={18} /> SEVER LINK
            </button>
          </div>
        </div>

        {/* Page Content Dashboard */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}