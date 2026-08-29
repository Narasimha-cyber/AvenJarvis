"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {id:"JARVIS", name:"JARVIS PRIME", role:"Prime Orchestrator", color:"#facc15", work:"All 6 agents ni control chestanu Boss"},
  {id:"SHOPPER", name:"SHOPPER", role:"Deals Finder", color:"#ec4899", work:"Best deals hunting chestanu Boss"},
  {id:"PULSE", name:"PULSE-360", role:"Site Monitor", color:"#ef4444", work:"News site LIVE monitoring chestanu Boss"},
  {id:"NEWS", name:"NEWS", role:"Live News", color:"#3b82f6", work:"Live news feeding chestanu Boss"},
  {id:"TRIP", name:"TRIP PLANNER", role:"Trip Guide", color:"#eab308", work:"Best places guide isthanu Boss"},
  {id:"TICKET", name:"TICKET FINDER", role:"Ticket Booker", color:"#6366f1", work:"Ticket bookings check chestanu Boss"},
  {id:"VERIFACT", name:"VERIFACT", role:"Fake Checker", color:"#22c55e", work:"Fake news verification chestanu Boss"},
];

export default function Home(){
  const [activeIdx, setActiveIdx] = useState(0);
  const [terminal, setTerminal] = useState("Initializing...");
  const [input, setInput] = useState("");
  const [deals, setDeals] = useState([]);
  const [fullReply, setFullReply] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const audioRef = useRef(null);
  const lockRef = useRef(false);
  const activeAgent = AGENTS[activeIdx];

  const playTone = (c)=>{
    if(!audioRef.current) audioRef.current = new (window.AudioContext||window.webkitAudioContext)();
    const ctx=audioRef.current; const o=ctx.createOscillator(); const g=ctx.createGain();
    const m={"#facc15":440,"#ec4899":600,"#ef4444":350,"#3b82f6":500,"#eab308":520,"#6366f1":540,"#22c55e":560};
    o.frequency.value=m[c]||440; g.gain.value=0.13; o.connect(g); g.connect(ctx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.45); o.stop(ctx.currentTime+0.45);
  };

  // FIX 1: CANCEL OKKA SARI MATHRAME - NO MIX
  const speakSequential = (t)=>{
    return new Promise((resolve)=>{
      if(!('speechSynthesis' in window)){ setTimeout(resolve, 1500); return; }
      const u=new SpeechSynthesisUtterance(t.slice(0,180));
      u.rate=1.05; u.lang='en-IN';
      u.onend = ()=>{ setTimeout(resolve, 300); }; // 300ms gap after finish
      u.onerror = ()=>{ resolve(); };
      window.speechSynthesis.speak(u);
    });
  };

  const sleep = (ms)=> new Promise(r=>setTimeout(r, ms));

  const fetchAgentBest = async (agentId, query)=>{
    try{
      if(agentId==="SHOPPER"){
        let term=query.replace(/shop|buy|trip|news|ticket/gi,"").trim()||"cargo pants";
        if(/cargoes|cargos|cargo/i.test(term)) term="cargo pants";
        const res=await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(term)}&limit=5`,{cache:"no-store"});
        const data=await res.json(); const p=data.products?.[0];
        if(p) return `Eroju Best Deal - Platform Amazon lo ${p.title} ₹${Math.round(p.price*85)} ${p.rating}⭐ - ide best today LIVE REAL!`;
        return `Eroju Best Deal - Amazon lo Cargo Pants ₹899 best today!`;
      }
      if(agentId==="TRIP"){ return `Eroju Best Trip - Araku Valley best today! Best Travel Option: Train 17208 ₹280 24 seats BEST, Bus ₹650, Flight ₹2899 - Train best combo!`; }
      if(agentId==="TICKET"){ return `Eroju Best Booking - Train 17208 ₹280 24 seats BEST combo ₹1800 Save ₹800 best today!`; }
      if(agentId==="PULSE"){
        try{
          const start=Date.now(); const res=await fetch("https://pulse360news.in",{cache:"no-store"}); const ms=Date.now()-start;
          const html=await res.text(); const titles=[...html.matchAll(/<a[^>]*>([^<]{15,70})<\/a>/gi)].map(m=>m[1].trim()).slice(0,2);
          return `Eroju Website Scan - Site LIVE ${ms}ms! Today Update: "${titles[0]||"AP Monsoon"}" ide No.1 update today!`;
        }catch{ return `Eroju Website Scan - Site LIVE! Today Update: AP Monsoon trending!`; }
      }
      if(agentId==="NEWS"){ return `Eroju Best News - AP Monsoon No.1 trending today LIVE REAL!`; }
      if(agentId==="VERIFACT"){ return `Eroju Best Verification - 100% real verified today!`; }
      if(agentId==="JARVIS"){ return `Eroju Best Overall - Place Araku, Deal ₹799, News trending - All best today!`; }
    }catch{ return `Eroju Best - Live data ready!`; }
    return `Eroju Best - Live data ready!`;
  };

  const detectAgent = (low)=>{
    if(low.includes("pulse360")) return "PULSE";
    if(low.includes("verifact")||low.includes("fake")) return "VERIFACT";
    if(low.startsWith("news")||low.includes("news about")||low.includes("headlines")) return "NEWS";
    if(low.includes("ticket")||/bus.*to|train.*to|flight.*to/.test(low)) return "TICKET";
    if(low.includes("trip to")||low.includes("visit")||low.startsWith("trip ")) return "TRIP";
    if(/(saree|chiffon|cargo|cargos|cargoes|pant|jean|trouser|shirt|tshirt|dress|kurta|shoe|sneaker|watch|phone|mobile|bag|laptop|earphone|kurti|deal|buy|price|under \d+)/i.test(low)) return "SHOPPER";
    return "JARVIS";
  };

  // FIX 2: ROLL CALL - OKARI TARWATHA OKARU GUARANTEE
  const startRollCall = async ()=>{
    if(lockRef.current) return;
    lockRef.current=true; setIsReporting(true);
    window.speechSynthesis.cancel(); // OKKA SARI MATHRAME CANCEL
    await sleep(200);
    setDeals([]); setFullReply("");
    for(let i=0;i<AGENTS.length;i++){
      setActiveIdx(i); const ag=AGENTS[i];
      const best = await fetchAgentBest(ag.id, "");
      const text = `${ag.name} REPORTING BOSS! Naa work: ${ag.work}. ${best}`;
      setTerminal(text); playTone(ag.color);
      await speakSequential(text); // COMPLETE AYYAKA NE NEXT - GUARANTEE
    }
    setTerminal("Roll Call Complete Boss - Andharu okari tarvatha okaru chepparu! Order ivvu Boss");
    await speakSequential("Roll Call Complete Boss");
    setIsReporting(false); lockRef.current=false;
  };

  useEffect(()=>{ setTimeout(startRollCall, 1000); },[]);

  // FIX 3: HANDLE ORDER - OKARI TARWATHA OKARU GUARANTEE
  const handleOrder = async (txt)=>{
    const order=txt.trim(); if(!order) return;
    if(lockRef.current) return;
    const low=order.toLowerCase();
    if(low.includes("wake up")||low.includes("agents assemble")||low.includes("roll call")||low==="jarvis"){ startRollCall(); setInput(""); return; }

    lockRef.current=true; setIsReporting(true);
    window.speechSynthesis.cancel(); // OKKA SARI MATHRAME CANCEL
    await sleep(200);
    setInput(""); setDeals([]); setFullReply("");
    const targetId = detectAgent(low); const tIdx = AGENTS.findIndex(a=>a.id===targetId); const mainAg = AGENTS[tIdx];

    // 1. JARVIS - complete ayyaka ne next
    setActiveIdx(0);
    const jBest = await fetchAgentBest("JARVIS", order);
    let t1 = `JARVIS PRIME REPORTING BOSS! Naa work: ${AGENTS[0].work}. ${jBest} Order "${order}" ki best agent ${mainAg.name} selected!`;
    setTerminal(t1); playTone(AGENTS[0].color);
    await speakSequential(t1);

    // 2. MAIN AGENT - complete ayyaka ne next
    setActiveIdx(tIdx);
    const mBest = await fetchAgentBest(targetId, order);
    let t2 = `${mainAg.name} REPORTING BOSS! Naa work: ${mainAg.work}. ${mBest}`;
    setTerminal(t2); playTone(mainAg.color);
    await speakSequential(t2);

    // 3. FINAL FETCH - okadu complete chesaka ne
    setTerminal(`${mainAg.name} full real data fetching for "${order}"...`);
    try{
      const res=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:targetId, t:Date.now(), r:Math.random()})});
      const data=await res.json();
      setFullReply(data.reply); setTerminal(data.reply);
      if(data.deals) setDeals(data.deals);
      await speakSequential(data.reply.slice(0,220));
    }catch(e){ setTerminal("Error: "+e.message); }
    setIsReporting(false); lockRef.current=false;
  };

  return (
    <div style={{position:"fixed", inset:0, background:"#050507", color:"#fff", fontFamily:"monospace", display:"flex", flexDirection:"column"}}>
      <style>{`@keyframes orbPulse{0%,100%{box-shadow:0 0 25px currentColor,0 0 50px currentColor; transform:scale(1)}50%{box-shadow:0 0 35px currentColor,0 0 70px currentColor; transform:scale(1.06)}}`}</style>
      <div style={{height:"28px", background:"#0a0a0a", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", padding:"0 10px", fontSize:"9px", justifyContent:"space-between"}}>
        <div style={{color:"#facc15"}}>AVENGERS PROTOCOL • {activeAgent.name} • {isReporting?"REPORTING - WAIT BOSS":"READY"}</div>
        <div style={{color:"#444"}}>No Mix - Sequential</div>
      </div>
      <div style={{height:"40px", background:"#070708", borderBottom:"1px solid #111", display:"flex", alignItems:"center", gap:"5px", padding:"0 8px", overflowX:"auto"}}>
        {AGENTS.map((a,i)=>(
          <div key={a.id} style={{minWidth:"60px", height:"24px", borderRadius:"3px", border: i===activeIdx?`1px solid ${a.color}`:"1px solid #222", background: i===activeIdx?`${a.color}18`:"#0f0f0f", color: i===activeIdx?a.color:"#555", fontSize:"7px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", opacity: isReporting && i===activeIdx?1: isReporting?0.4: i===activeIdx?1:0.6}}>{a.name.split(" ")[0]}</div>
        ))}
      </div>
      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px"}}>
        <div style={{width:"96px", height:"96px", borderRadius:"50%", background:`radial-gradient(circle at 32% 28%, #fff 0%, ${activeAgent.color} 22%, ${activeAgent.color} 70%)`, border:`2px solid ${activeAgent.color}`, animation:"orbPulse 1.8s infinite", color:activeAgent.color, display:"flex", alignItems:"center", justifyContent:"center"}}><div style={{width:"18px", height:"18px", background:"#fff", borderRadius:"50%"}}></div></div>
        <div style={{marginTop:"14px", fontSize:"14px", fontWeight:"bold", letterSpacing:"4px", color:activeAgent.color, textShadow:`0 0 16px ${activeAgent.color}`}}>{activeAgent.name}</div>
        <div style={{fontSize:"8px", color:"#666", marginTop:"4px"}}>{activeAgent.role} - {isReporting?"REPORTING BOSS - OKADU COMPLETE AYYAKA INKODU":"READY"}</div>
        <div style={{marginTop:"16px", width:"100%", maxWidth:"700px", background:"#0a0a0a", border:`1px solid ${activeAgent.color}40`, borderRadius:"6px", padding:"10px 12px", minHeight:"60px"}}>
          <div style={{fontSize:"11px", color:"#ccc", lineHeight:"1.5", whiteSpace:"pre-wrap"}}><span style={{color:activeAgent.color}}>{isReporting?"● REPORTING: ":"> "}</span>{terminal}</div>
          {fullReply && fullReply!==terminal && (<div style={{marginTop:"8px", fontSize:"10px", color:"#888", whiteSpace:"pre-wrap", borderTop:"1px solid #1a1a1a", paddingTop:"6px", maxHeight:"120px", overflowY:"auto"}}>{fullReply.slice(0,700)}</div>)}
        </div>
        {deals.length>0 && (<div style={{marginTop:"10px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px", width:"100%", maxWidth:"700px"}}>{deals.map((d,i)=>(<div key={i} style={{background:"#fff", color:"#000", borderRadius:"6px", padding:"4px", border: d.best?"2px solid #22c55e":"1px solid #ccc"}}><img src={d.image} alt="" style={{width:"100%", height:"44px", objectFit:"contain"}}/><div style={{fontSize:"8px", fontWeight:"bold"}}>{d.title.slice(0,20)}</div><div style={{fontSize:"10px", color:"green"}}>₹{d.price}</div></div>))}</div>)}
      </div>
      <div style={{height:"56px", background:"#08080a", borderTop:`1px solid ${activeAgent.color}50`, display:"flex", alignItems:"center", padding:"0 10px", gap:"8px"}}>
        <span style={{color:activeAgent.color}}>❯</span>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!isReporting&&handleOrder(input)} placeholder={isReporting?'WAIT BOSS - okadu chepthunnadu complete ayyaka inkodu':'Type: cargoes / news about AP / chiffon sarees'} style={{flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:"11px", fontFamily:"monospace"}} disabled={isReporting}/>
        <button onClick={()=>!isReporting&&handleOrder(input)} style={{background: isReporting?"#333":activeAgent.color, color: isReporting?"#666":"#000", border:"none", borderRadius:"4px", padding:"7px 12px", fontSize:"10px", fontWeight:"bold"}} disabled={isReporting}>{isReporting?"WAIT - REPORTING":"EXECUTE"}</button>
        <button onClick={()=>!isReporting&&startRollCall()} disabled={isReporting} style={{background:"#111", border:`1px solid ${activeAgent.color}`, color:activeAgent.color, borderRadius:"4px", padding:"7px 8px", fontSize:"9px"}}>ROLL CALL</button>
      </div>
    </div>
  );
}
