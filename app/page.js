"use client";
import { useState, useEffect } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", char: "DRAUPADI", icon: "👸", gender: "female", role: "Vastra Sampada", color: "#ff1493", sanskrit: "द्रौपदी", eng: "Goddess of Clothing", tel: "Vastra Devatha Draupadi" },
  { id: 2, name: "NEWS", char: "NARADA", icon: "📿", gender: "male", role: "Loka Sanchara", color: "#ffaa00", sanskrit: "नारद", eng: "Messenger of Worlds", tel: "Loka Sanchari Narada Maharshi" },
  { id: 3, name: "WEATHER", char: "INDRA", icon: "⚡", gender: "male", role: "Megha Adhipati", color: "#00d4ff", sanskrit: "इंद्र", eng: "Lord of Rain & Weather", tel: "Varsha Devudu Indra" },
  { id: 4, name: "TRIP", char: "ARJUNA", icon: "🏹", gender: "male", role: "Yatra Nayaka", color: "#ffffff", sanskrit: "अर्जुन", eng: "Great Traveler Warrior", tel: "Maha Yatri Arjuna" },
  { id: 5, name: "FINANCE", char: "KUBERA", icon: "💎", gender: "male", role: "Dhana Adhipati", color: "#ffd700", sanskrit: "कुबेर", eng: "Lord of Wealth", tel: "Dhana Devudu Kubera" },
  { id: 6, name: "MAPS", char: "KRISHNA", icon: "🦚", gender: "male", role: "Marga Darshaka", color: "#0080ff", sanskrit: "कृष्ण", eng: "Divine Guide", tel: "Marga Darshi Sri Krishna" },
  { id: 7, name: "YOUTUBE", char: "GANDHARVA", icon: "🎶", gender: "female", role: "Gana Kala", color: "#ff00ff", sanskrit: "गंधर्व", eng: "Celestial Musician", tel: "Gana Kala Gandharva Devi" },
  { id: 8, name: "TRAIN", char: "BHEEMA", icon: "💪", gender: "male", role: "Vayu Putra", color: "#ff4500", sanskrit: "भीम", eng: "Mighty Force", tel: "Bala Shali Bheema" },
  { id: 9, name: "BUDGET", char: "VIDURA", icon: "⚖️", gender: "male", role: "Niti Shastra", color: "#00ff88", sanskrit: "विदुर", eng: "Master of Wisdom", tel: "Niti Shastri Vidura" },
  { id: 10, name: "CALENDAR", char: "SAHADEVA", icon: "🔮", gender: "male", role: "Jyotisha", color: "#aa00ff", sanskrit: "सहदेव", eng: "Astrology Expert", tel: "Jyotisha Shastri Sahadeva" },
  { id: 11, name: "TRANSLATE", char: "SARASWATI", icon: "📜", gender: "female", role: "Vani Devi", color: "#fffacd", sanskrit: "सरस्वती", eng: "Goddess of Knowledge", tel: "Vani Devi Saraswati" },
  { id: 12, name: "CODE", char: "VISHWAKARMA", icon: "🛠️", gender: "male", role: "Srishti Karta", color: "#ff6600", sanskrit: "विश्वकर्मा", eng: "Divine Architect", tel: "Srishti Karta Vishwakarma" },
];

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [brainActive, setBrainActive] = useState(false);
  const [voices, setVoices] = useState([]);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // TELUGU VOICE - ONE AFTER ONE (No Overlap)
  const speakTelugu = (text, gender) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);

      // Try to find Telugu voice
      let telVoice = voices.find(v => v.lang.includes("te") || v.lang.includes("te-IN"));
      let femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.includes("Zira") || v.name.includes("Google") && v.name.includes("Telugu"));
      let maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.includes("David"));

      if (telVoice) utter.voice = telVoice;
      else if (gender === "female" && femaleVoice) utter.voice = femaleVoice;
      else if (maleVoice) utter.voice = maleVoice;

      utter.lang = telVoice? "te-IN" : "te-IN"; // Force Telugu
      utter.volume = 1.0;
      utter.rate = 0.9; // Slow for Telugu clarity
      utter.pitch = gender === "female"? 1.6 : 1.1; // High pitch as you asked

      utter.onend = () => { setTimeout(resolve, 400); }; // Gap after each
      utter.onerror = () => resolve();

      window.speechSynthesis.speak(utter);
    });
  };

  // SEQUENTIAL REPORTING - ONE COMPLETE THEN NEXT
  useEffect(() => {
    if (introDone || voices.length === 0) return;

    const startSequence = async () => {
      await speakTelugu("Dharmo Rakshati Rakshitah. Pannendu mandi Maha Yodhulu siddham ayyaru Prabhu.", "male");

      for (let i = 0; i < AGENTS.length; i++) {
        const ag = AGENTS[i];
        setActiveAgent(ag.id);
        setBrainActive(false);
        // TELUGU VOICE FULL
        await speakTelugu(`${ag.tel} garu, ${ag.role} agent, Seva ku siddham.`, ag.gender);
      }

      setActiveAgent(null);
      setBrainActive(true);
      await speakTelugu("Nenu Sri Krishna ni, Partha Sarathi. Antha siddham ayyindi. Mee aagya kosam eduru choosthunnanu.", "male");
      setBrainActive(false);
      setIntroDone(true);
    };

    const timer = setTimeout(startSequence, 1200);
    return () => clearTimeout(timer);
  }, [voices, introDone]);

  const send = async () => {
    if (!msg) return;
    const userMsg = msg;
    setChat(prev => [...prev, { role: "user", text: userMsg }]);
    setMsg("");
    setBrainActive(true);
    await speakTelugu("Aagya Prabhu, alochistunnanu...", "male");

    const lower = userMsg.toLowerCase();
    if (lower.includes("buy")) setActiveAgent(1);
    else if (lower.includes("news")) setActiveAgent(2);
    else if (lower.includes("weather")) setActiveAgent(3);
    else if (lower.includes("trip") || lower.includes("eluru") || lower.includes("manali")) setActiveAgent(4);
    else if (lower.includes("finance")) setActiveAgent(5);
    else if (lower.includes("map")) setActiveAgent(6);
    else if (lower.includes("youtube")) setActiveAgent(7);
    else if (lower.includes("train")) setActiveAgent(8);
    else if (lower.includes("budget")) setActiveAgent(9);
    else if (lower.includes("calendar")) setActiveAgent(10);
    else if (lower.includes("translate")) setActiveAgent(11);
    else setActiveAgent(12);

    try {
      const res = await fetch("/api/avengers", { method: "POST", body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();
      setChat(prev => [...prev, { role: "jarvis", text: data.reply, agent: data.agent }]);
      setBrainActive(false);
      setActiveAgent(null);

      // Speak response in Telugu
      const clean = data.reply.replace(/[*#_🕉️📿⚡🏹💎🦚🎶💪⚖️🔮📜🛠️💰👸]/g, "").slice(0, 300);
      await speakTelugu(clean + " Sarvam Krishnarpanam.", "male");

    } catch (e) {
      setChat(prev => [...prev, { role: "jarvis", text: "Kshaminchandi Prabhu, koncham aatankam... Malli prayatninchandi.", agent: "ERROR" }]);
      setBrainActive(false);
    }
  };

  return (
    <div style={{ background: "radial-gradient(ellipse at top, #1a0f00 0%, #000000 70%)", minHeight: "100vh", color: "#ffd700", fontFamily: "sans-serif", padding: "0" }}>
      <div style={{ height: "6px", background: "linear-gradient(90deg, #ff6600, #ffd700, #ff6600)", boxShadow: "0 0 20px #ff6600" }}></div>

      <div style={{ textAlign: "center", padding: "15px 10px", background: "linear-gradient(180deg, rgba(255,215,0,0.1), transparent)", borderBottom: "1px solid rgba(255,215,0,0.2)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#ffaa00" }}>॥ धर्मो रक्षति रक्षितः ॥ DHARMO RAKSHATI RAKSHITAH</div>
        <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffd700", textShadow: "0 0 20px #ff6600, 0 0 40px #ffd700", margin: "5px 0", letterSpacing: "3px" }}>MAHABHARATA PROTOCOL</div>
        <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#ff6600" }}>12 YODHAS + 1 PARAMATMA = 13X DHARMA SHAKTI</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "15px", maxWidth: "900px", margin: "0 auto" }}>
        {AGENTS.map(a => (
          <div key={a.id}
            onClick={async () => { setActiveAgent(a.id); await speakTelugu(`${a.tel} garu siddham ga unnaru. Sanskrit lo ${a.sanskrit}. English lo ${a.eng}`, a.gender); setActiveAgent(null); }}
            style={{
            border: `2px solid ${activeAgent===a.id? a.color : "rgba(255,215,0,0.2)"}`,
            background: activeAgent===a.id? `radial-gradient(circle, ${a.color}33, #1a0f00)` : "linear-gradient(180deg, #1a0f00, #0a0500)",
            padding: "10px 5px", textAlign: "center", borderRadius: "12px",
            boxShadow: activeAgent===a.id? `0 0 30px ${a.color}` : "0 4px 15px rgba(0,0,0,0.8)",
            transform: activeAgent===a.id? "scale(1.05)" : "scale(1)",
            transition: "all 0.3s ease", cursor: "pointer"
          }}>
            <div style={{ fontSize: "26px" }}>{a.icon}</div>
            <div style={{ fontSize: "10px", fontWeight: "900", marginTop: "6px", color: activeAgent===a.id? a.color : "#ffd700" }}>{a.char}</div>
            <div style={{ fontSize: "8px", color: "#ffaa00", marginTop: "2px", fontWeight: "bold" }}>{a.sanskrit}</div>
            <div style={{ fontSize: "6.5px", color: a.gender==="female"? "#ff69b4" : "#aaa", marginTop: "2px" }}>{a.eng}</div>
            <div style={{ fontSize: "6.5px", color: "#888", marginTop: "2px" }}>{a.role}</div>
            <div style={{ fontSize: "6px", color: activeAgent===a.id? a.color : "#444", marginTop: "4px", fontWeight: "bold" }}>{activeAgent===a.id? "🔔 MATLADUTHUNNARU..." : `🪔 ${a.gender==="female"? "Female Voice" : "Male Voice"} High Pitch`}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px 0" }}>
        <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: brainActive? "radial-gradient(circle, #0080ff, #001a33)" : "radial-gradient(circle, #1a0f00, #000)", border: `3px solid ${brainActive? "#00d4ff" : "#ffd700"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: brainActive? "0 0 50px #00d4ff" : "0 0 30px rgba(255,215,0,0.4)", animation: brainActive? "chakra 1.5s linear infinite" : "float 3s ease-in-out infinite" }}>
          <span style={{ fontSize: "45px" }}>🦚</span>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "900", color: brainActive? "#00d4ff" : "#ffd700" }}>🧠 SRI KRISHNA - PARAMATMA BRAIN</div>
          <div style={{ fontSize: "8px", color: "#ffaa00" }}>{brainActive? "🌀 Alocistunnanu..." : "🕉️ SIDDHAM - 5 DIVYA ASTRA ACTIVE"}</div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 12px" }}>
        <div style={{ minHeight: "220px", maxHeight: "380px", overflowY: "auto", border: "2px solid rgba(255,215,0,0.3)", borderRadius: "12px", background: "linear-gradient(180deg, #0f0a00, #000)", padding: "12px" }}>
          {chat.length===0 && <div style={{ color: "#665500", fontSize: "11px", textAlign: "center", marginTop: "50px", lineHeight: "1.8" }}>🕉️ All 12 Yodhas Okari Tarvata Okari Report Chestaru...<br/>Sanskrit + English Text Untundi, Voice Matram Telugu lo Vastundi<br/><br/>Example: "Eluru to Manali Yatra"</div>}
          {chat.map((c,i)=>(
            <div key={i} style={{ margin: "12px 0", padding: "12px", background: c.role==="user"? "#1a1200" : "#001a33", borderLeft: `4px solid ${c.role==="user"? "#ffaa00" : "#00d4ff"}`, borderRadius: "0 8px 8px 0", fontSize: "12.5px", whiteSpace: "pre-wrap", color: c.role==="user"? "#ffcc66" : "#aaddff" }}>
              <b style={{ fontSize: "9px", color: c.role==="user"? "#ffaa00" : "#00d4ff" }}>{c.role==="user"? "YOU" : c.agent}:</b><br/>{c.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "15px auto", padding: "0 12px", display: "flex", gap: "8px" }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="🕉️ Aagya ivvandi Prabhu..." style={{ flex: 1, background: "#1a1200", border: "2px solid rgba(255,215,0,0.3)", color: "#ffd700", padding: "14px", borderRadius: "10px", outline: "none" }} />
        <button onClick={send} style={{ background: "linear-gradient(180deg, #ffd700, #ffaa00)", color: "#000", border: "none", padding: "0 22px", borderRadius: "10px", fontWeight: "900", cursor: "pointer" }}>YAGYA 🔥</button>
      </div>

      <style>{`
        @keyframes chakra { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}
