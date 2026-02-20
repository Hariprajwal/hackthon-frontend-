import { useState } from "react";
import "./homepage.css";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      return alert("Fill all fields");
    }

    if (isRegister) {
      // REGISTER
      localStorage.setItem(
        "authUser",
        JSON.stringify({ username, password })
      );
      alert("Registered Successfully ✅");
      setIsRegister(false);
    } else {
      // LOGIN
      const storedUser = JSON.parse(localStorage.getItem("authUser"));

      if (
        storedUser &&
        storedUser.username === username &&
        storedUser.password === password
      ) {
        onLogin(username);
      } else {
        alert("Invalid Credentials ❌");
      }
    }
  };

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
        <h2>{isRegister ? "Register" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="add-btn">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p
          style={{ marginTop: "20px", cursor: "pointer", color: "#00c6ff" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have account? Login"
            : "Don't have account? Register"}
        </p>
      </div>
    </div>
  );
}