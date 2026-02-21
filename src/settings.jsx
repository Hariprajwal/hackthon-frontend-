import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Server, KeyRound, Settings as SettingsIcon, User, Activity, FileText, Globe, FolderOpen, ArrowLeft } from "lucide-react";
import "./homepage.css";

export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // connection phase or data phase menu
  const [activeView, setActiveView] = useState("connect");

  // Connection State
  const [dbConfig, setDbConfig] = useState({
    dbType: "postgres",
    host: "localhost",
    port: "5432",
    username: "",
    password: "",
    dbName: "",
  });

  const [secureNotes, setSecureNotes] = useState([
    { id: Date.now(), type: "Aadhaar / passport info", value: "" }
  ]);

  const [passwordEntries, setPasswordEntries] = useState([
    { id: Date.now(), url: "", username: "", password: "" }
  ]);

  const [customFields, setCustomFields] = useState([
    { id: Date.now(), key: "", value: "" }
  ]);

  const handleDbChange = (e) => setDbConfig({ ...dbConfig, [e.target.name]: e.target.value });

  // ==== Handlers ====
  const updateSecureNote = (id, field, val) => setSecureNotes(secureNotes.map(n => n.id === id ? { ...n, [field]: val } : n));
  const addSecureNote = () => setSecureNotes([...secureNotes, { id: Date.now(), type: "Aadhaar / passport info", value: "" }]);
  const removeSecureNote = (id) => setSecureNotes(secureNotes.filter(n => n.id !== id));

  const updatePasswordEntry = (id, field, val) => setPasswordEntries(passwordEntries.map(p => p.id === id ? { ...p, [field]: val } : p));
  const addPasswordEntry = () => setPasswordEntries([...passwordEntries, { id: Date.now(), url: "", username: "", password: "" }]);
  const removePasswordEntry = (id) => setPasswordEntries(passwordEntries.filter(p => p.id !== id));

  const updateCustomField = (id, field, val) => setCustomFields(customFields.map(c => c.id === id ? { ...c, [field]: val } : c));
  const addCustomField = () => setCustomFields([...customFields, { id: Date.now(), key: "", value: "" }]);
  const removeCustomField = (id) => setCustomFields(customFields.filter(c => c.id !== id));

  const handleConnect = (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setActiveView("menu");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setActiveView("connect");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Advanced Settings Applied 🔐");
    setActiveView("menu");
  };

  return (
    <div className="home-container" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 0", overflowY: "auto", minHeight: "100vh" }}>
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb" style={{ top: "30%", right: "25%", filter: "blur(90px)", position: "fixed" }}></div>

      <motion.div
        className="cyber-search-glass"
        style={{ width: "750px", flexDirection: "column", padding: "40px 50px" }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: isConnected ? "1px solid rgba(0, 245, 255, 0.2)" : "none", paddingBottom: isConnected ? "20px" : "0" }}>
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
          {activeView === "connect" && (
            <motion.form key="connect" onSubmit={handleConnect} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <select className="cyber-select" name="dbType" value={dbConfig.dbType} onChange={handleDbChange} style={{ flex: 1 }}>
                <option value="postgres">PostgreSQL</option><option value="mysql">MySQL</option><option value="mongodb">MongoDB</option><option value="sqlite">SQLite</option>
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-wrapper" style={{ flex: 2 }}><Server className="input-icon" size={18} /><input required className="cyber-input" name="host" placeholder="Host (e.g. localhost)" value={dbConfig.host} onChange={handleDbChange} /></div>
                <div className="input-wrapper" style={{ flex: 1 }}><Activity className="input-icon" size={18} /><input required className="cyber-input" name="port" placeholder="Port" value={dbConfig.port} onChange={handleDbChange} /></div>
              </div>
              <div className="input-wrapper"><Database className="input-icon" size={18} /><input required className="cyber-input" name="dbName" placeholder="Database Name" value={dbConfig.dbName} onChange={handleDbChange} /></div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="input-wrapper" style={{ flex: 1 }}><User className="input-icon" size={18} /><input className="cyber-input" name="username" placeholder="DB User" value={dbConfig.username} onChange={handleDbChange} /></div>
                <div className="input-wrapper" style={{ flex: 1 }}><KeyRound className="input-icon" size={18} /><input type="password" className="cyber-input" name="password" placeholder="DB Password" value={dbConfig.password} onChange={handleDbChange} /></div>
              </div>
              <button type="submit" className="cyber-btn" disabled={isConnecting} style={{ justifyContent: "center", marginTop: "10px", padding: "12px" }}>
                {isConnecting ? "ESTABLISHING UPLINK..." : "INITIALIZE CONNECTION"}
              </button>
            </motion.form>
          )}

          {/* ======================= MAIN MENU ======================= */}
          {activeView === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              <button onClick={() => setActiveView("secureNotes")} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}>
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>1</div><FileText size={26} color="#00f5ff" />Secure Notes
              </button>
              <button onClick={() => setActiveView("passwordManager")} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}>
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>2</div><Globe size={26} color="#00f5ff" />Password Manager entries
              </button>
              <button onClick={() => setActiveView("customFields")} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}>
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>3</div><FolderOpen size={26} color="#00f5ff" />Custom Fields
              </button>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                <span onClick={handleDisconnect} style={{ cursor: "pointer", fontSize: "14px", color: "#ff4d4d", transition: "0.3s", letterSpacing: "1px" }} onMouseOver={(e) => e.target.style.textShadow = "0 0 8px rgba(255,77,77,0.8)"} onMouseOut={(e) => e.target.style.textShadow = "none"}>[ DISCONNECT ]</span>
              </div>
            </motion.div>
          )}

          {/* ======================= 1. SECURE NOTES ======================= */}
          {activeView === "secureNotes" && (
            <motion.form key="secureNotes" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}><button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}><ArrowLeft size={20} /></button><h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>1. Secure Notes</h3></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                {secureNotes.map((note) => (
                  <div key={note.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><select className="cyber-input" value={note.type} onChange={(e) => updateSecureNote(note.id, "type", e.target.value)} style={{ paddingLeft: "10px", appearance: "none", cursor: "pointer", color: "#e2e8f0" }}><option value="Aadhaar / passport info">Aadhaar / passport info</option><option value="addresses">addresses</option><option value="personal documents">personal documents</option><option value="API keys">API keys</option><option value="recovery phrases">recovery phrases</option></select></div>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" placeholder="[ Enter Value ]" value={note.value} onChange={(e) => updateSecureNote(note.id, "value", e.target.value)} style={{ paddingLeft: "10px" }} /></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}><span onClick={() => removeSecureNote(note.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>[ Cancel ]</span></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSecureNote} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>➕ Add More Fields</button>
              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>Submit</button>
            </motion.form>
          )}

          {/* ======================= 2. PASSWORD MANAGER ======================= */}
          {activeView === "passwordManager" && (
            <motion.form key="passwordManager" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}><button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}><ArrowLeft size={20} /></button><h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>2. Password Manager entries</h3></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                {passwordEntries.map((entry) => (
                  <div key={entry.id} style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px dashed rgba(0,245,255,0.1)", paddingBottom: "15px", marginBottom: "5px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div className="input-wrapper" style={{ flex: 1.5, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" placeholder="Website Name / URL" value={entry.url} onChange={(e) => updatePasswordEntry(entry.id, "url", e.target.value)} style={{ paddingLeft: "10px" }} /></div>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" placeholder="Username" value={entry.username} onChange={(e) => updatePasswordEntry(entry.id, "username", e.target.value)} style={{ paddingLeft: "10px" }} /></div>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" type="password" placeholder="Password" value={entry.password} onChange={(e) => updatePasswordEntry(entry.id, "password", e.target.value)} style={{ paddingLeft: "10px" }} /></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}><span onClick={() => removePasswordEntry(entry.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>[ Cancel ]</span></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPasswordEntry} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>➕ Add More Fields</button>
              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>Submit</button>
            </motion.form>
          )}

          {/* ======================= 3. CUSTOM FIELDS ======================= */}
          {activeView === "customFields" && (
            <motion.form key="customFields" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}><button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}><ArrowLeft size={20} /></button><h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>3. Custom Fields</h3></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                {customFields.map((cf) => (
                  <div key={cf.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" style={{ paddingLeft: "10px" }} placeholder="[ Enter Field Name        ]" value={cf.key} onChange={(e) => updateCustomField(cf.id, "key", e.target.value)} /></div>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}><input className="cyber-input" style={{ paddingLeft: "10px" }} placeholder="[ Enter Value              ]" value={cf.value} onChange={(e) => updateCustomField(cf.id, "value", e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}><span onClick={() => removeCustomField(cf.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>[ Cancel ]</span></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addCustomField} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>➕ Add More Fields</button>
              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>Submit</button>
            </motion.form>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}