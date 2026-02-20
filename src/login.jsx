import { useState } from "react";
import "./homepage.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); 
  // login | register | verify

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registered! Check email for verification code 📩");
      setMode("verify");
    } else {
      alert(data.detail || "Registration failed");
    }
  };

  // ---------------- VERIFY ----------------
  const handleVerify = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/verify/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        verification_code: verificationCode
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account Verified ✅ You can now login");
      setMode("login");
    } else {
      alert(data.detail || "Verification failed");
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token
      localStorage.setItem("token", data.access || data.token);
      onLogin(username);
    } else {
      alert(data.detail || "Login failed");
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
              <input value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>

            <button type="submit" className="add-btn">Login</button>

            <p onClick={()=>setMode("register")} style={{cursor:"pointer", marginTop:"15px"}}>
              Don't have account? Register
            </p>
          </form>
        )}

        {/* REGISTER */}
        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>

            <button type="submit" className="add-btn">Register</button>
          </form>
        )}

        {/* VERIFY */}
        {mode === "verify" && (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input value={verificationCode} onChange={(e)=>setVerificationCode(e.target.value)} />
            </div>

            <button type="submit" className="add-btn">Verify</button>
          </form>
        )}

      </div>
    </div>
  );
}