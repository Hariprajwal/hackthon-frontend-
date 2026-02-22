import { useState } from "react";
import { apiRequest, saveTokens } from "./api";
import "./homepage.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Validation rules ─────────────────────────────────────
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const emailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const passHasUpper = /[A-Z]/.test(password);
  const passHasLower = /[a-z]/.test(password);
  const passHasNum = /[0-9]/.test(password);
  const passHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passLongEnough = password.length >= 8;
  const passwordValid = passHasUpper && passHasLower && passHasNum && passHasSpecial && passLongEnough;

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!usernameValid) { alert("Username: 3-20 chars, letters/numbers/underscores only."); return; }
    if (!emailValid) { alert("Only @gmail.com emails are accepted."); return; }
    if (!passwordValid) { alert("Password must be 8+ chars with uppercase, lowercase, number & special char."); return; }

    setLoading(true);
    try {
      const { response, data } = await apiRequest("/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        alert(data.message || "Registered! Check email for code 📩");
        setMode("verify");
      } else {
        alert(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY ----------------
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { response, data } = await apiRequest("/verify/", {
        method: "POST",
        body: JSON.stringify({ username, verification_code: verificationCode }),
      });
      if (response.ok) {
        alert(data.message || "Account Verified ✅ You can now login");
        setMode("login");
      } else {
        alert(data.error || data.message || "Verification failed");
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { response, data } = await apiRequest("/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        saveTokens(data.data.access, data.data.refresh);
        onLogin(data.data.user_name);
      } else {
        alert(data.error || data.message || "Login failed");
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: { icon: "🔐", label: "Welcome Back", sub: "Sign in to your encrypted vault" },
    register: { icon: "🚀", label: "Create Account", sub: "Set up your secure vault in seconds" },
    verify: { icon: "📩", label: "Verify Email", sub: "Enter the code sent to your inbox" },
  };

  const t = titles[mode];

  return (
    <div className="home-container" style={{ justifyContent: "center", alignItems: "center" }}>

      {/* Floating particles */}
      <div style={particles}>
        <div style={{ ...orb, width: 300, height: 300, top: "-80px", left: "-60px", background: "radial-gradient(circle, rgba(0,198,255,0.15) 0%, transparent 70%)" }} />
        <div style={{ ...orb, width: 200, height: 200, bottom: "-40px", right: "-40px", background: "radial-gradient(circle, rgba(0,114,255,0.15) 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div style={card}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px", animation: "pulse 2s ease-in-out infinite" }}>
            {t.icon}
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
            {t.label}
          </h2>
          <p style={{ opacity: 0.5, fontSize: "14px", marginTop: "6px" }}>
            {t.sub}
          </p>
        </div>

        {/* ─── LOGIN FORM ─── */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Username</label>
              <div style={inputWrap}>
                <span style={inputIcon}>👤</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrap}>
                <span style={inputIcon}>🔑</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <div style={footer}>
              <span style={{ opacity: 0.5 }}>Don't have an account?</span>
              <span style={linkStyle} onClick={() => setMode("register")}>
                Register
              </span>
            </div>
          </form>
        )}

        {/* ─── REGISTER FORM ─── */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Username</label>
              <div style={inputWrap}>
                <span style={inputIcon}>👤</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3-20 chars, letters/numbers/_"
                  style={inputStyle}
                  required
                />
              </div>
              {username && (
                <div style={hintRow}>
                  <span style={username.length >= 3 && username.length <= 20 ? rulePass : ruleFail}>
                    {username.length >= 3 && username.length <= 20 ? "✓" : "✗"} 3-20 characters
                  </span>
                  <span style={/^[a-zA-Z0-9_]+$/.test(username) ? rulePass : ruleFail}>
                    {/^[a-zA-Z0-9_]+$/.test(username) ? "✓" : "✗"} Letters, numbers, _ only
                  </span>
                </div>
              )}
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Email</label>
              <div style={inputWrap}>
                <span style={inputIcon}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  style={inputStyle}
                  required
                />
              </div>
              {email && (
                <div style={hintRow}>
                  <span style={emailValid ? rulePass : ruleFail}>
                    {emailValid ? "✓" : "✗"} Must be @gmail.com
                  </span>
                </div>
              )}
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrap}>
                <span style={inputIcon}>🔑</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, mixed case + number + symbol"
                  style={inputStyle}
                  required
                />
              </div>
              {password && (
                <div style={hintRow}>
                  <span style={passLongEnough ? rulePass : ruleFail}>{passLongEnough ? "✓" : "✗"} 8+ chars</span>
                  <span style={passHasUpper ? rulePass : ruleFail}>{passHasUpper ? "✓" : "✗"} Uppercase</span>
                  <span style={passHasLower ? rulePass : ruleFail}>{passHasLower ? "✓" : "✗"} Lowercase</span>
                  <span style={passHasNum ? rulePass : ruleFail}>{passHasNum ? "✓" : "✗"} Number</span>
                  <span style={passHasSpecial ? rulePass : ruleFail}>{passHasSpecial ? "✓" : "✗"} Symbol</span>
                </div>
              )}
            </div>

            <button type="submit" style={btnPrimary} disabled={loading || !(usernameValid && emailValid && passwordValid)}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>

            <div style={footer}>
              <span style={{ opacity: 0.5 }}>Already have an account?</span>
              <span style={linkStyle} onClick={() => setMode("login")}>
                Sign In
              </span>
            </div>
          </form>
        )}

        {/* ─── VERIFY FORM ─── */}
        {mode === "verify" && (
          <form onSubmit={handleVerify}>
            <div
              style={{
                background: "rgba(0,198,255,0.08)",
                border: "1px solid rgba(0,198,255,0.2)",
                borderRadius: "10px",
                padding: "14px",
                fontSize: "13px",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              A verification code has been sent to your email.
              <br />
              Enter it below to activate your account.
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Verification Code</label>
              <div style={inputWrap}>
                <span style={inputIcon}>🔢</span>
                <input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  style={{ ...inputStyle, letterSpacing: "4px", fontWeight: 600, fontSize: "18px", textAlign: "center" }}
                  required
                />
              </div>
            </div>

            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? "Verifying..." : "Verify Account ✓"}
            </button>

            <div style={footer}>
              <span style={linkStyle} onClick={() => setMode("login")}>
                ← Back to login
              </span>
            </div>
          </form>
        )}

        {/* Bottom badge */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "11px",
            opacity: 0.35,
            letterSpacing: "1px",
          }}
        >
          SECURED WITH AES-256-GCM + S3E
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const particles = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  overflow: "hidden",
  zIndex: 0,
};

const orb = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(60px)",
  animation: "gradientMove 12s ease infinite",
};

const card = {
  position: "relative",
  zIndex: 1,
  width: "420px",
  maxWidth: "92vw",
  padding: "40px 36px",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "24px",
  color: "white",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const fieldWrap = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 500,
  opacity: 0.7,
  letterSpacing: "0.3px",
};

const inputWrap = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon = {
  position: "absolute",
  left: "14px",
  fontSize: "15px",
  pointerEvents: "none",
  opacity: 0.5,
};

const inputStyle = {
  width: "100%",
  padding: "14px 14px 14px 42px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "14px",
  transition: "border 0.3s, background 0.3s",
};

const btnPrimary = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "white",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.3px",
  transition: "transform 0.2s, box-shadow 0.3s",
  boxShadow: "0 4px 20px rgba(0,198,255,0.25)",
};

const footer = {
  display: "flex",
  justifyContent: "center",
  gap: "6px",
  marginTop: "18px",
  fontSize: "13px",
};

const linkStyle = {
  color: "#00c6ff",
  cursor: "pointer",
  fontWeight: 600,
};