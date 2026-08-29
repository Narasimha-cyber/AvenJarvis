"use client";
import { useState, useEffect, useRef } from "react";

const TEAM = [
  { id:"IRON_MAN", name:"IRON MAN", emoji:"❤️", pitch:1.0, rate:1.1, color:"#ff0000", line:"Iron Man on duty, Boss. Mark 50 online." },
  { id:"HULK", name:"HULK", emoji:"💚", pitch:0.2, rate:0.65, color:"#00ff00", line:"HULK SMASH IN! Hulk on duty Boss!" },
  { id:"THOR", name:"THOR", emoji:"⚡", pitch:0.6, rate:0.8, color:"#00bfff", line:"Thor, God of Thunder, on duty!" },
  { id:"CAP", name:"CAPTAIN", emoji:"🛡️", pitch:0.9, rate:0.95, color:"#3a86ff", line:"Captain America on duty, Boss!" },
  { id:"WIDOW", name:"WIDOW", emoji:"🕷️", pitch:1.5, rate:1.0, color:"#ff006e", line:"Black Widow on duty, Boss." },
];

export default function Page(){
  const [active, setActive] = useState(null);
  const [order, setOrder] = useState("SAY: AVENGERS ASSEMBLE");
  const [reply, setReply] = useState("JARVIS STANDBY...");
  const [logs, setLogs] = useState(["System initialized..."]);
  const [scanning, setScanning] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const recogRef = useRef(null);

  const speakSync = (text, av) => {
    return new Promise(resolve=>{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = av.pitch;
      u.rate = av.rate;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  };

  const wakeUpSequence = async () => {
    if(scanning) return;
    setScanning(true);
    setReply("ASSEMBLING AVENGERS...");
    setLogs(l=>[...l, `BOSS: AVENGERS ASSEMBLE`]);

    // CLEAR HOLOGRAM QUEUE - OKKARI TARVATHA OKKARU
    for(let i=0; i<TEAM.length; i++){
      const av = TEAM[i];
      setActive(av);
      setLogs(l=>[...l, `${av.name} MATERIALIZING...`]);
      await new Promise(r=>setTimeout(r, 800)); // Hologram entry time
      await speakSync(av.line, av);
      setLogs(l=>[...l, `> ${av.name}: ON DUTY BOSS`]);
      await new Promise(r=>setTimeout(r, 400));
    }
    setActive(null);
    setScanning(false);
    setReply("ALL AVENGERS ON DUTY. GIVE ME ORDERS, BOSS.");
    await speakSync("All Avengers on duty Boss. Awaiting orders.", TEAM[0]);
  };

  useEffect(()=>{
    const init = () => {
      if(hasMic) return;
      navigator.mediaDevices.getUserMedia({audio:true}).then(()=>{
        setHasMic(true);
        const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
        if(!SR) return;
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onresult = (e)=>{
          const cmd = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
          console.log(cmd);
          if(cmd.includes("avengers assemble")){
            wakeUpSequence();
          } else if(cmd.length > 2){
            handleCommand(cmd);
          }
        };
        rec.onend = ()=>{ try{rec.start()}catch{} };
        rec.start();
        recogRef.current = rec;
      }).catch(()=>{});
    };
    document.addEventListener('click', init, {once:true});
    document.addEventListener('touchstart', init, {once:true});
  }, [hasMic]);

  const handleCommand = async (text) => {
    setOrder(text.toUpperCase());
    setScanning(true);
    const av = TEAM[Math.floor(Math.random()*TEAM.length)];
    setActive(av);
    setLogs(l=>[...l, `BOSS: ${text}`]);

    if(text.includes("buy") || text.includes("shop")){
      window.open(`https://www.amazon.in/s?k=${encodeURIComponent(text)}`,"_blank");
      setReply("Stark Shopping Portal Opening...");
      await speakSync("Opening shopping portal Boss", av);
      setScanning(false); return;
    }
    if(text.includes("news")){
      window.open(`https://news.google.com/search?q=${encodeURIComponent(text)}`,"_blank");
      setScanning(false); return;
    }
    if(text.includes("ticket") || text.includes("book") || text.includes("flight")){
      window.open(`https://www.google.com/travel/flights`,"_blank");
      setScanning(false); return;
    }

    try{
      const r = await fetch("/api/avengers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:text, avenger:av.name})});
      const d = await r.json();
      setReply(d.reply);
      await speakSync(d.reply, av);
    }catch{}
    setScanning(false);
    setTimeout(()=>setActive(null), 2000);
  };

  return(
    <div className="min-h-screen bg-[#020617] text-cyan-100 flex flex-col items-center p-3 relative overflow-hidden">
      {/* FUTURISTIC GRID BG */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0ea5e922,_transparent_70%)]"></div>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:"linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)", backgroundSize:"50px 50px"}}></div>

      {/* HUMANOID CORE */}
      <div className="relative mt-10 z-20">
        <div className="w-[280px] h-[280px] rounded-full border border-cyan-400/30 flex items-center justify-center relative bg-black/50 backdrop-blur">
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-spin" style={{animationDuration:"4s"}}></div>
          <div className="absolute inset-8 rounded-full border border-cyan-300/10 animate-ping"></div>
          {/* HOLOGRAM */}
          {active? (
            <div className="flex flex-col items-center animate-[pulse_0.8s_ease-in-out_infinite]">
              <div className="text-[80px] drop-shadow-[0_0_30px_currentColor]" style={{color:active.color}}>{active.emoji}</div>
              <div className="text-xs tracking-widest mt-2" style={{color:active.color}}>{active.name}</div>
              <div className="w-20 h-[2px] mt-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            </div>
          ) : (
            <div className="text-cyan-500/50">◉ STANDBY</div>
          )}
        </div>
        {/* SCANLINE */}
        {scanning && <div className="absolute top-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_20px_cyan] animate-[scan_2s_linear_infinite]"></div>}
      </div>

      <div className="z-20 mt-6 text-center">
        <h2 className="text-cyan-400 tracking-[0.6em] text-sm">{active? `${active.name} TRANSMITTING` : "F.R.I.D.A.Y"}</h2>
        <p className="text-[10px] opacity-50 mt-1">{order}</p>
      </div>

      <div className="z-20 mt-4 w-full max-w-xl bg-cyan-950/30 border border-cyan-800 rounded-lg p-4 text-center min-h-[90px] backdrop-blur">
        {scanning? <span className="animate-pulse text-cyan-300">◉ SCANNING AVENGERS NETWORK...</span> : reply}
      </div>

      {!hasMic && <div className="z-20 mt-4 px-4 py-2 bg-red-500/20 border border-red-500 text-xs animate-pulse">TAP ANYWHERE TO ENABLE MIC - THEN JUST SAY "AVENGERS ASSEMBLE"</div>}

      <div className="z-20 mt-4 w-full max-w-xl text-[10px] font-mono opacity-60 space-y-1">
        {logs.slice(-5).map((l,i)=><div key={i}>{l}</div>)}
      </div>

      <style>{`@keyframes scan{0%{top:0}100%{top:100%}}`}</style>
    </div>
  )
}
