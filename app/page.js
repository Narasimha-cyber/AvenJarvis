"use client";
import { useEffect, useRef, useState } from "react";

export default function AvengersJarvis(){
  const canvasRef=useRef(null);
  const [agent,setAgent]=useState("JARVIS");
  const [status,setStatus]=useState("AVENGERS JARVIS ONLINE • TYPE OR TALK");
  const [chats,setChats]=useState([]);
  const [input,setInput]=useState("");
  const [listening,setListening]=useState(false);
  const [loading,setLoading]=useState(false);

  // HUD
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    const ctx=c.getContext("2d");
    const resize=()=>{c.width=innerWidth; c.height=innerHeight;};
    resize(); addEventListener("resize",resize);
    let t=0;
    const draw=()=>{
      t+=0.015;
      ctx.fillStyle="rgba(5,10,25,0.12)"; ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle="rgba(0,255,255,0.07)";
      for(let i=0;i<c.width;i+=55){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,c.height); ctx.stroke(); }
      for(let j=0;j<c.height;j+=55){ ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(c.width,j); ctx.stroke(); }
      const cx=c.width/2, cy=c.height/2;
      ctx.shadowBlur=25; ctx.shadowColor="#00ffff";
      ctx.strokeStyle="#00ffff"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,85+Math.sin(t*2)*4,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,125+Math.cos(t)*6,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      requestAnimationFrame(draw);
    };
    draw();
    return()=>removeEventListener("resize",resize);
  },[]);

  const speak=(text)=>{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.pitch=0.45; u.rate=0.9;
    const v=window.speechSynthesis.getVoices().find(v=>v.name.includes("Male")) || window.speechSynthesis.getVoices()[0];
    if(v) u.voice=v;
    u.onstart=()=>setStatus("JARVIS SPEAKING...");
    u.onend=()=>setStatus("READY • ASK ANYTHING");
    window.speechSynthesis.speak(u);
  };

  const askBrain=async(msg)=>{
    if(!msg.trim()) return;
    setLoading(true);
    setStatus("🧠 "+agent+" THINKING...");
    setChats(s=>[...s,{q:msg,a:"..."}]);
    setInput("");
    try{
      const res=await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:agent})});
      const data=await res.json();
      const reply=data.reply || "Prabhu brain nunchi reply raledu, kani nenu online.";
      setChats(s=>{ const c=[...s]; c[c.length-1]={q:msg,a:reply}; return c.slice(-6); });
      setStatus(reply.slice(0,140));
      speak(reply);
    }catch(e){
      const r=`${agent} online Prabhu. "${msg}" vinna. Brain connect avvatledu kani nenu ready.`;
      setChats(s=>{ const c=[...s]; c[c.length-1]={q:msg,a:r}; return c; });
      setStatus(r); speak(r);
    }
    setLoading(false);
  };

  const startTalk=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ setStatus("MIC NOT SUPPORTED • TYPE BELOW"); return; }
    const r=new SR(); r.lang="en-IN";
    r.onstart=()=>{setListening(true); setStatus("🎤 LISTENING...");};
    r.onresult=(e)=>askBrain(e.results[0][0].transcript);
    r.onend=()=>setListening(false);
    r.start();
  };

  useEffect(()=>{ window.speechSynthesis.getVoices(); },[]);

  return(
    <div style={{width:"100vw", height:"100vh", background:"#020617", overflow:"hidden", position:"relative", fontFamily:"monospace"}}>
      <canvas ref={canvasRef} style={{position:"absolute", inset:0}} />
      <div style={{position:"relative", zIndex:10, display:"flex", justifyContent:"space-between", padding:"12px 16px", color:"#00ffff", fontSize:"10px", letterSpacing:"3px", borderBottom:"1px solid rgba(0,255,255,0.2)", background:"rgba(0,0,0,0.7)"}}>
        <span>● AVENGERS • STARK INDUSTRIES</span><span>{agent} • MARK-50</span>
      </div>
      <div style={{position:"relative", zIndex:10, display:"flex", gap:"7px", padding:"10px", flexWrap:"wrap", background:"rgba(0,0,0,0.5)"}}>
        {["JARVIS","FRIDAY","VERONICA","KAREN","EDITH","VISION"].map(a=>(
          <button key={a} onClick={()=>setAgent(a)} style={{padding:"6px 14px", borderRadius:"20px", background:agent===a?"#00ffff":"transparent", color:agent===a?"#000":"#00ffff", border:"1px solid #00ffff", fontSize:"10px", fontWeight:900, cursor:"pointer"}}>{a}</button>
        ))}
      </div>
      <div style={{position:"relative", zIndex:10, height:"45vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 16px"}}>
        <div style={{width:"120px", height:"120px", borderRadius:"50%", border:"2px solid #00ffff", boxShadow:"0 0 40px #00ffff", display:"flex", alignItems:"center", justifyContent:"center", color:"#00ffff", background:"radial-gradient(circle, rgba(0,255,255,0.15), transparent)"}}>{agent}</div>
        <div style={{marginTop:"16px", width:"100%", maxWidth:"720px", maxHeight:"28vh", overflowY:"auto", background:"rgba(0,0,0,0.75)", border:"1px solid rgba(0,255,255,0.2)", borderRadius:"12px", padding:"12px"}}>
          {chats.length===0 && <div style={{color:"#aaa", fontSize:"11px", textAlign:"center"}}>Type anything bro - Like real Jarvis - Weather, code, jokes, knowledge - Avengers style</div>}
          {chats.map((c,i)=>(<div key={i} style={{margin:"10px 0"}}><div style={{color:"#666", fontSize:"9px"}}>YOU: {c.q}</div><div style={{color:"#00ffff", fontSize:"12px", marginTop:"4px"}}>{c.a}</div></div>))}
        </div>
      </div>
      <div style={{position:"absolute", bottom:0, left:0, right:0, zIndex:20, padding:"12px", background:"linear-gradient(0deg, #000 80%, transparent)"}}>
        <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
          <button onClick={startTalk} style={{width:"56px", height:"56px", borderRadius:"50%", background:listening?"#ff0033":"#00ffff", border:"none", fontSize:"22px", cursor:"pointer", boxShadow:listening?"0 0 20px red":"0 0 20px #00ffff"}}>{listening?"●":"🎤"}</button>
          <div style={{flex:1, display:"flex", gap:"8px"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && askBrain(input)} placeholder={`Ask ${agent} anything...`} style={{flex:1, background:"rgba(0,0,0,0.9)", border:"1px solid #00ffff", borderRadius:"12px", padding:"14px 16px", color:"#fff", outline:"none", fontSize:"13px"}} />
            <button onClick={()=>askBrain(input)} disabled={loading} style={{padding:"0 22px", borderRadius:"12px", background:"#00ffff", color:"#000", border:"none", fontWeight:900, cursor:"pointer"}}>{loading?"...":"SEND"}</button>
          </div>
        </div>
        <div style={{color:"#00ffff", fontSize:"8px", marginTop:"8px", letterSpacing:"2px", textAlign:"center"}}>{status} • AVENGERS JARVIS • REAL AI • NO MAHABHARAT</div>
      </div>
    </div>
  );
}
