export async function POST(req) {
  try {
    const { message } = await req.json();
    const lower = message.toLowerCase();

    let agentTag = "KRISHNA-BRAIN";
    let reply = "";
    let weatherData = null;

    // --- REAL WEATHER FETCH (Your key works) ---
    try {
      const city = lower.includes("manali")? "Manali" : lower.includes("eluru")? "Eluru" : lower.includes("tirupati")? "Tirupati" : lower.includes("vizag")? "Visakhapatnam" : "Hyderabad";
      const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
      weatherData = await wRes.json();
    } catch(e) {}

    // --- 12 YODHAS LOGIC ---
    if (lower.includes("trip") || lower.includes("yatra") || lower.includes("eluru") || lower.includes("manali") || lower.includes("tirupati")) {
      agentTag = "ARJUNA + INDRA + KUBERA + VIDURA";
      const from = lower.includes("eluru")? "Eluru" : "Hyderabad";
      const to = lower.includes("manali")? "Manali" : lower.includes("tirupati")? "Tirupati" : "Destination";
      const temp = weatherData?.main?.temp || "27";
      const cond = weatherData?.weather?.[0]?.description || "divya megha";
      const humidity = weatherData?.main?.humidity || "65";

      reply = `🕉️ **${from} to ${to} MAHA YATRA PLAN - By DHARMA**

⚡ **INDRA (Weather) Reported:** Prabhu, ${to} lo ${temp}°C, ${cond}, Humidity ${humidity}% - Yatra ki anukulam!

🏹 **ARJUNA (Trip) Reported:**
• Marga: ${from} -> Delhi -> ${to}
• Rathas: 12763 Padmavathi, 20889 Vande Bharat, Delhi nunchi HRTC Bus
• Doora: 2100km, Samaya: 2 Divasalu

💎 **KUBERA (Finance) Reported:**
• Sleeper Ratha: ₹1,800 Dhana
• 3AC Ratha: ₹3,200
• Dharmashala (Hotel): ₹1,500 x 3 Ratri = ₹4,500
• Anna & Sanchara: ₹3,000
• Total Kosh: ₹9,500 - ₹12,000

⚖️ **VIDURA (Niti) Reported:** Uttama Samaya: September-November. Himavahana Manali lo atyanta sundara.

🦚 **KRISHNA VANI:** Partha, Eluru nunchi Manali Maha Yatra ki sannahanga avvu! Jacket, Danda, Bhakti tho pryana sagu! Sarvam Krishnarpanam!`;

    } else if (lower.includes("buy") || lower.includes("shop") || lower.includes("cargo") || lower.includes("pants") || lower.includes("vastra") || lower.includes("krayam")) {
      agentTag = "DRAUPADI";
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(message + " buy")}&num=4`;
        const res = await fetch(url);
        const data = await res.json();
        const items = data.items?.map((i, idx) => `${idx+1}. 👗 ${i.title}\n Link: ${i.link}`).join("\n\n") || "• Amazon, Flipkart lo divya vastralu labhyam";
        reply = `👸 **DRAUPADI (Vastra Sampada) Reported:**\nPrabhu, Nee korika meraku:\n\n${items}\n\n🦚 Krishna Vani: Vastra sampada samruddhi ki prateeka!`;
      } catch(e){
        reply = `👸 DRAUPADI: Prabhu, Vastra krayam kosam Amazon/Flipkart lo chudu - Uttama dhara lo labhyam!`;
      }

    } else if (lower.includes("weather") || lower.includes("varsha") || lower.includes("vizag")) {
      agentTag = "INDRA";
      const temp = weatherData?.main?.temp || "28";
      const cond = weatherData?.weather?.[0]?.description || "megha";
      const city = weatherData?.name || "Loka";
      reply = `⚡ **INDRA DEVA (Megha Adhipati) Reported:**\nPrabhu! ${city} lo ippudu ${temp}°C, ${cond}\nHumidity: ${weatherData?.main?.humidity}%\nVayu Vegam: ${weatherData?.wind?.speed} m/s\n\nYatra ki shubha muhurtham! 🕉️`;

    } else if (lower.includes("news") || lower.includes("varta")) {
      agentTag = "NARADA";
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(message)}&num=3`;
        const res = await fetch(url);
        const data = await res.json();
        const news = data.items?.map(i => `• ${i.title}`).join("\n") || "Loka vartalu";
        reply = `📿 **NARADA MUNI (Loka Sanchari) Reported:**\nNarayana Narayana! Loka Vartalu:\n\n${news}`;
      } catch(e){ reply = `📿 NARADA: Narayana! Vartalu prapti lo vilambam...`; }

    } else {
      agentTag = "KRISHNA-PARAMATMA";
      reply = `🦚 **KRISHNA PARAMATMA VANI:**\n\nPartha, Nee Aagya: "${message}"\n\nNenu 12 Yodhas tho siddham:\n👸 Draupadi - Vastra\n📿 Narada - Varta\n⚡ Indra - Varsha\n🏹 Arjuna - Yatra\n💎 Kubera - Dhana\n🦚 Krishna - Marga\n🎶 Gandharva - Gana\n💪 Bheema - Bala\n⚖️ Vidura - Niti\n🔮 Sahadeva - Jyotisha\n📜 Saraswati - Vani\n🛠️ Vishwakarma - Srishti\n\nPunah Adugu Prabhu! Sarvam Krishna Mayam! 🕉️`;
    }

    return Response.json({ reply, agent: agentTag });

  } catch (error) {
    return Response.json({ reply: `Kshamya Prabhu, Maya jaalam... Error: ${error.message} 🕉️`, agent: "ERROR" }, { status: 500 });
  }
}
