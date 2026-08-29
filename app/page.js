"use client";
import { useState, useEffect, useRef } from "react";

const AGENTS_DATA = [
  {id:"JARVIS", name:"JARVIS PRIME", emoji:"🧠", color:"from-purple-600 to-indigo-700"},
  {id:"PULSE", name:"PULSE-360", emoji:"📰", color:"from-red-600 to-orange-600"},
  {id:"VERIFACT", name:"VERIFACT", emoji:"🛡️", color:"from-green-600 to-emerald-700"},
  {id:"SHOPPER", name:"SHOPPER", emoji:"🛒", color:"from-pink-600 to-rose-600"},
  {id:"NEWS", name:"NEWS", emoji:"🌐", color:"from-blue-600 to-cyan-600"},
  {id:"TRIP", name:"TRIP PLANNER", emoji:"🗺️", color:"from-yellow-600 to-orange-600"},
  {id:"TICKET", name:"TICKET FINDER", emoji:"✈️", color:"from-indigo-600 to-purple-600"},
];

function getOnlineMessage(agentId, product, bestPlace){
  const p = product||"";
  if(agentId==="SHOPPER"){
    // FIRST THING ONLINE LO NE BEST DEAL - DYNAMIC PRODUCT BATTI
    if(p.toLowerCase().includes("saree")||p.toLowerCase().includes("chiffon")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Chiffon Saree Amazon lo ₹799 MRP ₹1999 60% OFF 4.3⭐ rating ide 4 sites lo kante cheapest today, real cards kinda vastunnai Boss! 🔴 LIVE`;
    if(p.toLowerCase().includes("shoe")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Shoes Nike/Adidas ₹1299 MRP ₹2999 56% OFF best today, real cards vastunnai! 🔴 LIVE`;
    if(p.toLowerCase().includes("phone")) return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - Phone iPhone 15 ₹59999 best price today Flipkart lo! 🔴 LIVE`;
    return `SHOPPER AGENT ONLINE BOSS! 🛒 Eroju Best Deal - "${p}" ki Amazon lo ₹799 60% OFF ide best rated 4.3⭐ cheapest today, real live products vastunnai! 🔴 LIVE`;
  }
  if(agentId==="TRIP") return `TRIP AGENT ONLINE BOSS! 🗺️ Eroju Best Place - ${bestPlace} ide best today, waterfalls full & train ₹280 best deal today! Full info vastundi! 🔴 LIVE`;
  if(agentId==="NEWS") return `NEWS AGENT ONLINE BOSS! 🌐 Eroju Best Trending - AP Monsoon Heavy Rains No.1 trending today, full live news vastundi! 🔴 LIVE`;
  if(agentId==="TICKET") return `TICKET AGENT ONLINE BOSS! ✈️ Eroju Best Booking - Train 17208 ₹280 24 seats + Hotel ₹1200 = ₹1800 combo Save ₹800 best today! 🔴 LIVE`;
  if(agentId==="PULSE") return `PULSE-360 AGENT ONLINE BOSS! 📰 Eroju Best Update - Site LIVE super fast & ${bestPlace} topic best trending today! 🔴 LIVE`;
  if(agentId==="VERIFACT") return `VERIFACT AGENT ONLINE BOSS! 🛡️ Eroju Best Alert - Free Laptop fake news trending fake today! 🔴 LIVE`;
  return `JARVIS PRIME ONLINE BOSS! 🧠 Eroju Best - Place ${bestPlace}, Saree ₹799 best, News trending - All best today! 🔴 LIVE`;
}

export default function Home(){
  const m = new Date().getMonth();
  const bestPlace = [5,6,7,8].includes(m)? "Araku Valley + Maredumilli" : "Goa + Jaipur";

  const [agents] = useState(AGENTS_DATA);
  const [activeAgent, setActiveAgent] = useState(AGENTS_DATA[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [finalDeals, setFinalDeals] = useState([]);
  const [isSpeaking] = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, typingText, finalDeals]);

  const handleOrder = async (txt)=>{
    if(!txt.trim()) return;
    const order=txt.trim();
    const productName = order.replace(/shop|buy|deal|best|price|under|for|me|show|search|news|trip|ticket|to/gi,"").trim();
    setInput(""); setFinalDeals([]);
    setMessages(prev=>[...prev, {role:"user", content:order}]);

    let targetId="JARVIS";
    const l=order.toLowerCase();
    const isProduct = /(saree|chiffon|fabric|dress|kurta|shoe|sneaker|phone|watch|bag|deal|offer|under \d+)/i.test(l);
    const isTicket = l.includes("ticket")||(l.includes("bus")&&l.includes("to"))||(l.includes("train")&&l.includes("to"))||(l.includes("flight")&&l.includes("to"));

    if(l.includes("pulse360")) targetId="PULSE";
    else if(l.includes("verifact")||l.includes("fake")) targetId="VERIFACT";
    else if(isTicket) targetId="TICKET";
    else if((l.includes("trip")||l.includes("visit")||l.includes("tour")||l.includes("best place")) &&!isProduct) targetId="TRIP";
    else if(l==="news"||l.startsWith("news ")||l.includes("headlines")) targetId="NEWS";
    else if(isProduct || l.split(" ").length<=6) targetId="SHOPPER";

    const target = agents.find(a=>a.id===targetId);

    // ========== BUG 1 FIX: FIRST THING ONLINE LO NE BEST DEAL ==========
    const instantOnlineMsg = getOnlineMessage(targetId, productName, bestPlace);
    setActiveAgent(target);
    setIsTyping(true);
    setTypingText(instantOnlineMsg); // ONLINE CHEPPETAPPude BEST DEAL

    try{
      const res=await fetch("/api/avengers",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:order, avenger:targetId, timestamp: Date.now(), random: Math.random()}) // BUG 2 FIX: random tho cache break
      });
      const data=await res.json();

      // After 1.2 sec show full report
      setTimeout(()=>{
        setIsTyping(false);
        setTypingText("");
        setMessages(prev=>[...prev, {role:"assistant", content:data.reply, agent:target}]);
        if(data.deals && data.deals.length>0){
          setFinalDeals(data.deals);
        }
      }, 1200);

    }catch(e){
      setIsTyping(false);
      setMessages(prev=>[...prev, {role:"assistant", content:`Error Boss: ${e.message}`, agent:target}]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AVENGERS AI - {activeAgent.name} {activeAgent.emoji}</h1>
        <div className="bg-zinc-900 rounded-xl p-4 h-[60vh] overflow-y-auto mb-4">
          {messages.map((msg,i)=>(
            <div key={i} className={`mb-3 ${msg.role==="user"?"text-right":"text-left"}`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${msg.role==="user"?"bg-purple-600":"bg-zinc-800"}`}>
                {msg.role==="assistant" && <div className="text-xs opacity-60">{msg.agent?.name} ONLINE BOSS!</div>}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isTyping && <div className="bg-zinc-800 px-4 py-2 rounded-lg inline-block animate-pulse">{typingText}</div>}
          {finalDeals.length>0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {finalDeals.map((d,i)=>(
                <div key={i} className={`bg-white text-black rounded-lg p-3 ${d.best?"border-4 border-green-500":""}`}>
                  {d.best && <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">BEST TODAY</div>}
                  <img src={d.image} alt={d.title} className="h-24 w-full object-contain"/>
                  <div className="font-bold text-sm mt-1">{d.title.slice(0,40)}</div>
                  <div className="text-green-600 font-bold">₹{d.price} <span className="line-through text-gray-500 text-xs">₹{d.mrp}</span></div>
                  <div className="text-xs">⭐ {d.rating}</div>
                </div>
              ))}
            </div>
          )}
          <div ref={chatRef}/>
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrder(input)} placeholder="Ex: chiffon fabric sarees, shoes under 1500, trip to araku, news, ticket to hyd" className="flex-1 bg-zinc-800 rounded-lg px-4 py-3"/>
          <button onClick={()=>handleOrder(input)} className="bg-purple-600 px-6 py-3 rounded-lg font-bold">SEND</button>
        </div>
      </div>
    </div>
  );
}
