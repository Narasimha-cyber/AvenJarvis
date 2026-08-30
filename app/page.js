"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", char: "DRAUPADI", icon: "👸", gender: "female", tel: "Vastra Devatha Draupadi garu", sanskrit: "द्रौपदी", eng: "Shopping Queen" },
  { id: 2, name: "NEWS", char: "NARADA", icon: "📿", gender: "male", tel: "Loka Sanchari Narada Maharshi garu", sanskrit: "नारद", eng: "News Messenger" },
  { id: 3, name: "WEATHER", char: "INDRA", icon: "⚡", gender: "male", tel: "Varsha Devudu Indra garu", sanskrit: "इंद्र", eng: "Weather Lord" },
  { id: 4, name: "TRIP", char: "ARJUNA", icon: "🏹", gender: "male", tel: "Maha Yatri Arjuna garu", sanskrit: "अर्जुन", eng: "Trip Planner" },
  { id: 5, name: "FINANCE", char: "KUBERA", icon: "💎", gender: "male", tel: "Dhana Devudu Kubera garu", sanskrit: "कुबेर", eng: "Finance Lord" },
  { id: 6, name: "MAPS", char: "KRISHNA", icon: "🦚", gender: "male", tel: "Marga Darshi Sri Krishna garu", sanskrit: "कृष्ण", eng: "Supreme Guide", isKrishna: true },
  { id: 7, name: "YOUTUBE", char: "GANDHARVA", icon: "🎶", gender: "female", tel: "Gana Kala Gandharva Devi garu", sanskrit: "गंधर्व", eng: "Music & Video" },
  { id: 8, name: "TRAIN", char: "BHEEMA", icon: "💪", gender: "male", tel: "Bala Shali Bheema garu", sanskrit: "भीम", eng: "Train Power" },
  { id: 9, name: "BUDGET", char: "VIDURA", icon: "⚖️", gender: "male", tel: "Niti Shastri Vidura garu", sanskrit: "विदुर", eng: "Budget Wisdom" },
  { id: 10, name: "CALENDAR", char: "SAHADEVA", icon: "🔮", gender: "male", tel: "Jyotisha Sahadeva garu", sanskrit: "सहदेव", eng: "Calendar Astro" },
  { id: 11, name: "TRANSLATE", char: "SARASWATI", icon: "📜", gender: "female", tel: "Vani Devi Saraswati garu", sanskrit: "सरस्वती", eng: "Translator" },
  { id: 12, name: "CODE", char: "VISHWAKARMA", icon: "🛠️", gender: "male", tel: "Srishti Karta Vishwakarma garu", sanskrit: "विश्वकर्मा", eng: "Coder Architect" },
];

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [brainActive, setBrainActive] = useState(false);
  const [voices, setVoices] = useState([]);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    // Force load on click anywhere if blocked
    const unlock = () => { window.speechSynthesis.getVoices(); };
    window.addEventListener("click", unlock, { once: true });
    return () => window.removeEventListener("click", unlock);
  }, []);

  const speak = (text, gender, isKrishna = false) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);

      // VOICE SELECTION - FIXED
      let v = null;
      if (isKrishna) {
        v = voices.find(x => x.name.includes("Microsoft") && x.name.includes("David")) || voices.find(x => x.lang.includes("en-US") && x.name.toLowerCase().includes("male")) || voices[0];
        u.pitch = 0.8; u.rate = 0.85; // Deep devotional for Krishna
      } else if (gender === "female") {
        v = voices.find(x => x.name.includes("Zira") || x.name.includes("Samantha") || x.lang.includes("te-IN") && x.name.toLowerCase().includes("female")) || voices.find(x => x.lang.includes("en-IN") && x.name.toLowerCase().includes("female")) || null;
        u.pitch = 1.6; u.rate = 0.95; // High pitch female
      } else {
        v = voices.find(x => x.name.includes("David") || x.lang.includes("en-IN") && x.name.toLowerCase().includes("male")) || voices[0];
        u.pitch = 1.1; u.rate = 0.95; // High pitch male
      }
      if (v) u.voice = v;
      u.lang = voices.find(x => x.lang.includes("te-IN"))? "te-IN" : "en-IN";
      u.volume = 1.0;
      u.onend = () => setTimeout(resolve, 600);
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  };

  // AUTO REPORT - FIXED WITH USER INTERACTION FALLBACK
  useEffect(() => {
    if (startedRef.current || voices.length === 0) return;

    const run = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStarted(true);

      await speak("Dharmo Rakshati Rakshitah. Pannendu mandi Maha Yodhulu siddam ayyaru Prabhu.", "male", false);

      for (let i = 0; i < AGENTS.length; i++) {
        const ag = AGENTS[i];
        setActiveAgent(ag.id);
        setBrainActive(false);
        await speak(`${ag.tel} seva ku siddam. ${ag.sanskrit}.`, ag.gender, ag.isKrishna || false);
      }

      setActiveAgent(null);
      setBrainActive(true);
      await speak("Nenu Sri Krishna ni, Partha Sarathi. Nenu meeku margam chupisthanu. Mee aagya kosam eduru choosthunanu. Bhakthi tho adagandi.", "male", true);
      setBrainActive(false);
    };

    // Try auto after 1.5 sec
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, [voices]);

  // Manual start if auto blocked by browser
  const manualStart = async () => {
    if (started) return;
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    await speak("Dharmo Rakshati Rakshitah. Pannendu mandi siddam.", "male", false);
    for (let ag of AGENTS) {
      setActiveAgent(ag.id);
      await speak(`${ag.tel} seva ku siddam.`, ag.gender, ag.isKrishna||false);
    }
    setActiveAgent(null);
    setBrainActive(true);
    await speak("Nenu Sri Krishna ni. Mee aagya cheppandi.", "male", true);
    setBrainActive(false);
  };

  const send = async () => {
    if (!msg) return;
    const userMsg = msg;
    setChat(p => [...p, { role: "user", text: userMsg }]);
    setMsg("");
    setBrainActive(true);
    await speak("Aagya Prabhu, alochistunnanu, koncham aagandi.", "male", true);

    try {
      const res = await fetch("/api/avengers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();
      setChat(p => [...p, { role: "jarvis", text: data.reply, agent: data.agent }]);
      setBrainActive(false);
      const clean = data.reply.replace(/[*#]/g, "").slice(0, 400);
      await speak(clean, "male", true);
    } catch (e) {
      setChat(p => [...p, { role: "jarvis", text: "Error Prabhu: " + e.message, agent: "ERROR" }]);
      setBrainActive(false);
    }
  };

  return (
    <div onClick={manualStart} style={{ background: "radial-gradient(ellipse at top, #1a0f00 0%, #000)", minHeight: "100vh", color: "#ffd700", fontFamily: "sans-serif" }}>
      <div style={{ height: "6px", background: "linear-gradient(90deg, #ff6600, #ffd700, #ff6600)" }}></div>
      <div style={{ textAlign: "center", padding: "15px" }}>
        <div style={{ fontSize: "10px", color: "#ffaa00" }}>॥ धर्मो रक्षति रक्षितः ॥</div>
        <div style={{ fontSize: "22px", fontWeight: "900", textShadow: "0 0 20px #ff6600" }}>MAHABHARATA PROTOCOL</div>
        <div style={{ fontSize: "9px", color: "#ff6600" }}>12 YODHAS + 1 PARAMATMA</div>
        {!started && <div style={{ marginTop: "10px", background: "#ffd700", color: "#000", padding: "8px 15px", borderRadius: "20px", fontSize: "11px", fontWeight: "900", display: "inline-block", animation: "pulse 1s infinite" }}>🔊 TAP ANYWHERE TO START DHARMA REPORTING 🕉️</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "15px", maxWidth: "900px", margin: "0 auto" }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ border: `2px solid ${activeAgent===a.id? "#ffd700" : "rgba(255,215,0,0.2)"}`, background: activeAgent===a.id? "#332200" : "#1a0f00", padding: "10px 5px", textAlign: "center", borderRadius: "12px", transform: activeAgent===a.id? "scale(1.05)" : "scale(1)", transition: "0.3s" }}>
            <div style={{ fontSize: "26px" }}>{a.icon}</div>
            <div style={{ fontSize: "10px", fontWeight: "900" }}>{a.char}</div>
            <div style={{ fontSize: "8px", color: "#ffaa00" }}>{a.sanskrit}</div>
            <div style={{ fontSize: "6.5px", color: "#aaa" }}>{a.eng}</div>
            <div style={{ fontSize: "6px", marginTop: "4px", color: activeAgent===a.id? "#00ff88" : "#444" }}>{activeAgent===a.id? "🔔 CHEPTHUNNARU..." : a.isKrishna? "🦚 BASE VOICE - DEEP DEVOTIONAL" : a.gender==="female"? "🎤 Female High Pitch" : "🎤 Male High Pitch"}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px 0" }}>
        <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: brainActive? "#001a33" : "#1a0f00", border: `3px solid ${brainActive? "#00d4ff" : "#ffd700"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: brainActive? "0 0 50px #00d4ff" : "0 0 30px #ffd700" }}>
          <span style={{ fontSize: "45px" }}>🦚</span>
        </div>
        <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: "900", color: brainActive? "#00d4ff" : "#ffd700" }}>🧠 SRI KRISHNA - PARAMATMA BRAIN (BASE VOICE)</div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 12px" }}>
        <div style={{ minHeight: "220px", maxHeight: "380px", overflowY: "auto", border: "2px solid rgba(255,215,0,0.3)", borderRadius: "12px", background: "#0f0a00", padding: "12px" }}>
          {chat.map((c,i)=><div key={i} style={{ margin: "12px 0", padding: "12px", background: c.role==="user"? "#1a1200" : "#001a33", borderLeft: `4px solid ${c.role==="user"? "#ffaa00" : "#00d4ff"}`, borderRadius: "0 8px 8px 0", fontSize: "12.5px", whiteSpace: "pre-wrap" }}><b style={{ fontSize: "9px" }}>{c.agent}:</b><br/>{c.text}</div>)}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "15px auto", padding: "0 12px", display: "flex", gap: "8px" }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="🕉️ Aagya ivvandi Prabhu..." style={{ flex: 1, background: "#1a1200", border: "2px solid rgba(255,215,0,0.3)", color: "#ffd700", padding: "14px", borderRadius: "10px", outline: "none" }} />
        <button onClick={send} style={{ background: "#ffd700", color: "#000", border: "none", padding: "0 22px", borderRadius: "10px", fontWeight: "900" }}>YAGYA 🔥</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
    </div>
  );
}
