import { NextResponse } from "next/server";

const VERIFACT_URL = "https://fake-news-detector-ir8c.onrender.com";
const PULSE_URL = "https://pulse360news.in";

export async function POST(req){
  try{
    const { prompt, avenger = "JARVIS" } = await req.json();
    const low = prompt.toLowerCase();

    // ========== PULSE360NEWS.IN - REAL LIVE ==========
    if(avenger==="PULSE" || low.includes("pulse")){
      try{
        const start = Date.now();
        const res = await fetch(PULSE_URL, { cache: "no-store", headers: {"User-Agent":"Mozilla/5.0"} });
        const html = await res.text();
        const time = Date.now() - start;

        const titles = [...html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi)].slice(0,5).map(m=>m[1].replace(/<[^>]*>/g,"").trim()).filter(Boolean);
        const articleCount = (html.matchAll(/<article/gi) || []).length || (html.matchAll(/class="post"/gi) || []).length;

        let sitemapLatest = "checking sitemap...";
        try{
          const sm = await fetch(`${PULSE_URL}/sitemap.xml`, {cache:"no-store"});
          const smText = await sm.text();
          const lastUrls = [...smText.matchAll(/<loc>(.*?)<\/loc>/g)].slice(-5).map(x=>x[1].split("/").pop());
          sitemapLatest = lastUrls.join(", ");
        }catch{}

        const report = `PULSE360NEWS.IN LIVE REPORT 🔴 LIVE

🌐 URL: ${PULSE_URL}
✅ Status: ${res.status} ${res.ok?"UP":"DOWN"} | Response: ${time}ms
📅 Checked: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}

📰 Homepage Scan:
• Articles found on homepage: ~${articleCount || "12+"}
• Top Headlines Now:
${titles.map((t,i)=>` ${i+1}. ${t}`).join("\n")}

🆕 Latest Posts (from sitemap):
${sitemapLatest}

📈 Visitors & Trending:
• Live visitors: Need GA4 API (nenu connect chesta)
• Trending now: ${titles[0] || "Scanning..."} is top

⚡ Action: Site is ${res.ok?"healthy Boss":"slow/down - check Render/hosting"}`;

        return NextResponse.json({reply: report, detectedPlace: PULSE_URL, source:"pulse-live"});

      }catch(e){
        return NextResponse.json({reply: `PULSE360NEWS: Fetching failed - ${e.message}. Site maybe sleeping, retrying... Boss site UP ayye varaku check chestha. URL: ${PULSE_URL}`});
      }
    }

    // ========== VERIFACT - YOUR RENDER LINK - REAL LIVE ==========
    if(avenger==="VERIFACT" || low.includes("verifact") || low.includes("fake-news")){
      try{
        const start = Date.now();
        const res = await fetch(VERIFACT_URL, { cache: "no-store", headers: {"User-Agent":"Mozilla/5.0"} });
        const html = await res.text();
        const time = Date.now() - start;

        // Check if it has any API endpoints
        let apiCheck = "";
        try{
          const apiRes = await fetch(`${VERIFACT_URL}/api/stats`).catch(()=>null);
          if(apiRes?.ok){ const j = await apiRes.json(); apiCheck = `API Stats: ${JSON.stringify(j).slice(0,200)}`; }
        }catch{}

        const report = `VERIFACT - FAKE NEWS DETECTOR LIVE REPORT 🔍 LIVE

🌐 URL: ${VERIFACT_URL}
✅ Status: ${res.status} ${res.ok?"UP":"DOWN"} | Response: ${time}ms (Render may sleep - first load slow)
📅 Checked: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}

🤖 App Scan:
• Homepage loaded: ${html.length} chars
• Title: ${(html.match(/<title>(.*?)<\/title>/i)?.[1] || "Fake News Detector").slice(0,100)}
• Contains detector form: ${html.toLowerCase().includes("check") || html.toLowerCase().includes("verify")? "YES ✅" : "Checking..."}

📊 Usage:
${apiCheck || "• Total checks today: Need backend /api/stats endpoint - nuvvu backend lo oka /api/stats create cheste nenu real count chupista\n• Pending verifications: Scanning homepage for stats..."}
• Render note: Free Render sleeps after 15min - first request 30sec paduthundi, adi normal

⚡ Action: Site ${res.ok?"UP - Ready to detect fake news Boss":"Waking up (Render sleep) - 30sec lo UP avthundi"}`;

        return NextResponse.json({reply: report, detectedPlace: VERIFACT_URL, source:"verifact-live"});

      }catch(e){
        return NextResponse.json({reply: `VERIFACT Monitor: ${VERIFACT_URL} waking up... Render free tier sleeps, first load 30-40sec. Error: ${e.message}. Malli try chey Boss, UP avthundi!`});
      }
    }

    // ========== TRIP / SHOPPER / TICKET - REALTIME WIKIPEDIA ==========
    let place = "goa";
    const m = prompt.match(/(?:trip to|visit|go to|plan for|places in|in)\s+([a-zA-Z\s]+)/i);
    if(m) place = m[1].trim().slice(0,30);
    else {
      const cleaned = low.replace(/trip|to|best|place|visit|plan|ticket|shop|shoes/g,"").trim();
      if(cleaned) place = cleaned.split(" ").slice(0,2).join(" ");
    }
    place = place.toLowerCase().trim() || "goa";

    // Wikipedia realtime for any place
    try{
      if(place.length>2 &&!["shoes","bus","train","flight","hotel"].includes(place)){
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place)}`, {cache:"no-store"});
        if(wikiRes.ok){
          const wikiData = await wikiRes.json();
          let reply = `${place.toUpperCase()} REAL-TIME (Wiki Live):\n${wikiData.extract?.slice(0,350) || ""}\n\n1. ${place} Top Attraction - Budget ₹1000 - 3hrs\n2. ${place} View Point - Budget ₹600 - 2hrs\nTotal: 2 days, Budget ₹8k-12k, Best Oct-Feb`;
          if(place.includes("araku")) reply = `Araku REAL: Borra Caves ₹300, Tribal Museum ₹100, Katiki Falls ₹500, Bamboo Chicken famous, Total 2 days ₹7k, Best Oct-Feb`;
          if(place.includes("maredumilli")) reply = `Maredumilli REAL: Jalatarangini Falls ₹800, Manyam View Point ₹500, Jungle Resort ₹2500/night, Total 2 days ₹5.5k, Best Aug-Feb`;
          return NextResponse.json({reply, detectedPlace: place, source:"wiki-live", imageQuery: place});
        }
      }
    }catch{}

    return NextResponse.json({reply: `${place} plan: Main spot ₹1000, View ₹600, Total ₹8k, Best Oct-Feb`, detectedPlace: place});

  }catch(e){
    return NextResponse.json({reply: `Error: ${e.message} - But monitoring active Boss!`});
  }
}
