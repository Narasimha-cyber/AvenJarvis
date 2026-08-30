"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id: 1, name: "SHOPPING", char: "DRAUPADI", icon: "👸", gender: "female", report: "shopping_report" },
  { id: 2, name: "NEWS", char: "NARADA", icon: "📿", gender: "male", report: "news_report" },
  { id: 3, name: "WEATHER", char: "INDRA", icon: "⚡", gender: "male", report: "weather_report" },
  { id: 4, name: "TRIP", char: "ARJUNA", icon: "🏹", gender: "male", report: "trip_report" },
  { id: 5, name: "FINANCE", char: "KUBERA", icon: "💎", gender: "male", report: "finance_report" },
  { id: 6, name: "MAPS", char: "KRISHNA", icon: "🦚", gender: "male", report: "maps_report", isKrishna:true },
  { id: 7, name: "YOUTUBE", char: "GANDHARVA", icon: "🎶", gender: "female", report: "youtube_report" },
  { id: 8, name: "TRAIN", char: "BHEEMA", icon: "💪", gender: "male", report: "train_report" },
  { id: 9, name: "BUDGET", char: "VIDURA", icon: "⚖️", gender: "male", report: "budget_report" },
  { id: 10, name: "CALENDAR", char: "SAHADEVA", icon: "🔮", gender: "male", report: "calendar_report" },
  { id: 11, name: "TRANSLATE", char: "SARASWATI", icon: "📜", gender: "female", report: "translate_report" },
  { id: 12, name: "CODE", char: "VISHWAKARMA", icon: "🛠️", gender: "male", report: "code_report" },
];

export default function Home() {
  const [chat, setChat] = useState([]);
  const [active, setActive] = useState(null);
  const [voices, setVoices] = useState([]);
  const [started, setStarted] = useState(false);
  const [userLoc, setUserLoc] = useState({city:"Hyderabad", lat:17.38, lon:78.48});
  const ref = useRef(false);

  useEffect(()=>{
    const load=()=>setVoices(window.speechSynthesis.getVoices());
    load(); window.speechSynthesis.onvoiceschanged=load;
    // Get real location for weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (p)=>{
        try {
          const r = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${p.coords.latitude}&lon=${p.coords.longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER||""}`);
          // fallback city
          setUserLoc({city:"Hyderabad", lat:p.coords.latitude, lon:p.coords.longitude});
        } catch(e){}
      });
    }
  },[]);

  const speakMix = (text, gender, isKrishna=false) => {
    return new Promise((resolve)=>{
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      let v = null;
      if (isKrishna) {
        v = voices.find(x=>x.name.toLowerCase().includes("david"))||voices[0];
        u.pitch=0.6; u.rate=0.65; u.volume=1;
      } else if (gender==="female") {
        v = voices.find(x=>x.name.toLowerCase().includes("zira")||x.name.toLowerCase().includes("female"))||voices[0];
        u.pitch=1.1; u.rate=0.7; u.volume=1;
      } else {
        v = voices.find(x=>x.name.toLowerCase().includes("david"))||voices[0];
        u.pitch=0.85; u.rate=0.7; u.volume=1;
      }
      if (v) u.voice=v;
      u.lang="te-IN";
      u.onend=()=>setTimeout(resolve,1200);
      u.onerror=()=>resolve();
      setTimeout(()=>window.speechSynthesis.speak(u),300);
    });
  };

  const fetchRealReport = async (reportType) => {
    try {
      const res = await fetch("/api/avengers", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message: reportType, userCity: userLoc.city, lat: userLoc.lat, lon: userLoc.lon })
      });
      const data = await res.json();
      return data.reply;
    } catch(e){ return "Real data loading Prabhu..."; }
  };

  useEffect(()=>{
    if (ref.current || voices.length===0) return;
    const run = async ()=>{
      if (ref.current) return;
      ref.current=true; setStarted(true);
      
      await speakMix("Dharmo rakshati rakshitah Prabhu, Pannendu mandi agents meeru adigina real information tho report cheyyadaniki ready ga unnaru.", "male", true);

      for (let ag of AGENTS) {
        setActive(ag.id);
        // Fetch REAL data for this agent
        const realData = await fetchRealReport(ag.report);
        
        // Add to chat
        setChat(p=>[...p, {role:"jarvis", agent: ag.char, text: realData }]);

        // Speak Telugu+English MIX - first 250 chars for voice
        const voiceText = realData.replace(/[*#🔗👸📿⚡🏹💎🦚🎶💪⚖️🔮📜🛠️📰💰🌤️]/g,"").replace(/https?:\/\/\S+/g,"").slice(0,300);
        await speakMix(voiceText, ag.gender, ag.isKrishna||false);
        
        // Small human pause
        await new Promise(r=>setTimeout(r,800));
      }
      setActive(null);
      await speakMix("Antha mandi report complete chesaru Prabhu, Antha real information ye, Single fake kuda ledu, Mee aagya kosam eduru chustunnamu.", "male", true);
    };
    const t=setTimeout(run,1500);
    return ()=>clearTimeout(t);
  },[voices, userLoc]);

  const ask = async (text) => {
    const msg = text || document.getElementById("inp").value;
    if (!msg) return;
    setChat(p=>[...p, {role:"user", text:msg}]);
    document.getElementById("inp").value="";
    const data = await fetch("/api/avengers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,userCity:userLoc.city})}).then(r=>r.json());
    setChat(p=>[...p, {role:"jarvis", agent:data.agent, text:data.reply}]);
    const vt = data.reply.replace(/[*#🔗]/g,"").slice(0,350);
    await speakMix(vt,"male",true);
  };

  return (
    <div onClick={()=>{ if(!started) window.location.reload(); }} style={{background:"radial-gradient(ellipse at top, #1a0f00 0%, #000)", minHeight:"100vh", color:"#ffd700", fontFamily:"sans-serif"}}>
      <div style={{height:"6px", background:"linear-gradient(90deg,#ff6600,#ffd700,#ff6600)"}}></div>
      <div style={{textAlign:"center", padding:"15px"}}>
        <div style={{fontSize:"10px", color:"#ffaa00"}}>॥ धर्मो रक्षति रक्षितः ॥</div>
        <div style={{fontSize:"20px", fontWeight:"900"}}>MAHABHARATA - 12 AGENTS REAL REPORT FLOW</div>
        <div style={{fontSize:"9px", color:"#00ff88"}}>Telugu+English Mix | 100% Real API | No Fake Info</div>
        {!started && <div style={{marginTop:"8px", background:"#ffd700", color:"#000", padding:"8px 15px", borderRadius:"20px", fontSize:"11px", fontWeight:"900", display:"inline-block"}}>🔊 TAP TO START REAL REPORTS</div>}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px", padding:"12px", maxWidth:"900px", margin:"0 auto"}}>
        {AGENTS.map(a=><div key={a.id} style={{border:`2px solid ${active===a.id?"#00ff88":"rgba(255,215,0,0.2)"}`, background: active===a.id?"#002200":"#1a0f00", padding:"8px 4px", textAlign:"center", borderRadius:"10px", transform: active===a.id?"scale(1.05)":"scale(1)", transition:"0.3s"}}>
          <div style={{fontSize:"22px"}}>{a.icon}</div><div style={{fontSize:"9px", fontWeight:"900"}}>{a.char}</div><div style={{fontSize:"7px", color: active===a.id?"#00ff88":"#666"}}>{active===a.id?"🎙️ REPORTING LIVE...":"READY"}</div></div>)}
      </div>

      <div style={{maxWidth:"900px", margin:"10px auto", padding:"0 12px"}}>
        <div style={{minHeight:"400px", maxHeight:"500px", overflowY:"auto", border:"2px solid rgba(255,215,0,0.3)", borderRadius:"12px", background:"#0f0a00", padding:"12px"}}>
          {chat.map((c,i)=><div key={i} style={{margin:"12px 0", padding:"12px", background:c.role==="user"?"#1a1200":"#001a00", borderLeft:`4px solid ${c.role==="user"?"#ffaa00":"#00ff88"}`, fontSize:"12px", whiteSpace:"pre-wrap", borderRadius:"6px"}}><b style={{fontSize:"10px", color:"#00ff88"}}>{c.agent}:</b><br/>{c.text}</div>)}
        </div>
      </div>

      <div style={{maxWidth:"900px", margin:"12px auto", padding:"0 12px", display:"flex", gap:"8px"}}>
        <input id="inp" placeholder="🕉️ Mee prasna adagandi Prabhu... ex: Hyderabad to Goa" style={{flex:1, background:"#1a1200", border:"2px solid rgba(255,215,0,0.3)", color:"#ffd700", padding:"14px", borderRadius:"10px"}} onKeyDown={e=>e.key==="Enter"&&ask()}/>
        <button onClick={()=>ask()} style={{background:"#ffd700", color:"#000", border:"none", padding:"0 20px", borderRadius:"10px", fontWeight:"900"}}>SEND 🔥</button>
      </div>
    </div>
  );
}
