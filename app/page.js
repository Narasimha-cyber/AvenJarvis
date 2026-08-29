"use client";
import { useState, useEffect, useRef } from "react";

const AVENGERS = {
  HULK: { name: "HULK", color: "shadow-green-500", pitch: 0.3, rate: 0.7, img: "💚", entry: "HULK SMASH IN! ON DUTY BOSS!" },
  IRON_MAN: { name: "IRON MAN", color: "shadow-red-500", pitch: 1.1, rate: 1.1, img: "❤️", entry: "Iron Man on duty, Boss. Systems online." },
  THOR: { name: "THOR", color: "shadow-blue-500", pitch: 0.7, rate: 0.85, img: "⚡", entry: "Thor, God of Thunder, on duty!" },
  BLACK_WIDOW: { name: "WIDOW", color: "shadow-pink-500", pitch: 1.4, rate: 1.0, img: "🕷️", entry: "Black Widow on duty, Boss." },
  CAPTAIN: { name: "CAP", color: "shadow-blue-300", pitch: 0.9, rate: 1.0, img: "🛡️", entry: "Captain America on duty, Boss!" },
};

export default function AvenJarvis(){
  const [active, setActive] = useState(AVENGERS.IRON_MAN);
  const [listening, setListening] = useState(false);
  const [order, setOrder] = useState("SAY AVENGERS ASSEMBLE");
  const [reply, setReply] = useState("Waiting for Boss order...");
  const [logs, setLogs] = useState([]);
  const [searching, setSearching] = useState(false);
  const recogRef = useRef(null);

  // VOICE PITCH MATCH
  const speak = (text, avenger = active) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = avenger.pitch;
    u.rate = avenger.rate;
    // Try to get best voice
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v=>v.name.includes("Google")) || voices[0];
    speechSynthesis.speak(u);
  };

  // AUTO MIC + WAKE WORD
  useEffect(()=>{
    const startWake = () => {
      const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
      if(!SR) return;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (e)=>{
        const cmd = e.results[e.results.length-1][0].transcript.toLowerCase();
        console.log("Heard:", cmd);
        if(cmd.includes("avengers assemble")){
          wakeUp();
        } else if(cmd.length > 3 && listening){
          handleOrder(cmd);
        }
      };
      rec.onend = ()=> rec.start();
      rec.start();
      recogRef.current = rec;
      setListening(true);
    };

    // One click = auto allow forever
    const onFirstClick = () => {
      navigator.mediaDevices.getUserMedia({audio:true}).then(()=>{
        startWake();
        document.removeEventListener('click', onFirstClick);
      });
    };
    document.addEventListener('click', onFirstClick);
    return ()=> document.removeEventListener('click', onFirstClick);
  }, [listening]);

  const wakeUp = () => {
    setSearching(true);
    // Hologram entry one by one
    const keys = Object.keys(AVENGERS);
    let i=0;
    const interval = setInterval(()=>{
      const av = AVENGERS[keys[i]];
      setActive(av);
      speak(av.entry, av);
      setLogs(l=>[...l, `[${new Date().toLocaleTimeString()}] ${av.name}: ON DUTY BOSS`]);
      i++;
      if(i>=keys.length){
        clearInterval(interval);
        setSearching(false);
        setReply("ALL AVENGERS ASSEMBLED. ORDER ME BOSS!");
        speak("All Avengers on duty Boss!");
      }
    }, 1200);
  };

  const handleOrder = async (text) => {
    if(!text) return;
    setOrder(text.toUpperCase());
    setSearching(true);
    setLogs(l=>[...l, `[${new Date().toLocaleTimeString()}] BOSS: ${text}`]);

    // SMART ACTIONS - shopping/news/ticket
    if(text.includes("buy") || text.includes("shop")){
      window.open(`https://www.amazon.in/s?k=${encodeURIComponent(text)}`, "_blank");
      setReply("Opening Stark Shopping Portal, Boss!");
      speak("Opening shopping portal Boss");
      setSearching(false); return;
    }
    if(text.includes("news")){
      window.open(`https://news.google.com/search?q=${encodeURIComponent(text)}`, "_blank");
      setReply("Fetching Daily Bugle, Boss!");
      setSearching(false); return;
    }
    if(text.includes("ticket") || text.includes("flight") || text.includes("book")){
      window.open(`https://www.google.com/travel/flights?q=${encodeURIComponent(text)}`, "_blank");
      setReply("Opening Stark Travel, Boss!");
      setSearching(false); return;
    }

    // GEMINI CALL
    const avKeys = Object.keys(AVENGERS);
    const randomAv = AVENGERS[avKeys[Math.floor(Math.random()*avKeys.length)]];
    setActive(randomAv);

    try{
      const res = await fetch("/api/avengers", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({prompt: text, avenger: randomAv.name})
      });
      const data = await res.json();
      setReply(data.reply);
      speak(data.reply, randomAv);
      setLogs(l=>[...l, `[${new Date().toLocaleTimeString()}] ${randomAv.name}: ${data.reply.substring(0,50)}...`]);
    }catch(e){
      setReply("System Error Boss!");
    }
    setSearching(false);
  };

  return(
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-mono overflow-hidden relative">
      {/* AVENGERS THEME SEARCH ANIMATION */}
      {searching && <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-cyan-400 animate-ping text-xl">◉ A-V-E-N-G-E-R-S SCANNING...</div>
      </div>}

      {/* HOLOGRAM */}
      <div className={`w-40 h-40 rounded-full border-4 border-cyan-400 flex items-center justify-center text-6xl shadow-[0_0_80px_cyan] transition-all duration-500 ${searching?'scale-110':''} ${active.color}`}>
        <span className="animate-pulse">{active.img}</span>
      </div>
      <h1 className="mt-4 text-cyan-400 tracking-[0.5em]">{active.name} ACTIVE</h1>
      <p className="text-xs opacity-50 mt-2">Last Order: {order}</p>

      <div className="mt-6 w-full max-w-2xl bg-white/5 border border-cyan-900 p-4 rounded-lg min-h-[100px] text-center">
        {reply}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={wakeUp} className="px-6 py-2 bg-cyan-500 text-black font-bold rounded">AVENGERS ASSEMBLE</button>
        <button onClick={()=>handleOrder(prompt("Type Order:"))} className="px-6 py-2 border border-cyan-500 rounded">TYPE ORDER</button>
      </div>

      <div className="mt-6 w-full max-w-2xl text-xs opacity-60">
        <p>BOSS LOG</p>
        {logs.slice(-4).map((l,i)=><div key={i}>{l}</div>)}
      </div>
      <p className="mt-4 text-[10px] opacity-30">CLICK ANYWHERE TO ALLOW MIC ONCE - THEN JUST SAY "AVENGERS ASSEMBLE"</p>
    </div>
  );
}
