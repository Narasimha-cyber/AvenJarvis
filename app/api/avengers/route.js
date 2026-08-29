import { NextResponse } from "next/server";

const AGENT_ROLES = {
  JARVIS: "Prime Orchestrator, controls all 19 agents",
  FRIDAY: "Daily Intelligence, gives morning briefs",
  ORACLE: "Automation Engine, handles workflows",
  ZEUS: "Sales Pipeline, 1528 leads, revenue tracker",
  STARK: "Project Manager, tracks all builds",
  STEVE: "Build Ops, ships clean builds",
  HERALD: "Transcription, Whisper Prime meeting transcriber",
  VISION: "Intelligent Watch, monitors all feeds",
  BANNER: "Medical Intelligence, diagnostics",
  ULTRON: "Security, perimeter secured",
  HERCULES: "Fitness & Vision, body scan & nutrition"
};

export async function POST(req){
  try{
    const { prompt, avenger = "JARVIS" } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if(!key) return NextResponse.json({reply: "GEMINI_API_KEY missing in.env Boss!"});

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let data = null;

    const systemPrompt = `
You are ${avenger} from Avengers.
Role: ${AGENT_ROLES[avenger] || "Avenger Agent"}.
Boss says: "${prompt}"

Rules:
1. Reply in ${avenger} character style, max 2 lines.
2. Always add 1 line Role explanation and 1 line Realtime live status like video.
3. If Boss says buy/shop/news/ticket/book - say "Opening ${prompt} portal sir" and we will handle search.
4. End with "On duty Boss" or your style.

Format:
[In-character reply]
ROLE: ${AGENT_ROLES[avenger]}
LIVE: [make a realistic live update with numbers for your role]
`;

    for(const m of models){
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{
        method:"POST",
        headers:{"Content-Type":"application/json", "x-goog-api-key":key},
        body: JSON.stringify({contents:[{parts:[{text: systemPrompt}]}]})
      });
      data = await r.json();
      if(!data.error) break; // success ayithe break
    }

    if(data?.error) return NextResponse.json({reply: `System Error: ${data.error.message} - On duty Boss!`});

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "On duty Boss!";
    return NextResponse.json({reply: text});

  }catch(e){
    console.log(e);
    return NextResponse.json({reply: "On duty Boss! Stark network glitch, but I'm here."});
  }
}
