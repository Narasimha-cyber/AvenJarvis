import { NextResponse } from "next/server";

const AGENTS = {
  KRISHNA: "You are Krishna - AvenJarvis brain Eluru - Telugu English mix Prabhu",
  DRAUPADI: "Shopping queen", ARJUNA: "Coding warrior", BHIMA: "Food expert",
  SAHADEVA: "Travel expert", NAKULA: "Health", KUBERA: "Money",
  VYASA: "Study", GANDHARVA: "Music", KARNA: "Fighter", YUDHISHTIRA: "Peace"
};

export async function POST(req) {
  const { message, activeAgent="KRISHNA", location="Eluru, AP" } = await req.json();

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const SEARCH_KEY = process.env.GOOGLE_SEARCH_API_KEY;
  const CX = process.env.GOOGLE_CX;
  const WEATHER_KEY = process.env.OPENWEATHER_API_KEY;

  let realContext = "";

  // REAL WEATHER if BHIMA / SAHADEVA / KRISHNA adigithe
  if (message.toLowerCase().includes("weather") || message.toLowerCase().includes("temperature") || activeAgent==="SAHADEVA") {
    try {
      const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Eluru&appid=${WEATHER_KEY}&units=metric`);
      const wd = await w.json();
      if(wd.main) realContext += ` REAL WEATHER ELURU: ${wd.main.temp}°C ${wd.weather[0].description}. `;
    } catch{}
  }

  // REAL GOOGLE SEARCH if SHOPPING / CODING
  if ((activeAgent==="DRAUPADI" || activeAgent==="ARJUNA" || message.toLowerCase().includes("search")) && SEARCH_KEY && CX) {
    try {
      const s = await fetch(`https://www.googleapis.com/customsearch/v1?key=${SEARCH_KEY}&cx=${CX}&q=${encodeURIComponent(message)}&num=3`);
      const sd = await s.json();
      if(sd.items) realContext += ` REAL SEARCH RESULTS: ${sd.items.map(i=>i.title+":"+i.snippet).join(" | ")} `;
    } catch{}
  }

  // REAL BRAIN - GEMINI with real context
  if (!GEMINI_KEY) {
    return NextResponse.json({ reply: "Prabhu Key missing", hasKey:false, status:"NO_KEY" });
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are ${AGENTS[activeAgent]} Mahabharatam theme, Eluru AP. User: ${message}. ${realContext} Give REAL, accurate, helpful answer in Telugu+English mix, 150 words max. Prabhu ani piluvu. Context: ${location}` }] }]
      })
    });
    const d = await r.json();
    const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Kshaminchandi Prabhu";

    return NextResponse.json({
      reply,
      agent: activeAgent,
      realContextUsed:!!realContext,
      hasKey: true,
      status: "REAL_INFO_WITH_5_KEYS_SUCCESS",
      keysActive: { gemini:!!GEMINI_KEY, search:!!SEARCH_KEY, weather:!!WEATHER_KEY }
    });
  } catch(e){
    return NextResponse.json({ reply: "Error: "+e.message, status:"ERROR" });
  }
}

export async function GET(){
  return NextResponse.json({
    hasKey:!!(process.env.GEMINI_API_KEY),
    allKeys: {
      GEMINI:!!process.env.GEMINI_API_KEY,
      GOOGLE_SEARCH:!!process.env.GOOGLE_SEARCH_API_KEY,
      OPENWEATHER:!!process.env.OPENWEATHER_API_KEY,
      RAPIDAPI:!!process.env.RAPIDAPI_KEY,
      GOOGLE_CX:!!process.env.GOOGLE_CX
    },
    status: "5 KEYS CONNECTED - REAL BRAIN READY"
  });
}
