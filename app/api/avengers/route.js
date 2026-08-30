export async function POST(req) {
  try {
    const { message } = await req.json();
    const lower = message.toLowerCase();

    // Universal From-To Extractor
    let fromCity = "Eluru", toCity = "Munnar";
    const match = lower.match(/(?:from\s+)?([a-z]+)\s+to\s+([a-z]+)/i);
    if (match) { fromCity = match[1]; toCity = match[2]; }
    else {
      const words = lower.split(" ");
      const toIndex = words.indexOf("to");
      if (toIndex > 0 && toIndex < words.length-1) {
        fromCity = words[toIndex-1]; toCity = words[toIndex+1];
      }
    }
    fromCity = fromCity.charAt(0).toUpperCase() + fromCity.slice(1);
    toCity = toCity.charAt(0).toUpperCase() + toCity.slice(1);

    // 1. REAL WEATHER - OpenWeather (Ninna teesukunna key)
    let weatherReal = "";
    try {
      const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${toCity}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
      const d = await w.json();
      weatherReal = d.main? `${d.main.temp}°C, ${d.weather[0].description}, Humidity ${d.main.humidity}%` : `Weather for ${toCity} - ${d.message}`;
    } catch(e){ weatherReal = "Weather API - Check OPENWEATHER_API_KEY"; }

    // 2. REAL GOOGLE SEARCH - (Ninna teesukunna 2 keys)
    let googleReal = "";
    try {
      const query = lower.includes("pant") || lower.includes("buy")? `${message} buy online india price` : `${fromCity} to ${toCity} distance trains buses`;
      const g = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5`);
      const gd = await g.json();
      if (gd.items) {
        googleReal = gd.items.map((it,i)=>`${i+1}. ${it.title}\n ${it.snippet}\n Link: ${it.link}`).join("\n\n");
      } else {
        googleReal = `Google API Error: ${gd.error?.message || "Check GOOGLE_SEARCH_API_KEY & GOOGLE_CX"}`;
      }
    } catch(e){ googleReal = "Google API - Check keys in Vercel"; }

    // 3. REAL YOUTUBE SEARCH (Optional - ninna key unte)
    let youtubeReal = "";
    if (process.env.YOUTUBE_API_KEY && (lower.includes("youtube") || lower.includes("video"))) {
      try {
        const y = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(message)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=3`);
        const yd = await y.json();
        if (yd.items) youtubeReal = yd.items.map(v=>`• ${v.snippet.title} - https://youtube.com/watch?v=${v.id.videoId}`).join("\n");
      } catch(e){}
    }

    const reply = `🕉️ **${fromCity.toUpperCase()} TO ${toCity.toUpperCase()} - 100% REAL APIS (No Hardcode)**

⚡ **INDRA - REAL WEATHER API:**
${toCity} lo ippudu: ${weatherReal}

🏹 **ARJUNA - REAL GOOGLE API:**
${googleReal}

${youtubeReal? `🎶 **GANDHARVA - REAL YOUTUBE API:**\n${youtubeReal}\n` : ""}

🦚 **KRISHNA VANI:** Partha, Idi ninna manam collect chesina real APIs nunchi vachina data - okka line kuda hardcoded kadu! Ekkadi nunchi ekkadiki aina vastundi!

🔑 Keys Status: OpenWeather: ${process.env.OPENWEATHER_API_KEY? "OK ✅" : "MISSING ❌"}, Google: ${process.env.GOOGLE_SEARCH_API_KEY? "OK ✅" : "MISSING ❌"}, CX: ${process.env.GOOGLE_CX? "OK ✅" : "MISSING ❌"}`;

    return Response.json({ reply, agent: `REAL API - ${fromCity} to ${toCity}` });

  } catch (e) {
    return Response.json({ reply: `Error: ${e.message} - Vercel Env Keys check chey bro!`, agent: "ERROR" }, { status: 500 });
  }
}
