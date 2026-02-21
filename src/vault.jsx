import React, { useState } from "react";
import { FolderOpen, ArrowLeft, FileText, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./homepage.css";

export default function Vault() {
  const [activeView, setActiveView] = useState("menu");

  const [secureNotes, setSecureNotes] = useState([
    { id: Date.now(), type: "Aadhaar / passport info", value: "" }
  ]);

  const [passwordEntries, setPasswordEntries] = useState([
    { id: Date.now(), url: "", username: "", password: "" }
  ]);

  const [customFields, setCustomFields] = useState([
    { id: Date.now(), key: "", value: "" }
  ]);

  // ==== Secure Notes Handlers ====
  const updateSecureNote = (id, field, val) => {
    setSecureNotes(secureNotes.map(n => n.id === id ? { ...n, [field]: val } : n));
  };
  const addSecureNote = () => setSecureNotes([...secureNotes, { id: Date.now(), type: "Aadhaar / passport info", value: "" }]);
  const removeSecureNote = (id) => setSecureNotes(secureNotes.filter(n => n.id !== id));

  // ==== Password Manager Handlers ====
  const updatePasswordEntry = (id, field, val) => {
    setPasswordEntries(passwordEntries.map(p => p.id === id ? { ...p, [field]: val } : p));
  };
  const addPasswordEntry = () => setPasswordEntries([...passwordEntries, { id: Date.now(), url: "", username: "", password: "" }]);
  const removePasswordEntry = (id) => setPasswordEntries(passwordEntries.filter(p => p.id !== id));

  // ==== Custom Fields Handlers ====
  const updateCustomField = (id, field, val) => {
    setCustomFields(customFields.map(c => c.id === id ? { ...c, [field]: val } : c));
  };
  const addCustomField = () => setCustomFields([...customFields, { id: Date.now(), key: "", value: "" }]);
  const removeCustomField = (id) => setCustomFields(customFields.filter(c => c.id !== id));

  // ==== Submission ====
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Encrypted Data Saved into Vault 🔐");
    setActiveView("menu");
  };

  return (
    <div className="home-container" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 0", overflowY: "auto", minHeight: "100vh" }}>

      {/* Background Ambience */}
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb" style={{ top: "10%", left: "20%", width: "600px", filter: "blur(80px)", position: "fixed" }}></div>

      <div className="cyber-search-glass" style={{ width: "750px", flexDirection: "column", padding: "40px 50px" }}>

        <div style={{ marginBottom: "30px", borderBottom: "1px solid rgba(0, 245, 255, 0.2)", paddingBottom: "20px" }}>
          <h2 style={{ fontSize: "28px", color: "white", display: "flex", alignItems: "center", gap: "10px", margin: 0, textShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }}>
            <span style={{ color: "#f5d97a" }}>📁</span> B. Vault Storage Types
          </h2>
          <p style={{ marginTop: "15px", color: "#e2e8f0", fontSize: "16px" }}>
            Let users store structured secrets:
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ======================= MAIN MENU ======================= */}
          {activeView === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "25px" }}
            >
              <button
                onClick={() => setActiveView("secureNotes")}
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}
              >
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>1</div>
                <FileText size={26} color="#00f5ff" />
                Secure Notes
              </button>

              <button
                onClick={() => setActiveView("passwordManager")}
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}
              >
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>2</div>
                <Globe size={26} color="#00f5ff" />
                Password Manager entries
              </button>

              <button
                onClick={() => setActiveView("customFields")}
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,245,255,0.3)", padding: "25px", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "15px", fontSize: "20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)" }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.2)"; e.currentTarget.style.borderColor = "#00f5ff"; }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,245,255,0.05)"; e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; }}
              >
                <div style={{ background: "#00f5ff", color: "black", borderRadius: "4px", padding: "2px 8px", fontSize: "16px", fontWeight: "bold" }}>3</div>
                <FolderOpen size={26} color="#00f5ff" />
                Custom Fields
              </button>
            </motion.div>
          )}


          {/* ======================= 1. SECURE NOTES ======================= */}
          {activeView === "secureNotes" && (
            <motion.form
              key="secureNotes"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                <button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}>
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>1. Secure Notes</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                {secureNotes.map((note) => (
                  <div key={note.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "15px" }}>

                      {/* Dropdown Left Box */}
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <select
                          className="cyber-input"
                          value={note.type}
                          onChange={(e) => updateSecureNote(note.id, "type", e.target.value)}
                          style={{ paddingLeft: "10px", appearance: "none", cursor: "pointer", color: "#e2e8f0" }}
                        >
                          <option value="Aadhaar / passport info">Aadhaar / passport info</option>
                          <option value="addresses">addresses</option>
                          <option value="personal documents">personal documents</option>
                          <option value="API keys">API keys</option>
                          <option value="recovery phrases">recovery phrases</option>
                        </select>
                      </div>

                      {/* Value Right Box */}
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" placeholder="[ Enter Value ]" value={note.value} onChange={(e) => updateSecureNote(note.id, "value", e.target.value)} style={{ paddingLeft: "10px" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}>
                      <span onClick={() => removeSecureNote(note.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>
                        [ Cancel ]
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addSecureNote} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>
                ➕ Add More Fields
              </button>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "10px", marginLeft: "10px" }}>(Repeat same structure when + is clicked)</p>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>
                Submit
              </button>
            </motion.form>
          )}


          {/* ======================= 2. PASSWORD MANAGER ======================= */}
          {activeView === "passwordManager" && (
            <motion.form
              key="passwordManager"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                <button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}>
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>2. Password Manager entries</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                {passwordEntries.map((entry) => (
                  <div key={entry.id} style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px dashed rgba(0,245,255,0.1)", paddingBottom: "15px", marginBottom: "5px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>

                      {/* Left Box */}
                      <div className="input-wrapper" style={{ flex: 1.5, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" placeholder="Website Name / URL" value={entry.url} onChange={(e) => updatePasswordEntry(entry.id, "url", e.target.value)} style={{ paddingLeft: "10px" }} />
                      </div>

                      {/* Middle Box */}
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" placeholder="Username" value={entry.username} onChange={(e) => updatePasswordEntry(entry.id, "username", e.target.value)} style={{ paddingLeft: "10px" }} />
                      </div>

                      {/* Right Box */}
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" type="password" placeholder="Password" value={entry.password} onChange={(e) => updatePasswordEntry(entry.id, "password", e.target.value)} style={{ paddingLeft: "10px" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}>
                      <span onClick={() => removePasswordEntry(entry.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>
                        [ Cancel ]
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addPasswordEntry} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>
                ➕ Add More Fields
              </button>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "10px", marginLeft: "10px" }}>(Repeat same structure when + is clicked)</p>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>
                Submit
              </button>
            </motion.form>
          )}


          {/* ======================= 3. CUSTOM FIELDS ======================= */}
          {activeView === "customFields" && (
            <motion.form
              key="customFields"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
                <button type="button" onClick={() => setActiveView("menu")} style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", borderRadius: "50%", padding: "8px", cursor: "pointer", display: "flex" }}>
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ color: "#00f5ff", fontSize: "22px", margin: 0 }}>3. Custom Fields</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px", background: "rgba(0,0,0,0.3)", padding: "25px", borderRadius: "12px", border: "1px solid rgba(0,245,255,0.1)" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>User-defined schema.</p>
                <h4 style={{ color: "white", fontSize: "16px", marginBottom: "5px", fontWeight: "normal" }}>Custom Field Title</h4>

                {customFields.map((cf) => (
                  <div key={cf.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" style={{ paddingLeft: "10px" }} placeholder="[ Enter Field Name        ]" value={cf.key} onChange={(e) => updateCustomField(cf.id, "key", e.target.value)} />
                      </div>
                      <div className="input-wrapper" style={{ flex: 1, padding: "5px", background: "rgba(0,0,0,0.5)" }}>
                        <input className="cyber-input" style={{ paddingLeft: "10px" }} placeholder="[ Enter Value              ]" value={cf.value} onChange={(e) => updateCustomField(cf.id, "value", e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "5px" }}>
                      <span onClick={() => removeCustomField(cf.id)} style={{ color: "#e2e8f0", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color = "#ff4d4d"} onMouseOut={(e) => e.target.style.color = "#e2e8f0"}>
                        [ Cancel ]
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addCustomField} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "white", marginTop: "20px", cursor: "pointer", fontSize: "16px" }}>
                ➕ Add More Fields
              </button>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "10px", marginLeft: "10px" }}>(Repeat same structure when + is clicked)</p>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", padding: "16px", fontSize: "16px", marginTop: "20px", width: "fit-content" }}>
                Submit
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}