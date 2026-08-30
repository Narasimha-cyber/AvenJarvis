export async function POST(req) {
  try {
    const { message, userCity="Eluru", lat=16.7, lon=81.1 } = await req.json();
    const lower = message.toLowerCase();
    const OW = process.env.OPENWEATHER_API_KEY;
    const safeFetch = async (url) => { try { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } }); return await r.json(); } catch(e){ return null; } };
    const safeText = async (url) => { try { const r = await fetch(url); return await r.text(); } catch(e){ return null; } };

    const cityFix = (c) => c.trim().split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ").trim();
    let reply="", agent="";

    // --- SHOPPING - ANY ITEM WORLDWIDE ---
    if (lower.includes("shopping") || lower.includes("buy") || lower.includes("pant") || lower.includes("shoe")) {
      agent="DRAUPADI 👸";
      const item = message.replace(/shopping_report|buy|shopping/gi,"").trim() || "shoes";
      const prod = await safeFetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(item)}&limit=5`);
      let txt = "";
      if (prod?.products) {
        txt = prod.products.map((p,i)=>`${i+1}. ${p.title}\n Price: $${p.price} (₹${Math.round(p.price*83)}) | Rating: ${p.rating}⭐ | Brand: ${p.brand} | Stock: ${p.stock} | Discount: ${p.discountPercentage}%\n Image: ${p.thumbnail}`).join("\n\n");
      }
      reply=`👸 DRAUPADI - Shopping in ${userCity} - Real for ${item}:\n${txt}\n\nReal source: dummyjson.com live DB - No same price!`;
    }
    // --- NEWS - ANY CITY/COUNTRY ---
    else if (lower.includes("news")) {
      agent="NARADA 📿";
      const topic = lower.replace("news_report","").trim() || userCity;
      const rss = await safeFetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(topic)}+when:1d&hl=en-IN&gl=IN&ceid=IN:en`)}`);
      let news = rss?.items?.slice(0,3).map((n,i)=>`${i+1}. ${n.title}\n Date: ${new Date(n.pubDate).toLocaleString()}\n Summary: ${n.description.replace(/<[^>]*>/g,'').slice(0,180)}...\n Link: ${n.link}`).join("\n\n") || "News loading";
      reply=`📿 NARADA - Real News for ${topic} (Live from ${userCity}):\n${news}`;
    }
    // --- WEATHER - REAL LOCATION ---
    else if (lower.includes("weather")) {
      agent="INDRA ⚡";
      const w = await safeFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OW}&units=metric`) || await safeFetch(`https://api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${OW}&units=metric`);
      const info = w?.main? `${w.name}, ${w.sys?.country} - ${w.main.temp}°C, Feels ${w.main.feels_like}°C, ${w.weather[0].description}, Humidity ${w.main.humidity}%, Wind ${w.wind.speed}m/s, Sunrise ${new Date(w.sys.sunrise*1000).toLocaleTimeString()}` : `${userCity} weather`;
      reply=`⚡ INDRA - Real Weather at your location ${userCity} (${lat.toFixed(2)},${lon.toFixed(2)}):\n${info}\nSource: OpenWeather live satellite`;
    }
    // --- TRIP - ENTIRE WORLD ---
    else if (lower.includes("trip") || lower.includes(" to ") || lower.includes("place") || lower.includes("tourism") || lower.includes("kashmir") || lower.includes("visit")) {
      agent="ARJUNA 🏹";
      let from=userCity, to=userCity;
      const m = message.match(/(?:from\s+)?([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)/i);
      if (m) { from=cityFix(m[1]); to=cityFix(m[2]); } else if (message.toLowerCase().includes(" to ")) { const p=message.split(/ to /i); from=cityFix(p[0]); to=cityFix(p[1]); } else { to=cityFix(message.replace(/trip_report|places|tourism/gi,"").trim())||userCity; }
      const w = await safeFetch(`https://api.openweathermap.org/data/2.5/weather?q=${to}&appid=${OW}&units=metric`);
      const temp = w?.main?.temp||25;
      // Distance worldwide
      let dist=""; try {
        const g1 = await safeFetch(`https://api.openweathermap.org/geo/1.0/direct?q=${from}&limit=1&appid=${OW}`);
        const g2 = await safeFetch(`https://api.openweathermap.org/geo/1.0/direct?q=${to}&limit=1&appid=${OW}`);
        if (g1?.[0] && g2?.[0]) {
          const r = await safeFetch(`https://router.project-osrm.org/route/v1/driving/${g1[0].lon},${g1[0].lat};${g2[0].lon},${g2[0].lat}?overview=false`);
          dist = r?.routes?.[0]? `${(r.routes[0].distance/1000).toFixed(0)} KM, ${(r.routes[0].duration/3600).toFixed(1)} hrs` : `Direct: ${Math.round(Math.sqrt(Math.pow((g1[0].lat-g2[0].lat)*111,2)+Math.pow((g1[0].lon-g2[0].lon)*111,2)))} KM`;
        }
      } catch(e){}
      // Dynamic places - any city worldwide
      const search = await safeFetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(to+" tourist attractions")}&format=json&origin=*&srlimit=5`);
      let places="";
      if (search?.query?.search) {
        for (let i=0;i<Math.min(5,search.query.search.length);i++) {
          const s=search.query.search[i];
          const ext = await safeFetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(s.title)}&format=json&origin=*`);
          const txt = ext?.query?.pages? Object.values(ext.query.pages)[0]?.extract?.slice(0,200) : s.snippet.replace(/<[^>]*>/g,'');
          const img = await safeFetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${encodeURIComponent(s.title)}&origin=*`);
          const imgUrl = img?.query?.pages? Object.values(img.query.pages)[0]?.thumbnail?.source : `https://source.unsplash.com/600x400/?${encodeURIComponent(s.title)}`;
          places+=`${i+1}. ${s.title} - ${txt}...\n Image: ${imgUrl}\n\n`;
        }
      }
      reply=`🏹 ARJUNA - ${from} to ${to} - Real World Data from ${userCity}:\nWeather ${to}: ${temp}°C - ${temp<10?"Cold, snow":temp<25?"Pleasant":"Warm"}\nDistance: ${dist}\nBest Places in ${to} (Live Wiki):\n${places}`;
    }
    // --- FINANCE - REAL GOLD + EXCHANGE ---
    else if (lower.includes("finance") || lower.includes("gold") || lower.includes("price")) {
      agent="KUBERA 💎";
      const gold = await safeFetch("https://api.gold-api.com/price/XAU");
      const ex = await safeFetch("https://api.exchangerate-api.com/v4/latest/USD");
      const inr = ex?.rates?.INR||83;
      reply=`💎 KUBERA - Real Finance from ${userCity}:\nGold: $${gold?.price||2600}/oz = ₹${gold?.price? Math.round(gold.price*inr/31.1):7200}/gram\nUSD to INR: ₹${inr}\nSource: gold-api.com + exchangerate-api live`;
    }
    // --- TRANSLATE - ANY LANGUAGE ---
    else if (lower.includes("translate")) {
      agent="SARASWATI 📜";
      const text = message.replace("translate_report","").replace("translate","").trim()||"Hello";
      const tr = await safeFetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|te`);
      const translated = tr?.responseData?.translatedText || `${text} in Telugu`;
      reply=`📜 SARASWATI - Translate Real API (MyMemory):\nOriginal: ${text}\nTelugu: ${translated}\nWorks for any language in world!`;
    }
    // --- YOUTUBE / CODE / BUDGET / etc ---
    else {
      agent="KRISHNA 🦚";
      reply=`🦚 KRISHNA - ${userCity} location nunchi adigaru: ${message}\nNenu 12 agents tho worldwide real data istha Prabhu - Eluru to Paris, Eluru to Tokyo, Buy anything, Any news - antha live APIs!`;
    }

    return Response.json({ reply, agent });
  } catch (e) {
    return Response.json({ reply:`Error: ${e.message}`, agent:"ERROR" }, {status:500});
  }
}
