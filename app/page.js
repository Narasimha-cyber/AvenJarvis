"use client";
import { useEffect, useRef, useState } from "react";

export default function IronManJarvis(){
  const canvasRef=useRef(null);
  const [agent,setAgent]=useState("JARVIS");
  const [status,setStatus]=useState("SYSTEM ONLINE • CINEMATIC JARVIS READY • CLICK TO TALK");
  const [chats,setChats]=useState([]);
  const [listening,setListening]=useState(false);

  // HUD Canvas - Iron Man style - No black screen
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    const ctx=c.getContext("2d");
    const resize=()=>{c.width=window.innerWidth; c.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);
    let t=0;
    const draw=()=>{
      t+=0.015;
      ctx.fillStyle="rgba(5,10,25,0.15)"; ctx.fillRect(0,0,c.width,c.height);
      // Scanning lines
      ctx.strokeStyle="rgba(0,255,255,0.08)"; ctx.lineWidth=1;
      for(let i=0;i<c.width;i+=60){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,c.height); ctx.stroke(); }
      for(let j=0;j<c.height;j+=60){ ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(c.width,j); ctx.stroke(); }
      // Central reactor
      const cx=c.width/2, cy=c.height/2;
      ctx.shadowBlur=30; ctx.shadowColor="#00ffff";
      ctx.strokeStyle="#00ffff"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,90+Math.sin(t*2)*5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,130+Math.cos(t)*8,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      requestAnimationFrame(draw);
    };
    draw();
    return()=>window.removeEventListener("resize",resize);
  },[]);

  const speak=(text)=>{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.pitch=0.45; u.rate=0.88; u.volume=1;
    const v=window.speechSynthesis.getVoices().find(v=>v.name.includes("Google UK English Male")) || window.speechSynthesis.getVoices()[0];
    if(v) u.voice=v;
    u.onstart=()=>setStatus("JARVIS SPEAKING...");
    u.onend=()=>setStatus("READY • ASK ANYTHING PRABHU");
    window.speechSynthesis.speak(u);
  };

  const askBrain=async(msg)=>{
    setStatus("🧠 JARVIS THINKING WITH 5 APIS...");
    try{
      const res=await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:agent})});
      const data=await res.json();
      const reply=data.reply || data.answer || "Prabhu, nenu vinna, kani brain nunchi reply raledu.";
      setChats(s=>[...s,{q:msg,a:reply}].slice(-5));
      setStatus(reply.slice(0,120));
      speak(reply);
    }catch(e){
      const fallback=`Prabhu, brain API connect avvatledu, kani nenu ${agent} ni. Meeku edhi kavali adagandi, nenu na knowledge tho cheptha.`;
      setStatus(fallback); speak(fallback);
    }
  };

  const startTalk=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ const q=prompt("Mic ledu - Type chey Prabhu, edhi adigina cheptha:"); if(q) askBrain(q); return; }
    const r=new SR(); r.lang="en-IN";
    r.onstart=()=>{setListening(true); setStatus("🎤 LISTENING...");};
    r.onresult=(e)=>{ const t=e.results[0][0].transcript; setStatus("HEARD: "+t); askBrain(t); };
    r.onend=()=>setListening(false);
    r.start();
  };

  useEffect(()=>{ window.speechSynthesis.getVoices(); setTimeout(()=>{ speak("Systems online Prabhu. I am Jarvis, cinematic edition. Ask me anything, I am like Meta AI, real intelligence, ready."); },600); },[]);

  return(
    <div style={{width:"100vw", height:"100vh", background:"#020617", overflow:"hidden", position:"relative", fontFamily:"monospace"}}>
      <canvas ref={canvasRef} style={{position:"absolute", inset:0}} />

      {/* Header HUD */}
      <div style={{position:"relative", zIndex:10, display:"flex", justifyContent:"space-between", padding:"14px 18px", color:"#00ffff", fontSize:"10px", letterSpacing:"3px", borderBottom:"1px solid rgba(0,255,255,0.2)", background:"rgba(0,0,0,0.6)"}}>
        <span>● AVENJARVIS MARK-7 • REAL AI</span>
        <span>{agent} • ELURU</span>
      </div>

      {/* Agent selector - Cinematic */}
      <div style={{position:"relative", zIndex:10, display:"flex", gap:"8px", padding:"10px", flexWrap:"wrap", background:"rgba(0,0,0,0.4)"}}>
        {["JARVIS","KRISHNA","FRIDAY","DRAUPADI","ARJUNA"].map(a=>(
          <button key={a} onClick={()=>setAgent(a)} style={{padding:"6px 14px", borderRadius:"20px", background: agent===a?"#00ffff":"transparent", color: agent===a?"#000":"#00ffff", border:"1px solid #00ffff", fontSize:"10px", fontWeight:"900", cursor:"pointer"}}>{a}</button>
        ))}
      </div>

      {/* Center */}
      <div style={{position:"relative", zIndex:10, height:"58vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
        <div style={{width:"140px", height:"140px", borderRadius:"50%", border:"2px solid #00ffff", boxShadow:"0 0 50px #00ffff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", color:"#00ffff", background:"radial-gradient(circle, rgba(0,255,255,0.2), transparent)", animation:"pulse 2s infinite"}}>JARVIS CORE</div>
        <div style={{color:"#fff", marginTop:"18px", fontSize:"11px", maxWidth:"700px", textAlign:"center", padding:"0 20px", lineHeight:"18px", background:"rgba(0,0,0,0.7)", borderRadius:"10px", border:"1px solid rgba(0,255,255,0.2)"}}>
          {chats.map((c,i)=>(<div key={i} style={{margin:"8px 0"}}><div style={{color:"#888", fontSize:"9px"}}>YOU: {c.q}</div><div style={{color:"#00ffff"}}>{c.a}</div></div>))}
          {chats.length===0 && <div>Ask anything Prabhu - Like Meta AI - Weather, code, story, knowledge - Real Iron Man Jarvis</div>}
        </div>
      </div>

      {/* Bottom Talk */}
      <div style={{position:"absolute", bottom:0, left:0, right:0, zIndex:20, padding:"16px", background:"linear-gradient(0deg, #000 70%, transparent)", display:"flex", gap:"12px", alignItems:"center"}}>
        <button onClick={startTalk} style={{width:"72px", height:"72px", borderRadius:"50%", background:listening?"#ff0033":"#00ffff", border:"none", fontSize:"28px", cursor:"pointer", boxShadow:listening?"0 0 30px red":"0 0 30px #00ffff", transition:"0.2s"}}>{listening?"●":"🎤"}</button>
        <div style={{flex:1, background:"rgba(0,0,0,0.9)", border:"1px solid #00ffff", borderRadius:"14px", padding:"14px"}}>
          <div style={{color:"#fff", fontSize:"13px"}}>{status}</div>
          <div style={{color:"#00ffff", fontSize:"8px", marginTop:"6px", letterSpacing:"2px"}}>REAL JARVIS • 5 APIS • NO GAME • CINEMATIC • CLICK MIC AND ASK ANYTHING LIKE META AI</div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
    </div>
  );
}
