import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import { hasToken, clearTokens } from "./api";
import Layout from "./layout";
import HomePage from "./homepage";
import Vault from "./vault";
import Settings from "./settings";
import Login from "./login";

function App() {
  const [user, setUser] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user_name");
    if (storedUser && hasToken()) {
      setUser(storedUser);
    }
  }, []);

  // Login handler — also persists username
  const handleLogin = (username) => {
    localStorage.setItem("user_name", username);
    setUser(username);
  };

  // Logout handler — clears everything
  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem("user_name");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} setUser={handleLogout} />}>
          <Route index element={<HomePage user={user} />} />
          <Route path="vault" element={<Vault />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;