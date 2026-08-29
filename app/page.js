"use client";
import { useState } from "react";

const AGENTS = [
  { id:"JARVIS", name:"JARVIS PRIME", color:"#ffcc00", role:"LEADER - 6 agents ni manage chestha", voice:"Jarvis Prime Online sir.", live: () => `6 agents active` },
  { id:"PULSE", name:"PULSE-360", color:"#00e5ff", role:"pulse360news.in monitor", voice:"Pulse 360 online.", live: () => `pulse360news.in: UP • Posts: 5` },
  { id:"VERIFACT", name:"VERIFACT", color:"#a855f7", role:"verifact website monitor", voice:"Verifact online.", live: () => `verifact: UP • Pending: 2` },
  { id:"LOCAL", name:"LOCAL-TASK", color:"#4ade80", role:"Local tasks", voice:"Local online.", live: () => `Tasks: 3 pending` },
  { id:"NEWS", name:"NEWS-HUNTER", color:"#ef4444", role:"Realtime news hunter", voice:"News Hunter online.", live: () => `News: 24 headlines` },
  { id:"SHOPPER", name:"SHOPPER", color:"#ff8c00", role:"Shopping - Amazon Flipkart scan chesi best deal istha", voice:"Shopper online.", live: () => `Ready to scan deals` },
  { id:"TICKET", name:"TICKET-MASTER", color:"#00ff88", role:"Travel - bus train flight compare chesi book chese sub-agent undi", voice:"Ticket Master online.", live: () => `Booker ready` },
];

export default function Page(){
  const [screen, setScreen] = useState("INIT");
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const [typedReply, setTypedReply] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [deals, setDeals] = useState([]);
  const [travel, setTravel] = useState(null);

  // VOICE OUTPUT - Agent matladuthadu + Type lo kuda chupisthadu
  const speak = (text, agent) => {
    setTypedReply(text); // Text lo kuda
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9; u.pitch = agent.id==="JARVIS"?0.8:1;
      speechSynthesis.speak(u);
    }catch{}
  };

  // VOICE INPUT + TYPE INPUT - rendu okate function ki vasthai
  const handleOrder = async (txt) => {
    if(!txt.trim()) return;
    const order = txt.trim();
    setInput(""); setDeals([]); setTravel(null);
    setLogs(l=>[...l, `YOU (${isListening?"🎤 Voice":"⌨️ Typed"}): ${order}`]);

    let target = AGENTS[0];
    if(order.toLowerCase().includes("pulse")) target = AGENTS[1];
    else if(order.toLowerCase().includes("verifact")) target = AGENTS[2];
    else if(order.toLowerCase().includes("shop")||order.toLowerCase().includes("buy")) target = AGENTS[5];
    else if(order.toLowerCase().includes("ticket")||order.toLowerCase().includes("travel")||order.toLowerCase().includes("hyd")) target = AGENTS[6];
    else if(order.toLowerCase().includes("news")) target = AGENTS[4];

    setActive(target);
    setTypedReply(`Processing "${order}" via ${target.name}...`);
    speak(`Processing ${order} sir, routing to ${target.name}`, target);

    if(target.id==="SHOPPER"){
      setTimeout(()=>{
        const fakeDeals=[
          {site:"Amazon", price:"₹1299", best:true, link:"https://amazon.in/s?k="+order},
          {site:"Flipkart", price:"₹1499", link:"https://flipkart.com/search?q="+order},
          {site:"Myntra", price:"₹1699", link:"https://myntra.com/search?q="+order},
        ];
        setDeals(fakeDeals);
        const msg = `Found best deal for ${order} on Amazon at 1299 rupees sir, showing here.`;
        setTypedReply(msg); speak(msg, target);
      },1500);
    }
    else if(target.id==="TICKET"){
      setTravel({options:[
        {type:"Bus - Orange Travels", price:"₹890", time:"6h"},
        {type:"Train - Vande Bharat", price:"₹1240", time:"4.5h", best:true},
        {type:"Flight - IndiGo", price:"₹2890", time:"1h"},
      ]});
      const msg=`Travel plan for ${order} ready sir, Vande Bharat best option, say OK BOOK to confirm.`;
      setTypedReply(msg); speak(msg, target);
    }
    else{
      try{
        const r = await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:target.id})});
        const d = await r.json();
        setTypedReply(d.reply); speak(d.reply, target);
        setLogs(l=>[...l, `${target.id}: ${d.reply}`]);
      }catch{
        const msg=`Order ${order} executed sir.`;
        setTypedReply(msg); speak(msg, target);
      }
    }
  };

  // MIC - VOICE COMMAND
  const startVoiceCommand = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ alert("Mic not supported, type chey Bro"); return; }
    const rec = new SR(); rec.lang="en-IN"; rec.interimResults=false;
    setIsListening(true);
    rec.onresult = (e)=>{
      const txt = e.results[0][0].transcript;
      setIsListening(false); handleOrder(txt); // voice command -> same function
    };
    rec.onerror = ()=> setIsListening(false);
    rec.onend = ()=> setIsListening(false);
    rec.start();
  };

  const startRollCall = async ()=>{
    setScreen("ROLLCALL"); setHistory([]); setLogs(["[PROTOCOL] INIT"]);
    for(let ag of AGENTS){
      setActive(ag); setTypedReply(ag.voice+" Role: "+ag.role); speak(ag.voice+" My role is "+ag.role, ag);
      setHistory(h=>[...h, {...ag, liveText: ag.live()}]); setLogs(l=>[...l, `${ag.id} ONLINE - ${ag.role}`]);
      await new Promise(r=>setTimeout(r, 1200));
    }
    setActive(null); setScreen("ACTIVE"); setTypedReply("All 7 agents ready sir. Give order by Voice or Type."); speak("All agents ready sir, give order by voice or type.", AGENTS[0]);
  };

  return(
    <div style={{minHeight:"100vh", background:"#050508", color:"white", fontFamily:"monospace", display:"flex", flexDirection:"column"}}>
      <div style={{display:"flex", justifyContent:"space-between", padding:8, borderBottom:"1px solid #222"}}>{AGENTS.map(a=><div key={a.id} style={{textAlign:"center", opacity: history.find(h=>h.id===a.id)?1:0.2}}><div style={{width:24, height:24, borderRadius:"50%", border:`1px solid ${a.color}`, background:history.find(h=>h.id===a.id)?a.color+"55":"transparent"}}></div><div style={{fontSize:5, color:a.color}}>{a.id}</div></div>)}</div>

      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16}}>
        {screen==="INIT" && <><div style={{fontSize:32, color:"#ffcc00", fontWeight:900}}>AVENGERS</div><button onClick={startRollCall} style={{marginTop:16, padding:"10px 20px", border:"1px solid #ffcc00", background:"transparent", color:"#ffcc00", borderRadius:20, cursor:"pointer"}}>INITIATE</button></>}

        {screen!=="INIT" && active && <div style={{textAlign:"center", maxWidth:400}}><div style={{width:100, height:100, borderRadius:"50%", margin:"0 auto", background:`radial-gradient(circle, ${active.color}, #111)`, border:`2px solid ${active.color}`}}></div><div style={{color:active.color, marginTop:8, fontWeight:800}}>{active.name}</div><div style={{marginTop:10, background:"#111", border:`1px solid ${active.color}33`, padding:10, borderRadius:8, textAlign:"left"}}><div style={{fontSize:11, color:active.color}}>💬 SAYS (Voice+Text):</div><div style={{fontSize:13, marginTop:4}}>{typedReply}</div><div style={{fontSize:9, opacity:0.5, marginTop:6}}>{active.role}</div></div></div>}

        {screen==="ACTIVE" &&!active && <div style={{width:"100%", maxWidth:600}}><div style={{background:"#111", border:"1px solid #333", padding:12, borderRadius:10, minHeight:60}}><div style={{fontSize:10, color:"#ffcc00"}}>JARVIS PRIME - LAST REPLY (Voice+Text):</div><div style={{marginTop:6, fontSize:14}}>{typedReply || "Ready for Voice or Typed order sir..."}</div></div>
          {deals.length>0 && <div style={{marginTop:10, background:"#111", border:"1px solid #ff8c00", padding:10, borderRadius:10}}><b style={{color:"#ff8c00"}}>🛒 DEALS - Background Scan Result:</b>{deals.map((d,i)=><div key={i} style={{display:"flex", justifyContent:"space-between", marginTop:6, background:d.best?"#ff8c0022":"#000", padding:6, borderRadius:6}}><span>{d.site} {d.price} {d.best?"⭐BEST":""}</span><a href={d.link} target="_blank" style={{color:"#00e5ff"}}>VIEW</a></div>)}</div>}
          {travel && <div style={{marginTop:10, background:"#111", border:"1px solid #00ff88", padding:10, borderRadius:10}}><b style={{color:"#00ff88"}}>✈️ TRAVEL OPTIONS:</b>{travel.options.map((o,i)=><div key={i} style={{display:"flex", justifyContent:"space-between", marginTop:6, background:o.best?"#00ff8822":"#000", padding:6, borderRadius:6}}><span>{o.type} {o.price} {o.time}</span><button onClick={()=>{const m=`Booking ${o.type} confirmed sir`; setTypedReply(m); speak(m, AGENTS[6]);}} style={{background:"#00ff88", border:"none", padding:"4px 8px", borderRadius:4, fontWeight:800, cursor:"pointer"}}>OK BOOK</button></div>)}</div>}
        </div>}
      </div>

      {/* COMMAND BAR - RENDU INPUTS */}
      {screen==="ACTIVE" && (
        <div style={{display:"flex", gap:6, padding:10, borderTop:"1px solid #222", background:"#08080a"}}>
          <button onClick={startVoiceCommand} style={{padding:"10px 14px", background:isListening?"#ef4444":"#27272a", border:"1px solid #333", borderRadius:8, cursor:"pointer", color:"white", fontWeight:800}}>
            {isListening? "🔴 Listening... Speak Now" : "🎤 VOICE COMMAND"}
          </button>

          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleOrder(input)}
            placeholder='⌨️ TYPE COMMAND: "shop shoes" / "ticket hyd to vja" / "check pulse360"'
            style={{flex:1, background:"#111", border:"1px solid #333", borderRadius:8, padding:"10px", color:"white"}}/>

          <button onClick={()=>handleOrder(input)} style={{padding:"10px 16px", background:"#ffcc00", color:"black", fontWeight:900, borderRadius:8, border:"none", cursor:"pointer"}}>EXECUTE</button>
        </div>
      )}

      <div style={{fontSize:7, opacity:0.3, padding:4, textAlign:"center"}}>VOICE COMMAND (Mic) • TYPED COMMAND (Keyboard) • Both work same • Reply Voice+Text</div>
    </div>
  )
}
