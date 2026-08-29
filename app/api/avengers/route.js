import { NextResponse } from "next/server";
export async function POST(req){
  try{
    const { prompt, avenger } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    const models = ["gemini-2.5-flash","gemini-3.6-flash","gemini-flash-latest"];
    let data=null;
    for(const m of models){
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":key},
        body: JSON.stringify({contents:[{parts:[{text:`You are ${avenger} from Avengers. Reply in character style, 2 lines max. Boss says: ${prompt}`}]}]})
      });
      data = await r.json();
      if(!data.error) break;
    }
    if(data?.error) return NextResponse.json({reply:`System Error: ${data.error.message}`});
    return NextResponse.json({reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "On duty Boss!"});
  }catch(e){ return NextResponse.json({reply:"On duty Boss!"})}
}
