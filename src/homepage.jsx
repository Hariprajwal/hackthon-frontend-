import { motion } from "framer-motion";
import { useState } from "react";
import { Terminal, ShieldAlert, Cpu, Zap, Lock, ScanLine, Activity } from "lucide-react";
import "./homepage.css";

export default function HomePage({ user }) {
  const [step, setStep] = useState(1);

  return (
    <div className="cyber-home">

      {/* Dynamic Background Elements */}
      <div className="cyber-grid-overlay"></div>
      <div className="cyber-glow-orb"></div>

      {/* Header / Welcome */}
      <motion.div
        className="cyber-header"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => setStep(2)}
      >
        <div className="cyber-title-wrapper">
          <Terminal className="title-icon" size={40} />
          <h1>
            SYS.LOGIN(<span className="highlight-user">{user || "UNKNOWN"}</span>)
            <span className="neon-text blink">_</span>
          </h1>
        </div>
        <p className="cyber-subtitle">SECURE VAULT ACCESS GRANTED</p>
      </motion.div>

      {/* Search Interface */}
      {step >= 2 && (
        <motion.div
          className="cyber-search-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onAnimationComplete={() => setStep(3)}
        >
          <div className="cyber-search-glass">
            <select className="cyber-select">
              <option>DATABANK</option>
              <option>PERSONNEL</option>
              <option>ASSETS</option>
              <option>CLEARANCE</option>
            </select>
            <div className="input-wrapper">
              <ScanLine className="input-icon" size={20} />
              <input className="cyber-input" placeholder="Query encrypted database..." />
            </div>
            <button className="cyber-btn scan-btn">
              <Zap size={18} /> INITIATE_SCAN
            </button>
          </div>
        </motion.div>
      )}

      {/* System Metrics */}
      {step >= 3 && (
        <motion.div
          className="cyber-metrics-grid"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, staggerChildren: 0.2 }}
        >
          <motion.div className="cyber-metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="metric-icon-box blue-glow">
              <Lock size={24} />
            </div>
            <div className="metric-info">
              <h3>ENCRYPTION</h3>
              <p className="neon-blue">AES-256 ACTIVE</p>
            </div>
          </motion.div>

          <motion.div className="cyber-metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="metric-icon-box green-glow">
              <ShieldAlert size={24} />
            </div>
            <div className="metric-info">
              <h3>THREAT LEVEL</h3>
              <p className="neon-green">SECURE [0]</p>
            </div>
          </motion.div>

          <motion.div className="cyber-metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="metric-icon-box purple-glow">
              <Cpu size={24} />
            </div>
            <div className="metric-info">
              <h3>SYSTEM INTEGRITY</h3>
              <p className="neon-purple">99.98% OPTIMAL</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Status Bar Floating */}
      {step >= 3 && (
        <motion.div
          className="cyber-status-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Activity className="pulse-icon" size={16} />
          <span>NETWORK: CONNECTED // LATENCY: 12ms // VPN: ACTIVE</span>
        </motion.div>
      )}

    </div>
  );
}