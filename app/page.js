"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {id:"JARVIS", name:"JARVIS PRIME", role:"Prime Orchestrator", color:"#facc15", glow:"#facc15", desc:"Main Boss - All Systems"},
  {id:"SHOPPER", name:"SHOPPER", role:"Deals Finder", color:"#ec4899", glow:"#ec4899", desc:"Chiffon Sarees ₹799 Best Today"},
  {id:"PULSE", name:"PULSE-360", role:"Site Monitor", color:"#ef4444", glow:"#ef4444", desc:"Site LIVE Monitoring"},
  {id:"NEWS", name:"NEWS", role:"Live News", color:"#3b82f6", glow:"#3b82f6", desc:"AP Monsoon Trending"},
  {id:"TRIP", name:"TRIP PLANNER", role:"Trip Guide", color:"#eab308", glow:"#eab308", desc:"Araku Valley Best Place"},
  {id:"TICKET", name:"TICKET FINDER", role:"Ticket Booker", color:"#6366f1", glow:"#6366f1", desc:"Train ₹280 Best Booking"},
  {id:"VERIFACT", name:"VERIFACT", role:"Fake Checker", color:"#22c55e", glow:"#22c55e", desc:"Fake News Verification"},
];

const ROLL_CALL_TEXTS = {
  JARVIS: "Jarvis Prime Online, Prime Orchestrator Active, 6 agents standing by. What are your orders, Boss?",
  SHOPPER: "Shopper reporting Boss! Daily best deals active - Chiffon Saree ₹799 MRP ₹1999 60% OFF 4.3 star - cheapest today, real cards ready Boss!",
  PULSE: "Pulse-360 reporting Boss! News site monitoring active, site LIVE 120ms super fast & Araku Valley topic best trending today Boss!",
  NEWS: "News Agent reporting Boss! Live news feeding active - AP Monsoon No.1 trending today, real headlines fetching Boss!",
  TRIP: "Trip Planner reporting Boss! Best places active - Araku Valley + Maredumilli monsoon best today, waterfalls full Boss!",
  TICKET: "Ticket Finder reporting Boss! Bookings active - Train 17208 ₹280 24 seats + Hotel ₹1200 combo ₹1800 save ₹800 best today Boss!",
  VERIFACT: "Verifact reporting Boss! Fake detection active - 100% real vs fake verification ready, no scam Boss!",
};

export default function Home(){
  const [activeIdx, setActiveIdx] = useState(0);
  const [isRollCall, setIsRollCall] = useState(false);
  const [terminal, setTerminal] = useState("Initializing Avengers Protocol...");
  const [input, setInput] = useState("");
  const [deals, setDeals] = useState([]);
  const [showResult, setShowResult] = useState("");
  const audioRef = useRef(null);

  const activeAgent = AGENTS[activeIdx];

  const playTone = (color)=>{
    if(!audioRef.current) audioRef.current = new (window.AudioContext||window.webkitAudioContext)();
    const ctx=audioRef.current; const o=ctx.createOscillator(); const g=ctx.createGain();
    const map={"#facc15":440,"#ec4899":600,"#ef4444":350,"#3b82f6":500,"#eab308":520,"#6366f1":540,"#22c55e":560};
    o.frequency.value=map[color]||440; o.type="sine"; g.gain.value=0.14;
    o.connect(g); g.connect(ctx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.5); o.stop(ctx.currentTime+0.5);
  };

  const speak = (t)=>{
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(t.slice(0,200)); u.rate=1.05; u.lang='en-IN';
      window.speechSynthesis.speak(u);
    }
  };

  const startRollCall = ()=>{
    setIsRollCall(true); setDeals([]); setShowResult("");
    let idx=0;
    const next=()=>{
      if(idx>=AGENTS.length){
        setIsRollCall(false); setTerminal("A.V.E.N.G.E.R.S Roll Call Complete Boss. All 7 agents reporting done. What are your orders sir? - Try: chiffon sarees, trip to araku, news, ticket to hyd");
        speak("All 7 agents reporting complete Boss. What are your orders?");
        return;
      }
      setActiveIdx(idx);
      const ag=AGENTS[idx];
      const txt = `${ag.name} REPORTING BOSS! ${ROLL_CALL_TEXTS[ag.id]}`;
      setTerminal(txt); playTone(ag.color); speak(txt);
      idx++; setTimeout(next, 2800);
    };
    next();
  };

  useEffect(()=>{ setTimeout(startRollCall, 1200); },[]);

  const handleOrder = async (txt)=>{
    const order=txt.trim(); if(!order) return;
    const low=order.toLowerCase();
    if(low.includes("wake up")||low.includes("agents assemble")||low.includes("roll call")||low==="jarvis"){
      startRollCall(); setInput(""); return;
    }
    setInput(""); setDeals([]); setIsRollCall(false);
    let targetId="JARVIS";
    const isProduct=/(saree|chiffon|fabric|dress|kurta|shoe|phone|watch|bag|deal|under \d+)/i.test(low);
    const isTicket=low.includes("ticket")||(low.includes("bus")&&low.includes("to"))||(low.includes("train")&&low.includes("to"));
    if(low.includes("pulse360")) targetId="PULSE";
    else if(low.includes("verifact")||low.includes("fake")) targetId="VERIFACT";
    else if(isTicket) targetId="TICKET";
    else if((low.includes("trip")||low.includes("visit"))&&!isProduct) targetId="TRIP";
    else if(low.startsWith("news")) targetId="NEWS";
    else if(isProduct||low.split(" ").length<=6) targetId="SHOPPER";

    const tIdx=AGENTS.findIndex(a=>a.id===targetId);
    setActiveIdx(tIdx>=0?tIdx:0);
    const ag=AGENTS[tIdx>=0?tIdx:0];

    // Sequential reporting for this order
    setTerminal(`${ag.name} REPORTING BOSS! Eroju Best - ${order} kosam best fetching Boss... 🔴 LIVE`);
    playTone(ag.color); speak(`${ag.name} reporting Boss, fetching best for ${order}`);

    try{
      const res=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:targetId, t:Date.now(), r:Math.random()})});
      const data=await res.json();
      setTimeout(()=>{
        setShowResult(data.reply);
        setTerminal(data.reply);
        if(data.deals) setDeals(data.deals);
        speak(data.reply.slice(0,220));
      }, 1000);
    }catch(e){ setTerminal("Error: "+e.message); }
  };

  return (
    <div style={{position:"fixed", inset:0, background:"#050507", color:"#fff", fontFamily:"monospace", display:"flex", flexDirection:"column"}}>
      <style>{`
        @keyframes orbPulse{0%,100%{box-shadow:0 0 25px currentColor,0 0 50px currentColor,0 0 80px currentColor; transform:scale(1)}50%{box-shadow:0 0 35px currentColor,0 0 70px currentColor,0 0 100px currentColor; transform:scale(1.06)}}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:0.85}}
      `}</style>

      <div style={{height:"30px", background:"#0a0a0a", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", padding:"0 10px", fontSize:"9px", justifyContent:"space-between"}}>
        <div style={{color:"#facc15", letterSpacing:"1px"}}>AVENGERS PROTOCOL • JARVIS PRIME • [{AGENTS.length} AGENTS]</div>
        <div style={{color:"#555"}}>Day 22 - Meet the team behind JARVIS - {activeAgent.name} ONLINE</div>
      </div>

      <div style={{height:"42px", background:"#070708", borderBottom:"1px solid #111", display:"flex", alignItems:"center", gap:"6px", padding:"0 8px", overflowX:"auto"}}>
        {AGENTS.map((a,i)=>(
          <div key={a.id} style={{
            minWidth:"62px", height:"26px", borderRadius:"3px", border: i===activeIdx?`1px solid ${a.color}`:"1px solid #222",
            background: i===activeIdx?`${a.color}18`:"#0f0f0f", color: i===activeIdx?a.color:"#666",
            fontSize:"7px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold",
            boxShadow: i===activeIdx?`0 0 12px ${a.color}50`:"none", cursor:"pointer", opacity: isRollCall && i>activeIdx?0.35:1
          }}>
            {a.name.split(" ")[0]}
          </div>
        ))}
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"10px"}}>
        <div style={{
          width:"98px", height:"98px", borderRadius:"50%",
          background:`radial-gradient(circle at 32% 28%, #fff 0%, ${activeAgent.color} 22%, ${activeAgent.color} 68%, #000 100%)`,
          border:`2px solid ${activeAgent.color}`, animation:"orbPulse 2s infinite", color:activeAgent.color,
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <div style={{width:"20px", height:"20px", background:"#fff", borderRadius:"50%", boxShadow:"0 0 15px #fff"}}></div>
        </div>

        <div style={{marginTop:"16px", fontSize:"15px", fontWeight:"bold", letterSpacing:"5px", color:activeAgent.color, textShadow:`0 0 18px ${activeAgent.color}`}}>{activeAgent.name}</div>
        <div style={{marginTop:"6px", fontSize:"8px", color:"#666", letterSpacing:"2px"}}>{activeAgent.role} • {activeAgent.desc}</div>
        <div style={{marginTop:"6px", width:"44px", height:"2px", background:activeAgent.color, boxShadow:`0 0 10px ${activeAgent.color}`}}></div>

        <div style={{marginTop:"18px", width:"100%", maxWidth:"720px", background:"#0a0a0a", border:`1px solid ${activeAgent.color}30`, borderRadius:"6px", padding:"10px 12px", minHeight:"54px"}}>
          <div style={{fontSize:"11px", color:"#ccc", lineHeight:"1.5", whiteSpace:"pre-wrap"}}>
            <span style={{color:activeAgent.color}}>{isRollCall?"● REPORTING: ":"> "}</span>{terminal}
            <span style={{animation:"flicker 1s infinite"}}> █</span>
          </div>
          {showResult && showResult!==terminal && (
            <div style={{marginTop:"8px", fontSize:"10px", color:"#999", whiteSpace:"pre-wrap", borderTop:"1px solid #1a1a1a", paddingTop:"6px"}}>{showResult.slice(0,600)}</div>
          )}
        </div>

        {deals.length>0 && (
          <div style={{marginTop:"12px", display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"6px", width:"100%", maxWidth:"720px", maxHeight:"130px", overflowY:"auto"}}>
            {deals.map((d,i)=>(
              <div key={i} style={{background:"#fff", color:"#000", borderRadius:"6px", padding:"5px", border: d.best?"2px solid #22c55e":"1px solid #ccc"}}>
                <img src={d.image} alt="" style={{width:"100%", height:"48px", objectFit:"contain"}}/>
                <div style={{fontSize:"8px", fontWeight:"bold"}}>{d.title.slice(0,22)}</div>
                <div style={{fontSize:"10px", color:"#16a34a", fontWeight:"bold"}}>₹{d.price} {d.best?"🏆":""}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:"10px", fontSize:"8px", color:"#333", letterSpacing:"1px"}}>
          {isRollCall?`ROLL CALL ${activeIdx+1}/${AGENTS.length} - All agents reporting Boss`:"JARVIS COMMAND CENTER - Say 'Agents Assemble' for Roll Call"}
        </div>
      </div>

      <div style={{height:"56px", background:"#08080a", borderTop:`1px solid ${activeAgent.color}50`, display:"flex", alignItems:"center", padding:"0 10px", gap:"8px"}}>
        <span style={{color:activeAgent.color, fontSize:"12px"}}>❯</span>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} placeholder='Wake up Jarvis / chiffon sarees / trip to araku / news / ticket to hyd' style={{flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:"11px", fontFamily:"monospace"}}/>
        <button onClick={()=>handleOrder(input)} style={{background:activeAgent.color, color:"#000", border:"none", borderRadius:"4px", padding:"7px 14px", fontSize:"10px", fontWeight:"bold", cursor:"pointer"}}>EXECUTE</button>
        <button onClick={startRollCall} style={{background:"#111", border:`1px solid ${activeAgent.color}`, color:activeAgent.color, borderRadius:"4px", padding:"7px 10px", fontSize:"9px", cursor:"pointer"}}>ROLL CALL</button>
      </div>
    </div>
  );
}
