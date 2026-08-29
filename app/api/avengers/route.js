import { NextResponse } from "next/server";
export async function POST(req){
  try{
    const { prompt, avenger } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{parts: [{text: `You are ${avenger}. Boss says: ${prompt}. Reply like ${avenger} in 2 lines.`}]}] })
    });
    const d = await r.json();
    if(d.error) return NextResponse.json({reply: `System Error: ${d.error.message}`});
    return NextResponse.json({reply: d.candidates?.[0]?.content?.parts?.[0]?.text || "Yes Boss! On it."});
  }catch(e){ return NextResponse.json({reply:"Yes Boss! System ready."}); }
}
