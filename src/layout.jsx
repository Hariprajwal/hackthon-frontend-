import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./homepage.css";

export default function Layout({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="home-container">
      <div className="glass-card">

        {/* Sidebar (COMMON) */}
        <div className="sidebar">
          <div>
            <div className="profile">
              <FaUserCircle size={70} />
              <p>{user}</p>
            </div>

            <div className="menu">
              <button
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => navigate("/")}
              >
                Vault
              </button>

              <button
                className={location.pathname === "/settings" ? "active" : ""}
                onClick={() => navigate("/settings")}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="logout">
            <button onClick={() => setUser()}>
              Logout
            </button>
          </div>
        </div>

        {/* Page Content Appears Here */}
        <div className="dashboard">
          <Outlet />
        </div>

      </div>
    </div>
  );
}