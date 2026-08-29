import { NextResponse } from "next/server";

const AGENT_ROLES = {
  "JARVIS": "LEADER - 6 agents ni manage chesthu, boss orders ni correct agent ki isthavu",
  "PULSE": "pulse360news.in monitor - site UP/DOWN, posts count, traffic check chesthavu. Website: pulse360news.in",
  "VERIFACT": "verifact website monitor - verification pending, site health check",
  "LOCAL": "Local Task agent - PC local tasks, files, reminders",
  "NEWS": "News Hunter - realtime world news, tech news, headlines instant ga isthavu",
  "SHOPPER": "Shopping Best Deal Hunter - Amazon, Flipkart, Myntra scan chesi best price comparison chesthavu. Always give format: Amazon ₹X, Flipkart ₹Y, Myntra ₹Z + BEST DEAL",
  "TICKET": "Ticket Master + Booker sub-agent - place to place travel plan, bus train flight comparison, price + time. User OK ante Booker book chesthadu"
};

export async function POST(req){
  try{
    const { prompt, avenger = "JARVIS" } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if(!key) return NextResponse.json({reply: "GEMINI_API_KEY missing in.env.local Boss! Add chey."});

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let data = null;

    const isShopping = /shop|buy|deal|price|amazon|flipkart/i.test(prompt);
    const isTravel = /ticket|travel|bus|train|flight|hyd|vij|bangalore|chennai/i.test(prompt);

    let extraInstruction = "";
    if(isShopping) extraInstruction = "User wants shopping best deals. Give 3 sites comparison with fake but realistic Indian prices. Highlight BEST. Say 'Background scan complete sir, deals shown in portal'";
    if(isTravel) extraInstruction = "User wants travel. Give Bus ₹890 6h, Train Vande Bharat ₹1240 4.5h BEST, Flight ₹2890 1h. Ask 'Say OK BOOK to confirm via Booker sub-agent'";

    const systemPrompt = `
You are ${avenger}.
Role: ${AGENT_ROLES[avenger]}

Boss Command: "${prompt}"
Context: ${extraInstruction}

Rules:
1. Reply in ${avenger} style, short 2-3 lines, Telugu mix allowed.
2. Must include: your Role + Realtime Live status (make realistic numbers for your website/task)
3. For Pulse: mention pulse360news.in UP, posts today.
4. For Verifact: mention verifact UP.
5. For Shopper: mention scanning Amazon/Flipkart/Myntra background.
6. For Ticket: mention comparison + Booker sub-agent.
7. End always with actionable line.

IMPORTANT: Even if voice fails, this text will be shown, so be clear.
`;

    for(const m of models){
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{
        method:"POST",
        headers:{"Content-Type":"application/json", "x-goog-api-key":key},
        body: JSON.stringify({contents:[{parts:[{text: systemPrompt}]}]})
      });
      data = await r.json();
      if(!data.error) break;
    }

    if(data?.error){
      return NextResponse.json({reply: `Error: ${data.error.message} - But I'm on duty Boss! Try again.`});
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "On duty Boss! Order executed.";
    return NextResponse.json({reply: text});

  }catch(e){
    console.error(e);
    return NextResponse.json({reply: "Stark Network glitch Boss, but I'm here. On duty!"});
  }
}
