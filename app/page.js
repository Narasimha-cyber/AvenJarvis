"use client";
import { useState, useEffect } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", char: "DRAUPADI", icon: "👸", gender: "female", role: "Vastra Sampada", color: "#ff1493", sanskrit: "द्रौपदी" },
  { id: 2, name: "NEWS", char: "NARADA", icon: "📿", gender: "male", role: "Loka Sanchara", color: "#ffaa00", sanskrit: "नारद" },
  { id: 3, name: "WEATHER", char: "INDRA", icon: "⚡", gender: "male", role: "Megha Adhipati", color: "#00d4ff", sanskrit: "इंद्र" },
  { id: 4, name: "TRIP", char: "ARJUNA", icon: "🏹", gender: "male", role: "Yatra Nayaka", color: "#ffffff", sanskrit: "अर्जुन" },
  { id: 5, name: "FINANCE", char: "KUBERA", icon: "💎", gender: "male", role: "Dhana Adhipati", color: "#ffd700", sanskrit: "कुबेर" },
  { id: 6, name: "MAPS", char: "KRISHNA", icon: "🦚", gender: "male", role: "Marga Darshaka", color: "#0080ff", sanskrit: "कृष्ण" },
  { id: 7, name: "YOUTUBE", char: "GANDHARVA", icon: "🎶", gender: "female", role: "Gana Kala", color: "#ff00ff", sanskrit: "गंधर्व" },
  { id: 8, name: "TRAIN", char: "BHEEMA", icon: "💪", gender: "male", role: "Vayu Putra", color: "#ff4500", sanskrit: "भीम" },
  { id: 9, name: "BUDGET", char: "VIDURA", icon: "⚖️", gender: "male", role: "Niti Shastra", color: "#00ff88", sanskrit: "विदुर" },
  { id: 10, name: "CALENDAR", char: "SAHADEVA", icon: "🔮", gender: "male", role: "Jyotisha", color: "#aa00ff", sanskrit: "सहदेव" },
  { id: 11, name: "TRANSLATE", char: "SARASWATI", icon: "📜", gender: "female", role: "Vani Devi", color: "#fffacd", sanskrit: "सरस्वती" },
  { id: 12, name: "CODE", char: "VISHWAKARMA", icon: "🛠️", gender: "male", role: "Srishti Karta", color: "#ff6600", sanskrit: "विश्वकर्मा" },
];

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [brainActive, setBrainActive] = useState(false);
  const [voices, setVoices] = useState([]);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text, gender = "male", highPitch = true) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    // SELECT VOICE BY GENDER
    let selectedVoice = null;
    if (voices.length > 0) {
      if (gender === "female") {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.includes("Google") && v.lang.includes("en")) || voices[1];
      } else {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.includes("Google") && v.lang.includes("en")) || voices[0];
      }
    }
    if (selectedVoice) utter.voice = selectedVoice;

    utter.volume = 1.0;
    utter.rate = highPitch? 1.15 : 0.95;
    utter.pitch = gender === "female"? 1.8 : highPitch? 1.4 : 0.9;
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (introDone) return;
    const timer = setTimeout(() => {
      speak("Dharma Samsthapana. All 12 Mahabharata Yodhas Reported Ready, Prabhu.", "male", true);

      let i = 0;
      const interval = setInterval(() => {
        if (i < AGENTS.length) {
          const ag = AGENTS[i];
          setActiveAgent(ag.id);
          setBrainActive(false);
          const line = `${ag.char}, ${ag.role} Agent, Reported Ready. ${ag.sanskrit}`;
          speak(line, ag.gender, true);
        } else {
          clearInterval(interval);
          setActiveAgent(null);
          setBrainActive(true);
          speak("I am Krishna, The Supreme Brain, Partha Sarathi. Aham Brahmasmi. All Protocols Active.", "male", true);
          setTimeout(() => setBrainActive(false), 3000);
          setIntroDone(true);
        }
        i++;
      }, 2200);
    }, 1500);
    return () => clearTimeout(timer);
  }, [voices, introDone]);

  const send = async () => {
    if (!msg) return;
    const userMsg = msg;
    setChat(prev => [...prev, { role: "user", text: userMsg }]);
    setMsg("");
    setBrainActive(true);
    speak("Aagya Prabhu, Vicharana Prarambha...", "male", true);

    const lower = userMsg.toLowerCase();
    if (lower.includes("buy") || lower.includes("shop")) setActiveAgent(1);
    else if (lower.includes("news")) setActiveAgent(2);
    else if (lower.includes("weather")) setActiveAgent(3);
    else if (lower.includes("trip") || lower.includes("eluru") || lower.includes("manali")) setActiveAgent(4);
    else if (lower.includes("finance") || lower.includes("money")) setActiveAgent(5);
    else if (lower.includes("map")) setActiveAgent(6);
    else if (lower.includes("youtube")) setActiveAgent(7);
    else if (lower.includes("train")) setActiveAgent(8);
    else if (lower.includes("budget")) setActiveAgent(9);
    else if (lower.includes("calendar") || lower.includes("date")) setActiveAgent(10);
    else if (lower.includes("translate")) setActiveAgent(11);
    else setActiveAgent(12);

    try {
      const res = await fetch("/api/avengers", { method: "POST", body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();

      setChat(prev => [...prev, { role: "jarvis", text: data.reply, agent: data.agent }]);
      setBrainActive(false);
      setActiveAgent(null);

      const cleanText = data.reply.replace(/[*#_]/g, "").slice(0, 250);
      speak(cleanText, "male", false);

    } catch (e) {
      setChat(prev => [...prev, { role: "jarvis", text: "Kshamya Prabhu, Maya Jaalam... Error.", agent: "ERROR" }]);
      setBrainActive(false);
    }
  };

  return (
    <div style={{ background: "radial-gradient(ellipse at top, #1a0f00 0%, #000000 70%)", minHeight: "100vh", color: "#ffd700", fontFamily: "'Cinzel', serif", padding: "0", overflowX: "hidden" }}>

      {/* TEMPLE TOP BORDER */}
      <div style={{ height: "6px", background: "linear-gradient(90deg, #ff6600, #ffd700, #ff6600)", boxShadow: "0 0 20px #ff6600" }}></div>

      {/* HEADER - DEVOTIONAL */}
      <div style={{ textAlign: "center", padding: "15px 10px", background: "linear-gradient(180deg, rgba(255,215,0,0.1), transparent)", borderBottom: "1px solid rgba(255,215,0,0.2)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#ffaa00" }}>॥ धर्मो रक्षति रक्षितः ॥</div>
        <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffd700", textShadow: "0 0 20px #ff6600, 0 0 40px #ffd700", margin: "5px 0", letterSpacing: "3px" }}>MAHABHARATA PROTOCOL</div>
        <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#ff6600" }}>12 YODHAS + 1 PARAMATMA = 13X DHARMA SHAKTI</div>
        <div style={{ marginTop: "8px", fontSize: "18px" }}>🕉️ 📿 🦚 🏹 ⚔️</div>
      </div>

      {/* 12 AGENTS - TEMPLE PILLARS STYLE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "15px", maxWidth: "900px", margin: "0 auto" }}>
        {AGENTS.map(a => (
          <div key={a.id}
            onClick={() => speak(`${a.char}, ${a.role}. ${a.sanskrit}. Ready for Seva.`, a.gender, true)}
            style={{
            border: `2px solid ${activeAgent===a.id? a.color : "rgba(255,215,0,0.2)"}`,
            background: activeAgent===a.id? `radial-gradient(circle, ${a.color}33, #1a0f00)` : "linear-gradient(180deg, #1a0f00, #0a0500)",
            padding: "12px 5px", textAlign: "center", borderRadius: "12px",
            boxShadow: activeAgent===a.id? `0 0 30px ${a.color}, inset 0 0 20px ${a.color}33` : "0 4px 15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,215,0,0.1)",
            transform: activeAgent===a.id? "scale(1.05) translateY(-3px)" : "scale(1)",
            transition: "all 0.4s ease", cursor: "pointer", position: "relative", overflow: "hidden"
          }}>
            {activeAgent===a.id && <div style={{ position: "absolute", top: "0", left: "0", right: "0", height: "2px", background: a.color, boxShadow: `0 0 10px ${a.color}` }}></div>}
            <div style={{ fontSize: "26px", filter: activeAgent===a.id? `drop-shadow(0 0 10px ${a.color})` : "none" }}>{a.icon}</div>
            <div style={{ fontSize: "10px", fontWeight: "900", marginTop: "6px", color: activeAgent===a.id? a.color : "#ffd700", letterSpacing: "1px" }}>{a.char}</div>
            <div style={{ fontSize: "7px", color: a.gender==="female"? "#ff69b4" : "#ffaa00", marginTop: "2px" }}>{a.sanskrit} • {a.gender==="female"? "स्त्री" : "पुरुष"}</div>
            <div style={{ fontSize: "6.5px", color: "#888", marginTop: "3px", lineHeight: "1.2" }}>{a.role}<br/>{a.name}</div>
            <div style={{ fontSize: "6px", color: activeAgent===a.id? a.color : "#444", marginTop: "4px", fontWeight: "bold" }}>{activeAgent===a.id? "🔔 SEVA ACTIVE" : "🪔 READY"}</div>
          </div>
        ))}
      </div>

      {/* CENTRAL KRISHNA BRAIN - SUDARSHAN CHAKRA */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px 0 15px 0" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: "110px", height: "110px", borderRadius: "50%",
            background: brainActive? "radial-gradient(circle, #0080ff, #001a33)" : "radial-gradient(circle, #1a0f00, #000)",
            border: `3px solid ${brainActive? "#00d4ff" : "#ffd700"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: brainActive? "0 0 50px #00d4ff, 0 0 80px #0080ff, inset 0 0 30px #00d4ff55" : "0 0 30px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,215,0,0.1)",
            animation: brainActive? "chakra 1.5s linear infinite" : "float 3s ease-in-out infinite",
            cursor: "pointer"
          }}
          onClick={() => speak("Aham Krishnasmi, Partha Sarathi. What is your Aagya?", "male", true)}
          >
            <span style={{ fontSize: "45px", filter: brainActive? "drop-shadow(0 0 15px #00d4ff)" : "drop-shadow(0 0 10px #ffd700)" }}>🦚</span>
          </div>
          {brainActive && <div style={{ position: "absolute", top: "-10px", left: "-10px", right: "-10px", bottom: "-10px", borderRadius: "50%", border: "1px dashed #00d4ff", animation: "chakra 2s linear infinite reverse", opacity: 0.5 }}></div>}
        </div>
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: "900", color: brainActive? "#00d4ff" : "#ffd700", letterSpacing: "2px", textShadow: brainActive? "0 0 15px #00d4ff" : "0 0 10px #ffd700" }}>🧠 SRI KRISHNA - PARAMATMA BRAIN</div>
          <div style={{ fontSize: "8px", color: "#ffaa00", marginTop: "3px", letterSpacing: "1px" }}>{brainActive? "🌀 SUDARSHAN CHAKRA ACTIVE - VICHARANA..." : "🕉️ SARATHI READY - 5 DIVYA ASTRA ACTIVE"}</div>
        </div>
      </div>

      {/* CHAT - PALM LEAF MANUSCRIPT STYLE */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 12px" }}>
        <div style={{ minHeight: "220px", maxHeight: "380px", overflowY: "auto", border: "2px solid rgba(255,215,0,0.3)", borderRadius: "12px", background: "linear-gradient(180deg, #0f0a00, #000)", padding: "12px", boxShadow: "inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,215,0,0.1)" }}>
          {chat.length===0 && <div style={{ color: "#665500", fontSize: "11px", textAlign: "center", marginTop: "60px", lineHeight: "1.8" }}>🕉️ Dharmo Rakshati Rakshitah<br/>All 12 Yodhas Reporting For Dharma Seva...<br/><br/>Adugu Prabhu: <br/>"Eluru to Manali Yatra" / "Vastra Krayam" / "Varsha Suchana"</div>}
          {chat.map((c,i)=>(
            <div key={i} style={{ margin: "12px 0", padding: "12px", background: c.role==="user"? "linear-gradient(90deg, #1a1200, #0f0a00)" : "linear-gradient(90deg, #001a33, #000a1a)", borderLeft: `4px solid ${c.role==="user"? "#ffaa00" : "#00d4ff"}`, borderRadius: "0 8px 8px 0", fontSize: "12.5px", whiteSpace: "pre-wrap", color: c.role==="user"? "#ffcc66" : "#aaddff", lineHeight: "1.6", boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: "9px", fontWeight: "900", color: c.role==="user"? "#ffaa00" : "#00d4ff", marginBottom: "6px", letterSpacing: "1px" }}>{c.role==="user"? "👤 BHक्त (YOU)" : `🦚 ${c.agent} - KRISHNA VANI`}:</div>
              {c.text}
            </div>
          ))}
        </div>
      </div>

      {/* INPUT - YAGNA KUNDAM STYLE */}
      <div style={{ maxWidth: "900px", margin: "15px auto", padding: "0 12px", display: "flex", gap: "8px" }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="🕉️ Aagya Deejiye Prabhu... (Ex: Eluru to Manali Yatra / Cargo pants krayam)" style={{ flex: 1, background: "linear-gradient(180deg, #1a1200, #0a0800)", border: "2px solid rgba(255,215,0,0.3)", color: "#ffd700", padding: "14px 12px", borderRadius: "10px", outline: "none", fontSize: "13px", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.8)" }} />
        <button onClick={send} style={{ background: "linear-gradient(180deg, #ffd700, #ffaa00)", color: "#000", border: "none", padding: "0 22px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "12px", letterSpacing: "1px", boxShadow: "0 0 20px rgba(255,215,0,0.5)", textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}>YAGYA 🔥</button>
      </div>

      <div style={{ textAlign: "center", padding: "12px", fontSize: "8px", color: "#554400", letterSpacing: "2px" }}>॥ सर्वे भवन्तु सुखिनः ॥ MADE WITH BHAKTI FOR DHARMA ॥</div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
        @keyframes chakra { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.05); } 100% { transform: rotate(360deg) scale(1); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #ffd700; border-radius: 3px; }
      `}</style>
    </div>
  );
}
