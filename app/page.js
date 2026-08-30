"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", char: "DRAUPADI", icon: "👸", gender: "female", tel: "Vastra sampada Draupadi ni, seve ku siddamga unnanu prabhu", sanskrit: "द्रौपदी", eng: "Shopping" },
  { id: 2, name: "NEWS", char: "NARADA", icon: "📿", gender: "male", tel: "Loka sanchari Narada ni, varthalu techhanu prabhu", sanskrit: "नारद", eng: "News" },
  { id: 3, name: "WEATHER", char: "INDRA", icon: "⚡", gender: "male", tel: "Varshapu devudu Indra ni, meghala samacharam techhanu prabhu", sanskrit: "इंद्र", eng: "Weather" },
  { id: 4, name: "TRIP", char: "ARJUNA", icon: "🏹", gender: "male", tel: "Maha yatri Arjuna ni, yatra margam chupistanu prabhu", sanskrit: "अर्जुन", eng: "Trip" },
  { id: 5, name: "FINANCE", char: "KUBERA", icon: "💎", gender: "male", tel: "Dhana adhipati Kubera ni, kharchu lekka chusthanu prabhu", sanskrit: "कुबेर", eng: "Finance" },
  { id: 6, name: "MAPS", char: "KRISHNA", icon: "🦚", gender: "male", tel: "Marga darshi Sri Krishna ni, nene mee Partha Saradhi prabhu", sanskrit: "कृष्ण", eng: "Guide", isKrishna: true },
  { id: 7, name: "YOUTUBE", char: "GANDHARVA", icon: "🎶", gender: "female", tel: "Gana kala Gandharva Devi ni, paatalu techhanu prabhu", sanskrit: "गंधर्व", eng: "Music" },
  { id: 8, name: "TRAIN", char: "BHEEMA", icon: "💪", gender: "male", tel: "Bala shali Bheema ni, bharam moyyagalanu prabhu", sanskrit: "भीम", eng: "Train" },
  { id: 9, name: "BUDGET", char: "VIDURA", icon: "⚖️", gender: "male", tel: "Niti shastri Vidura ni, manchi chedu chepthanu prabhu", sanskrit: "विदुर", eng: "Budget" },
  { id: 10, name: "CALENDAR", char: "SAHADEVA", icon: "🔮", gender: "male", tel: "Jyotisha Sahadeva ni, muhurtham chusthanu prabhu", sanskrit: "सहदेव", eng: "Astro" },
  { id: 11, name: "TRANSLATE", char: "SARASWATI", icon: "📜", gender: "female", tel: "Vani devi Saraswati ni, bhashalu anuvadisthanu prabhu", sanskrit: "सरस्वती", eng: "Translate" },
  { id: 12, name: "CODE", char: "VISHWAKARMA", icon: "🛠️", gender: "male", tel: "Srishti karta Vishwakarma ni, nirmisthanu prabhu", sanskrit: "विश्वकर्मा", eng: "Coder" },
];

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [brainActive, setBrainActive] = useState(false);
  const [voices, setVoices] = useState([]);
  const [started, setStarted] = useState(false);
  const ref = useRef(false);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speakTeluguOnly = (teluguText, gender, isKrishna=false) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(teluguText);
      let v = null;
      if (isKrishna) {
        v = voices.find(x=>x.name.toLowerCase().includes("david")) || voices[0];
        u.pitch = 0.75; u.rate = 0.82;
      } else if (gender === "female") {
        v = voices.find(x=>x.name.includes("Zira")||x.name.toLowerCase().includes("female")) || voices[0];
        u.pitch = 1.55; u.rate = 0.92;
      } else {
        v = voices.find(x=>x.name.includes("David")) || voices[0];
        u.pitch = 1.15; u.rate = 0.92;
      }
      if (v) u.voice = v;
      u.lang = "te-IN";
      u.onend = () => setTimeout(resolve, 700);
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  };

  useEffect(() => {
    if (ref.current || voices.length === 0) return;
    const run = async () => {
      if (ref.current) return;
      ref.current = true; setStarted(true);
      await speakTeluguOnly("Dharmo rakshati rakshitah. Pannendu mandi yodhulu siddam ayyaru prabhu.", "male", false);
      for (let ag of AGENTS) {
        setActiveAgent(ag.id);
        await speakTeluguOnly(ag.tel, ag.gender, ag.isKrishna||false);
      }
      setActiveAgent(null); setBrainActive(true);
      await speakTeluguOnly("Nenu Sri Krishna ni, mee Partha Sarathi. Antha siddam ayyindi. Mee agna kosam eduru chustunnanu prabhu.", "male", true);
      setBrainActive(false);
    };
    const t = setTimeout(run, 1000);
    return () => clearTimeout(t);
  }, [voices]);

  const send = async () => {
    if (!msg) return;
    const userMsg = msg; setChat(p=>[...p, {role:"user", text:userMsg}]); setMsg("");
    setBrainActive(true); await speakTeluguOnly("Agna prabhu, alochistunnanu.", "male", true);
    try {
      const res = await fetch("/api/avengers", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({message:userMsg}) });
      const data = await res.json();
      setChat(p=>[...p, {role:"jarvis", text:data.reply, agent:data.agent}]);
      setBrainActive(false);
      await speakTeluguOnly(data.reply.replace(/[*#🕉️⚡🏹💎🦚🎶💪⚖️🔮📜🛠️]/g,"").slice(0,380), "male", true);
    } catch(e){ setBrainActive(false); }
  };

  return (
    <div onClick={()=>{ if(!started){ window.location.reload(); } }} style={{background:"radial-gradient(ellipse at top, #1a0f00 0%, #000)", minHeight:"100vh", color:"#ffd700"}}>
      <div style={{height:"6px", background:"linear-gradient(90deg,#ff6600,#ffd700,#ff6600)"}}></div>
      <div style={{textAlign:"center", padding:"15px"}}>
        <div style={{fontSize:"10px", color:"#ffaa00"}}>॥ धर्मो रक्षति रक्षितः ॥</div>
        <div style={{fontSize:"22px", fontWeight:"900"}}>MAHABHARATA PROTOCOL</div>
        {!started && <div style={{marginTop:"10px", background:"#ffd700", color:"#000", padding:"8px 15px", borderRadius:"20px", fontSize:"11px", fontWeight:"900", display:"inline-block"}}>🔊 TAP TO START TELUGU REPORTING</div>}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"10px", padding:"15px", maxWidth:"900px", margin:"0 auto"}}>
        {AGENTS.map(a=><div key={a.id} style={{border:`2px solid ${activeAgent===a.id?"#ffd700":"rgba(255,215,0,0.2)"}`, background:"#1a0f00", padding:"10px 5px", textAlign:"center", borderRadius:"12px"}}>
          <div style={{fontSize:"26px"}}>{a.icon}</div><div style={{fontSize:"10px", fontWeight:"900"}}>{a.char}</div><div style={{fontSize:"8px", color:"#ffaa00"}}>{a.sanskrit}</div><div style={{fontSize:"6px", color:activeAgent===a.id?"#00ff88":"#444"}}>{activeAgent===a.id?"🔔 TELUGU LO CHEPTHUNNARU":"TELUGU VOICE"}</div></div>)}
      </div>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
        <div style={{width:"110px", height:"110px", borderRadius:"50%", background:brainActive?"#001a33":"#1a0f00", border:`3px solid ${brainActive?"#00d4ff":"#ffd700"}`, display:"flex", alignItems:"center", justifyContent:"center"}}><span style={{fontSize:"45px"}}>🦚</span></div>
        <div style={{marginTop:"8px", fontSize:"11px", fontWeight:"900"}}>SRI KRISHNA - BASE VOICE</div>
      </div>
      <div style={{maxWidth:"900px", margin:"10px auto", padding:"0 12px"}}>
        <div style={{minHeight:"220px", maxHeight:"380px", overflowY:"auto", border:"2px solid rgba(255,215,0,0.3)", borderRadius:"12px", background:"#0f0a00", padding:"12px"}}>
          {chat.map((c,i)=><div key={i} style={{margin:"12px 0", padding:"12px", background:c.role==="user"?"#1a1200":"#001a33", borderLeft:`4px solid ${c.role==="user"?"#ffaa00":"#00d4ff"}`, fontSize:"12.5px", whiteSpace:"pre-wrap"}}><b style={{fontSize:"9px"}}>{c.agent}:</b><br/>{c.text}</div>)}
        </div>
      </div>
      <div style={{maxWidth:"900px", margin:"15px auto", padding:"0 12px", display:"flex", gap:"8px"}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="🕉️ Aagya ivvandi Prabhu..." style={{flex:1, background:"#1a1200", border:"2px solid rgba(255,215,0,0.3)", color:"#ffd700", padding:"14px", borderRadius:"10px"}}/>
        <button onClick={send} style={{background:"#ffd700", color:"#000", border:"none", padding:"0 22px", borderRadius:"10px", fontWeight:"900"}}>YAGYA 🔥</button>
      </div>
    </div>
  );
}
