"use client";
import { useEffect, useRef, useState } from "react";

export default function RealJarvisGokulam() {
  const [listening, setListening] = useState(false);
  const [subtitle, setSubtitle] = useState("🎤 CLICK MIC - REAL JARVIS - GOKULAM");
  const [chat, setChat] = useState([]);
  const [activeAgent, setActiveAgent] = useState("KRISHNA");
  const recRef = useRef(null);

  const AGENTS = [
    {name:"KRISHNA", color:"#FFD700", role:"Supreme Commander"},
    {name:"DRAUPADI", color:"#E91E63", role:"Intelligence"},
    {name:"ARJUNA", color:"#2196F3", role:"Executor"},
    {name:"BHIMA", color:"#FF9800", role:"Guardian"},
    {name:"SAHADEVA", color:"#4CAF50", role:"Analyst"},
    {name:"NAKULA", color:"#8BC34A", role:"Scout"},
    {name:"KUBERA", color:"#FFC107", role:"Treasury"},
    {name:"VYASA", color:"#795548", role:"Knowledge"},
    {name:"GANDHARVA", color:"#9C27B0", role:"Media"},
    {name:"KARNA", color:"#F44336", role:"Warrior"},
    {name:"YUDHISHTIRA", color:"#00BCD4", role:"Dharma"},
  ];

  const speak = (text, agentName) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = 0.45; u.rate = 0.88; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const male = voices.find(v=>v.name.includes("Male")||v.name.includes("Google UK English Male")) || voices[0];
    if(male) u.voice = male;
    u.onstart = () => setSubtitle(`🗣️ ${agentName}: ${text.slice(0,90)}...`);
    u.onend = () => setListening(false);
    window.speechSynthesis.speak(u);
  };

  const callBrain = async (msg, agent) => {
    setSubtitle(`🧠 ${agent} alochisthunnadu...`);
    try{
      const r = await fetch("/api/brain",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:msg, activeAgent:agent, location:"Eluru"})});
      const d = await r.json();
      const reply = d.reply || "Prabhu, nenu vinna.";
      setChat(c=>[...c, {agent, user:msg, reply, time:new Date().toLocaleTimeString()}].slice(-8));
      speak(reply, agent);
    }catch(e){
      speak("Prabhu connection lo samasya, malli cheppandi", agent);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ alert("Mic kosam Chrome lo open chey bro"); return; }
    if(recRef.current) recRef.current.stop();
    const rec = new SR(); rec.lang="en-IN"; rec.interimResults=false; rec.continuous=false;
    rec.onstart=()=>{ setListening(true); setSubtitle("🎤 Vintunnanu Prabhu... Cheppandi"); };
    rec.onresult=(e)=>{
      const txt = e.results[0][0].transcript;
      setSubtitle(`✅ Vina: ${txt}`);
      callBrain(txt, activeAgent);
    };
    rec.onerror=()=>{ setListening(false); setSubtitle("🎤 Mic malli click chey"); };
    rec.onend=()=>setListening(false);
    rec.start(); recRef.current=rec;
  };

  useEffect(()=>{ window.speechSynthesis.getVoices(); },[]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Cinematic Background - No 3D - Real Gokulam image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514222134-b57cbb3946d3?q=80&w=2000')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0D47A1]/20 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_black_100%)]" />

      {/* Top */}
      <div className="relative z-10 flex justify-between items-center p-3 md:p-5">
        <div className="text-amber-300 text-[9px] tracking-[0.5em] border border-amber-500/20 px-4 py-2 rounded-full bg-black/40 backdrop-blur">AVENJARVIS • REAL JARVIS • GOKULAM</div>
        <div className="text-white/60 text-[9px]">{activeAgent}</div>
      </div>

      {/* Center - Krishna & Agents - Not game */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 border-4 border-amber-400/50 shadow-[0_0_80px_rgba(255,215,0,0.6)] flex items-center justify-center text-5xl animate-pulse">🦚</div>
        <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter mt-4 drop-shadow-[0_0_20px_black]">KRISHNA</h1>
        <div className="text-amber-200 text-[10px] tracking-[0.4em] mt-1">SUPREME COMMANDER • REAL VOICE • REAL BRAIN</div>

        {/* Agent Pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-3xl">
          {AGENTS.map(a=>(
            <button key={a.name} onClick={()=>setActiveAgent(a.name)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest border transition ${activeAgent===a.name?"bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_gold]":"bg-black/50 text-white/70 border-white/10 hover:bg-white/10"}`} style={{borderColor:activeAgent===a.name?undefined:a.color}}>{a.name}</button>
          ))}
        </div>

        {/* Chat */}
        <div className="w-full max-w-2xl mt-6 space-y-2 max-h-[22vh] overflow-y-auto">
          {chat.map((c,i)=>(
            <div key={i} className="bg-black/50 backdrop-blur border border-white/10 rounded-xl p-3 text-[11px]">
              <div className="text-amber-300 text-[8px]">{c.agent} • {c.time}</div>
              <div className="text-white/60 text-[10px] mt-1">You: {c.user}</div>
              <div className="text-white text-[12px] mt-1">{c.reply}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Jarvis */}
      <div className="relative z-10 p-4 md:p-6 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <button onClick={startListening} className={`flex-1 md:flex-none w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl font-black transition-all ${listening?"bg-red-500 animate-ping shadow-[0_0_40px_red]":"bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_40px_orange] hover:scale-105"}`}>🎤</button>
          <div className="flex-1 bg-black/60 backdrop-blur border border-amber-500/20 rounded-2xl px-4 py-3">
            <div className="text-white text-[12px] md:text-[14px] leading-snug">{subtitle}</div>
            <div className="text-white/40 text-[8px] mt-1 tracking-widest">REAL JARVIS • NO GAME • NO LOOP • VOICE + BRAIN + 5 KEYS • ELURU</div>
          </div>
        </div>
      </div>
    </div>
  );
}
