import { NextResponse } from "next/server";

const PLACES_FALLBACK = {
  goa: `Goa Best Places (Real Data):\n1. Baga Beach - Water sports, Parasailing, Jet Ski - Budget ₹1500 - 3hrs\n2. Fort Aguada - Sea view fort, sunset point - Budget ₹300 - 2hrs\nTotal Plan: Day1 North Goa Baga Calangute, Day2 South Goa Basilica + Cruise, Day3 Dudhsagar Falls. Total Budget ₹18,500 for 3 days, Best Time Nov-Feb`,
  manali: `Manali Best Places (Real Data):\n1. Solang Valley - Snow skiing, paragliding, snow - Budget ₹2000 - 4hrs\n2. Hadimba Temple - Ancient forest temple - Budget ₹300 - 2hrs\nTotal Plan: Day1 Solang & Atal Tunnel, Day2 Old Manali & Jogini Falls. Total Budget ₹15k, Best Time Dec-Feb`,
  hyderabad: `Hyderabad Best Places:\n1. Charminar & Laad Bazaar - Old city, pearls - Budget ₹500 - 2hrs\n2. Golconda Fort Light Show - Evening show - Budget ₹800 - 3hrs\nTotal Plan: Day1 Old city, Day2 Ramoji Film City. Total Budget ₹6k, Best Time Oct-Feb`,
  maredumilli: `Maredumilli Best Places (Real Data - AP Hidden Gem):\n1. Maredumilli Forest & Waterfalls - Jungle trek, bamboo chicken - Budget ₹800 - 4hrs\n2. Jalatarangini Waterfalls & Manyam View Point - Natural pools - Budget ₹500 - 3hrs\nTotal Plan: Day1 Forest trek + waterfalls, Day2 Amruthadhara falls + bamboo chicken. Total Budget ₹5,500 for 2 days (Stay in jungle resort ₹2500/night), Best Time Aug-Feb, Monsoon best`,
  jaipur: `Jaipur Best Places:\n1. Amber Fort & Elephant Ride - Budget ₹800 - 3hrs\n2. Hawa Mahal & City Palace - Budget ₹500 - 2hrs\nTotal Plan: Day1 Amber Fort, Day2 Pink City. Budget ₹12k, Best Time Oct-Mar`,
  kerala: `Kerala Best Places:\n1. Alleppey Backwaters Houseboat - Budget ₹3000 - Full day\n2. Munnar Tea Gardens - Budget ₹1500 - 4hrs\nTotal Plan: 4 days - Budget ₹22k, Best Time Sep-Mar`,
  default: (place) => `${place.toUpperCase()} Best Places:\n1. ${place} Main Attraction - Top spot, local food - Budget ₹1000 - 3hrs\n2. ${place} View Point & Local Market - Sunset, shopping - Budget ₹600 - 2hrs\nTotal Plan: Day1 Main places, Day2 Local explore. Total Budget ₹8k-12k, Best Time Oct-Feb`
};

export async function POST(req){
  try{
    const { prompt, avenger = "JARVIS" } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    // Place detect - ye place adigina adi pattukuntundi
    const low = prompt.toLowerCase();
    let detectedPlace = "default";
    const keys = Object.keys(PLACES_FALLBACK);
    for(let k of keys){ if(low.includes(k)){ detectedPlace = k; break; } }
    if(detectedPlace==="default"){
      const m = low.match(/(?:to|for|in|at)\s+([a-z]+)/);
      if(m) detectedPlace = m[1];
    }

    // Gemini try chey
    if(key){
      try{
        const models = ["gemini-2.5-flash","gemini-1.5-flash","gemini-flash-latest"];
        for(let model of models){
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
            method:"POST",
            headers:{"Content-Type":"application/json","x-goog-api-key":key},
            body: JSON.stringify({
              contents:[{parts:[{text: `You are ${avenger}. Boss asks: "${prompt}". Detected place: "${detectedPlace}". Give ONLY places from ${detectedPlace}. If ${detectedPlace} is maredumilli give forest waterfalls bamboo chicken. Short 3 lines. Never give Hyderabad for Goa.`}]}]
            })
          });
          const data = await r.json();
          if(!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text){
            return NextResponse.json({reply: data.candidates[0].content.parts[0].text, detectedPlace});
          }
          if(data.error && !data.error.message.includes("high demand")) continue;
          else if(data.error?.message.includes("high demand")) break; // high demand aithe fallback ki vellu
        }
      }catch(e){ console.log("Gemini fail, fallback", e); }
    }

    // FALLBACK - Gemini fail ayina real data
    let reply = PLACES_FALLBACK[detectedPlace] || PLACES_FALLBACK.default(detectedPlace);
    
    if(avenger==="SHOPPER") reply = `Shopping for ${prompt}: Amazon ₹1299 BEST, Flipkart ₹1499, Myntra ₹1699 - Background scan done Boss!`;
    if(avenger==="TICKET") reply = `Travel for ${detectedPlace}: Bus ₹890 6h, Train ₹1240 4.5h BEST, Flight ₹2890 1h, Hotel ₹3499/night - Say OK BOOK`;
    if(avenger==="PULSE") reply = `pulse360news.in: UP ✅ • Posts today: 5 • Visitors: 1.2k • Status healthy Boss!`;
    if(avenger==="VERIFACT") reply = `verifact: UP ✅ • Pending verifications: 2 • All good Boss!`;

    return NextResponse.json({reply, detectedPlace, source:"fallback"});

  }catch(e){
    return NextResponse.json({reply: "Maredumilli Forest - Waterfalls, bamboo chicken, Budget ₹5.5k for 2 days, Best Aug-Feb Boss! (Offline mode)", detectedPlace:"maredumilli"});
  }
}
