"use client";
import { useState } from "react";

const AGENTS = [
  { id:"JARVIS", name:"JARVIS PRIME", color:"#ffcc00", role:"LEADER", voice:"Jarvis Prime online." },
  { id:"PULSE", name:"PULSE-360", color:"#00e5ff", role:"pulse360news.in monitor" },
  { id:"VERIFACT", name:"VERIFACT", color:"#a855f7", role:"verifact monitor" },
  { id:"LOCAL", name:"LOCAL-TASK", color:"#4ade80", role:"Local tasks" },
  { id:"NEWS", name:"NEWS-HUNTER", color:"#ef4444", role:"Realtime news" },
  { id:"SHOPPER", name:"SHOPPER", color:"#ff8c00", role:"Shopping - Amazon Flipkart scan" },
  { id:"TICKET", name:"TICKET-MASTER", color:"#00ff88", role:"Bus Train Flight + Hotels" },
  { id:"TRIP", name:"TRIP-GUIDE", color:"#ff1493", role:"Trip Planner - place chepthe best places with pics budget total plan" },
];

export default function Page(){
  const [screen, setScreen] = useState("INIT");
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [typedReply, setTypedReply] = useState("");
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // FIX: okaru matladuthunte inkokaru aagali
  const [searchMode, setSearchMode] = useState(null); // "shopping" | "travel" | "trip" | null
  const [searchItems, setSearchItems] = useState([]); // fast scroll items
  const [finalDeals, setFinalDeals] = useState([]); // 2 best deals
  const [queue, setQueue] = useState([]); // speaking queue

  const speakQueue = async (text, agent) => {
    if(isSpeaking) { setQueue(q=>[...q, {text, agent}]); return; }
    setIsSpeaking(true);
    setTypedReply(text);
    setActive(agent);
    await new Promise(res=>{
      try{
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate=0.9; u.onend=res; u.onerror=res;
        speechSynthesis.speak(u);
        // text ki time - voice fail ayina 3 sec taruvatha next
        setTimeout(res, 3500);
      }catch{ setTimeout(res, 2000); }
    });
    setIsSpeaking(false);
    if(queue.length>0){
      const next = queue[0]; setQueue(q=>q.slice(1));
      setTimeout(()=>speakQueue(next.text, next.agent), 300);
    } else { if(screen==="ACTIVE") setActive(null); }
  };

  const handleOrder = async (txt) => {
    if(!txt.trim() || isSpeaking) return;
    const order = txt.trim(); setInput("");
    setFinalDeals([]); setSearchItems([]);

    let target = AGENTS[0];
    if(/pulse/i.test(order)) target=AGENTS[1];
    else if(/verifact/i.test(order)) target=AGENTS[2];
    else if(/shop|shoes|buy|deal|price/i.test(order)) target=AGENTS[5];
    else if(/ticket|bus|train|flight|hotel/i.test(order)) target=AGENTS[6];
    else if(/trip|place|visit|goa|manali|hyderabad|bangalore|best place/i.test(order)) target=AGENTS[7];
    else if(/news/i.test(order)) target=AGENTS[4];

    // SHOPPING - FULL SCREEN SEARCH ANIMATION
    if(target.id==="SHOPPER"){
      setSearchMode("shopping");
      const fakeScroll = Array.from({length:20},(_,i)=>({site:["Amazon","Flipkart","Myntra","Ajio"][i%4], price:`₹${1200+i*123}`, name:`${order} Model ${i+1}`}));
      let idx=0;
      const interval = setInterval(()=>{
        setSearchItems(s=> [...s.slice(-6), fakeScroll[idx]]);
        idx++; if(idx>=fakeScroll.length){ clearInterval(interval);
          setTimeout(()=>{
            setSearchMode(null);
            setFinalDeals([
              {site:"Amazon", price:"₹1,299", mrp:"₹3,999", off:"68% OFF", name:"Nike Air Max Shoes", img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", best:true, rating:"4.5⭐ (12k)"},
              {site:"Flipkart", price:"₹1,499", mrp:"₹2,999", off:"50% OFF", name:"Puma Runner Shoes", img:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400", rating:"4.3⭐ (8k)"},
            ]);
            speakQueue(`Search complete sir, found 2 best deals for ${order}, showing with images`, target);
          },500);
        }
      },120);
      await speakQueue(`On it sir, scanning Amazon Flipkart Myntra for ${order} in background, full screen search started`, target);
    }
    // TICKET + HOTEL
    else if(target.id==="TICKET"){
      setSearchMode("travel");
      const fakeTravel = ["Searching Buses...","Searching Trains...","Searching Flights...","Searching Hotels...","Comparing Prices...","Finding Best Route..."];
      let t=0; const intv=setInterval(()=>{ setSearchItems(s=>[...s, fakeTravel[t]]); t++; if(t>=fakeTravel.length){ clearInterval(intv); setSearchMode(null);
        setFinalDeals([
          {type:"Bus - Orange", price:"₹890", time:"6h", img:"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400", best:false, details:"AC Sleeper • 9PM Departure"},
          {type:"Train - Vande Bharat", price:"₹1,240", time:"4.5h", img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400", best:true, details:"Fastest • Food Included"},
          {type:"Hotel - Taj Banjara", price:"₹3,499/night", time:"4.8⭐", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", best:true, details:"Best Deal in area"},
        ]);
        speakQueue(`Travel and hotel best deals ready sir for ${order}`, target);
      }},400);
      await speakQueue(`Planning travel for ${order} sir, searching buses trains hotels`, target);
    }
    // TRIP GUIDE - NEW AGENT
    else if(target.id==="TRIP"){
      setSearchMode("trip");
      const places=["Scanning Best Places...","Finding Budget...","Calculating Total Cost...","Loading Images..."];
      let p=0; const intv2=setInterval(()=>{ setSearchItems(s=>[...s, places[p]]); p++; if(p>=places.length){ clearInterval(intv2); setSearchMode(null);
        setFinalDeals([
          {name:"Charminar & Old City", budget:"₹500", img:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400", desc:"Historic, 2hrs, Entry ₹20"},
          {name:"Golconda Fort Light Show", budget:"₹800", img:"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400", desc:"Evening best, 3hrs"},
        ]);
        // Total trip plan
        setTypedReply(`TRIP PLAN for ${order}: Day1 Charminar, Day2 Golconda, Total Budget ₹4,500 including travel stay.`);
      }},500);
      await speakQueue(`Trip planning for ${order} sir, finding best places with pics and budget`, target);
    }
    else{
      await speakQueue(`Processing ${order} via ${target.name} sir`, target);
      try{
        const r=await fetch("/api/avengers",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:order, avenger:target.id})});
        const d=await r.json();
        await speakQueue(d.reply, target);
      }catch{ await speakQueue(`${order} done sir`, target); }
    }
  };

  const startVoice = ()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return alert("Mic not supported");
    const rec=new SR(); rec.lang="en-IN"; setIsListening(true);
    rec.onresult=e=>{ setIsListening(false); handleOrder(e.results[0][0].transcript); };
    rec.onend=()=>setIsListening(false); rec.start();
  };

  const startRollCall = async ()=>{
    setScreen("ROLLCALL"); setHistory([]);
    for(let ag of AGENTS){
      setActive(ag); setHistory(h=>[...h, ag]);
      await speakQueue(`${ag.name} online. My role is ${ag.role}`, ag);
      await new Promise(r=>setTimeout(r, 400));
    }
    setScreen("ACTIVE"); await speakQueue("All 8 agents ready sir, sequential speaking enabled, shopping with images, travel and trip guide ready", AGENTS[0]);
  };

  return(
    <div style={{minHeight:"100vh", background:"#050508", color:"white", fontFamily:"monospace", position:"relative", overflow:"hidden"}}>
      {/* FULL SCREEN SEARCHING ANIMATION */}
      {searchMode && (
        <div style={{position:"fixed", inset:0, background:"#050508f0", zIndex:50, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
          <div style={{fontSize:22, color:"#ffcc00", fontWeight:900, letterSpacing:3, animation:"pulse 0.6s infinite"}}>{searchMode==="shopping"?"🛒 SEARCHING DEALS...": searchMode==="travel"?"✈️ SEARCHING TRAVEL & HOTELS...":"🗺️ PLANNING TRIP..."}</div>
          <div style={{marginTop:20, width:300, height:4, background:"#222", borderRadius:10, overflow:"hidden"}}><div style={{height:"100%", background: searchMode==="shopping"?"#ff8c00": searchMode==="travel"?"#00ff88":"#ff1493", width:"100%", animation:"slide 1s linear infinite"}}></div></div>
          <div style={{marginTop:20, height:200, overflow:"hidden", width:"90%", maxWidth:400}}>{searchItems.map((it,i)=><div key={i} style={{padding:"6px 10px", background:"#111", marginTop:6, borderRadius:6, borderLeft:`3px solid ${searchMode==="shopping"?"#ff8c00":"#00ff88"}`, fontSize:12, animation:"scrollUp 0.2s"}}>{typeof it==="string"? it : `${it.site} - ${it.name} - ${it.price}`}</div>)}</div>
          <div style={{marginTop:10, fontSize:10, opacity:0.5}}>Background scan • Fast scrolling</div>
        </div>
      )}

      <div style={{display:"flex", justifyContent:"space-between", padding:8, borderBottom:"1px solid #222"}}>{AGENTS.map(a=><div key={a.id} style={{textAlign:"center", opacity: history.find(h=>h.id===a.id)?1:0.2, transform: active?.id===a.id?"scale(1.3)":"scale(1)", transition:"0.3s"}}><div style={{width:22, height:22, borderRadius:"50%", border:`1px solid ${a.color}`, background:history.find(h=>h.id===a.id)?a.color+"66":"transparent"}}></div><div style={{fontSize:4, color:a.color}}>{a.id}</div></div>)}</div>

      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16, minHeight:"70vh"}}>
        {screen==="INIT" && <><div style={{fontSize:30, color:"#ffcc00", fontWeight:900}}>AVENGERS V2</div><div style={{fontSize:9, opacity:0.4, marginTop:4}}>Sequential Voice • Shopping Images • Trip Planner</div><button onClick={startRollCall} style={{marginTop:16, padding:"10px 24px", border:"1px solid #ffcc00", background:"transparent", color:"#ffcc00", borderRadius:20, cursor:"pointer"}}>INITIATE PROTOCOL</button></>}

        {screen!=="INIT" && active &&!searchMode && <div style={{textAlign:"center"}}><div style={{width:90, height:90, borderRadius:"50%", margin:"0 auto", background:`radial-gradient(circle, ${active.color}, #111)`, border:`2px solid ${active.color}`, boxShadow:`0 0 40px ${active.color}`, animation: isSpeaking?"pulse 0.8s infinite":"none"}}></div><div style={{color:active.color, marginTop:8, fontWeight:800, fontSize:12}}>{active.name} {isSpeaking?"🔊 Speaking...":""}</div><div style={{marginTop:10, background:"#111", border:`1px solid ${active.color}33`, padding:12, borderRadius:10, maxWidth:380, textAlign:"left"}}><div style={{fontSize:10, color:active.color}}>💬 SAYS:</div><div style={{fontSize:13, marginTop:4}}>{typedReply}</div></div></div>}

        {screen==="ACTIVE" &&!active &&!searchMode && (
          <div style={{width:"100%", maxWidth:700}}>
            {finalDeals.length===0 && <div style={{textAlign:"center", opacity:0.5, fontSize:12}}>Ready Boss...<br/>Try: "shop shoes" / "ticket hyd to goa with hotel" / "trip to goa"</div>}

            {finalDeals.length>0 && (
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                {finalDeals.map((d,i)=><div key={i} style={{background:"#111113", border: d.best?"2px solid #ffcc00":"1px solid #333", borderRadius:12, overflow:"hidden"}}>
                  <img src={d.img} style={{width:"100%", height:140, objectFit:"cover"}} alt="deal"/>
                  <div style={{padding:10}}>
                    <div style={{fontSize:12, fontWeight:800}}>{d.name||d.type} {d.best && "⭐ BEST"}</div>
                    <div style={{fontSize:11, opacity:0.7, marginTop:4}}>{d.details||d.desc||d.rating}</div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
                      <div><span style={{fontSize:16, fontWeight:900, color:"#00ff88"}}>{d.price}</span> {d.mrp && <span style={{fontSize:10, textDecoration:"line-through", opacity:0.5}}>{d.mrp}</span>} {d.off && <span style={{fontSize:9, background:"#ff8c00", padding:"2px 6px", borderRadius:4, marginLeft:4}}>{d.off}</span>}</div>
                      <a href={d.link||"#"} target="_blank" style={{background:"#ffcc00", color:"black", padding:"6px 12px", borderRadius:6, fontSize:10, fontWeight:900, textDecoration:"none"}}>{d.site||"VIEW"}</a>
                    </div>
                    {d.budget && <div style={{marginTop:6, fontSize:10, color:"#ff8c00"}}>Budget: {d.budget}</div>}
                    {d.type?.includes("Train") && <button onClick={()=>alert("BOOKER: Booking confirmed Boss!")} style={{marginTop:8, width:"100%", background:"#00ff88", border:"none", padding:8, borderRadius:6, fontWeight:800, cursor:"pointer"}}>OK BOOK</button>}
                  </div>
                </div>)}
              </div>
            )}
            {finalDeals.length>0 && finalDeals[0].budget && <div style={{marginTop:12, background:"#111", border:"1px solid #ff1493", padding:10, borderRadius:10}}><div style={{color:"#ff1493", fontSize:11, fontWeight:800}}>🗺️ TOTAL TRIP PLAN</div><div style={{fontSize:12, marginTop:4}}>{typedReply}</div><div style={{fontSize:10, opacity:0.6, marginTop:6}}>Estimated Total: ₹4,500 • Best Time: Oct-Feb • Includes pics above</div></div>}
          </div>
        )}
      </div>

      {screen==="ACTIVE" && (
        <div style={{display:"flex", gap:6, padding:10, borderTop:"1px solid #222", background:"#08080a", position:"sticky", bottom:0}}>
          <button onClick={startVoice} disabled={isSpeaking} style={{padding:"10px 14px", background:isListening?"#ef4444": isSpeaking?"#333":"#27272a", border:"1px solid #333", borderRadius:8, color:"white", fontWeight:800, cursor: isSpeaking?"not-allowed":"pointer"}}>{isListening?"🔴 Listening": isSpeaking?"🔇 Wait...":"🎤 VOICE"}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleOrder(input)} disabled={isSpeaking} placeholder={isSpeaking?"Wait for current agent to finish...":"Type: shop shoes / ticket hyd to goa / trip to goa"} style={{flex:1, background:"#111", border:"1px solid #333", borderRadius:8, padding:10, color:"white", opacity:isSpeaking?0.5:1}}/>
          <button onClick={()=>handleOrder(input)} disabled={isSpeaking} style={{padding:"10px 16px", background: isSpeaking?"#333":"#ffcc00", color:"black", fontWeight:900, borderRadius:8, border:"none", cursor:isSpeaking?"not-allowed":"pointer"}}>EXECUTE</button>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} @keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes scrollUp{from{transform:translateY(10px); opacity:0} to{transform:translateY(0); opacity:1}}`}</style>
    </div>
  )
}
