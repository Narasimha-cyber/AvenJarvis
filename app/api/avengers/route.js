import { NextResponse } from "next/server";
export async function POST(req){
  try{
    const { prompt, avenger } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({contents:[{parts:[{text:`You are ${avenger} avenger. Boss says: ${prompt}. Reply in 2 lines, mass Telugu+English.`}]}]})
    });
    const d = await r.json();
    return NextResponse.json({reply: d.candidates?.[0]?.content?.parts?.[0]?.text || "Yes Boss! On it."});
  }catch(e){ return NextResponse.json({reply:"Yes Boss! System ready."}); }
}
