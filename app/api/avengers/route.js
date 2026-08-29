import { NextResponse } from "next/server";

export async function POST(req){
  try{
    const { prompt, avenger } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if(!key) return NextResponse.json({reply: "Yes Boss! Key missing in Vercel."});

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key
      },
      body: JSON.stringify({
        contents: [{parts: [{text: `You are ${avenger} from Avengers. Boss says: ${prompt}. Reply like ${avenger} in 2 lines, funny and mass.`}]}]
      })
    });

    const d = await r.json();
    if(d.error){
      console.log("Gemini Error:", d.error);
      return NextResponse.json({reply: `System Error: ${d.error.message}`});
    }
    return NextResponse.json({reply: d.candidates?.[0]?.content?.parts?.[0]?.text || "Yes Boss! On it."});
  }catch(e){
    console.log(e);
    return NextResponse.json({reply:"Yes Boss! System ready."});
  }
}
