"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {id:"JARVIS", name:"JARVIS PRIME", emoji:"🧠", color:"bg-purple-600"},
  {id:"PULSE", name:"PULSE-360", emoji:"📰", color:"bg-red-600"},
  {id:"VERIFACT", name:"VERIFACT", emoji:"🛡️", color:"bg-green-600"},
  {id:"SHOPPER", name:"SHOPPER", emoji:"🛒", color:"bg-pink-600"},
  {id:"NEWS", name:"NEWS", emoji:"🌐", color:"bg-blue-600"},
  {id:"TRIP", name:"TRIP", emoji:"🗺️", color:"bg-yellow-600"},
  {id:"TICKET", name:"TICKET", emoji:"✈️", color:"bg-indigo-600"},
];

function getInstantBest(product, low){
  const m = new Date().getMonth();
  const bestPlace = [5,6,7,8].includes(m)? "Araku Valley + Maredumilli" : "Goa + Jaipur";

  if(low.includes("saree")||low.includes("chiffon")||low.includes("fabric")){
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Chiffon Saree Amazon lo ₹799 MRP ₹1999 60% OFF 4.3⭐ ide 4 sites lo kante cheapest today! Real cards kinda vastunnai Boss! 🔴 LIVE`;
  }
  if(low.includes("shoe")||low.includes("sneaker")){
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Shoes Nike ₹1299 MRP ₹2999 56% OFF best today! Real cards vastunnai! 🔴 LIVE`;
  }
  if(low.includes("phone")||low.includes("mobile")){
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Phone 5G ₹14999 best price today Flipkart lo! 🔴 LIVE`;
  }
  if(low.includes("watch")){
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Watch Titan ₹1999 40% OFF best today! 🔴 LIVE`;
  }
  if(low.includes("trip")||low.includes("visit")||low.includes("best place")){
    return `TRIP AGENT ONLINE BOSS! 🗺️ Eroju Best Place - ${bestPlace} ide ippudu velladaniki best, waterfalls full & tickets cheap today! Full info vastundi! 🔴 LIVE`;
  }
  if(low.startsWith("news")||low.includes("headlines")){
    return `NEWS AGENT ONLINE BOSS! 🌐 Eroju Best Trending - AP Monsoon Heavy Rains No.1 trending today! Full live news vastundi! 🔴 LIVE`;
  }
  if(low.includes("ticket")||low.includes("bus")||low.includes("train")||low.includes("flight")){
    return `TICKET AGENT ONLINE BOSS! ✈️ Eroju Best Booking - Train 17208 ₹280 24 seats + Hotel ₹1200 = ₹1800 combo Save ₹800 best today! Full list vastundi! 🔴 LIVE`;
  }
  if(low.includes("pulse360")){
    return `PULSE-360 AGENT ONLINE BOSS! 📰 Eroju Best Update - Site LIVE super fast & ${bestPlace} article best trending today! 🔴 LIVE`;
  }
  return `JARVIS PRIME ONLINE BOSS! 🧠 Best Today - Place ${bestPlace}, Saree ₹799 best, News trending - All best picks today! 🔴 LIVE`;
}

export default function Home(){
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([{role:"assistant", content:"Welcome Boss! 🧠 Try: chiffon sarees, shoes under 1500, trip to araku, ticket to hyd, news, pulse360news", agent:AGENTS[0]}]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [finalDeals, setFinalDeals] = useState([]);
  const chatRef = useRef(null);

  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, typingText, finalDeals]);

  const handleOrder = async (txt)=>{
    const order = txt.trim();
    if(!order) return;

    const low = order.toLowerCase();
    let targetId = "JARVIS";
    const isProduct = /(saree|chiffon|fabric|dress|kurta|shoe|sneaker|phone|mobile|watch|bag|deal|offer|under \d+)/i.test(low);
    const isTicket = low.includes("ticket") || (low.includes("bus")&&low.includes("to")) || (low.includes("train")&&low.includes("to"));

    if(low.includes("pulse360")) targetId="PULSE";
    else if(low.includes("verifact")||low.includes("fake")) targetId="VERIFACT";
    else if(isTicket) targetId="TICKET";
    else if((low.includes("trip")||low.includes("visit")||low.includes("tour")||low.includes("best place")) &&!isProduct) targetId="TRIP";
    else if(low==="news"||low.startsWith("news ")||low.includes("headlines")) targetId="NEWS";
    else if(isProduct || low.split(" ").length<=6) targetId="SHOPPER";

    const target = AGENTS.find(a=>a.id===targetId);
    setActiveAgent(target);
    setInput("");
    setFinalDeals([]);
    setMessages(prev=>[...prev, {role:"user", content:order}]);

    // BUG 1 FIX: ONLINE ANNAPPude BEST DEAL - FIRST THING
    const instantMsg = getInstantBest(order, low);
    setIsTyping(true);
    setTypingText(instantMsg);

    try{
      const res = await fetch("/api/avengers",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:order, avenger:targetId, t:Date.now(), r:Math.random()})
      });
      const data = await res.json();

      // 1.2 sec tarvata full report
      setTimeout(()=>{
        setIsTyping(false);
        setTypingText("");
        setMessages(prev=>[...prev, {role:"assistant", content:data.reply, agent:target}]);
        if(data.deals) setFinalDeals(data.deals);
      }, 1300);

    }catch(e){
      setIsTyping(false);
      setMessages(prev=>[...prev, {role:"assistant", content:"Error Boss: "+e.message, agent:target}]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="font-bold text-xl">Avengers - Boss Mode - {activeAgent.emoji} {activeAgent.name}</h1>
        <div className="flex gap-2">
          {AGENTS.map(a=>(
            <button key={a.id} onClick={()=>setActiveAgent(a)} className={`px-3 py-1 rounded text-xs ${activeAgent.id===a.id?"bg-white text-black":"bg-zinc-800"}`}>{a.emoji}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-5xl mx-auto w-full">
        {messages.map((m,i)=>(
          <div key={i} className={`${m.role==="user"?"text-right":"text-left"}`}>
            <div className={`inline-block max-w-[85%] px-4 py-3 rounded-xl ${m.role==="user"?"bg-purple-600":"bg-zinc-800"} text-sm whitespace-pre-wrap`}>
              {m.role==="assistant" && <div className="text-[10px] opacity-50 mb-1">{m.agent?.emoji} {m.agent?.name} ONLINE BOSS!</div>}
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-left">
            <div className="inline-block max-w-[85%] px-4 py-3 rounded-xl bg-zinc-800 text-sm animate-pulse">{typingText}</div>
          </div>
        )}
        {finalDeals.length>0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {finalDeals.map((d,i)=>(
              <div key={i} className={`bg-white text-black rounded-xl p-2 ${d.best?"border-4 border-green-500":""}`}>
                {d.best && <div className="bg-green-500 text-white text-[10px] px-2 py-1 rounded mb-1 inline-block">BEST TODAY</div>}
                <img src={d.image} alt="" className="h-28 w-full object-contain"/>
                <div className="font-bold text-xs mt-1 line-clamp-2">{d.title}</div>
                <div className="text-green-600 font-bold text-sm">₹{d.price} <span className="line-through text-gray-400 text-[10px]">₹{d.mrp}</span></div>
                <div className="text-[11px]">⭐ {d.rating}</div>
              </div>
            ))}
          </div>
        )}
        <div ref={chatRef}/>
      </div>

      <div className="p-4 border-t border-zinc-800 max-w-5xl mx-auto w-full flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} placeholder="Ex: chiffon fabric sarees, shoes under 1500, trip to araku, news, ticket to hyd" className="flex-1 bg-zinc-800 rounded-full px-5 py-3 text-sm outline-none"/>
        <button onClick={()=>handleOrder(input)} className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm">SEND</button>
      </div>
    </div>
  );
}
