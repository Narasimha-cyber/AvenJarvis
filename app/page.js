"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id:"JARVIS", name:"JARVIS PRIME", color:"#ffcc00", emoji:"🧠", role:"LEADER", pos:{x:0,y:-140} },
  { id:"PULSE", name:"PULSE-360", color:"#00e5ff", emoji:"📰", role:"pulse360news.in LIVE", pos:{x:110,y:-90} },
  { id:"VERIFACT", name:"VERIFACT", color:"#a855f7", emoji:"🛡️", role:"Fake News Detector", pos:{x:140,y:0} },
  { id:"LOCAL", name:"LOCAL", color:"#4ade80", emoji:"💻", role:"Local Tasks", pos:{x:110,y:90} },
  { id:"NEWS", name:"NEWS", color:"#ef4444", emoji:"🌐", role:"Realtime News", pos:{x:0,y:140} },
  { id:"SHOPPER", name:"SHOPPER", color:"#ff8c00", emoji:"🛒", role:"Best Deals", pos:{x:-110,y:90} },
  { id:"TICKET", name:"TICKET", color:"#00ff88", emoji:"✈️", role:"Travel + Hotel", pos:{x:-140,y:0} },
  { id:"TRIP", name:"TRIP", color:"#ff1493", emoji:"🗺️", role:"Trip Planner", pos:{x:-110,y:-90} },
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
  const [angle,setAngle]=useState(0);

  useEffect(()=>{ const i=setInterval(()=>{ setPulse(p=>p+1); setAngle(a=>a+0.8); }, 50); return ()=>clearInterval(i); },[]);

  const speakOne = (text, agent) => new Promise(res=>{
    if(!text) return res();
    setIsSpeaking(true); setActive(agent); setTypedReply(text);
    try{
      speechSynthesis.cancel();
      const chunks = text.match(/[^.!?\n]{1,250}[.!?\n]|[^\n]{1,250}/g) || [text];
      let i=0;
      const speakChunk = () =>{
        if(i>=chunks.length){ setIsSpeaking(false); return res(); }
        const u = new SpeechSynthesisUtterance(chunks[i].trim());
        u.rate=0.88; u.pitch=agent.id==="JARVIS"?0.75:1;
        u.onend=()=>{ i++; setTimeout(speakChunk, 280); };
        u.onerror=()=>{ i++; setTimeout(speakChunk, 280); };
        speechSynthesis.speak(u);
      };
      speakChunk();
    }catch{ setIsSpeaking(false); res(); }
  });

  const speakQueue = async (text, agent)=>{
    if(isSpeaking){ setQueue(q=>[...q,{text,agent}]); return; }
    await speakOne(text, agent);
    if(queue.length>0){
      const next=queue[0]; setQueue(q=>q.slice(1));
      await new Promise(r=>setTimeout(r,600));
      await speakQueue(next.text, next.agent);
    }
  };

  useEffect(()=>{
    const check=setInterval(()=>{
      if(!isSpeaking && queue.length>0 && screen!=="ROLLCALL"){
        const nxt=queue[0]; setQueue(q=>q.slice(1)); speakOne(nxt.text, nxt.agent);
      }
    },900);
    return ()=>clearInterval(check);
  },[isSpeaking, queue, screen]);

  const handleOrder = async (txt)=>{
    if(!txt.trim() || isSpeaking) return;
    const order=txt.trim(); setInput(""); setFinalDeals([]); setSearchItems([]);
    let target=AGENTS[0];
    if(/pulse/i.test(order)) target=AGENTS[1];
    else if(/verifact|fake/i.test(order)) target=AGENTS[2];
    else if(/shop|shoes|buy/i.test(order)) target=AGENTS[5];
    else if(/ticket|bus|train|flight|hotel/i.test(order)) target=AGENTS[6];
    else if(/trip|goa|manali|araku|maredumilli|jaipur|visit/i.test(order)) target=AGENTS[7];
    else if(/news/i.test(order)) target=AGENTS[4];

    setActive(target);
    if(["SHOPPER","TICKET","TRIP","PULSE","VERIFACT"].includes(target.id)){
      setSearchMode(target.id.toLowerCase());
      const msgs = target.id==="PULSE"? ["Connecting to pulse360news.in...","Scanning homepage live...","Fetching sitemap + headlines...","Building full live report..."] :
                   target.id==="VERIFACT"? ["Waking Render server (30s)...","Scanning fake-news-detector live...","Checking detector form + API...","Building full live report..."] :
                   target.id==="TRIP"? ["Real-time Wikipedia search...","Finding real images for place...","Building day-wise budget plan..."] :
                   ["Scanning Amazon + Flipkart...","Comparing prices...","Finding BEST deal..."];
      for(let m of msgs){ setSearchItems(s=>[...s,m]); await new Promise(r=>setTimeout(r,800)); }
    }

    try{
      const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:target.id})});
      const d=await r.json();
      setSearchMode(null);
      if(target.id==="TRIP"){
        const place=d.detectedPlace||"travel";
        setFinalDeals([
          {name:`${place} Top Spot`, budget:"₹800-1500", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(place)},tourist`, desc:"Day 1 Morning - 3hrs"},
          {name:`${place} Nature View`, budget:"₹500", img:`https://source.unsplash.com/500x300/?${encodeURIComponent(place)},nature,waterfall`, desc:"Day 1 Evening - Sunset"},
        ]);
      }else if(target.id==="SHOPPER"){
        const q=encodeURIComponent(order.replace(/shop/i,""));
        setFinalDeals([
          {name:`${order} - Nike 68% OFF`, price:"₹1,299", mrp:"₹3,999", off:"BEST", site:"Amazon", img:`https://source.unsplash.com/400x300/?${q},shoes`, best:true},
          {name:`${order} - Puma`, price:"₹1,499", site:"Flipkart", img:`https://source.unsplash.com/400x300/?${q},sneakers`},
        ]);
      }else if(target.id==="TICKET"){
        setFinalDeals([
          {type:"Bus Orange AC Sleeper", price:"₹890", time:"6h • 9PM", img:"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400"},
          {type:"Hotel - 4.8⭐ Best", price:"₹3,499", time:"Free Cancel", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", best:true},
        ]);
      }
      setTypedReply(d.reply);
      await speakQueue(d.reply, target);
    }catch{ setSearchMode(null); await speakQueue(`${target.name} ready Boss - try again`, target); }
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
      await new Promise(r=>setTimeout(r,400));
    }
    setScreen("ACTIVE");
    await speakOne("All eight Avengers online in 3D. Interface fully dynamic Boss. Command me.", AGENTS[0]);
  };

  return(
    <div style={{minHeight:"100vh", background:`radial-gradient(900px 500px at 50% -10%, ${active?.color||"#ffcc00"}18 0%, transparent 60%), radial-gradient(1200px 700px at 90% 110%, #0a0a1a 0%, #050508 80%)`, color:"white", fontFamily:"system-ui, monospace", overflow:"hidden"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotateX(10deg) rotateY(0deg)}50%{transform:translateY(-10px) rotateX(15deg) rotateY(10deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 25px var(--c), 0 0 50px var(--c)}50%{box-shadow:0 0 50px var(--c), 0 0 90px var(--c), 0 0 120px var(--c)}}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        @keyframes spin3d{0%{transform:perspective(800px) rotateY(0deg)}100%{transform:perspective(800px) rotateY(360deg)}}
       .glass{background:rgba(18,18,22,0.85);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.08)}
      `}</style>

      {searchMode && <div style={{position:"fixed", inset:0, background:"#020208f8", zIndex:100, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
        <div style={{width:130, height:130, borderRadius:"50%", border:`3px solid ${AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color||"#ffcc00"}`, borderTopColor:"transparent", animation:"glow 1s linear infinite, spin3d 2s linear infinite", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44}}>{AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.emoji}</div>
        <div style={{marginTop:22, fontSize:20, fontWeight:900, letterSpacing:4, color:AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color}}>{searchMode.toUpperCase()} SCANNING LIVE</div>
        <div style={{marginTop:14, width:320, height:4, background:"#1e1e24", borderRadius:10, overflow:"hidden", position:"relative"}}><div style={{position:"absolute", inset:0, width:"40%", background:AGENTS.find(a=>a.id.toLowerCase()===searchMode)?.color, animation:"scan 1.1s ease-in-out infinite"}}></div></div>
        <div style={{marginTop:20}}>{searchItems.map((it,i)=><div key={i} style={{fontSize:12, opacity:0.9, marginTop:7, textAlign:"center"}}>• {it}</div>)}</div>
      </div>}

      {/* 3D AVENGERS CIRCLE - INIT SCREEN */}
      {screen==="INIT" && <div style={{minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", perspective:"1200px"}}>
        <div style={{fontSize:56, fontWeight:900, letterSpacing:12, background:"linear-gradient(90deg,#ffcc00,#ff3300,#a855f7,#00e5ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", textShadow:"0 0 30px #ffcc0055"}}>AVENGERS</div>
        <div style={{fontSize:10, letterSpacing:7, opacity:0.5, marginTop:6}}>NARASIMHA DYNAMIC 3D PROTOCOL • V4</div>

        <div style={{position:"relative", width:360, height:360, marginTop:30, transformStyle:"preserve-3d", transform:`perspective(900px) rotateX(15deg) rotateY(${angle}deg)`}}>
          {AGENTS.map((a,idx)=>{
            const ang = (idx/AGENTS.length)*Math.PI*2;
            const r = 145;
            const x = Math.cos(ang)*r;
            const z = Math.sin(ang)*r;
            return <div key={a.id} style={{position:"absolute", left:"50%", top:"50%", width:64, height:64, marginLeft:-32, marginTop:-32, borderRadius:"50%", background:`radial-gradient(circle at 30% 30%, ${a.color}, #000)`, border:`2px solid ${a.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, transform:`translate3d(${x}px,0,${z}px) rotateY(${-angle}deg)`, boxShadow:`0 0 25px ${a.color}`, animation:`float ${3+idx*0.2}s ease-in-out infinite`, transformStyle:"preserve-3d"}}>
              <div style={{transform:"translateZ(20px)"}}>{a.emoji}</div>
              <div style={{position:"absolute", bottom:-18, fontSize:7, color:a.color, fontWeight:900, whiteSpace:"nowrap", background:"rgba(0,0,0,0.7)", padding:"2px 6px", borderRadius:10}}>{a.id}</div>
            </div>
          })}
          <div style={{position:"absolute", left:"50%", top:"50%", width:100, height:100, marginLeft:-50, marginTop:-50, borderRadius:"50%", background:"radial-gradient(circle at 30% 30%, #1a1a1a, #000)", border:"3px solid #ffcc00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, boxShadow:"0 0 60px #ffcc00", transform:"translateZ(10px)", animation:"glow 1.5s infinite", "--c":"#ffcc00"}}>A</div>
        </div>

        <button onClick={startRollCall} style={{marginTop:40, padding:"18px 42px", background:"linear-gradient(90deg,#ffcc00,#ff8c00)", color:"black", fontWeight:900, borderRadius:32, border:"none", cursor:"pointer", letterSpacing:3, boxShadow:"0 12px 40px #ffcc0066", transform:"translateZ(50px)"}}>⚡ INITIATE 3D PROTOCOL</button>
        <div style={{marginTop:14, fontSize:10, opacity:0.4}}>8 Agents • 3D Orbit • Full Voice Queue • No Cut</div>
      </div>}

      {screen!=="INIT" && <>
        <div className="glass" style={{display:"flex", justifyContent:"space-between", padding:"10px 8px", position:"sticky", top:0, zIndex:10}}>
          {AGENTS.map(a=>{
            const isActive=active?.id===a.id; const isOnline=history.find(h=>h.id===a.id);
            return <div key={a.id} style={{textAlign:"center", opacity:isOnline?1:0.2, transform:isActive?`scale(${1.25+Math.sin(pulse/4)*0.08})`:"scale(1)", transition:"0.25s"}}>
              <div style={{"--c":a.color, width:32, height:32, borderRadius:"50%", border:`2px solid ${a.color}`, background:isOnline?`${a.color}33`:"transparent", display:"flex", alignItems:"center", justifyContent:"center", animation:isActive?"glow 0.8s infinite":"none", fontSize:14}}>{a.emoji}</div>
              <div style={{fontSize:6, color:a.color, fontWeight:900, marginTop:2}}>{a.id}</div>
              {isActive && <div style={{width:5,height:5,background:a.color,borderRadius:"50%",margin:"2px auto",boxShadow:`0 0 10px ${a.color}`}}></div>}
            </div>
          })}
        </div>

        <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"76vh", padding:16, paddingBottom:90}}>
          {active &&!searchMode && <div style={{textAlign:"center", width:"100%", maxWidth:560}}>
            <div style={{width:120,height:120,borderRadius:"50%",margin:"0 auto",background:`radial-gradient(circle at 30% 30%, ${active.color}, #000)`,border:`3px solid ${active.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52, animation:isSpeaking?"glow 0.7s infinite":"float 3s infinite", "--c":active.color, transformStyle:"preserve-3d", transform:"perspective(600px) rotateY(10deg)"}}><span style={{transform:"translateZ(30px)"}}>{active.emoji}</span></div>
            <div style={{color:active.color,marginTop:14,fontWeight:900,fontSize:20}}>{active.name} {isSpeaking?"🔊 Speaking Full Report...":""}</div>
            <div style={{color:active.color,fontSize:11,opacity:0.7}}>{active.role}</div>
            <div className="glass" style={{marginTop:18, padding:16, borderRadius:18, textAlign:"left", borderLeft:`4px solid ${active.color}`, maxHeight:"62vh", overflowY:"auto"}}>
              <div style={{fontSize:10, color:active.color, fontWeight:900, letterSpacing:1}}>💬 FULL LIVE REPORT - NO CUT:</div>
              <div style={{fontSize:13, marginTop:10, lineHeight:1.8, whiteSpace:"pre-wrap"}}>{typedReply}</div>
            </div>
          </div>}

          {screen==="ACTIVE" &&!active &&!searchMode && <div style={{width:"100%", maxWidth:800}}>
            {finalDeals.length===0 && <div style={{textAlign:"center", opacity:0.6, lineHeight:2, marginTop:40}}>Dynamic HQ Ready Boss<br/><span style={{fontSize:12}}>Try:<br/><b style={{color:"#00e5ff"}}>pulse360news monitor</b> • <b style={{color:"#a855f7"}}>verifact monitor</b><br/><b>trip to araku</b> • <b>shop shoes under 1500</b></span></div>}
            {finalDeals.length>0 && <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:12}}>{finalDeals.map((d,i)=><div key={i} className="glass" style={{borderRadius:18, overflow:"hidden", border:d.best?"2px solid #ffcc00":"1px solid rgba(255,255,255,0.08)"}}><img src={d.img} style={{width:"100%",height:145,objectFit:"cover"}}/><div style={{padding:10}}><div style={{fontWeight:900,fontSize:12}}>{d.name||d.type} {d.best?"⭐ BEST":""}</div><div style={{fontSize:10,opacity:0.6,marginTop:4}}>{d.desc||d.time||""}</div><div style={{marginTop:8,fontWeight:900,color:"#00ff88"}}>{d.price||d.budget||""}</div></div></div>)}</div>}
            {typedReply && finalDeals.length>0 && <div className="glass" style={{marginTop:14, padding:14, borderRadius:14, fontSize:12, whiteSpace:"pre-wrap", maxHeight:"40vh", overflowY:"auto"}}>{typedReply}</div>}
          </div>}

          {screen==="ROLLCALL" && <div style={{display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", maxWidth:400}}>{history.map(a=><div key={a.id} className="glass" style={{padding:"10px 14px", borderRadius:20, border:`1px solid ${a.color}`, color:a.color, fontWeight:800, animation:"float 2s infinite"}}>{a.emoji} {a.id} ONLINE</div>)}</div>}
        </div>

        {screen==="ACTIVE" && <div className="glass" style={{display:"flex", gap:8, padding:12, position:"fixed", bottom:0, left:0, right:0, zIndex:20}}>
          <button onClick={startVoice} disabled={isSpeaking} style={{padding:"13px 16px", background:isListening?"#ef4444": isSpeaking?"#222":"#1f1f23", border:"1px solid #333", borderRadius:14, color:"white", fontWeight:900, cursor:"pointer"}}>{isListening?"🔴": isSpeaking?"⏳ WAIT":"🎤"}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} disabled={isSpeaking} placeholder={isSpeaking?"Agent speaking full report - wait...":"Command: monitor pulse360news / verifact / trip to araku..."} style={{flex:1, background:"#0a0a0c", border:"1px solid #2a2a2e", borderRadius:14, padding:"13px 14px", color:"white"}}/>
          <button onClick={()=>handleOrder(input)} disabled={isSpeaking} style={{padding:"13px 20px", background:isSpeaking?"#333":"#ffcc00", color:"black", fontWeight:900, borderRadius:14, border:"none", cursor:"pointer"}}>GO</button>
        </div>}
      </>}
    </div>
  )
}
