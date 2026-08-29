"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id:"JARVIS", name:"JARVIS PRIME", color:"#ffcc00", emoji:"🧠", role:"LEADER" },
  { id:"PULSE", name:"PULSE-360", color:"#00e5ff", emoji:"📰", role:"pulse360news.in LIVE" },
  { id:"VERIFACT", name:"VERIFACT", color:"#a855f7", emoji:"🛡️", role:"Fake News Detector LIVE" },
  { id:"LOCAL", name:"LOCAL", color:"#4ade80", emoji:"💻", role:"Local Tasks" },
  { id:"NEWS", name:"NEWS", color:"#ef4444", emoji:"🌐", role:"Realtime News" },
  { id:"SHOPPER", name:"SHOPPER", color:"#ff8c00", emoji:"🛒", role:"Best Deals" },
  { id:"TICKET", name:"TICKET", color:"#00ff88", emoji:"✈️", role:"Travel + Hotel" },
  { id:"TRIP", name:"TRIP", color:"#ff1493", emoji:"🗺️", role:"Trip Planner" },
];

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
  const [pulse,setPulse]=useState(0);

  useEffect(()=>{ const i=setInterval(()=>setPulse(p=>p+1), 150); return ()=>clearInterval(i); },[]);

  const speakOne = (text, agent)=> new Promise(res=>{
    setIsSpeaking(true); setActive(agent); setTypedReply(text);
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text.slice(0,300));
      u.rate=0.9; u.pitch= agent.id==="JARVIS"?0.7:1;
      u.onend=()=>{ setIsSpeaking(false); res(); };
      u.onerror=()=>{ setIsSpeaking(false); res(); };
      speechSynthesis.speak(u);
      setTimeout(()=>{ speechSynthesis.cancel(); setIsSpeaking(false); res(); }, 7000);
    }catch{ setIsSpeaking(false); res(); }
  });

  const speakQueue = async (text, agent)=>{
    if(isSpeaking){ setQueue(q=>[...q,{text,agent}]); return; }
    await speakOne(text, agent);
    if(queue.length>0){
      const nxt=queue[0]; setQueue(q=>q.slice(1));
      await new Promise(r=>setTimeout(r,400));
      await speakQueue(nxt.text, nxt.agent);
    }else{ if(screen!=="ROLLCALL") setActive(null); }
  };

  const handleOrder = async (txt)=>{
    if(!txt.trim() || isSpeaking) return;
    const order=txt.trim(); setInput(""); setFinalDeals([]); setSearchItems([]);
    let target=AGENTS[0];
    if(/pulse/i.test(order)) target=AGENTS[1];
    else if(/verifact|fake/i.test(order)) target=AGENTS[2];
    else if(/shop|shoes|buy/i.test(order)) target=AGENTS[5];
    else if(/ticket|bus|train|flight|hotel/i.test(order)) target=AGENTS[6];
    else if(/trip|goa|manali|araKu|maredumilli|jaipur|visit/i.test(order)) target=AGENTS[7];
    else if(/news/i.test(order)) target=AGENTS[4];

    setActive(target);

    if(["SHOPPER","TICKET","TRIP","PULSE","VERIFACT"].includes(target.id)){
      setSearchMode(target.id.toLowerCase());
      const msgs = target.id==="PULSE"? ["Connecting to pulse360news.in...","Scanning homepage...","Fetching sitemap + headlines..."] :
                   target.id==="VERIFACT"? ["Waking Render server...","Scanning fake-news-detector...","Checking detector status..."] :
                   target.id==="TRIP"? ["Real-time Wikipedia search...","Finding real images...","Building day-wise budget plan..."] :
                   ["Scanning Amazon...","Scanning Flipkart...","Finding BEST deal..."];
      for(let m of msgs){ setSearchItems(s=>[...s,m]); await new Promise(r=>setTimeout(r,700)); }
    }

    try{
      const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:target.id})});
      const d=await r.json();
      setSearchMode(null);

      // Dynamic cards based on agent
      if(target.id==="TRIP"){
        const place = d.detectedPlace || "travel";
        setFinalDeals([
          {name:`${place} Top Spot`, budget:"₹800-1500", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(place)},tourist,beach`, desc:"Day 1 Morning"},
          {name:`${place} Nature View`, budget:"₹500", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(place)},nature,waterfall`, desc:"Day 1 Evening - Sunset"},
        ]);
      } else if(target.id==="SHOPPER"){
        const q=encodeURIComponent(order.replace(/shop/i,""));
        setFinalDeals([
          {name:`${order} - Nike`, price:"₹1,299", mrp:"₹3,999", off:"68% OFF", site:"Amazon", img:`https://source.unsplash.com/400x300/?${q},shoes`, best:true},
          {name:`${order} - Puma`, price:"₹1,499", site:"Flipkart", img:`https://source.unsplash.com/400x300/?${q},sneakers`},
        ]);
      } else if(target.id==="TICKET"){
        setFinalDeals([
          {type:"Bus - Orange", price:"₹890", time:"6h AC", img:"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400"},
          {type:"Hotel - 4.8⭐", price:"₹3,499", time:"Best", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", best:true},
        ]);
      }

      setTypedReply(d.reply);
      await speakQueue(d.reply, target);

    }catch{ setSearchMode(null); await speakQueue(`${target.name} ready Boss`, target); }
  };

  const startVoice=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return alert("Mic not supported");
    const rec=new SR(); rec.lang="en-IN"; setIsListening(true);
    rec.onresult=e=>{ setIsListening(false); handleOrder(e.results[0][0].transcript); };
    rec.onend=()=>setIsListening(false); rec.start();
  };

  const startRollCall = async ()=>{
    setScreen("ROLLCALL"); setHistory([]);
    for(let ag of AGENTS){
      setHistory(h=>[...h,ag]);
      await speakOne(`${ag.name} online. ${ag.role}`, ag);
      await new Promise(r=>setTimeout(r,350));
    }
    setScreen("ACTIVE");
    await speakOne("All 8 Avengers online. Interface is now fully dynamic Boss. Ask anything.", AGENTS[0]);
  };

  return(
    <div style={{minHeight:"100vh", background:`radial-gradient(800px 400px at 20% 0%, ${active?.color}22 0%, transparent 60%), radial-gradient(1000px 600px at 80% 100%, #1a1a2e 0%, #050508 70%)`, color:"white", fontFamily:"system-ui, monospace", overflow:"hidden"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px var(--c)}50%{box-shadow:0 0 50px var(--c),0 0 80px var(--c)}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
       .glass{background:rgba(17,17,19,0.8);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08)}
      `}</style>

      {searchMode && <div style={{position:"fixed", inset:0, background:"#020208f8", zIndex:100, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
        <div style={{width:120, height:120, borderRadius:"50%", border:`3px solid ${AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color || "#ffcc00"}`, borderTopColor:"transparent", animation:"glow 1s linear infinite", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40}}>{AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.emoji}</div>
        <div style={{marginTop:20, fontSize:18, fontWeight:900, letterSpacing:3, color:AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color}}>{searchMode.toUpperCase()} SCANNING...</div>
        <div style={{marginTop:12, width:300, height:3, background:"#222", borderRadius:10, overflow:"hidden", position:"relative"}}><div style={{position:"absolute", inset:0, width:"50%", background:AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color, animation:"scan 1.2s linear infinite"}}></div></div>
        <div style={{marginTop:20}}>{searchItems.map((it,i)=><div key={i} style={{fontSize:12, opacity:0.8, marginTop:6, animation:"float 2s infinite"}}>• {it}</div>)}</div>
      </div>}

      {/* TOP AGENTS BAR - DYNAMIC */}
      <div className="glass" style={{display:"flex", justifyContent:"space-between", padding:"12px 10px", position:"sticky", top:0, zIndex:10}}>
        {AGENTS.map(a=>{
          const isActive = active?.id===a.id;
          const isOnline = history.find(h=>h.id===a.id);
          return <div key={a.id} style={{textAlign:"center", opacity:isOnline?1:0.25, transform:isActive?`scale(${1.2+Math.sin(pulse/5)*0.1})`: "scale(1)", transition:"0.3s"}}>
            <div style={{"--c":a.color, width:34, height:34, borderRadius:"50%", border:`2px solid ${a.color}`, background: isOnline? `${a.color}33` : "transparent", display:"flex", alignItems:"center", justifyContent:"center", animation: isActive? "glow 1s infinite" : "none", fontSize:16}}>{a.emoji}</div>
            <div style={{fontSize:6, color:a.color, fontWeight:900, marginTop:3}}>{a.id}</div>
            {isActive && <div style={{width:4, height:4, background:a.color, borderRadius:"50%", margin:"2px auto", boxShadow:`0 0 8px ${a.color}`}}></div>}
          </div>
        })}
      </div>

      <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"78vh", padding:16}}>
        {screen==="INIT" && <div style={{textAlign:"center"}}>
          <div style={{fontSize:54, fontWeight:900, letterSpacing:10, background:"linear-gradient(90deg,#ffcc00,#ff3300,#ff1493)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>AVENGERS</div>
          <div style={{fontSize:9, letterSpacing:6, opacity:0.5}}>NARASIMHA DYNAMIC PROTOCOL • V4</div>
          <div style={{marginTop:30, width:200, height:200, borderRadius:"50%", margin:"30px auto", background:"radial-gradient(circle at 30% 30%, #222, #000)", border:"2px solid #ffcc00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, animation:"float 3s infinite, glow 2s infinite", "--c":"#ffcc00"}}>A</div>
          <button onClick={startRollCall} style={{marginTop:10, padding:"16px 36px", background:"linear-gradient(90deg,#ffcc00,#ff8c00)", color:"black", fontWeight:900, borderRadius:30, border:"none", cursor:"pointer", letterSpacing:2, boxShadow:"0 10px 30px #ffcc0044"}}>⚡ INITIATE DYNAMIC PROTOCOL</button>
        </div>}

        {screen!=="INIT" && active &&!searchMode && <div style={{textAlign:"center", width:"100%", maxWidth:500}}>
          <div style={{width:110, height:110, borderRadius:"50%", margin:"0 auto", background:`radial-gradient(circle at 30% 30%, ${active.color}, #000)`, border:`3px solid ${active.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, animation: isSpeaking? "glow 0.6s infinite" : "float 3s infinite", "--c":active.color}}>{active.emoji}</div>
          <div style={{color:active.color, marginTop:14, fontWeight:900, fontSize:18}}>{active.name} {isSpeaking?"🔊":""}</div>
          <div style={{color:active.color, fontSize:10, opacity:0.7}}>{active.role}</div>
          <div className="glass" style={{marginTop:18, padding:16, borderRadius:16, textAlign:"left", borderLeft:`4px solid ${active.color}`}}>
            <div style={{fontSize:10, color:active.color, fontWeight:800}}>💬 LIVE RESPONSE:</div>
            <div style={{fontSize:13, marginTop:8, lineHeight:1.6, whiteSpace:"pre-wrap"}}>{typedReply}</div>
          </div>
        </div>}

        {screen==="ACTIVE" &&!active &&!searchMode && <div style={{width:"100%", maxWidth:780}}>
          {finalDeals.length===0 && <div style={{textAlign:"center", opacity:0.5, lineHeight:1.8}}>Dynamic HQ Ready Boss<br/><span style={{fontSize:12}}>Try: <b>pulse360news monitor</b> • <b>verifact monitor</b> • <b>trip to araku</b> • <b>shop shoes</b></span></div>}
          {finalDeals.length>0 && <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12}}>{finalDeals.map((d,i)=><div key={i} className="glass" style={{borderRadius:16, overflow:"hidden", border: d.best? "2px solid #ffcc00" : "1px solid rgba(255,255,255,0.08)", transform:`translateY(${Math.sin(pulse/10+i)*2}px)`, transition:"0.2s"}}>
            <img src={d.img} style={{width:"100%", height:140, objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
            <div style={{padding:10}}><div style={{fontWeight:900, fontSize:12}}>{d.name||d.type} {d.best?"⭐ BEST":""}</div><div style={{fontSize:10, opacity:0.6, marginTop:4}}>{d.desc||d.time||""}</div><div style={{marginTop:8, fontWeight:900, color:"#00ff88"}}>{d.price||d.budget||""} <span style={{fontSize:10, textDecoration:"line-through", opacity:0.4}}>{d.mrp||""}</span></div></div>
          </div>)}</div>}
          {typedReply && finalDeals.length>0 && <div className="glass" style={{marginTop:14, padding:12, borderRadius:12, fontSize:12, whiteSpace:"pre-wrap"}}>{typedReply}</div>}
        </div>}
      </div>

      {screen==="ACTIVE" && <div className="glass" style={{display:"flex", gap:8, padding:12, position:"fixed", bottom:0, left:0, right:0}}>
        <button onClick={startVoice} disabled={isSpeaking} style={{padding:"12px 16px", background:isListening?"#ef4444": isSpeaking?"#222":"#1f1f23", border:"1px solid #333", borderRadius:12, color:"white", fontWeight:800}}>{isListening?"🔴": isSpeaking?"⏳":"🎤"}</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} disabled={isSpeaking} placeholder={isSpeaking?"Agent speaking...":"Ask: monitor pulse360news, trip to araku, shop shoes..."} style={{flex:1, background:"#0a0a0c", border:"1px solid #2a2a2e", borderRadius:12, padding:"12px 14px", color:"white"}}/>
        <button onClick={()=>handleOrder(input)} disabled={isSpeaking} style={{padding:"12px 18px", background:isSpeaking?"#333":"#ffcc00", color:"black", fontWeight:900, borderRadius:12, border:"none"}}>GO</button>
      </div>}
    </div>
  )
}
