import { useState } from "react";
import { apiRequest, saveTokens } from "./api";
import "./homepage.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  // login | register | verify

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { response, data } = await apiRequest("/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        alert(data.message || "Registered! Check email for verification code 📩");
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
        // Save JWT tokens
        saveTokens(data.data.access, data.data.refresh);
        // Pass username to App
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

  // ---------------- UI ----------------
  return (
    <div className="home-container">
      <div style={{
        width: "400px",
        padding: "40px",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        color: "white"
      }}>
        <h2>
          {mode === "login" && "Login"}
          {mode === "register" && "Register"}
          {mode === "verify" && "Verify Account"}
        </h2>

        {/* LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p onClick={() => setMode("register")} style={{ cursor: "pointer", marginTop: "15px" }}>
              Don't have account? Register
            </p>
          </form>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <p onClick={() => setMode("login")} style={{ cursor: "pointer", marginTop: "15px" }}>
              Already have an account? Login
            </p>
          </form>
        )}

        {/* VERIFY */}
        {mode === "verify" && (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
            </div>

            <button type="submit" className="add-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}