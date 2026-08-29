"use client";
import { useState, useEffect, useRef } from "react";

const TEAM = [
  { name:"IRON MAN", color:"#ff1a1a", img:"https://i.ibb.co/8g0QJ7v/iron.png", line:"I'm Iron Man on duty, Boss", pitch:1.0, rate:1.0, entry:"from-right"},
  { name:"HULK", color:"#39ff14", img:"https://i.ibb.co/3WQj3hL/hulk.png", line:"I'm Hulk on duty, Boss! Hulk smash", pitch:0.2, rate:0.6, entry:"from-left"},
  { name:"THOR", color:"#00d4ff", img:"https://i.ibb.co/5Yt4hQk/thor.png", line:"I'm Thor on duty, Boss", pitch:0.6, rate:0.8, entry:"from-top"},
  { name:"CAPTAIN", color:"#3a86ff", img:"https://i.ibb.co/qk5p2L0/cap.png", line:"I'm Captain on duty, Boss", pitch:0.9, rate:0.9, entry:"from-right"},
  { name:"WIDOW", color:"#ff2e93", img:"https://i.ibb.co/NY7c7Z0/widow.png", line:"I'm Widow on duty, Boss", pitch:1.4, rate:1.0, entry:"from-left"},
];

export default function Page(){
  const [screen, setScreen] = useState("OPENING");
  const [active, setActive] = useState(null);
  const [walking, setWalking] = useState(false);
  const [reply, setReply] = useState("TAP TO START AVENGERS PROTOCOL");
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState(["FRIDAY Online..."]);
  const [assembled, setAssembled] = useState([]);

  const speak = (t, av) => new Promise(r=>{
    try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.pitch=av.pitch; u.rate=av.rate; u.onend=r; u.onerror=r; speechSynthesis.speak(u);}catch{ r(); }
  });

  const playTheme = () =>{
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      [130,196,261,392].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.frequency.value=f; o.type="sawtooth"; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime+i*0.3); g.gain.linearRampToValueAtTime(0.15, ctx.currentTime+i*0.3+0.1); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+i*0.3+1.2);
        o.start(ctx.currentTime+i*0.3); o.stop(ctx.currentTime+i*0.3+1.2);
      });
    }catch{}
  };

  const doAssemble = async () =>{
    if(screen==="ASSEMBLING") return;
    setScreen("ASSEMBLING"); playTheme();
    setAssembled([]);
    for(let av of TEAM){
      setActive(av); setWalking(true);
      setReply(`${av.name} ENTERING...`);
      setLogs(s=>[...s, `${av.name} WALKING IN...`]);
      await new Promise(r=>setTimeout(r, 1100)); // walk animation
      setWalking(false);
      setReply(`> ${av.line.toUpperCase()}`);
      await speak(av.line, av);
      setAssembled(a=>[...a, av]);
      setLogs(s=>[...s, `${av.name} ✓ ON DUTY`]);
      await new Promise(r=>setTimeout(r, 400));
    }
    setActive(null); setScreen("ACTIVE");
    setReply("ALL AVENGERS ON DUTY BOSS! GIVE ORDER BY VOICE OR TYPE");
    speak("All Avengers on duty Boss", TEAM[0]);
  };

  const handleOrder = async (orderText) =>{
    const order = orderText.trim();
    if(!order) return;
    setInput(""); setLogs(s=>[...s, `BOSS ORDER: ${order}`]);
    const av = TEAM[Math.floor(Math.random()*TEAM.length)];
    setActive(av); setReply(`SEARCHING: ${order}...`);

    // Voice order kuda work avvali
    if(order.toLowerCase().includes("buy") || order.toLowerCase().includes("shop") || order.toLowerCase().includes("amazon")){
      const q = order.replace(/buy|shop/gi,"").trim();
      window.open(`https://www.amazon.in/s?k=${encodeURIComponent(q)}`,"_blank");
      setReply(`Opening Amazon for ${q}`); await speak(`Opening shopping for ${q} Boss`, av);
    }else if(order.toLowerCase().includes("news") || order.toLowerCase().includes("ticket") || order.toLowerCase().includes("book")){
      window.open(`https://www.google.com/search?q=${encodeURIComponent(order)}`,"_blank");
      setReply(`Searching web for ${order}`); await speak(`Searching ${order} Boss`, av);
    }else{
      try{
        const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:av.name})});
        const d=await r.json();
        setReply(d.reply); await speak(d.reply, av);
      }catch{
        // Fallback google search
        window.open(`https://www.google.com/search?q=${encodeURIComponent(order)}`,"_blank");
        setReply(`Google Search: ${order}`); await speak(`Here is what I found for ${order} Boss`, av);
      }
    }
    setTimeout(()=>setActive(null), 2000);
  };

  // Voice listener
  useEffect(()=>{
    if(screen!=="READY" && screen!=="ACTIVE") return;
    const init = ()=>{
      navigator.mediaDevices.getUserMedia({audio:true}).then(()=>{
        const SR = window.webkitSpeechRecognition||window.SpeechRecognition;
        if(!SR) return; const rec=new SR(); rec.continuous=true; rec.lang='en-US';
        rec.onresult=(e)=>{
          const t=e.results[e.results.length-1][0].transcript.toLowerCase();
          if(t.includes("avengers assemble")) doAssemble();
          else if(t.length>2 && screen==="ACTIVE") handleOrder(t);
        };
        rec.onend=()=>{try{rec.start()}catch{}}; rec.start();
        setLogs(s=>[...s,"VOICE: LISTENING (1st Priority)"]);
      });
    };
    document.addEventListener('click', init, {once:true});
  },[screen]);

  if(screen==="OPENING"){
    return(
      <div onClick={()=>{playTheme(); setScreen("READY"); setReply("SAY AVENGERS ASSEMBLE OR TAP BUTTON");}} style={{minHeight:"100vh", background:"radial-gradient(circle, #0a1628, #020617)", color:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"monospace", cursor:"pointer"}}>
        <div style={{fontSize:60, textShadow:"0 0 40px #22d3ee", animation:"pulse 1.5s infinite"}}>A</div>
        <div style={{letterSpacing:12, fontSize:24, fontWeight:900, color:"#22d3ee", marginTop:10}}>AVENGERS</div>
        <div style={{marginTop:20, border:"1px solid #22d3ee", padding:"10px 24px", borderRadius:30}}>▶ TAP FOR THEME + START</div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    )
  }

  return(
    <div style={{minHeight:"100vh", background:"#020617", color:"white", display:"flex", flexDirection:"column", alignItems:"center", padding:12, fontFamily:"monospace", overflow:"hidden", position:"relative"}}>
      <div style={{position:"absolute", inset:0, opacity:0.06, backgroundImage:"linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize:"30px 30px"}}></div>

      {/* STAGE */}
      <div style={{zIndex:2, width:"100%", maxWidth:700, height:360, background:"linear-gradient(to bottom, #0f172a, #020617)", border:"1px solid #1e293b", borderRadius:20, position:"relative", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", boxShadow:`0 0 60px ${active?active.color+"55":"#22d3ee22"}`}}>

        {/* Already assembled small avatars */}
        <div style={{position:"absolute", top:10, left:10, display:"flex", gap:6}}>
          {assembled.map(a=><div key={a.name} style={{width:32, height:32, borderRadius:"50%", background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"black", boxShadow:`0 0 15px ${a.color}`}}>{a.name[0]}</div>)}
        </div>

        {/* WALKING AVENGER */}
        {active && (
          <div style={{
            position:"absolute", bottom:20,
            left: active.entry==="from-left"? (walking?"-10%":"35%") : active.entry==="from-right"? (walking?"110%":"35%") : "35%",
            top: active.entry==="from-top"? (walking?"-50%":"25%") : "auto",
            transition:"all 1s cubic-bezier(0.4,0,0.2,1)",
            textAlign:"center",
            filter:`drop-shadow(0 0 25px ${active.color})`
          }}>
            <div style={{width:110, height:170, background:`linear-gradient(180deg, ${active.color}33, transparent)`, border:`2px solid ${active.color}`, borderRadius:"20px 20px 5px 5px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)"}}>
              <div style={{fontSize:50}}>🤖</div>
              <div style={{fontSize:9, color:active.color, fontWeight:900, marginTop:5}}>{active.name}</div>
              <div style={{width:40, height:3, background:active.color, marginTop:5, animation: walking?"walk 0.2s infinite alternate":"none"}}></div>
            </div>
            <div style={{marginTop:8, background:"black", border:`1px solid ${active.color}`, padding:"4px 8px", borderRadius:10, fontSize:8, color:active.color, whiteSpace:"nowrap"}}>
              {active.line}
            </div>
          </div>
        )}

        {!active && screen==="READY" && <div style={{marginBottom:140, color:"#22d3ee", letterSpacing:3}}>● WAITING FOR ASSEMBLE COMMAND</div>}
        {!active && screen==="ACTIVE" && <div style={{marginBottom:140, color:"#22d3ee66", fontSize:10}}>ALL {assembled.length} AVENGERS ON STAGE - READY</div>}

        <div style={{position:"absolute", bottom:0, width:"100%", height:4, background:`linear-gradient(90deg, transparent, ${active?active.color:"#22d3ee"}, transparent)`, boxShadow:`0 0 20px ${active?active.color:"#22d3ee"}`}}></div>
      </div>

      <div style={{zIndex:2, marginTop:12, width:"100%", maxWidth:700, background:"rgba(14,165,233,0.08)", border:"1px solid #164e63", padding:14, borderRadius:12, textAlign:"center", minHeight:60}}>{reply}</div>

      {/* CONTROLS */}
      <div style={{zIndex:2, display:"flex", gap:8, marginTop:12, width:"100%", maxWidth:700}}>
        <button onClick={doAssemble} style={{padding:"12px 18px", background: screen==="READY"?"#22d3ee":"#1e293b", color: screen==="READY"?"black":"#666", fontWeight:900, border:"none", borderRadius:10, cursor:"pointer", whiteSpace:"nowrap"}}>🔊 ASSEMBLE</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") handleOrder(input)}} placeholder="Type order: buy shoes, news, book tickets..." style={{flex:1, background:"#0f172a", border:"1px solid #164e63", borderRadius:10, padding:"12px", color:"white", outline:"none"}}/>
        <button onClick={()=>handleOrder(input)} style={{padding:"12px 18px", background:"#3b82f6", color:"white", fontWeight:900, border:"none", borderRadius:10, cursor:"pointer"}}>SEND</button>
      </div>
      <div style={{zIndex:2, fontSize:9, opacity:0.4, marginTop:6}}>VOICE = 1st Priority | TYPE = Backup | Auto Search + Reply</div>

      <style>{`
        @keyframes walk{0%{transform:translateX(-3px)}100%{transform:translateX(3px)}}
      `}</style>
    </div>
  )
}
