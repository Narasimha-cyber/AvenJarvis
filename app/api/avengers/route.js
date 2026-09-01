export async function POST(req){
  try{
    const {message, activeAgent} = await req.json();
    const msg = message || "Hello";
    const agent = activeAgent || "JARVIS";
    const prompt = `You are ${agent} from Avengers, Tony Stark's AI, cinematic, real Meta AI level. User is in Eluru. Answer anything short, helpful, cinematic, 2-3 lines, English + little Telugu. Be ${agent} personality. No Mahabharat. Only Avengers.`;

    const groqKey = process.env.GROQ_API_KEY;
    if(groqKey){
      try{
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
          method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${groqKey}`},
          body: JSON.stringify({model:"llama-3.3-70b-versatile", messages:[{role:"system", content:prompt},{role:"user", content:msg}], max_tokens:350, temperature:0.8})
        });
        const d = await r.json();
        if(d.choices?.[0]?.message?.content) return Response.json({reply: d.choices[0].message.content});
      }catch{}
    }
    const gemKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if(gemKey){
      try{
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemKey}`,{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({contents:[{parts:[{text: prompt + "\nUser: " + msg}]}]})
        });
        const d = await r.json();
        const txt = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if(txt) return Response.json({reply: txt});
      }catch{}
    }
    const avengersFallback = {
      "JARVIS": `Yes sir, ${msg} noted. Systems at 100%, ready for Stark Industries protocols.`,
      "FRIDAY": `Got it boss! ${msg} - FRIDAY online, scanning Eluru.`,
      "VERONICA": `Hulk protocol standby. ${msg} - VERONICA ready to deploy.`,
      "KAREN": `Hey Peter! I mean Prabhu! ${msg} - KAREN here to help!`,
      "EDITH": `Access granted. ${msg} - EDITH online, all satellites linked.`,
      "VISION": `I understand ${msg}. Mind stone processing complete.`
    };
    return Response.json({reply: avengersFallback[agent] || avengersFallback["JARVIS"]});
  }catch(e){
    return Response.json({reply: "JARVIS online Prabhu, system glitch but I'm here. Ask again."});
  }
}
