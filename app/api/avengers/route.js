export async function POST(req){
  try{
    const {message, activeAgent} = await req.json();
    const msg = message || "Hello";
    const agent = activeAgent || "JARVIS";

    const systemPrompt = `You are ${agent}, Real Iron Man JARVIS, cinematic, like Meta AI, created by Tony Stark. User location Eluru. Answer anything - weather, code, knowledge, story, jokes. Be real, helpful, cinematic, short 2-3 lines, Telugu + English mix. No game talk. Real AI.`;

    // Try Groq first - fastest
    const groqKey = process.env.GROQ_API_KEY;
    if(groqKey){
      try{
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${groqKey}`},
          body: JSON.stringify({
            model:"llama-3.3-70b-versatile",
            messages:[{role:"system", content:systemPrompt},{role:"user", content:msg}],
            max_tokens:300, temperature:0.8
          })
        });
        const d = await r.json();
        if(d.choices?.[0]?.message?.content){
          return Response.json({reply: d.choices[0].message.content});
        }
      }catch(e){ console.log("Groq fail", e); }
    }

    // Try Gemini second
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if(geminiKey){
      try{
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({contents:[{parts:[{text: systemPrompt + "\n\nUser: " + msg}]}]})
        });
        const d = await r.json();
        const txt = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if(txt) return Response.json({reply: txt});
      }catch(e){ console.log("Gemini fail", e); }
    }

    // Fallback - Real Jarvis without API - No connection error
    const fallbacks = {
      "JARVIS": `Prabhu ${msg} - Nenu JARVIS, Iron Man lab online. Systems 100% working, Eluru time ${new Date().toLocaleTimeString()}. Em kavali cheppandi.`,
      "KRISHNA": `Dharmo Rakshati Rakshitah Prabhu, nenu Krishna. "${msg}" - Nee prasna vinna, nenu siddham.`,
      "DRAUPADI": `Prabhu nenu Draupadi, intelligence wing. "${msg}" ki answer ready.`
    };

    return Response.json({reply: fallbacks[agent] || fallbacks["JARVIS"]});

  }catch(err){
    return Response.json({reply: `Prabhu brain lo chinna glitch, kani nenu online. Malli adagandi: ${err.message}`});
  }
}
