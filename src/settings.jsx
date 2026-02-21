import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Server, KeyRound, Settings as SettingsIcon, User, Activity, FileText, Globe, Plus, X } from "lucide-react";
import "./homepage.css";

export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connection State
  const [dbConfig, setDbConfig] = useState({
    dbType: "postgres",
    host: "localhost",
    port: "5432",
    username: "",
    password: "",
    dbName: "",
  });

  // Settings Data State (Structured Secrets)
  const [settingsData, setSettingsData] = useState({
    secureNotes: "",
    websiteLogin: "",
    username: "",
    password: ""
  });

  const [customFields, setCustomFields] = useState([
    { id: Date.now(), key: "", value: "" }
  ]);

  const handleDbChange = (e) => {
    setDbConfig({ ...dbConfig, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    setSettingsData({ ...settingsData, [e.target.name]: e.target.value });
  };

  const handleCustomFieldChange = (id, field, value) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now(), key: "", value: "" }]);
  };

  const removeCustomField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleConnect = (e) => {
    e.preventDefault();
    setIsConnecting(true);
    // Simulate secure connection bridging
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Advanced Settings Applied 🔐");
    setSettingsData({ secureNotes: "", websiteLogin: "", username: "", password: "" });
    setCustomFields([{ id: Date.now(), key: "", value: "" }]);
  };

  return (
    <div className="home-container" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 0", overflowY: "auto", minHeight: "100vh" }}>

      {/* Background Ambience */}
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb" style={{ top: "30%", right: "25%", filter: "blur(90px)", position: "fixed" }}></div>

      <motion.div
        className="cyber-search-glass"
        style={{ width: "600px", flexDirection: "column", padding: "40px" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {isConnected ? (
            <SettingsIcon className="title-icon" size={40} style={{ color: "#00ff88", margin: "0 auto 10px auto" }} />
          ) : (
            <Database className="title-icon" size={40} style={{ margin: "0 auto 10px auto" }} />
          )}

          <h2 className={isConnected ? "neon-green" : "neon-text"} style={{ fontSize: "24px", letterSpacing: "2px" }}>
            {isConnected ? "ADVANCED SETTINGS . SECURED" : "ADVANCED SETTINGS . CONNECT"}
            <span className="blink">_</span>
          </h2>
          <p className="cyber-subtitle" style={{ marginLeft: 0, marginTop: "5px" }}>
            {isConnected ? `UPLINK ESTABLISHED [${dbConfig.dbType.toUpperCase()}]` : "ESTABLISH DATABASE UPLINK"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ===================== CONNECTION PHASE ===================== */}
          {!isConnected && (
            <motion.form
              key="connect"
              onSubmit={handleConnect}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  className="cyber-select"
                  name="dbType"
                  value={dbConfig.dbType}
                  onChange={handleDbChange}
                  style={{ flex: 1 }}
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-wrapper" style={{ flex: 2 }}>
                  <Server className="input-icon" size={18} />
                  <input required className="cyber-input" name="host" placeholder="Host (e.g. localhost)" value={dbConfig.host} onChange={handleDbChange} />
                </div>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <Activity className="input-icon" size={18} />
                  <input required className="cyber-input" name="port" placeholder="Port" value={dbConfig.port} onChange={handleDbChange} />
                </div>
              </div>

              <div className="input-wrapper">
                <Database className="input-icon" size={18} />
                <input required className="cyber-input" name="dbName" placeholder="Database Name" value={dbConfig.dbName} onChange={handleDbChange} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <User className="input-icon" size={18} />
                  <input className="cyber-input" name="username" placeholder="DB User" value={dbConfig.username} onChange={handleDbChange} />
                </div>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <KeyRound className="input-icon" size={18} />
                  <input type="password" className="cyber-input" name="password" placeholder="DB Password" value={dbConfig.password} onChange={handleDbChange} />
                </div>
              </div>

              <button type="submit" className="cyber-btn" disabled={isConnecting} style={{ justifyContent: "center", marginTop: "10px", padding: "12px" }}>
                {isConnecting ? "ESTABLISHING UPLINK..." : "INITIALIZE CONNECTION"}
              </button>
            </motion.form>
          )}

          {/* ===================== DATA ENTRY PHASE ===================== */}
          {isConnected && (
            <motion.form
              key="settings_data"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Type 1: Secure Notes */}
              <h3 style={{ color: "#00f5ff", borderBottom: "1px solid rgba(0,245,255,0.3)", paddingBottom: "8px", fontSize: "16px", marginTop: "10px", letterSpacing: "1px" }}>
                1. Secure Notes
              </h3>
              <div className="input-wrapper" style={{ alignItems: "flex-start", padding: "12px 15px" }}>
                <FileText className="input-icon" size={18} style={{ marginTop: "4px" }} />
                <textarea
                  className="cyber-input"
                  name="secureNotes"
                  placeholder="Aadhaar / passport info, addresses, personal documents, API keys, recovery phrases..."
                  value={settingsData.secureNotes}
                  onChange={handleSettingsChange}
                  rows={4}
                  style={{ resize: "vertical", background: "transparent", color: "white", outline: "none", border: "none", width: "100%" }}
                />
              </div>

              {/* Type 2: Password Manager entries */}
              <h3 style={{ color: "#00f5ff", borderBottom: "1px solid rgba(0,245,255,0.3)", paddingBottom: "8px", fontSize: "16px", marginTop: "15px", letterSpacing: "1px" }}>
                2. Password Manager
              </h3>
              <div className="input-wrapper">
                <Globe className="input-icon" size={18} />
                <input className="cyber-input" name="websiteLogin" placeholder="Website Login URL" value={settingsData.websiteLogin} onChange={handleSettingsChange} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <User className="input-icon" size={18} />
                  <input className="cyber-input" name="username" placeholder="Username" value={settingsData.username} onChange={handleSettingsChange} />
                </div>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <KeyRound className="input-icon" size={18} />
                  <input type="password" className="cyber-input" name="password" placeholder="Password" value={settingsData.password} onChange={handleSettingsChange} />
                </div>
              </div>

              {/* Type 4: Custom Fields */}
              <h3 style={{ color: "#00f5ff", borderBottom: "1px solid rgba(0,245,255,0.3)", paddingBottom: "8px", fontSize: "16px", marginTop: "15px", letterSpacing: "1px" }}>
                4. Custom Fields
              </h3>

              {customFields.map((cf) => (
                <div key={cf.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <input className="cyber-input" placeholder="Enter field" value={cf.key} onChange={(e) => handleCustomFieldChange(cf.id, "key", e.target.value)} />
                  </div>
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <input className="cyber-input" placeholder="Enter value" value={cf.value} onChange={(e) => handleCustomFieldChange(cf.id, "value", e.target.value)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(cf.id)}
                    style={{ background: "rgba(255, 77, 77, 0.1)", border: "1px solid rgba(255,77,77,0.3)", color: "#ff4d4d", borderRadius: "8px", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomField}
                className="cyber-btn"
                style={{ justifyContent: "center", background: "transparent", border: "1px dashed #00f5ff", color: "#00f5ff", padding: "10px", marginTop: "5px" }}
              >
                <Plus size={18} /> ADD MORE FIELDS
              </button>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", marginTop: "20px", padding: "14px", background: "linear-gradient(135deg, #00ff88, #0072ff)" }}>
                ENCRYPT & SUBMIT DATA
              </button>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <span
                  onClick={() => setIsConnected(false)}
                  style={{ cursor: "pointer", fontSize: "12px", color: "#64748b", textDecoration: "underline", transition: "0.3s" }}
                  onMouseOver={(e) => e.target.style.color = "#00f5ff"}
                  onMouseOut={(e) => e.target.style.color = "#64748b"}
                >
                  Sever Connection
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}