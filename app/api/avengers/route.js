import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message="Namaste Prabhu", activeAgent="KRISHNA", location="Eluru, AP" } = body;

    const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const SEARCH_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const CX = process.env.GOOGLE_CX;
    const WEATHER_KEY = process.env.OPENWEATHER_API_KEY;

    if(!GEMINI_KEY){
      return NextResponse.json({ reply: "Prabhu Vercel lo GEMINI_API_KEY kanipinchaledu - Settings > Env lo check chey - Ippudu local reply isthunna. Eluru nunchi Dharmo Rakshati Rakshitah 🙏", status:"NO_KEY", hasKey:false });
    }

    let realContext = "";
    if(WEATHER_KEY && (message.toLowerCase().includes("weather") || activeAgent==="SAHADEVA")){
      try{ const w=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Eluru&appid=${WEATHER_KEY}&units=metric`); const wd=await w.json(); if(wd.main) realContext+=`WEATHER ELURU: ${wd.main.temp}C ${wd.weather[0].main}. `; }catch{}
    }
    if(SEARCH_KEY && CX && (activeAgent==="DRAUPADI" || activeAgent==="ARJUNA")){
      try{ const s=await fetch(`https://www.googleapis.com/customsearch/v1?key=${SEARCH_KEY}&cx=${CX}&q=${encodeURIComponent(message)}&num=2`); const sd=await s.json(); if(sd.items) realContext+=` SEARCH:${sd.items.map(i=>i.snippet).join(" ")}`; }catch{}
    }

    const prompt = `You are ${activeAgent} of AvenJarvis Mahabharatam from ${location}. User: ${message}. Context: ${realContext}. Reply in Telugu+English mix, 120 words, divine style, say Prabhu.`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const d = await r.json();
    if(d.error){ return NextResponse.json({ reply:`Prabhu Gemini Error: ${d.error.message} - Key limit ayyinda check chey`, status:"GEMINI_ERROR", error:d.error, hasKey:true }); }
    const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Kshaminchandi Prabhu - Alocisthunnanu";

    return NextResponse.json({ reply, status:"REAL_SUCCESS", hasKey:true, realContext:!!realContext });

  } catch(e){
    return NextResponse.json({ reply:`Brain Error Fix: ${e.message} - Malli try chey Prabhu`, status:"CATCH_ERROR", error:e.message }, {status:200});
  }
}

export async function GET(){
  return NextResponse.json({
    hasKey:!!(process.env.GEMINI_API_KEY||process.env.NEXT_PUBLIC_GEMINI_API_KEY),
    all: { GEMINI:!!process.env.GEMINI_API_KEY, NEXT_PUBLIC:!!process.env.NEXT_PUBLIC_GEMINI_API_KEY, SEARCH:!!process.env.GOOGLE_SEARCH_API_KEY, WEATHER:!!process.env.OPENWEATHER_API_KEY },
    status:"BRAIN ONLINE"
  });
}
