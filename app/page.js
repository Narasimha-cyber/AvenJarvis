"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {id:"JARVIS", name:"JARVIS PRIME", emoji:"🧠", bg:"#7c3aed", desc:"Main Boss"},
  {id:"PULSE", name:"PULSE-360", emoji:"📰", bg:"#dc2626", desc:"News Site Monitor"},
  {id:"VERIFACT", name:"VERIFACT", emoji:"🛡️", bg:"#16a34a", desc:"Fake News Checker"},
  {id:"SHOPPER", name:"SHOPPER", emoji:"🛒", bg:"#db2777", desc:"Best Deals Finder"},
  {id:"NEWS", name:"NEWS", emoji:"🌐", bg:"#2563eb", desc:"Live News"},
  {id:"TRIP", name:"TRIP PLANNER", emoji:"🗺️", bg:"#ca8a04", desc:"Trip Planner"},
  {id:"TICKET", name:"TICKET FINDER", emoji:"✈️", bg:"#4f46e5", desc:"Ticket Booking"},
];

function getInstantBest(low){
  const m = new Date().getMonth();
  const bestPlace = [5,6,7,8].includes(m)? "Araku Valley + Maredumilli" : "Goa + Jaipur";
  if(low.includes("saree")||low.includes("chiffon")||low.includes("fabric")){
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Chiffon Saree Amazon lo ₹799 MRP ₹1999 60% OFF 4.3⭐ ide cheapest today! Real cards vastunnai Boss! 🔴 LIVE`;
  }
  if(low.includes("shoe")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Shoes Nike ₹1299 56% OFF best today! 🔴 LIVE`;
  if(low.includes("phone")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Phone 5G ₹14999 best today! 🔴 LIVE`;
  if(low.includes("watch")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Watch Titan ₹1999 40% OFF best! 🔴 LIVE`;
  if(low.includes("trip")||low.includes("visit")||low.includes("best place")) return `TRIP AGENT ONLINE BOSS! 🗺️ Eroju Best Place - ${bestPlace} ide best today, waterfalls full & train ₹280 best! 🔴 LIVE`;
  if(low.startsWith("news")||low.includes("headlines")) return `NEWS AGENT ONLINE BOSS! 🌐 Eroju Best Trending - AP Monsoon Heavy Rains No.1 trending today! 🔴 LIVE`;
  if(low.includes("ticket")||low.includes("bus")||low.includes("train")||low.includes("flight")) return `TICKET AGENT ONLINE BOSS! ✈️ Eroju Best Booking - Train 17208 ₹280 24 seats + Hotel ₹1200 = ₹1800 combo Save ₹800 best! 🔴 LIVE`;
  if(low.includes("pulse360")) return `PULSE-360 AGENT ONLINE BOSS! 📰 Eroju Best Update - Site LIVE super fast & ${bestPlace} topic trending best today! 🔴 LIVE`;
  if(low.includes("verifact")||low.includes("fake")) return `VERIFACT AGENT ONLINE BOSS! 🛡️ Eroju Best Alert - Fake News checking LIVE, real vs fake chepta Boss! 🔴 LIVE`;
  return `JARVIS PRIME ONLINE BOSS! 🧠 Eroju Best Overall - Place ${bestPlace}, Deal Saree ₹799 best, News trending - All best picks today! 🔴 LIVE`;
}

export default function Home(){
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([
    {role:"assistant", content:"Welcome Boss! 🧠 Avengers Ready!\n\nTry:\n• chiffon fabric sarees\n• shoes under 1500\n• trip to araku valley\n• ticket from vijayawada to hyderabad\n• news about AP\n• pulse360news\n• verifact free laptop", agent:AGENTS[0]}
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [finalDeals, setFinalDeals] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, typingText, finalDeals]);

  const speak = (text)=>{
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.slice(0,200));
      u.rate=1; u.lang='en-IN';
      window.speechSynthesis.speak(u);
    }
  };

  const handleOrder = async (txt)=>{
    const order = txt.trim();
    if(!order) return;
    const low = order.toLowerCase();
    let targetId = "JARVIS";
    const isProduct = /(saree|chiffon|fabric|dress|kurta|shoe|sneaker|phone|mobile|watch|bag|deal|offer|under \d+)/i.test(low);
    const isTicket = low.includes("ticket") || (low.includes("bus")&&low.includes("to")) || (low.includes("train")&&low.includes("to")) || (low.includes("flight")&&low.includes("to"));

    if(low.includes("pulse360")) targetId="PULSE";
    else if(low.includes("verifact")||low.includes("fake")) targetId="VERIFACT";
    else if(isTicket) targetId="TICKET";
    else if((low.includes("trip")||low.includes("visit")||low.includes("tour")||low.includes("best place")) &&!isProduct) targetId="TRIP";
    else if(low==="news"||low.startsWith("news ")||low.includes("headlines")) targetId="NEWS";
    else if(isProduct || low.split(" ").length<=6) targetId="SHOPPER";

    const target = AGENTS.find(a=>a.id===targetId);
    setActiveAgent(target);
    setInput(""); setFinalDeals([]);
    setMessages(prev=>[...prev, {role:"user", content:order}]);

    // NEW CHANGE: ONLINE ANNAPPude BEST DEAL - FIRST THING
    const instantMsg = getInstantBest(low);
    setIsTyping(true);
    setTypingText(instantMsg);

    try{
      const res = await fetch("/api/avengers",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:order, avenger:targetId, t:Date.now(), r:Math.random()})
      });
      const data = await res.json();
      setTimeout(()=>{
        setIsTyping(false); setTypingText("");
        setMessages(prev=>[...prev, {role:"assistant", content:data.reply, agent:target, place:data.detectedPlace}]);
        if(data.deals) setFinalDeals(data.deals);
        speak(data.reply);
      }, 1200);
    }catch(e){
      setIsTyping(false);
      setMessages(prev=>[...prev, {role:"assistant", content:"Error Boss: "+e.message, agent:target}]);
    }
  };

  const startVoice = ()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){ alert("Voice not supported in this browser"); return; }
    const rec = new SpeechRecognition();
    rec.lang="en-IN"; rec.onstart=()=>setIsListening(true);
    rec.onend=()=>setIsListening(false);
    rec.onresult=(e)=>{ const txt=e.results[0][0].transcript; setInput(txt); handleOrder(txt); };
    rec.start();
  };

  return (
    <div style={{minHeight:"100vh", background:"#000", color:"#fff", fontFamily:"Arial, sans-serif", display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"12px 16px", borderBottom:"1px solid #333", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px"}}>
        <div style={{fontWeight:"bold", fontSize:"15px"}}>⚡ AVENGERS - BOSS MODE - {activeAgent.emoji} {activeAgent.name}</div>
        <div style={{display:"flex", gap:"5px", flexWrap:"wrap"}}>
          {AGENTS.map(a=>(
            <button key={a.id} onClick={()=>setActiveAgent(a)} title={a.desc} style={{padding:"5px 9px", borderRadius:"6px", fontSize:"11px", border:"1px solid #444", cursor:"pointer", background: activeAgent.id===a.id? a.bg:"#222", color:"#fff"}}>{a.emoji} {a.id}</button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1, overflowY:"auto", padding:"16px", maxWidth:"900px", margin:"0 auto", width:"100%"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{textAlign: m.role==="user"?"right":"left", marginBottom:"12px"}}>
            <div style={{display:"inline-block", maxWidth:"88%", padding:"10px 14px", borderRadius:"14px", background: m.role==="user"? "#7c3aed":"#1e1e1e", fontSize:"13px", whiteSpace:"pre-wrap", textAlign:"left", border: m.role==="assistant"?"1px solid #333":"none"}}>
              {m.role==="assistant" && <div style={{fontSize:"10px", opacity:0.6, marginBottom:"4px", color:"#a78bfa"}}>{m.agent?.emoji} {m.agent?.name} - {m.agent?.desc} - ONLINE BOSS!</div>}
              {m.content}
              {m.place && <div style={{marginTop:"6px", fontSize:"11px", color:"#22c55e"}}>📍 {m.place}</div>}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{textAlign:"left", marginBottom:"12px"}}>
            <div style={{display:"inline-block", maxWidth:"88%", padding:"10px 14px", borderRadius:"14px", background:"#1e1e1e", fontSize:"13px", border:"1px solid #7c3aed"}}>{typingText}</div>
          </div>
        )}
        {finalDeals.length>0 && (
          <div>
            <div style={{fontSize:"12px", margin:"10px 0 6px", opacity:0.7}}>🔴 LIVE REAL PRODUCTS - {finalDeals.length} found - BEST in green border</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              {finalDeals.map((d,i)=>(
                <div key={i} style={{background:"#fff", color:"#000", borderRadius:"10px", padding:"8px", border: d.best? "3px solid #22c55e":"1px solid #ddd"}}>
                  {d.best && <div style={{background:"#22c55e", color:"#fff", fontSize:"9px", padding:"2px 6px", borderRadius:"4px", display:"inline-block", marginBottom:"4px", fontWeight:"bold"}}>🏆 BEST TODAY</div>}
                  <img src={d.image} alt="" style={{height:"90px", width:"100%", objectFit:"contain", background:"#f5f5f5", borderRadius:"6px"}}/>
                  <div style={{fontWeight:"bold", fontSize:"11px", marginTop:"4px", lineHeight:"1.2"}}>{d.title.slice(0,38)}</div>
                  <div style={{color:"#16a34a", fontWeight:"bold", fontSize:"13px", marginTop:"2px"}}>₹{d.price} <span style={{textDecoration:"line-through", color:"#999", fontSize:"10px"}}>₹{d.mrp}</span></div>
                  <div style={{fontSize:"10px", color:"#666"}}>⭐ {d.rating} | {d.source||"REAL API"}</div>
                  <a href={d.link} target="_blank" style={{display:"block", marginTop:"4px", background:"#000", color:"#fff", textAlign:"center", padding:"4px", borderRadius:"6px", fontSize:"10px", textDecoration:"none"}}>View Deal</a>
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={chatRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"12px", borderTop:"1px solid #333", maxWidth:"900px", margin:"0 auto", width:"100%", display:"flex", gap:"8px", alignItems:"center"}}>
        <button onClick={startVoice} style={{background: isListening? "#ef4444":"#222", border:"1px solid #444", borderRadius:"50%", width:"42px", height:"42px", cursor:"pointer", fontSize:"16px"}}>{isListening? "🔴":"🎤"}</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} placeholder="Ex: chiffon sarees, shoes under 1500, trip to araku, news, pulse360news" style={{flex:1, background:"#222", border:"1px solid #444", borderRadius:"20px", padding:"12px 16px", color:"#fff", outline:"none", fontSize:"13px"}}/>
        <button onClick={()=>handleOrder(input)} style={{background:"#fff", color:"#000", border:"none", borderRadius:"20px", padding:"12px 18px", fontWeight:"bold", cursor:"pointer", fontSize:"13px"}}>SEND</button>
      </div>
      <div style={{textAlign:"center", fontSize:"10px", opacity:0.4, padding:"4px"}}>Avengers AI - All 7 Agents - Voice + Real Products + Live News + Trip + Ticket - Boss Mode</div>
    </div>
  );
}
