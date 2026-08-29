"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "../utils/cloudinary"; // placeholder, we will init below
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- YOUR DETAILS INBUILT ---
const firebaseConfig = {
  apiKey: "AIzaSyAITlkoZIsMx99BDrj14I1S-ZtdEMsd1kc",
  authDomain: "pulse360-news.firebaseapp.com",
  projectId: "pulse360-news",
  storageBucket: "pulse360-news.firebasestorage.app",
  messagingSenderId: "789441397313",
  appId: "1:789441397313:web:ff3abd4184818b23d13cc0"
};
const CLOUDINARY_CLOUD = "ld6mifgm";
const CLOUDINARY_PRESET = "reporter_upload";
let app, dbFirestore;
try { app = initializeApp(firebaseConfig); dbFirestore = getFirestore(app); } catch(e){}

export default function AvenJarvis() {
  const [assembled, setAssembled] = useState(false);
  const [listening, setListening] = useState(false);
  const [order, setOrder] = useState("");
  const [reply, setReply] = useState("");
  const [avenger, setAvenger] = useState("IRON MAN");
  const [logs, setLogs] = useState([]);
  const recognitionRef = useRef(null);

  const avengers = ["IRON MAN","CAPTAIN AMERICA","THOR","BLACK WIDOW","HULK"];

  useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecognition){
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleBossOrder(transcript);
      };
    }
    // Clap detection
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const mic = audioCtx.createMediaStreamSource(stream);
      mic.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastClap = 0;
      const detect = ()=>{
        analyser.getByteFrequencyData(data);
        const vol = data.reduce((a,b)=>a+b)/data.length;
        if(vol>140 && Date.now()-lastClap>1000){
          lastClap = Date.now();
          if(!assembled) doAssemble();
          else triggerListen();
        }
        requestAnimationFrame(detect);
      }; detect();
    }).catch(()=>{});
  },[assembled]);

  const doAssemble = () => {
    setAssembled(true);
    const voices = [
      {name:"IRON MAN", text:"Yes Boss. Systems online."},
      {name:"CAPTAIN", text:"On your left, Boss."},
      {name:"THOR", text:"I am ready, Boss!"},
      {name:"WIDOW", text:"Mission ready, Boss."},
      {name:"HULK", text:"Hulk... listens to Boss!"},
    ];
    let i=0;
    const playNext = ()=>{
      if(i>=voices.length) return;
      setAvenger(voices[i].name);
      speak(voices[i].text);
      i++; setTimeout(playNext, 2000);
    }; playNext();
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1;
    window.speechSynthesis.speak(u);
    setReply(text);
  };

  const triggerListen = () => {
    setListening(true); speak("Yes Boss, order please");
    setTimeout(()=>{ recognitionRef.current?.start(); }, 800);
  };

  const handleBossOrder = async (text) => {
    setOrder(text); setListening(false);
    setLogs(l=>[{time:new Date().toLocaleTimeString(), order:text, avenger},...l].slice(0,10));
    try{
      // Save to Firebase
      if(dbFirestore) await addDoc(collection(dbFirestore,"boss_orders"),{order:text, avenger, time:serverTimestamp()});
    }catch(e){}
    try{
      const res = await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:text, avenger})});
      const data = await res.json();
      speak(data.reply);
    }catch(e){ speak(`Yes Boss, ${text} - on it!`); }
  };

  return (
    <div style={{minHeight:"100vh", background:"radial-gradient(circle at center, #0a1930 0%, #000 80%)", color:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"monospace", padding:"20px", textAlign:"center"}}>
      {!assembled? (
        <>
          <h1 style={{fontSize:"3rem", letterSpacing:"6px", textShadow:"0 0 20px #00d4ff"}}>AVENJARVIS</h1>
          <p style={{opacity:0.7}}>YOU ORDER - THEY OBEY</p>
          <button onClick={doAssemble} style={{marginTop:"30px", padding:"20px 40px", fontSize:"1.2rem", background:"linear-gradient(90deg,#00d4ff,#ff003c)", border:"none", borderRadius:"50px", color:"white", cursor:"pointer", boxShadow:"0 0 30px #00d4ff", fontWeight:"bold"}}>⚡ AVENGERS ASSEMBLE ⚡</button>
          <p style={{marginTop:"20px", fontSize:"0.9rem", opacity:0.5}}>Or Clap Twice 👏👏</p>
        </>
      ):(
        <>
          <div style={{width:"150px", height:"150px", borderRadius:"50%", border:`3px solid ${listening?"#00ff88":"#00d4ff"}`, boxShadow:`0 0 40px ${listening?"#00ff88":"#00d4ff"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", animation:listening?"pulse 1s infinite":""}}>{avenger[0]}</div>
          <h2 style={{marginTop:"20px", color:"#00d4ff"}}>{avenger} ACTIVE</h2>
          <div style={{marginTop:"20px", minHeight:"60px"}}><p style={{color:"#aaa"}}>Last Order: <b style={{color:"white"}}>{order || "Waiting Boss..."}</b></p><p style={{fontSize:"1.3rem", marginTop:"10px"}}>{reply}</p></div>
          <div style={{display:"flex", gap:"10px", marginTop:"25px"}}>
            <button onClick={triggerListen} style={{padding:"12px 25px", background:"#00d4ff", border:"none", borderRadius:"10px", fontWeight:"bold", cursor:"pointer"}}>🎤 VOICE ORDER</button>
            <button onClick={()=>{const t=prompt("Type Boss Order:"); if(t) handleBossOrder(t);}} style={{padding:"12px 25px", background:"transparent", border:"1px solid #00d4ff", color:"#00d4ff", borderRadius:"10px", cursor:"pointer"}}>⌨️ TYPE ORDER</button>
          </div>
          <div style={{marginTop:"30px", width:"100%", maxWidth:"400px", textAlign:"left", opacity:0.8}}><h4>BOSS LOG</h4>{logs.map((l,i)=><div key={i} style={{fontSize:"0.8rem", borderLeft:"2px solid #ff003c", paddingLeft:"8px", marginTop:"6px"}}>[{l.time}] {l.avenger}: {l.order}</div>)}</div>
        </>
      )}
      <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}
