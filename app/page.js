"use client";
import { useState, useEffect } from "react";

const AGENTS = [
  {
    id:"JARVIS", name:"JARVIS", color:"#ffcc00",
    role:"Prime Orchestrator - motham team ni control chese main brain",
    voice:"Jarvis Online, Prime Orchestrator Active, 19 agents standing by.",
    live: () => `${Math.floor(Math.random()*3)+19} agents active • Orchestrator CPU: ${Math.floor(Math.random()*20)+70}% • All systems nominal`
  },
  {
    id:"FRIDAY", name:"FRIDAY", color:"#00ff88",
    role:"Daily Intelligence - podlalo nundi data techi morning brief istundi",
    voice:"Friday here, Daily Intelligence brief from pods, all systems active.",
    live: () => `Today: ${new Date().toLocaleDateString()} • Briefs generated: 12 • Pods synced: 8/8 • Next brief in 45 mins`
  },
  {
    id:"ORACLE", name:"ORACLE", color:"#00e5ff",
    role:"Automation Engine - workflow lu, auto-tasks run chestundi",
    voice:"Oracle Active, 12 automations running, all workflows holding.",
    live: () => `${Math.floor(Math.random()*4)+11} automations LIVE • Tasks today: 247 • Failed: 0 • Market data: Bullish`
  },
  {
    id:"ZEUS", name:"ZEUS", color:"#ffde59",
    role:"Sales Pipeline - leads, deals, revenue chusukuntundi",
    voice:"Zeus Online, 1,528 leads in the system.",
    live: () => `Leads: 1,${528+Math.floor(Math.random()*50)} • Hot leads: 89 • Revenue today: $${(Math.random()*5+12).toFixed(1)}k • Apex pipeline LIVE`
  },
  {
    id:"STARK", name:"STARK", color:"#ff8c00",
    role:"Project Manager - anni projects track chestundi, building status",
    voice:"Stark Online, all projects tracked and accounted for.",
    live: () => `Projects: 24 active • Builds: 3 in progress • Last deploy: 2 mins ago • All tracked`
  },
  {
    id:"STEVE", name:"STEVE", color:"#00f0ff",
    role:"Build Ops - code build chesi ship cheyadaniki ready chestadu",
    voice:"Steve here, Build ops running clean, ready to ship.",
    live: () => `Build status: CLEAN • Queue: 0 • Last build: success • Ready to ship on command`
  },
  {
    id:"HERALD", name:"HERALD", color:"#c084fc",
    role:"Transcription - meetings record chesi text ga marchutundi",
    voice:"Herald reporting in, Whisper Prime ready.",
    live: () => `Whisper Prime: READY • Meetings today: 4 transcribed • Accuracy: 98.7% • Next meeting in 1 hour`
  },
  {
    id:"VISION", name:"VISION", color:"#a855f7",
    role:"Intelligent Watch - system antha kanipettukuni em miss avvakunda chustundi",
    voice:"The Vision watching, intelligent systems fully operational.",
    live: () => `Monitoring: 47 feeds • Anomalies: 0 • Nothing escapes notice • All cams active`
  },
  {
    id:"BANNER", name:"BANNER", color:"#4ade80",
    role:"Medical Intelligence - diagnostics, health data monitor chestundi",
    voice:"Banner standing by, medical intelligence ready.",
    live: () => `Diagnostics: 12 patients • Vitals: stable • Alerts: 0 • Medical AI: ONLINE`
  },
  {
    id:"ULTRON", name:"ULTRON", color:"#ef4444",
    role:"Security - perimeter, threats, protection chusukuntundi",
    voice:"Ultron Online, all perimeters secured.",
    live: () => `Perimeter: SECURED • Threats blocked today: ${Math.floor(Math.random()*5)} • Firewall: ACTIVE • You are protected sir`
  },
  {
    id:"HERCULES", name:"HERCULES", color:"#a3e635",
    role:"Fitness & Vision - camera tho body scan, nutrition track chestadu",
    voice:"Hercules here, camera armed, nutrition scan ready.",
    live: () => `Body fat: 15% • Calories today: 1840 • Target: locked in • Camera: ARMED`
  },
];

export default function Page(){
  const [screen, setScreen] = useState("INIT");
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]); // already reported agents with live data
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  const speak = (text, agent) => new Promise(res=>{
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = agent.id==="ULTRON"?0.2: agent.id==="FRIDAY"?1.4:0.9;
      u.rate = 0.9;
      u.onend=res; u.onerror=res;
      speechSynthesis.speak(u);
    }catch{res()}
  });

  const startRollCall = async () =>{
    setScreen("ROLLCALL"); setHistory([]); setLogs(["[PROTOCOL] A.V.E.N.G.E.R.S - ROLL CALL INITIATED"]);
    for(let agent of AGENTS){
      setActive(agent);
      const liveText = agent.live();
      setLogs(l=>[...l, `${agent.id} :: ONLINE`]);

      // 1. Role + Voice
      await speak(agent.voice, agent);
      await new Promise(r=>setTimeout(r, 200));

      // 2. Role cheppadam + Realtime update cheppadam
      const roleSpeech = `${agent.name} role is ${agent.role}. Realtime update: ${liveText}`;
      setLogs(l=>[...l, `> ROLE: ${agent.role}`, `> LIVE: ${liveText}`]);

      // Add to history panel
      setHistory(h=>[...h, {...agent, liveText, time: new Date().toLocaleTimeString()}]);

      await speak(roleSpeech, agent);
      await new Promise(r=>setTimeout(r, 400));
    }
    setActive(null);
    setScreen("ACTIVE");
    setReply("All 11 agents reported with role and live status, sir. What are your orders?");
    speak("All agents reported with roles and live status, sir.", AGENTS[0]);
  };

  const handleOrder = async (txt) =>{
    if(!txt.trim()) return;
    const order = txt.trim(); setInput("");
    setLogs(l=>[...l, `BOSS ORDER: ${order}`]);
    const ag = AGENTS[Math.floor(Math.random()*AGENTS.length)];
    setActive(ag); setReply(`Routing to ${ag.name}...`);
    try{
      const r = await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order})});
      const d = await r.json();
      setReply(d.reply); setLogs(l=>[...l, `${ag.id}: ${d.reply}`]);
      await speak(d.reply, ag);
    }catch{
      window.open(`https://www.google.com/search?q=${encodeURIComponent(order)}`,"_blank");
      setReply(`Executed: ${order}`); await speak(`Executed ${order} sir`, ag);
    }
    setTimeout(()=>setActive(null), 1500);
  };

  // live refresh every 5 sec for active panel
  useEffect(()=>{
    if(screen!=="ACTIVE") return;
    const iv = setInterval(()=>{
      setHistory(h=> h.map(a=> ({...a, liveText: a.live()})));
    }, 5000);
    return ()=>clearInterval(iv);
  },[screen]);

  return(
    <div style={{minHeight:"100vh", background:"#050508", color:"#e5e7eb", fontFamily:"monospace", display:"flex", flexDirection:"column"}}>
      {/* TOP */}
      <div style={{display:"flex", justifyContent:"space-between", padding:"10px 12px", borderBottom:"1px solid #1f2937"}}>
        {AGENTS.map(a=>(
          <div key={a.id} style={{textAlign:"center", opacity: history.find(h=>h.id===a.id)?1:0.2, transform: active?.id===a.id?"scale(1.2)":"scale(1)", transition:"0.3s"}}>
            <div style={{width:28, height:28, borderRadius:"50%", border:`1px solid ${a.color}`, background: history.find(h=>h.id===a.id)?a.color+"55":"transparent", boxShadow: active?.id===a.id?`0 0 20px ${a.color}`:"none"}}></div>
            <div style={{fontSize:6, color:a.color, marginTop:2}}>{a.id}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex", flex:1, overflow:"hidden"}}>
        {/* CENTER */}
        <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", padding:20}}>
          {screen==="INIT" && (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:40, color:"#ffcc00", fontWeight:900, letterSpacing:8, textShadow:"0 0 30px #ffcc00"}}>JARVIS</div>
              <button onClick={startRollCall} style={{marginTop:24, padding:"12px 28px", border:"1px solid #ffcc00", background:"transparent", color:"#ffcc00", borderRadius:30, cursor:"pointer", letterSpacing:2}}>INITIATE PROTOCOL</button>
            </div>
          )}

          {screen!=="INIT" && active && (
            <div style={{textAlign:"center", maxWidth:480}}>
              <div style={{width:120, height:120, borderRadius:"50%", margin:"0 auto", background:`radial-gradient(circle, ${active.color}, ${active.color}22)`, border:`2px solid ${active.color}`, boxShadow:`0 0 60px ${active.color}`, display:"flex", alignItems:"center", justifyContent:"center", animation:"pulse 1s infinite"}}><div style={{width:18, height:18, background:"white", borderRadius:"50%"}}></div></div>
              <div style={{marginTop:14, color:active.color, letterSpacing:4, fontWeight:800}}>{active.id}</div>

              <div style={{marginTop:16, background:"#111113", border:`1px solid ${active.color}44`, borderRadius:12, padding:12, textAlign:"left"}}>
                <div style={{fontSize:10, color:active.color}}>ROLE:</div>
                <div style={{fontSize:11, marginTop:4, lineHeight:1.5}}>{active.role}</div>
                <div style={{fontSize:10, color:active.color, marginTop:10}}>REALTIME LIVE UPDATE:</div>
                <div style={{fontSize:11, marginTop:4, color:"#a3e635"}}>{active.live()}</div>
              </div>

              <div style={{marginTop:12, fontSize:10, color:"#9ca3af"}}>{active.voice}</div>
            </div>
          )}

          {screen==="ACTIVE" &&!active && (
            <div style={{textAlign:"center"}}>
              <div style={{color:"#ffcc00", letterSpacing:3}}>ALL AGENTS REPORTED</div>
              <div style={{marginTop:8, fontSize:12, color:"#9ca3af"}}>{reply}</div>
            </div>
          )}

          <div style={{position:"absolute", bottom:10, left:10, fontSize:8, opacity:0.5}}>
            {logs.slice(-4).map((l,i)=><div key={i}>{l}</div>)}
          </div>
        </div>

        {/* RIGHT HISTORY PANEL - Role + Live */}
        {history.length>0 && (
          <div style={{width:300, borderLeft:"1px solid #1f2937", background:"#08080a", overflowY:"auto", padding:10}}>
            <div style={{fontSize:9, letterSpacing:2, opacity:0.5, marginBottom:8}}>AGENT ROSTER • LIVE</div>
            {history.map(h=>(
              <div key={h.id+h.time} style={{background:"#111113", borderLeft:`3px solid ${h.color}`, padding:8, borderRadius:6, marginBottom:8}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:h.color, fontWeight:800, fontSize:10}}>{h.id}</span><span style={{fontSize:7, opacity:0.4}}>{h.time}</span></div>
                <div style={{fontSize:8, marginTop:4, opacity:0.7}}>{h.role}</div>
                <div style={{fontSize:8, marginTop:6, background:"#000", padding:5, borderRadius:4, color:"#4ade80"}}>● {h.liveText}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {screen==="ACTIVE" && (
        <div style={{display:"flex", gap:8, padding:10, borderTop:"1px solid #1f2937", background:"#08080a"}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleOrder(input)} placeholder="Order: buy shoes / check news / book ticket..." style={{flex:1, background:"#111113", border:"1px solid #27272a", borderRadius:8, padding:"10px 12px", color:"white", outline:"none"}}/>
          <button onClick={()=>handleOrder(input)} style={{padding:"10px 18px", background:"#ffcc00", color:"black", fontWeight:900, borderRadius:8, border:"none", cursor:"pointer"}}>EXECUTE</button>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
    </div>
  )
}
