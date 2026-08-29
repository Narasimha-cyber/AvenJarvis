import { NextResponse } from "next/server";

const AGENT_ROLES = {
  "JARVIS": "LEADER - You manage all 7 agents",
  "PULSE": "You monitor pulse360news.in - Check site status",
  "VERIFACT": "You monitor verifact website - verification status",
  "LOCAL": "Local Task Agent - PC tasks",
  "NEWS": "News Hunter - Real time news",
  "SHOPPER": "Shopping Agent - You find best deals from Amazon Flipkart Myntra",
  "TICKET": "Ticket Master - Bus Train Flight Hotel price comparison",
  "TRIP": "Trip Guide - You are expert travel planner"
};

export async function POST(req){
  try{
    const { prompt, avenger = "JARVIS" } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if(!key) return NextResponse.json({reply: "GEMINI_API_KEY missing Boss!"});

    const rawPlace = prompt.toLowerCase();

    // PLACE EXTRACTION - ye place adigado pattuko
    let detectedPlace = "general";
    const placeRegex = /(?:trip to|visit|go to|plan for|in)\s+([a-zA-Z\s]+)/i;
    const match = prompt.match(placeRegex);
    if(match) detectedPlace = match[1].trim();
    else {
      // direct place names detect
      const knownPlaces = ["goa","manali","hyderabad","bangalore","delhi","mumbai","chennai","kolkata","jaipur","kerala","udaipur","shimla","leh","ladakh","ooty","mysore","pondicherry","andaman"];
      for(let p of knownPlaces){ if(rawPlace.includes(p)){ detectedPlace = p; break; } }
      if(detectedPlace==="general" && rawPlace.includes("to")) {
        detectedPlace = rawPlace.split("to").pop().trim().split(" ").slice(0,2).join(" ");
      }
    }

    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let data = null;

    // STRICT PROMPT - Place ki place ke ivvali
    const systemPrompt = `
You are ${avenger} - ${AGENT_ROLES[avenger]}

Boss Command: "${prompt}"
Detected Location: "${detectedPlace}"

CRITICAL RULES - MUST FOLLOW:
1. If boss asks "trip to ${detectedPlace}" or "best places in ${detectedPlace}" - You MUST give ONLY places from ${detectedPlace} itself.
2. NEVER give Hyderabad Charminar/Golconda if user asked Goa/Manali/Delhi etc.
3. NEVER mix places. If Goa asked, give ONLY Goa: Baga Beach, Calangute, Fort Aguada, Dudhsagar, Anjuna etc.
4. If Manali asked, give ONLY Manali: Solang Valley, Hadimba Temple, Rohtang Pass etc.
5. If ${detectedPlace} is unknown place, search your knowledge and give 2 best places ONLY from ${detectedPlace}.

For TRIP agent response format EXACTLY:
Place 1: [Name] - [1 line description] - Budget ₹X - Time 2hrs
Place 2: [Name] - [1 line description] - Budget ₹Y - Time 3hrs
Total Plan: Day1..., Day2..., Total Budget ₹Z, Best Time: Oct-Feb

For SHOPPER: Give Amazon ₹, Flipkart ₹, Myntra ₹ with BEST tag
For TICKET: Give Bus, Train, Flight, Hotel with prices for ${detectedPlace} route only

Keep reply short 3-4 lines, Telugu mix ok, but place names 100% accurate for ${detectedPlace}.
If you don't know ${detectedPlace}, say "I will find best places in ${detectedPlace}" but still try with your knowledge.

Current request is strictly about: ${detectedPlace.toUpperCase()}
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
      console.error(data.error);
      return NextResponse.json({reply: `Error: ${data.error.message} - But ${detectedPlace} plan ready Boss, try again.`});
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || `Trip plan for ${detectedPlace} ready Boss!`;

    // extra check - if Goa asked but reply contains Charminar, force correction
    let finalReply = text;
    if(detectedPlace.includes("goa") && /charminar|golconda|hyderabad/i.test(text)){
      finalReply = `Goa Best Places:\n1. Baga Beach - Water sports, sunset - Budget ₹1500\n2. Fort Aguada - Sea fort view - Budget ₹300\nTotal Plan: Day1 North Goa beaches, Day2 South Goa churches & sunset cruise, Total Budget ₹18,500, Best Time Nov-Feb`;
    }
    if(detectedPlace.includes("manali") && /charminar|goa.*beach/i.test(text)){
      finalReply = `Manali Best Places:\n1. Solang Valley - Snow skiing, paragliding - Budget ₹2000\n2. Hadimba Temple - Old forest temple - Budget ₹300\nTotal Plan: Day1 Solang & Atal Tunnel, Day2 Old Manali, Total Budget ₹15k, Best Time Dec-Feb`;
    }

    return NextResponse.json({reply: finalReply, detectedPlace});

  }catch(e){
    console.error(e);
    return NextResponse.json({reply: "Network glitch Boss, but place detection active!"});
  }
}
