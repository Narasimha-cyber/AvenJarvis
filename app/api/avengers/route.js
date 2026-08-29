import { NextResponse } from "next/server";
export async function POST(req){
  try{
    const { prompt, avenger } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash";
    // Google nee key ki 3.6 adugutundi kabatti rendu try cheddam
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest"];
    let d = null;
    for(const m of modelsToTry){
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{parts: [{text: `You are ${avenger}. Boss says: ${prompt}. Reply like ${avenger}.`}]}] })
      });
      d = await r.json();
      if(!d.error) break;
    }
    if(d?.error) return NextResponse.json({reply: `System Error: ${d.error.message}`});
    return NextResponse.json({reply: d.candidates?.[0]?.content?.parts?.[0]?.text || "Yes Boss! On it."});
  }catch(e){ return NextResponse.json({reply:"Yes Boss! System ready."}); }
}
