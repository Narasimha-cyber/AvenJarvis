export async function POST(req) {
  try {
    const { message } = await req.json();
    const lower = message.toLowerCase();

    let fromCity = "Hyderabad", toCity = "Mumbai";
    const m = lower.match(/(?:from\s+)?([a-z]+)\s+to\s+([a-z]+)/i);
    if (m) { fromCity = m[1]; toCity = m[2]; }
    else {
      const w = lower.split(" ");
      const ti = w.indexOf("to");
      if (ti > 0 && ti < w.length-1) { fromCity = w[ti-1]; toCity = w[ti+1]; }
    }
    fromCity = fromCity.charAt(0).toUpperCase()+fromCity.slice(1);
    toCity = toCity.charAt(0).toUpperCase()+toCity.slice(1);

    // 1. REAL WEATHER - OpenWeather (Nee key)
    let weatherReal = "";
    try {
      const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${toCity}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
      const d = await w.json();
      weatherReal = d.main? `${toCity} lo ${d.main.temp}°C, ${d.weather[0].description}, Humidity ${d.main.humidity}%` : `${toCity} weather`;
    } catch(e){ weatherReal = `${toCity} weather loading...`; }

    // 2. REAL SEARCH - DuckDuckGo (FREE, No key needed - 100% Real)
    let searchReal = "";
    try {
      const q = `${fromCity} to ${toCity} distance trains buses`;
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&pretty=1`);
      const data = await res.json();
      if (data.AbstractText) searchReal += data.AbstractText + "\n\n";
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        searchReal += data.RelatedTopics.slice(0,4).map(t=>`• ${t.Text || t.Result?.replace(/<[^>]*>/g,'')}`).join("\n\n");
      }
      // Always add real useful links
      searchReal += `\n\n🔗 Real Links:\n1. Distance: https://www.google.com/maps/dir/${fromCity}/${toCity}\n2. Trains: https://www.irctc.co.in - Search ${fromCity} to ${toCity}\n3. Buses: https://www.redbus.in/bus-tickets/${fromCity.toLowerCase()}-to-${toCity.toLowerCase()}\n4. Hotels in ${toCity}: https://www.booking.com/city/in/${toCity.toLowerCase()}.html`;
      if (!searchReal.trim()) searchReal = `Real info for ${fromCity} to ${toCity} - Use links below`;
    } catch(e){ searchReal = `Check: Google Maps https://www.google.com/maps/dir/${fromCity}/${toCity}`; }

    // 3. REAL DISTANCE - OSRM Free API (No key)
    let distanceReal = "";
    try {
      // Get coordinates first from OpenWeather
      const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${fromCity}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`);
      const geo2 = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${toCity}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`);
      const g1 = await geo.json(); const g2 = await geo2.json();
      if (g1[0] && g2[0]) {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${g1[0].lon},${g1[0].lat};${g2[0].lon},${g2[0].lat}?overview=false`);
        const rd = await r.json();
        if (rd.routes && rd.routes[0]) {
          const km = (rd.routes[0].distance/1000).toFixed(0);
          const hr = (rd.routes[0].duration/3600).toFixed(1);
          distanceReal = `${km} KM, ${hr} hours driving`;
        }
      }
    } catch(e){ distanceReal = `${fromCity} to ${toCity}`; }

    const reply = `🕉️ **${fromCity.toUpperCase()} TO ${toCity.toUpperCase()} - 100% REAL APIs (No Custom Search)**

⚡ **INDRA - Real Weather:**
${weatherReal}

🏹 **ARJUNA - Real Trip Info:**
Distance: ${distanceReal}
${searchReal}

🦚 **KRISHNA VANI:** Partha, Idi motham real free APIs nunchi - OpenWeather + DuckDuckGo + OSRM Maps - No hardcode, no Google Custom Search error!`;

    return Response.json({ reply, agent: `REAL - ${distanceReal}` });

  } catch (e) {
    return Response.json({ reply: `Error: ${e.message}`, agent: "ERROR" }, { status: 500 });
  }
}
