"use client";
import { useState } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", icon: "🛒", color: "#00ff88" },
  { id: 2, name: "NEWS", icon: "📰", color: "#ff0055" },
  { id: 3, name: "WEATHER", icon: "🌦️", color: "#00d4ff" },
  { id: 4, name: "TRIP", icon: "✈️", color: "#ffaa00" },
  { id: 5, name: "FINANCE", icon: "💰", color: "#ffd700" },
  { id: 6, name: "MAPS", icon: "🗺️", color: "#00ffaa" },
  { id: 7, name: "YOUTUBE", icon: "▶️", color: "#ff0000" },
  { id: 8, name: "TRAIN", icon: "🚆", color: "#aa00ff" },
  { id: 9, name: "BUDGET", icon: "📊", color: "#00ff00" },
  { id: 10, name: "CALENDAR", icon: "📅", color: "#ff6600" },
  { id: 11, name: "TRANSLATE", icon: "🌐", color: "#00aaff" },
  { id: 12, name: "CODE", icon: "💻", color: "#ff00ff" },
];

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [brainActive, setBrainActive] = useState(false);

  const send = async () => {
    if(!msg) return;
    setChat([...chat, { role: "user", text: msg }]);
    setBrainActive(true);
    
    // Auto detect agent for UI glow
    const lower = msg.toLowerCase();
    if(lower.includes("buy") || lower.includes("shop")) setActiveAgent(1);
    else if(lower.includes("news")) setActiveAgent(2);
    else if(lower.includes("weather")) setActiveAgent(3);
    else if(lower.includes("trip") || lower.includes("eluru")) setActiveAgent(4);
    else if(lower.includes("finance") || lower.includes("price")) setActiveAgent(5);
    else if(lower.includes("map")) setActiveAgent(6);
    else if(lower.includes("youtube") || lower.includes("video")) setActiveAgent(7);
    else if(lower.includes("train")) setActiveAgent(8);
    else if(lower.includes("budget")) setActiveAgent(9);
    else setActiveAgent(12);

    const res = await fetch("/api/avengers", {
      method: "POST",
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    
    setChat(prev => [...prev, { role: "jarvis", text: data.reply, agent: data.agent }]);
    setMsg("");
    setBrainActive(false);
    setActiveAgent(null);
  };

  return (
    <div style={{ background: "#020202", minHeight: "100vh", color: "#fff", fontFamily: "monospace", padding: "10px" }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", color: "#ffcc00", fontSize: "12px", letterSpacing: "2px" }}>
        AVENGERS PROTOCOL : 12 VERIFIED + 1 BRAIN = 13X POWER
      </div>

      {/* 12 AGENTS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", margin: "15px 0", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ 
            border: `1px solid ${activeAgent===a.id? a.color : "#333"}`, 
            background: activeAgent===a.id? `${a.color}22` : "#111",
            padding: "8px", textAlign: "center", borderRadius: "6px",
            boxShadow: activeAgent===a.id? `0 0 15px ${a.color}` : "none",
            transition: "0.3s"
          }}>
            <div style={{ fontSize: "20px" }}>{a.icon}</div>
            <div style={{ fontSize: "8px", marginTop: "4px", color: activeAgent===a.id? a.color : "#888" }}>{a.name}</div>
            <div style={{ fontSize: "6px", color: "#555" }}>{activeAgent===a.id? "ACTIVE" : "READY"}</div>
          </div>
        ))}
      </div>

      {/* BRAIN */}
      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
        <div style={{ 
          width: "90px", height: "90px", borderRadius: "50%", 
          background: brainActive? "#00ff88" : "#111",
          border: `3px solid ${brainActive? "#00ff88" : "#333"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: brainActive? "0 0 40px #00ff88" : "0 0 10px #222",
          animation: brainActive? "pulse 1s infinite" : "none"
        }}>
          <span style={{ fontSize: "30px" }}>🧠</span>
        </div>
      </div>
      <div style={{ textAlign: "center", color: brainActive? "#00ff88" : "#555", fontSize: "10px" }}>
        {brainActive? "JARVIS PRIME THINKING WITH 5 REAL APIs..." : "BRAIN READY - 5 KEYS ACTIVE"}
      </div>

      {/* CHAT */}
      <div style={{ maxWidth: "800px", margin: "20px auto", minHeight: "200px", border: "1px solid #222", padding: "10px", borderRadius: "8px", background: "#0a0a0a" }}>
        {chat.length===0 && <div style={{ color: "#444", fontSize: "12px", textAlign: "center", marginTop: "50px" }}>All Agents Reported Ready! Adugu bro edo okati... Ex: cargo pants buy, eluru to tirupati trip, weather in vizag</div>}
        {chat.map((c,i)=>(
          <div key={i} style={{ margin: "10px 0", padding: "10px", background: c.role==="user"? "#111" : "#001a0f", borderLeft: `3px solid ${c.role==="user"? "#333" : "#00ff88"}`, fontSize: "13px", whiteSpace: "pre-wrap" }}>
            <b style={{ color: c.role==="user"? "#888" : "#00ff88" }}>{c.role==="user"? "YOU" : `JARVIS [${c.agent}]`}:</b> {c.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", gap: "8px" }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="Type: cargo pants buy / trip / news / weather..." style={{ flex: 1, background: "#111", border: "1px solid #333", color: "#fff", padding: "12px", borderRadius: "6px", outline: "none" }} />
        <button onClick={send} style={{ background: "#00ff88", color: "#000", border: "none", padding: "0 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>SEND</button>
      </div>

      <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }`}</style>
    </div>
  );
}
