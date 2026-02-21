import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Mail, KeyRound, Terminal } from "lucide-react";
import "./homepage.css";
import { redirect } from "react-router-dom";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  // login | register | verify

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // ---------------- API Call Helpers ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (response.ok) {
      alert("Registration Successful! Check your email for the verification code. 📩");
      setMode("verify");
    } else {
      alert(data.detail || "Registration failed");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, verification_code: verificationCode })
    });
    const data = await response.json();
    if (response.ok) {
      alert("Vault Access Verified ✅ You can now initialize login.");
      setMode("login");
    } else {
      alert(data.detail || "Verification failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.access || data.token);
      onLogin(username);
      redirect("/")
    } else {
      alert(data.detail || "Login failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="home-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Background Ambience */}
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb" style={{ top: '10%', left: '20%', width: '600px', filter: 'blur(80px)' }}></div>

      <motion.div
        className="cyber-search-glass"
        style={{ width: "450px", flexDirection: "column", padding: "40px 30px" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Terminal className="title-icon" size={40} style={{ margin: "0 auto 10px auto" }} />
          <h2 className="neon-text" style={{ fontSize: "24px", letterSpacing: "2px" }}>
            SYS.AUTH<span className="blink">_</span>
          </h2>
          <p className="cyber-subtitle" style={{ marginLeft: 0, marginTop: "5px" }}>SECURE CONNECTION</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", borderBottom: "1px solid rgba(0, 245, 255, 0.2)", paddingBottom: "10px" }}>
          <span
            onClick={() => setMode("login")}
            style={{ cursor: "pointer", fontWeight: 600, color: mode === "login" ? "#00f5ff" : "#64748b", textShadow: mode === "login" ? "0 0 8px rgba(0,245,255,0.5)" : "none", transition: "0.3s" }}
          >
            LOGIN
          </span>
          <span
            onClick={() => setMode("register")}
            style={{ cursor: "pointer", fontWeight: 600, color: mode === "register" ? "#00f5ff" : "#64748b", textShadow: mode === "register" ? "0 0 8px rgba(0,245,255,0.5)" : "none", transition: "0.3s" }}
          >
            REGISTER
          </span>
          <span
            onClick={() => setMode("verify")}
            style={{ cursor: "pointer", fontWeight: 600, color: mode === "verify" ? "#00f5ff" : "#64748b", textShadow: mode === "verify" ? "0 0 8px rgba(0,245,255,0.5)" : "none", transition: "0.3s" }}
          >
            VERIFY
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* ---------------- LOGIN FORM ---------------- */}
          {mode === "login" && (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input required className="cyber-input" placeholder="Operator ID (Username)" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input required type="password" className="cyber-input" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", marginTop: "10px", padding: "12px" }}>
                INITIALIZE_SESSION
              </button>
            </motion.form>
          )}

          {/* ---------------- REGISTER FORM ---------------- */}
          {mode === "register" && (
            <motion.form
              key="register"
              onSubmit={handleRegister}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input required className="cyber-input" placeholder="New Operator ID" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input required type="email" className="cyber-input" placeholder="Comm Link (Email)" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input required type="password" className="cyber-input" placeholder="Master Passkey" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", marginTop: "10px", padding: "12px" }}>
                REQUEST_CLEARANCE
              </button>
            </motion.form>
          )}

          {/* ---------------- VERIFY FORM ---------------- */}
          {mode === "verify" && (
            <motion.form
              key="verify"
              onSubmit={handleVerify}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input required className="cyber-input" placeholder="Operator ID" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className="input-wrapper">
                <KeyRound className="input-icon" size={20} />
                <input required className="cyber-input" placeholder="Authorization Token (Email)" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
              </div>

              <button type="submit" className="cyber-btn" style={{ justifyContent: "center", marginTop: "10px", padding: "12px" }}>
                VALIDATE_ACCESS
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}