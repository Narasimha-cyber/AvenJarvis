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
  const [userLoc, setUserLoc] = useState({ city: "Detecting...", lat: 16.7, lon: 81.1 });
  const ref = useRef(false);

  useEffect(()=>{
    const load=()=>setVoices(window.speechSynthesis.getVoices());
    load(); window.speechSynthesis.onvoiceschanged=load;

    // 100% REAL LOCATION DETECT - Eluru auto
    const detectLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos)=>{
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          try {
            // Free reverse geocoding - BigDataCloud - No key - Real city
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || "Eluru";
            setUserLoc({ city, lat, lon });
            console.log("Real Location:", city, lat, lon);
          } catch(e){
            // Fallback IP API
            try {
              const ip = await fetch("https://ipapi.co/json/").then(r=>r.json());
              setUserLoc({ city: ip.city||"Eluru", lat: ip.latitude||16.7, lon: ip.longitude||81.1 });
            } catch(e2){ setUserLoc({ city:"Eluru", lat:16.7, lon:81.1 }); }
          }
        }, async ()=>{
          // If permission denied - IP based
          try {
            const ip = await fetch("https://ipapi.co/json/").then(r=>r.json());
            setUserLoc({ city: ip.city||"Eluru", lat: ip.latitude||16.7, lon: ip.longitude||81.1 });
          } catch(e){ setUserLoc({ city:"Eluru", lat:16.7, lon:81.1 }); }
        });
      }
    };
    detectLocation();
  },[]);

  const speakFull = (text, gender, isKrishna=false) => {
    return new Promise(async (resolve)=>{
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const clean = text.replace(/https?:\/\/\S+/g," ").replace(/[*#]/g," ").replace(/Image \d+:.*\.jpg/g," ").slice(0,2000);
      const sentences = clean.match(/[^.!?\n]+[.!?\n]+/g) || [clean];
      for (let s of sentences) {
        if (!s.trim() || s.trim().length<5) continue;
        await new Promise(r=>{
          const u = new SpeechSynthesisUtterance(s.trim().slice(0,250));
          let v = voices.find(x=>x.name.toLowerCase().includes("david"))||voices[0];
          if (gender==="female") v = voices.find(x=>x.name.toLowerCase().includes("zira")||x.name.toLowerCase().includes("female"))||voices[0];
          if (v) u.voice=v;
          u.pitch = isKrishna?0.58: gender==="female"?1.12:0.82;
          u.rate = 0.62;
          u.lang="te-IN";
          u.onend=()=>setTimeout(r,350);
          u.onerror=()=>r();
          window.speechSynthesis.speak(u);
        });
      }
      resolve();
    });
  };

  const fetchReport = async (reportType) => {
    const res = await fetch("/api/avengers",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ message: reportType, userCity: userLoc.city, lat: userLoc.lat, lon: userLoc.lon })
    });
    return await res.json();
  };

  useEffect(()=>{
    if (ref.current || voices.length===0 || userLoc.city==="Detecting...") return;
    const run = async ()=>{
      if (ref.current) return;
      ref.current=true; setStarted(true);
      await speakFull(`Dharmo rakshati rakshitah Prabhu, Nenu meeru unna ${userLoc.city} location ni detect chesanu, Pannendu mandi agents real information tho report cheyyadaniki ready.`, "male", true);
      for (let ag of AGENTS) {
        setActive(ag.id);
        const data = await fetchReport(ag.report);
        setChat(p=>[...p, {role:"jarvis", agent: ag.char, text: data.reply}]);
        await speakFull(data.reply, ag.gender, ag.isKrishna||false);
        await new Promise(r=>setTimeout(r,600));
      }
      setActive(null);
      await speakFull(`Antha mandi ${userLoc.city} nunchi real reports complete chesaru Prabhu, Mee aagya kosam eduru chustunnamu.`, "male", true);
    };
    const t=setTimeout(run, 1000);
    return ()=>clearTimeout(t);
  },[voices, userLoc]);

  const ask = async () => {
    const inp = document.getElementById("inp"); const msg = inp.value; if (!msg) return;
    setChat(p=>[...p, {role:"user", text:msg}]); inp.value="";
    const data = await fetch("/api/avengers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg,userCity:userLoc.city,lat:userLoc.lat,lon:userLoc.lon})}).then(r=>r.json());
    setChat(p=>[...p, {role:"jarvis", agent:data.agent, text:data.reply}]);
    await speakFull(data.reply,"male",true);
  };

  return (
    <div onClick={()=>{ if(!started&&userLoc.city!=="Detecting...") window.location.reload(); }} style={{background:"radial-gradient(ellipse at top, #1a0f00 0%, #000)", minHeight:"100vh", color:"#ffd700"}}>
      <div style={{height:"6px", background:"linear-gradient(90deg,#ff6600,#ffd700,#ff6600)"}}></div>
      <div style={{textAlign:"center", padding:"12px"}}>
        <div style={{fontSize:"10px", color:"#ffaa00"}}>॥ धर्मो रक्षति रक्षितः ॥</div>
        <div style={{fontSize:"16px", fontWeight:"900"}}>MAHABHARATA - 12 AGENTS - WORLDWIDE REAL</div>
        <div style={{fontSize:"11px", color:"#00ff88", background:"#002200", display:"inline-block", padding:"3px 10px", borderRadius:"12px", marginTop:"4px"}}>📍 Location: {userLoc.city} ({userLoc.lat.toFixed(2)}, {userLoc.lon.toFixed(2)}) - Auto Detected</div>
        {!started && userLoc.city!=="Detecting..." && <div style={{marginTop:"8px", background:"#ffd700", color:"#000", padding:"8px 15px", borderRadius:"20px", fontSize:"11px", fontWeight:"900", display:"inline-block"}}>🔊 TAP TO START 12 REAL REPORTS FROM {userLoc.city.toUpperCase()}</div>}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px", padding:"12px", maxWidth:"900px", margin:"0 auto"}}>
        {AGENTS.map(a=><div key={a.id} style={{border:`2px solid ${active===a.id?"#00ff88":"rgba(255,215,0,0.2)"}`, background: active===a.id?"#002200":"#1a0f00", padding:"8px 4px", textAlign:"center", borderRadius:"10px"}}><div style={{fontSize:"20px"}}>{a.icon}</div><div style={{fontSize:"8px", fontWeight:"900"}}>{a.char}</div><div style={{fontSize:"6px", color: active===a.id?"#00ff88":"#666"}}>{active===a.id?"🎙️ REPORTING":"READY"}</div></div>)}
      </div>
      <div style={{maxWidth:"900px", margin:"10px auto", padding:"0 12px"}}>
        <div style={{minHeight:"400px", maxHeight:"500px", overflowY:"auto", border:"2px solid rgba(255,215,0,0.3)", borderRadius:"12px", background:"#0f0a00", padding:"12px"}}>
          {chat.map((c,i)=><div key={i} style={{margin:"12px 0", padding:"12px", background:c.role==="user"?"#1a1200":"#001a00", borderLeft:`4px solid ${c.role==="user"?"#ffaa00":"#00ff88"}`, fontSize:"11px", whiteSpace:"pre-wrap"}}><b style={{fontSize:"10px", color:"#00ff88"}}>{c.agent}:</b><br/>{c.text}</div>)}
        </div>
      </div>
      <div style={{maxWidth:"900px", margin:"12px auto", padding:"0 12px", display:"flex", gap:"8px"}}>
        <input id="inp" placeholder={`🕉️ ${userLoc.city} nunchi adagandi... ex: Paris to London, Buy shoes, Gold price, Translate hello`} style={{flex:1, background:"#1a1200", border:"2px solid rgba(255,215,0,0.3)", color:"#ffd700", padding:"14px", borderRadius:"10px"}} onKeyDown={e=>e.key==="Enter"&&ask()}/>
        <button onClick={ask} style={{background:"#ffd700", color:"#000", border:"none", padding:"0 20px", borderRadius:"10px", fontWeight:"900"}}>SEND 🔥</button>
      </div>
    </div>
  );
}
