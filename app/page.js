"use client";
import { useState, useEffect, useRef } from "react";

const TEAM = [
  { id:1, name:"IRON MAN", short:"IM", color:"#ff1a1a", bg:"#ff1a1a22", line:"Iron Man on duty, Boss. Systems online.", pitch:1.0, rate:1.1},
  { id:2, name:"HULK", short:"HK", color:"#39ff14", bg:"#39ff1422", line:"Hulk on duty Boss! Hulk Smash!", pitch:0.2, rate:0.6},
  { id:3, name:"THOR", short:"TH", color:"#00d4ff", bg:"#00d4ff22", line:"Thor, God of Thunder, on duty!", pitch:0.6, rate:0.8},
  { id:4, name:"CAPTAIN AMERICA", short:"CA", color:"#3a86ff", bg:"#3a86ff22", line:"Captain America on duty, Boss!", pitch:0.9, rate:0.9},
  { id:5, name:"BLACK WIDOW", short:"BW", color:"#ff2e93", bg:"#ff2e9322", line:"Black Widow on duty, Boss.", pitch:1.5, rate:1.0},
];

export default function Page(){
  const [screen, setScreen] = useState("OPENING"); // OPENING | READY | ASSEMBLING | ACTIVE
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("SYSTEM STANDBY");
  const [logs, setLogs] = useState(["F.R.I.D.A.Y Booting..."]);
  const [text, setText] = useState("");
  const audioCtxRef = useRef(null);

  // AVENGERS THEME - Epic synth using Web Audio API
  const playTheme = () =>{
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const notes = [130, 164, 196, 261, 329, 392];
      notes.forEach((f,i)=>{
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.value = f; o.type="sawtooth";
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, ctx.currentTime + i*0.25);
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i*0.25 + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.25 + 1.5);
        o.start(ctx.currentTime + i*0.25); o.stop(ctx.currentTime + i*0.25 + 1.5);
      });
    }catch{}
  };

  const speakSync = (t, av) => new Promise(r=>{
    try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.pitch=av.pitch; u.rate=av.rate; u.onend=r; u.onerror=r; speechSynthesis.speak(u);}catch{ r(); }
  });

  const handleOpeningComplete = () =>{
    playTheme();
    setScreen("READY");
    setReply("SAY: AVENGERS ASSEMBLE (Voice 1st Priority)");
    setLogs(l=>[...l, "Stark Satellite Linked", "Voice Recognition: ACTIVE"]);
    initVoice();
  };

  const initVoice = () =>{
    navigator.mediaDevices.getUserMedia({audio:true}).then(()=>{
      const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
      if(!SR) return;
      const rec = new SR(); rec.continuous=true; rec.interimResults=false; rec.lang='en-US';
      rec.onresult = (e)=>{
        const cmd = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
        setText(cmd);
        if(cmd.includes("avengers assemble") || cmd.includes("assemble")){
          doAssemble();
        }else if(cmd.length>2 && screen==="ACTIVE"){
          doCommand(cmd);
        }
      };
      rec.onend = ()=>{ try{rec.start()}catch{} };
      rec.start();
    }).catch(()=>{});
  };

  const doAssemble = async () =>{
    if(screen==="ASSEMBLING") return;
    setScreen("ASSEMBLING");
    playTheme();
    setReply("ASSEMBLING SEQUENCE INITIATED...");
    for(let i=0;i<TEAM.length;i++){
      const av = TEAM[i];
      setActive(av);
      setLogs(s=>[...s, `[${i+1}/5] ${av.name} MATERIALIZING...`]);
      await new Promise(r=>setTimeout(r, 900));
      await speakSync(av.line, av);
      setLogs(s=>[...s, `> ${av.name}: ON DUTY BOSS ✓`]);
      await new Promise(r=>setTimeout(r, 350));
    }
    setActive(null);
    setScreen("ACTIVE");
    setReply("ALL 5 AVENGERS ON DUTY, BOSS. ORDERS?");
    speakSync("All Avengers on duty Boss. Awaiting orders.", TEAM[0]);
  };

  const doCommand = async (cmd) =>{
    const av = TEAM[Math.floor(Math.random()*5)];
    setActive(av); setReply(`PROCESSING: ${cmd}`);
    setLogs(s=>[...s, `BOSS: ${cmd}`]);
    if(cmd.includes("buy") || cmd.includes("shop")){
      window.open(`https://www.amazon.in/s?k=${encodeURIComponent(cmd)}`,"_blank");
      await speakSync("Opening Stark shopping portal Boss", av);
    }else if(cmd.includes("news")){
      window.open(`https://news.google.com/search?q=${encodeURIComponent(cmd)}`,"_blank");
      await speakSync("Fetching intelligence Boss", av);
    }else{
      try{
        const r = await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:cmd, avenger:av.name})});
        const d = await r.json();
        setReply(d.reply); await speakSync(d.reply, av);
      }catch{ setReply("Stark Network Error"); }
    }
    setTimeout(()=>setActive(null), 1800);
  };

  if(screen==="OPENING"){
    return(
      <div onClick={handleOpeningComplete} style={{minHeight:"100vh", background:"radial-gradient(circle at center, #0a1628 0%, #020617 100%)", color:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"monospace", cursor:"pointer"}}>
        <div style={{width:120, height:120, borderRadius:"50%", border:"2px solid #22d3ee", boxShadow:"0 0 80px #22d3ee", display:"flex", alignItems:"center", justifyContent:"center", animation:"pulse 1.5s infinite"}}>A</div>
        <div style={{marginTop:30, letterSpacing:12, fontSize:22, fontWeight:900, color:"#22d3ee"}}>AVENGERS</div>
        <div style={{letterSpacing:6, fontSize:10, opacity:0.6, marginTop:5}}>INITIATIVE PROTOCOL v5.0</div>
        <div style={{marginTop:40, width:200, height:2, background:"linear-gradient(90deg, transparent, #22d3ee, transparent)"}}></div>
        <div style={{marginTop:30, fontSize:11, border:"1px solid #22d3ee", padding:"10px 20px", borderRadius:20, animation:"pulse 1s infinite"}}>▶ TAP TO INITIATE THEME</div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    )
  }

  return(
    <div style={{minHeight:"100vh", background:"#020617", color:"white", display:"flex", flexDirection:"column", alignItems:"center", padding:15, fontFamily:"monospace", position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute", inset:0, opacity:0.08, backgroundImage:"linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize:"40px 40px"}}></div>

      <div style={{zIndex:2, marginTop:20, width:300, height:300, borderRadius:"50%", border:`3px solid ${active?active.color:"#22d3ee"}`, background:"radial-gradient(circle, #0f172a, #000)", boxShadow:`0 0 80px ${active?active.color:"#22d3ee"}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative"}}>
        <div style={{position:"absolute", inset:10, borderRadius:"50%", border:"1px dashed #22d3ee44", animation:"spin 6s linear infinite"}}></div>
        {active? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:80, filter:`drop-shadow(0 0 30px ${active.color})`}}>{active.short}</div>
            <div style={{color:active.color, letterSpacing:4, fontWeight:900, marginTop:5}}>{active.name}</div>
            <div style={{height:2, width:80, background:active.color, margin:"8px auto", boxShadow:`0 0 10px ${active.color}`}}></div>
            <div style={{fontSize:9, letterSpacing:2}}>HOLOGRAM LINK • STABLE</div>
          </div>
        ) : <div style={{color:"#22d3ee", letterSpacing:3}}>{screen==="READY"?"◉ STANDBY FOR VOICE":"◉ ALL SYSTEMS NOMINAL"}</div>}
        {screen==="ASSEMBLING" && <div style={{position:"absolute", top:0, left:0, width:"100%", height:3, background:active?.color||"#22d3ee", boxShadow:`0 0 20px ${active?.color}`, animation:"scan 1.2s linear infinite"}}></div>}
      </div>

      <div style={{zIndex:2, marginTop:15, color:"#22d3ee", letterSpacing:5, fontSize:12}}>{active? `${active.name} TRANSMITTING` : text? `HEARD: ${text.toUpperCase()}` : "F.R.I.D.A.Y"}</div>

      <div style={{zIndex:2, marginTop:15, width:"94%", maxWidth:560, background:"rgba(34,211,238,0.07)", border:"1px solid #155e75", borderRadius:14, padding:16, textAlign:"center", minHeight:80, backdropFilter:"blur(6px)"}}>
        {reply}
      </div>

      <div style={{zIndex:2, display:"flex", gap:10, marginTop:16}}>
        <button onClick={doAssemble} style={{padding:"12px 22px", background: screen==="READY"?"linear-gradient(90deg, #06b6d4, #3b82f6)":"#1e293b", color: screen==="READY"?"black":"#64748b", fontWeight:900, border:"none", borderRadius:30, cursor:"pointer", boxShadow: screen==="READY"?"0 0 25px #22d3ee":"none"}}>
          {screen==="READY"?"🔊 AVENGERS ASSEMBLE (Voice 1st)":"ASSEMBLED"}
        </button>
      </div>
      <div style={{zIndex:2, fontSize:9, opacity:0.4, marginTop:8}}>{screen==="READY"?"VOICE PRIORITY • BUTTON BACKUP FOR SILENT MODE":"VOICE ACTIVE • SAY ANY ORDER"}</div>

      <div style={{zIndex:2, marginTop:14, width:"94%", maxWidth:560, fontSize:10, opacity:0.6, lineHeight:1.6}}>
        {logs.slice(-5).map((l,i)=><div key={i} style={{borderLeft:`2px solid ${i===4?"#22d3ee":"transparent"}`, paddingLeft:6, marginBottom:3}}>{l}</div>)}
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scan{0%{top:0}100%{top:100%}}
      `}</style>
    </div>
  )
}
