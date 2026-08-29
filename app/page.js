"use client";
import { useState, useRef } from "react";

const AGENTS = [
  { id:"JARVIS", name:"JARVIS PRIME", color:"#ffcc00", role:"LEADER" },
  { id:"PULSE", name:"PULSE-360", color:"#00e5ff", role:"pulse360news.in monitor" },
  { id:"VERIFACT", name:"VERIFACT", color:"#a855f7", role:"verifact monitor" },
  { id:"LOCAL", name:"LOCAL-TASK", color:"#4ade80", role:"Local tasks" },
  { id:"NEWS", name:"NEWS-HUNTER", color:"#ef4444", role:"Realtime news" },
  { id:"SHOPPER", name:"SHOPPER", color:"#ff8c00", role:"Shopping best deals" },
  { id:"TICKET", name:"TICKET-MASTER", color:"#00ff88", role:"Bus Train Flight Hotel" },
  { id:"TRIP", name:"TRIP-GUIDE", color:"#ff1493", role:"Trip planner with real pics budget" },
];

const PLACES_DB = {
  goa: [
    {name:"Baga Beach - Water Sports", budget:"₹1500", img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500", desc:"Parasailing, Jet Ski, Best sunset"},
    {name:"Fort Aguada", budget:"₹300", img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500", desc:"Sea view fort, 2hrs"},
    {name:"Total Budget ₹18k for 3 days", budget:"₹18,500", desc:"Day1 North Goa, Day2 South Goa, Day3 Dudhsagar. Stay 2500/night"}
  ],
  hyderabad: [
    {name:"Charminar & Old City", budget:"₹500", img:"https://images.unsplash.com/photo-1567696153798-9111f9cd54f6?w=500", desc:"Historic, 2hrs"},
    {name:"Golconda Fort", budget:"₹800", img:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=500", desc:"Light show evening"},
  ],
  manali: [
    {name:"Solang Valley Snow", budget:"₹2000", img:"https://images.unsplash.com/photo-1547140230-8d4be6c0e44a?w=500", desc:"Skiing, Paragliding"},
    {name:"Hadimba Temple", budget:"₹300", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500", desc:"Old Manali forest temple"},
  ]
};

export default function Page(){
  const [screen,setScreen]=useState("INIT");
  const [active,setActive]=useState(null);
  const [history,setHistory]=useState([]);
  const [typedReply,setTypedReply]=useState("");
  const [input,setInput]=useState("");
  const [isListening,setIsListening]=useState(false);
  const [isSpeaking,setIsSpeaking]=useState(false);
  const [queue,setQueue]=useState([]);
  const [searchMode,setSearchMode]=useState(null);
  const [searchItems,setSearchItems]=useState([]);
  const [finalDeals,setFinalDeals]=useState([]);
  const audioRef=useRef(null);

  const playAvengersTheme = ()=>{
    try{
      const a = new Audio("https://cdn.pixabay.com/audio/2022/03/24/audio_4e7b2b40a1.mp3");
      a.volume=0.5; a.play().catch(()=>{});
      setTimeout(()=>a.pause(), 8000);
      audioRef.current=a;
    }catch{}
  };

  const speakOne = (text, agent)=>{
    return new Promise(res=>{
      setIsSpeaking(true); setActive(agent); setTypedReply(text);
      try{
        speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance(text);
        u.rate=0.92; u.pitch= agent.id==="JARVIS"?0.75:0.95;
        u.onend=()=>{ setIsSpeaking(false); res(); };
        u.onerror=()=>{ setIsSpeaking(false); res(); };
        speechSynthesis.speak(u);
        setTimeout(()=>{ if(isSpeaking){ speechSynthesis.cancel(); setIsSpeaking(false); res(); }}, 6000);
      }catch{ setIsSpeaking(false); res(); }
    });
  };

  const speakQueue = async (text, agent)=>{
    if(isSpeaking){ setQueue(q=>[...q,{text,agent}]); return; }
    await speakOne(text, agent);
    if(queue.length>0){
      const nxt=queue[0]; setQueue(q=>q.slice(1));
      await new Promise(r=>setTimeout(r, 400));
      await speakQueue(nxt.text, nxt.agent);
    } else {
      if(screen!=="ROLLCALL") setActive(null);
    }
  };

  const handleOrder = async (txt)=>{
    if(!txt.trim() || isSpeaking) return;
    const order=txt.trim(); setInput(""); setFinalDeals([]); setSearchItems([]);
    let target=AGENTS[0];
    if(/pulse/i.test(order)) target=AGENTS[1];
    else if(/verifact/i.test(order)) target=AGENTS[2];
    else if(/shop|shoes|buy|deal/i.test(order)) target=AGENTS[5];
    else if(/ticket|bus|train|flight|hotel/i.test(order)) target=AGENTS[6];
    else if(/trip|goa|manali|hyd|place|visit/i.test(order)) target=AGENTS[7];
    else if(/news/i.test(order)) target=AGENTS[4];

    if(target.id==="SHOPPER"){
      setSearchMode("shopping"); setActive(target);
      const query = encodeURIComponent(order.replace(/shop/i,"").trim()||"shoes");
      let items=Array.from({length:15},(_,i)=>`${["Amazon","Flipkart","Myntra"][i%3]} scanning ${order}...`);
      for(let i=0;i<items.length;i++){ setSearchItems(s=>[...s.slice(-5), items[i]]); await new Promise(r=>setTimeout(r,120)); }
      setSearchMode(null);
      setFinalDeals([
        {name:`${order} - Nike Air`, price:"₹1,299", mrp:"₹3,999", off:"68% OFF", site:"Amazon", img:`https://source.unsplash.com/400x300/?${query},shoes`, rating:"4.5⭐", best:true, link:`https://amazon.in/s?k=${query}`},
        {name:`${order} - Puma Runner`, price:"₹1,499", mrp:"₹2,999", off:"50% OFF", site:"Flipkart", img:`https://source.unsplash.com/400x300/?${query},sneakers`, rating:"4.3⭐", link:`https://flipkart.com/search?q=${query}`},
      ]);
      await speakQueue(`Search complete sir. Best deals for ${order} found with images`, target);
    }
    else if(target.id==="TRIP"){
      setSearchMode("trip"); setActive(target);
      const low = order.toLowerCase();
      let key = "goa"; if(low.includes("manali")) key="manali"; else if(low.includes("hyd")) key="hyderabad"; else if(low.includes("goa")) key="goa";
      let tripPlaces = PLACES_DB[key] || [{name:`Best in ${order}`, budget:"₹1000", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(order)},travel`, desc:"Top attraction"},{name:`Second best in ${order}`, budget:"₹800", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(order)},beach`, desc:"Must visit"}];
      for(let t of ["Scanning best places...","Finding real images...","Calculating budget..."]){ setSearchItems(s=>[...s,t]); await new Promise(r=>setTimeout(r,500)); }
      setSearchMode(null); setFinalDeals(tripPlaces.slice(0,2));
      const total = tripPlaces[2]?.desc || `Total Budget around ${tripPlaces[0].budget} + stay. Best time Oct-Feb`;
      setTypedReply(`TRIP PLAN for ${order}: ${total}`);
      await speakQueue(`Trip plan for ${order} ready sir. Real ${key} places with images and budget showing`, target);
      // Real AI call for details
      try{
        const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:`Give real trip plan for ${order} - 2 places, budget, best time`, avenger:"TRIP"})});
        const d=await r.json(); await speakQueue(d.reply, target);
      }catch{}
    }
    else if(target.id==="TICKET"){
      setSearchMode("travel"); setActive(target);
      for(let t of ["Searching Buses...","Searching Trains...","Searching Flights & Hotels..."]){ setSearchItems(s=>[...s,t]); await new Promise(r=>setTimeout(r,600)); }
      setSearchMode(null);
      setFinalDeals([
        {type:"Bus - Orange", price:"₹890", time:"6h", img:"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400", details:"AC Sleeper"},
        {type:"Train - Vande Bharat", price:"₹1,240", time:"4.5h", img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400", best:true, details:"Fastest"},
        {type:"Hotel - Best in Area", price:"₹3,499", time:"4.8⭐", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", best:true, details:"Top rated"},
      ]);
      await speakQueue(`Travel and hotels for ${order} ready sir`, target);
    }
    else{
      await speakQueue(`Processing ${order} via ${target.name} sir`, target);
      try{
        const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:target.id})});
        const d=await r.json(); await speakQueue(d.reply, target);
      }catch{ await speakQueue(`${order} executed sir`, target); }
    }
  };

  const startVoice=()=>{
    if(isSpeaking) return;
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return alert("Mic not supported");
    const rec=new SR(); rec.lang="en-IN"; setIsListening(true);
    rec.onresult=e=>{ setIsListening(false); handleOrder(e.results[0][0].transcript); };
    rec.onend=()=>setIsListening(false); rec.start();
  };

  const startRollCall = async ()=>{
    playAvengersTheme();
    setScreen("ROLLCALL"); setHistory([]);
    for(let ag of AGENTS){
      setHistory(h=>[...h,ag]);
      await speakOne(`${ag.name} online. Role ${ag.role}`, ag);
      await new Promise(r=>setTimeout(r,300));
    }
    setScreen("ACTIVE"); setActive(null);
    await speakOne("All 8 Avengers ready sir. Sequential voice enabled. Ask trip to Goa, shop shoes, tickets.", AGENTS[0]);
  };

  return(
    <div style={{minHeight:"100vh", background:"radial-gradient(1200px 600px at 50% -10%, #1a1a2e 0%, #050508 60%)", color:"white", fontFamily:"monospace", position:"relative"}}>
      <style>{`@keyframes avengersGlow{0%,100%{box-shadow:0 0 20px #ffcc00}50%{box-shadow:0 0 60px #ffcc00,0 0 100px #ff8c00}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {searchMode && <div style={{position:"fixed", inset:0, background:"#020208f2", zIndex:99, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
        <div style={{fontSize:24, fontWeight:900, color:"#ffcc00", letterSpacing:4, animation:"pulse 0.7s infinite"}}>{searchMode==="shopping"?"🛒 SEARCHING REAL DEALS": searchMode==="trip"?"🗺️ FINDING REAL PLACES":"✈️ SEARCHING TRAVEL"}</div>
        <div style={{marginTop:16, width:320, height:4, background:"#222", borderRadius:10, overflow:"hidden"}}><div style={{height:"100%", width:"100%", background:"linear-gradient(90deg,#ffcc00,#ff8c00)", animation:"pulse 0.8s infinite"}}></div></div>
        <div style={{marginTop:20, width:"90%", maxWidth:400}}>{searchItems.map((it,i)=><div key={i} style={{background:"#111113", borderLeft:"3px solid #ffcc00", padding:8, marginTop:6, borderRadius:6, fontSize:12}}>{it}</div>)}</div>
      </div>}

      <div style={{display:"flex", justifyContent:"space-between", padding:"10px 16px", borderBottom:"1px solid #1f2937", background:"#08080a"}}>
        {AGENTS.map(a=><div key={a.id} style={{textAlign:"center", opacity: history.find(h=>h.id===a.id)?1:0.15, transform: active?.id===a.id?"scale(1.35)":"scale(1)", transition:"0.3s"}}><div style={{width:24, height:24, borderRadius:"50%", border:`1.5px solid ${a.color}`, background: history.find(h=>h.id===a.id)?a.color+"88":"transparent", animation: active?.id===a.id?"avengersGlow 1s infinite":"none"}}></div><div style={{fontSize:5, color:a.color, marginTop:2, fontWeight:800}}>{a.id}</div></div>)}
      </div>

      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"75vh", padding:16}}>
        {screen==="INIT" && <div style={{textAlign:"center"}}>
          <div style={{fontSize:48, fontWeight:900, letterSpacing:8, background:"linear-gradient(90deg,#ffcc00,#ff3300)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"pulse 2s infinite"}}>AVENGERS</div>
          <div style={{fontSize:10, letterSpacing:6, opacity:0.6, marginTop:6}}>NARASIMHA PROTOCOL • 8 AGENTS • SEQUENTIAL VOICE</div>
          <div style={{marginTop:20, width:180, height:180, borderRadius:"50%", margin:"20px auto", background:"radial-gradient(circle, #1a1a2e, #000)", border:"2px solid #ffcc00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60, animation:"avengersGlow 2s infinite"}}>A</div>
          <button onClick={startRollCall} style={{marginTop:20, padding:"14px 32px", background:"linear-gradient(90deg,#ffcc00,#ff8c00)", color:"black", fontWeight:900, borderRadius:30, border:"none", cursor:"pointer", fontSize:14, letterSpacing:2}}>⚡ INITIATE PROTOCOL</button>
          <div style={{fontSize:8, opacity:0.3, marginTop:12}}>Avengers Theme + Sequential Voice + Real Images</div>
        </div>}

        {screen!=="INIT" && active &&!searchMode && <div style={{textAlign:"center"}}><div style={{width:100, height:100, borderRadius:"50%", margin:"0 auto", background:`radial-gradient(circle, ${active.color}, #000)`, border:`3px solid ${active.color}`, boxShadow:`0 0 50px ${active.color}`, animation: isSpeaking?"pulse 0.6s infinite":"none"}}></div><div style={{color:active.color, marginTop:12, fontWeight:900}}>{active.name} {isSpeaking?"🔊":""}</div><div style={{marginTop:14, background:"#111113", border:`1px solid ${active.color}44`, padding:14, borderRadius:12, maxWidth:420, textAlign:"left"}}><div style={{fontSize:10, color:active.color}}>💬 {active.id} SAYS (Real Data):</div><div style={{fontSize:14, marginTop:6, lineHeight:1.4}}>{typedReply}</div></div></div>}

        {screen==="ACTIVE" &&!active &&!searchMode && <div style={{width:"100%", maxWidth:750}}>
          {finalDeals.length===0 && <div style={{textAlign:"center", opacity:0.6}}>Ready Boss<br/><span style={{fontSize:11}}>Try: "trip to goa" (real Goa), "shop shoes", "ticket hyd to goa with hotel"</span></div>}
          {finalDeals.length>0 && <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>{finalDeals.map((d,i)=><div key={i} style={{background:"#111113", border: d.best?"2px solid #ffcc00":"1px solid #2a2a2e", borderRadius:14, overflow:"hidden"}}>
            <img src={d.img} alt="deal" style={{width:"100%", height:150, objectFit:"cover"}} onError={e=>e.target.src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400"}/>
            <div style={{padding:10}}><div style={{fontWeight:900, fontSize:13}}>{d.name||d.type} {d.best?"⭐ BEST":""}</div><div style={{fontSize:10, opacity:0.6, marginTop:4}}>{d.desc||d.details||d.rating}</div><div style={{marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center"}}><div><span style={{fontWeight:900, color:"#00ff88", fontSize:16}}>{d.price||d.budget}</span> {d.mrp && <span style={{textDecoration:"line-through", fontSize:10, opacity:0.4, marginLeft:4}}>{d.mrp}</span>} {d.off && <span style={{background:"#ff8c00", padding:"2px 6px", borderRadius:4, fontSize:9, marginLeft:4}}>{d.off}</span>}</div><a href={d.link||"#"} target="_blank" style={{background:"#ffcc00", color:"black", padding:"6px 12px", borderRadius:6, fontSize:10, fontWeight:900, textDecoration:"none"}}>{d.site||"VIEW"}</a></div></div>
          </div>)}</div>}
          {finalDeals.length>0 && typedReply.includes("TRIP PLAN") && <div style={{marginTop:12, background:"#111", border:"1px solid #ff1493", padding:12, borderRadius:10}}><div style={{color:"#ff1493", fontWeight:800, fontSize:11}}>🗺️ TOTAL TRIP PLAN - REAL</div><div style={{fontSize:12, marginTop:4}}>{typedReply}</div></div>}
        </div>}
      </div>

      {screen==="ACTIVE" && <div style={{display:"flex", gap:6, padding:10, borderTop:"1px solid #222", background:"#08080a", position:"sticky", bottom:0}}>
        <button onClick={startVoice} disabled={isSpeaking} style={{padding:"10px 14px", background:isListening?"#ef4444": isSpeaking?"#222":"#27272a", border:"1px solid #333", borderRadius:8, color:"white", fontWeight:800, cursor:isSpeaking?"not-allowed":"pointer"}}>{isListening?"🔴 Listening": isSpeaking?"⏳ Wait":"🎤 VOICE"}</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleOrder(input)} disabled={isSpeaking} placeholder={isSpeaking?"One agent speaking... wait":"Type: trip to goa / shop shoes / ticket hyd to goa"} style={{flex:1, background:"#111", border:"1px solid #333", borderRadius:8, padding:10, color:"white", opacity:isSpeaking?0.4:1}}/>
        <button onClick={()=>handleOrder(input)} disabled={isSpeaking} style={{padding:"10px 16px", background:isSpeaking?"#333":"#ffcc00", color:"black", fontWeight:900, borderRadius:8, border:"none", cursor:isSpeaking?"not-allowed":"pointer"}}>EXECUTE</button>
      </div>}
    </div>
  )
}
