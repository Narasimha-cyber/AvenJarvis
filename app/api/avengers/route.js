import { NextResponse } from "next/server";

export async function POST(req){
  try{
    const {message="Namaste", activeAgent="KRISHNA", location="Eluru, Andhra Pradesh"} = await req.json();
    const GEMINI = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const SEARCH = process.env.GOOGLE_SEARCH_API_KEY;
    const CX = process.env.GOOGLE_CX;
    const WEATHER = process.env.OPENWEATHER_API_KEY;
    const YT = process.env.YOUTUBE_API_KEY;

    if(!GEMINI) return NextResponse.json({reply:"Prabhu GEMINI key ledu - Vercel env lo add chey", status:"NO_KEY", hasKey:false});

    let realCtx = `LOCATION: ${location}. DATE: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}.\n`;

    // 1. WEATHER REAL
    if(WEATHER){
      try{
        const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER}&units=metric`);
        const wd = await w.json();
        if(wd.main) realCtx += `REAL WEATHER ${location}: ${wd.main.temp}°C, ${wd.weather[0].description}, Humidity ${wd.main.humidity}%. `;
      }catch{}
    }
    // 2. GOOGLE SEARCH REAL
    if(SEARCH && CX && message.length>3){
      try{
        const s = await fetch(`https://www.googleapis.com/customsearch/v1?key=${SEARCH}&cx=${CX}&q=${encodeURIComponent(message+" "+activeAgent)}&num=3`);
        const sd = await s.json();
        if(sd.items) realCtx += ` REAL GOOGLE SEARCH: ${sd.items.map(i=>i.title+": "+i.snippet).join(" | ").slice(0,800)} `;
      }catch{}
    }
    // 3. YOUTUBE REAL (for MUSIC/GANDHARVA)
    if(YT && activeAgent==="GANDHARVA"){
      try{
        const y = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&key=${YT}&q=${encodeURIComponent(message)}&maxResults=2&type=video`);
        const yd = await y.json();
        if(yd.items) realCtx += ` REAL YOUTUBE: ${yd.items.map(i=>i.snippet.title).join(", ")} `;
      }catch{}
    }

    const prompt = `You are ${activeAgent} from Mahabharata, in Gokulam serving Lord Krishna. User says: "${message}" from ${location}.
REAL WORLD DATA: ${realCtx}
Task: Reply as ${activeAgent} personality (KRISHNA=divine flute wisdom, DRAUPADI=shopping queen, ARJUNA=coding warrior, BHIMA=food lover, SAHADEVA=travel, NAKULA=health, KUBERA=money, VYASA=study guru, GANDHARVA=music, KARNA=fight, YUDHISHTIRA=peace). Mix Telugu+English, 150 words, mention real weather/search if available, say Prabhu, Dharmo Rakshati Rakshitah. Be Rajamouli cinematic.`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
    });
    const d = await r.json();
    if(d.error) return NextResponse.json({reply:`Gemini Error Prabhu: ${d.error.message}`, status:"GEMINI_ERR", error:d.error, realCtx});
    const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || "Kshaminchandi Prabhu";

    return NextResponse.json({reply, status:"RAJAMOULI_REAL_SUCCESS", hasKey:true, realCtxUsed: realCtx.slice(0,400), agent:activeAgent});

  }catch(e){ return NextResponse.json({reply:`Brain catch: ${e.message}`, status:"CATCH", error:e.message},{status:200}); }
}

export async function GET(){
  return NextResponse.json({
    hasKey:!!(process.env.GEMINI_API_KEY||process.env.NEXT_PUBLIC_GEMINI_API_KEY),
    keys:{GEMINI:!!process.env.GEMINI_API_KEY, GEMINI_PUBLIC:!!process.env.NEXT_PUBLIC_GEMINI_API_KEY, SEARCH:!!process.env.GOOGLE_SEARCH_API_KEY, CX:!!process.env.GOOGLE_CX, WEATHER:!!process.env.OPENWEATHER_API_KEY, YOUTUBE:!!process.env.YOUTUBE_API_KEY},
    status:"GOKULAM_BRAIN_READY"
  });
}
