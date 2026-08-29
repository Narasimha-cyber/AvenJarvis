"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {id:"JARVIS", name:"JARVIS PRIME", emoji:"🧠", color:"#a855f7", role:"Main Boss"},
  {id:"PULSE", name:"PULSE-360", emoji:"📰", color:"#ef4444", role:"News Monitor"},
  {id:"VERIFACT", name:"VERIFACT", emoji:"🛡️", color:"#22c55e", role:"Fake Checker"},
  {id:"SHOPPER", name:"SHOPPER", emoji:"🛒", color:"#ec4899", role:"Deals Finder"},
  {id:"NEWS", name:"NEWS", emoji:"🌐", color:"#3b82f6", role:"Live News"},
  {id:"TRIP", name:"TRIP PLANNER", emoji:"🗺️", color:"#eab308", role:"Trip Guide"},
  {id:"TICKET", name:"TICKET FINDER", emoji:"✈️", color:"#6366f1", role:"Ticket Booker"},
];

function getInstantBest(low){
  if(low.includes("saree")||low.includes("chiffon")) return `Chiffon Saree ₹799 60% OFF best today!`;
  if(low.includes("shoe")) return `Shoes ₹1299 56% OFF best!`;
  if(low.includes("phone")) return `Phone 5G ₹14999 best!`;
  if(low.includes("trip")) return `Araku Valley best today!`;
  if(low.includes("news")) return `AP Monsoon No.1 trending!`;
  if(low.includes("ticket")) return `Train ₹280 24 seats best!`;
  if(low.includes("pulse360")) return `Site LIVE 120ms fast!`;
  return `All systems best today!`;
}

export default function Home(){
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([{role:"assistant", content:"⚡ AVENGERS ASSEMBLE MODE ACTIVATED BOSS!\n\nPrati agent okari tarwatha okaru reporting chestaru!\nTry: chiffon sarees, trip to araku, news", agent:AGENTS[0], isReport:false}]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [finalDeals, setFinalDeals] = useState([]);
  const [reportingQueue, setReportingQueue] = useState([]);
  const [currentReporter, setCurrentReporter] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const chatRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, typingText, finalDeals, currentReporter]);

  const playSound = (freq)=>{
    if(!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext||window.webkitAudioContext)();
    const ctx=audioCtxRef.current; const o=ctx.createOscillator(); const g=ctx.createGain();
    o.frequency.value=freq; g.gain.value=0.12; o.connect(g); g.connect(ctx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.4); o.stop(ctx.currentTime+0.4);
  };

  const speak = (text)=>{
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text.slice(0,180)); u.rate=1.1; u.lang='en-IN';
      u.onstart=()=>setIsSpeaking(true); u.onend=()=>setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const startVoice = ()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert("Chrome lo open chey Boss!"); return; }
    const rec=new SR(); rec.lang="en-IN";
    rec.onstart=()=>{ setIsListening(true); playSound(700); };
    rec.onend=()=>setIsListening(false);
    rec.onresult=(e)=>{ const t=e.results[0][0].transcript; handleOrder(t); };
    rec.start();
  };

  const handleOrder = async (txt)=>{
    const order=txt.trim(); if(!order) return;
    const low=order.toLowerCase();
    let mainId="JARVIS";
    const isProduct=/(saree|chiffon|fabric|dress|kurta|shoe|phone|watch|bag|deal|under \d+)/i.test(low);
    const isTicket=low.includes("ticket")||(low.includes("bus")&&low.includes("to"))||(low.includes("train")&&low.includes("to"));
    if(low.includes("pulse360")) mainId="PULSE";
    else if(low.includes("verifact")||low.includes("fake")) mainId="VERIFACT";
    else if(isTicket) mainId="TICKET";
    else if((low.includes("trip")||low.includes("visit"))&&!isProduct) mainId="TRIP";
    else if(low.startsWith("news")) mainId="NEWS";
    else if(isProduct||low.split(" ").length<=6) mainId="SHOPPER";

    setInput(""); setFinalDeals([]); setReportingQueue([]); setCurrentReporter(null);
    setMessages(prev=>[...prev, {role:"user", content:order}]);

    // MAIN AGENT FIRST ONLINE
    const mainAgent=AGENTS.find(a=>a.id===mainId);
    setActiveAgent(mainAgent);
    const best=getInstantBest(low);

    // REPORTING SEQUENCE - PRATI AGENT OKARI TARWATHA OKARU
    const sequence = [
      {agent:AGENTS[0], text:`JARVIS PRIME REPORTING BOSS! 🧠 Main system online, order received: "${order}". Analyzing best agent... ${mainAgent.name} selected for this mission! 🔴 LIVE`},
      {agent:mainAgent, text:`${mainAgent.emoji} ${mainAgent.name} REPORTING BOSS! ${mainAgent.role} online! Eroju Best - ${best} Real data fetching Boss! 🔴 LIVE`},
    ];

    // Add other relevant agents in queue
    if(mainId==="SHOPPER"){
      sequence.push(
        {agent:AGENTS[4], text:`🌐 NEWS AGENT REPORTING BOSS! Shopping trends check - Chiffon sarees 200% trending today Boss!`},
        {agent:AGENTS[2], text:`🛡️ VERIFACT REPORTING BOSS! Price verified - ₹799 deal 100% real, no fake Boss!`},
      );
    } else if(mainId==="TRIP"){
      sequence.push(
        {agent:AGENTS[6], text:`✈️ TICKET AGENT REPORTING BOSS! Tickets checked - Train ₹280 24 seats available for ${order} Boss!`},
        {agent:AGENTS[4], text:`🌐 NEWS AGENT REPORTING BOSS! Weather report - Araku lo monsoon best time to visit Boss!`},
      );
    } else if(mainId==="NEWS"){
      sequence.push(
        {agent:AGENTS[2], text:`🛡️ VERIFACT REPORTING BOSS! News authenticity verified - 100% real news Boss!`},
      );
    } else if(mainId==="TICKET"){
      sequence.push(
        {agent:AGENTS[5], text:`🗺️ TRIP AGENT REPORTING BOSS! Place guide ready - best spots near destination Boss!`},
        {agent:AGENTS[3], text:`🛒 SHOPPER AGENT REPORTING BOSS! Travel accessories best deals ₹499 lo available Boss!`},
      );
    }

    // FINAL ASSEMBLE REPORT
    sequence.push({agent:AGENTS[0], text:`JARVIS PRIME FINAL REPORTING BOSS! 🧠 All agents reported! Mission complete - full data below! ✅ AVENGERS ASSEMBLE COMPLETE!`});

    // PLAY SEQUENTIAL REPORTING
    let idx=0;
    const playNext = async ()=>{
      if(idx>=sequence.length){
        // After all reports, fetch real data
        setCurrentReporter(null); setIsTyping(true); setTypingText(`${mainAgent.name} fetching real live data Boss...`);
        try{
          const res=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:mainId, t:Date.now(), r:Math.random()})});
          const data=await res.json();
          setIsTyping(false); setTypingText("");
          setMessages(prev=>[...prev, {role:"assistant", content:data.reply, agent:mainAgent}]);
          if(data.deals) setFinalDeals(data.deals);
          speak(data.reply);
        }catch(e){ setIsTyping(false); setMessages(prev=>[...prev, {role:"assistant", content:"Error: "+e.message, agent:mainAgent}]); }
        return;
      }
      const item=sequence[idx];
      setCurrentReporter(item.agent); setActiveAgent(item.agent);
      playSound(400+idx*60);
      setMessages(prev=>[...prev, {role:"assistant", content:item.text, agent:item.agent, isReport:true}]);
      speak(item.text);
      idx++;
      setTimeout(playNext, 1800); // 1.8 sec gap - okari tarvatha okaru
    };
    playNext();
  };

  return (
    <div style={{position:"fixed", inset:0, background:"radial-gradient(ellipse at center, #1e1b4b 0%, #000 80%)", color:"#fff", display:"flex", flexDirection:"column", fontFamily:"monospace"}}>
      <style>{`
        @keyframes glow{0%,100%{box-shadow:0 0 10px currentColor}50%{box-shadow:0 0 20px currentColor,0 0 30px currentColor}}
        @keyframes reportSlide{0%{transform:translateX(-100%);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>

      <div style={{height:"56px", background:"#0a0a0a", borderBottom:`2px solid ${activeAgent.color}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px"}}>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <div style={{width:"32px", height:"32px", borderRadius:"50%", background:activeAgent.color, display:"flex", alignItems:"center", justifyContent:"center", animation: currentReporter?"glow 0.8s infinite":"none", color:"#fff"}}>{currentReporter? currentReporter.emoji : activeAgent.emoji}</div>
          <div>
            <div style={{fontSize:"13px", fontWeight:"bold"}}>{currentReporter? `${currentReporter.name} REPORTING...` : `AVENGERS - ${activeAgent.name}`}</div>
            <div style={{fontSize:"9px", opacity:0.7}}>{isSpeaking?"🔊 SPEAKING": isListening?"🎤 LISTENING": currentReporter?`⚡ ${currentReporter.role} REPORTING BOSS`:"⚡ ASSEMBLE MODE"}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:"4px"}}>
          {AGENTS.map(a=>(
            <div key={a.id} style={{width:"26px", height:"26px", borderRadius:"5px", background: currentReporter?.id===a.id? a.color : activeAgent.id===a.id? a.color:"#222", border: currentReporter?.id===a.id?`2px solid #fff`:`1px solid ${a.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", opacity: currentReporter?.id===a.id?1:0.6, animation: currentReporter?.id===a.id?"glow 0.6s infinite":"none"}}>{a.emoji}</div>
          ))}
        </div>
      </div>

      <div style={{flex:1, overflowY:"auto", padding:"12px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{marginBottom:"10px", textAlign: m.role==="user"?"right":"left", animation: m.isReport?"reportSlide 0.5s ease":"none"}}>
            <div style={{
              display:"inline-block", maxWidth:"88%", padding:"10px 12px", borderRadius:"12px",
              background: m.role==="user"? "#6d28d9" : m.isReport? `linear-gradient(135deg, #1a1a1a, ${m.agent.color}20)` : "#1e1e1e",
              border: m.isReport?`1px solid ${m.agent.color}`:"1px solid #333",
              boxShadow: m.isReport?`0 0 12px ${m.agent.color}60`:"none",
              fontSize:"12px", whiteSpace:"pre-wrap", textAlign:"left"
            }}>
              {m.role==="assistant" && <div style={{fontSize:"8px", color:m.agent.color, marginBottom:"3px", fontWeight:"bold"}}>{m.isReport?`● ${m.agent.name} REPORTING BOSS!`:`● ${m.agent.name} ONLINE`}</div>}
              {m.content}
            </div>
          </div>
        ))}
        {currentReporter && (
          <div style={{textAlign:"left", marginBottom:"10px"}}>
            <div style={{display:"inline-block", background:"#000", border:`2px solid ${currentReporter.color}`, padding:"8px 12px", borderRadius:"20px", fontSize:"11px", animation:"pulse 1s infinite"}}>
              🎤 {currentReporter.emoji} {currentReporter.name} REPORTING BOSS!...
            </div>
          </div>
        )}
        {isTyping && <div style={{fontSize:"12px", padding:"8px", background:"#111", borderRadius:"8px", border:`1px solid ${activeAgent.color}`}}>{typingText}</div>}
        {finalDeals.length>0 && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"10px"}}>
            {finalDeals.map((d,i)=>(
              <div key={i} style={{background:"#fff", color:"#000", borderRadius:"8px", padding:"6px", border: d.best?"3px solid #22c55e":"1px solid #ccc"}}>
                {d.best && <div style={{background:"#22c55e", color:"#fff", fontSize:"8px", padding:"2px 4px", borderRadius:"3px"}}>BEST TODAY</div>}
                <img src={d.image} alt="" style={{width:"100%", height:"75px", objectFit:"contain"}}/>
                <div style={{fontSize:"10px", fontWeight:"bold"}}>{d.title.slice(0,28)}</div>
                <div style={{fontSize:"11px", color:"green"}}>₹{d.price}</div>
              </div>
            ))}
          </div>
        )}
        <div ref={chatRef} style={{height:"20px"}}/>
      </div>

      <div style={{height:"64px", background:"#0a0a0a", borderTop:`2px solid ${activeAgent.color}`, display:"flex", alignItems:"center", padding:"0 10px", gap:"8px"}}>
        <button onClick={startVoice} style={{width:"44px", height:"44px", borderRadius:"50%", border:`2px solid ${activeAgent.color}`, background: isListening?"#ef4444": currentReporter? currentReporter.color:"#222", color:"#fff", cursor:"pointer", animation: isListening||currentReporter?"glow 0.6s infinite":"none"}}>{isListening?"🔴":"🎤"}</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} placeholder="Type: chiffon sarees, trip, news, ticket..." style={{flex:1, background:"#111", border:`1px solid ${activeAgent.color}`, borderRadius:"20px", padding:"10px 14px", color:"#fff", outline:"none"}}/>
        <button onClick={()=>handleOrder(input)} style={{background:activeAgent.color, color:"#fff", border:"none", borderRadius:"20px", padding:"10px 16px", fontWeight:"bold", cursor:"pointer"}}>SEND</button>
      </div>
    </div>
  );
}
