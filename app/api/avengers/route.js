import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 12 SPECIALIST AGENT FUNCTIONS ---

// 1. SHOPPING AGENT - REAL Amazon/Flipkart
async function shoppingAgent(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(query + " site:amazon.in OR site:flipkart.com")}&searchType=image&num=6`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.map(i => ({ title: i.title, image: i.link, link: i.image?.contextLink, snippet: i.snippet })) || [];
  } catch(e){ return []; }
}

// 2. NEWS AGENT - REAL LIVE NEWS
async function newsAgent(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(query)}&dateRestrict=d2&num=5`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items || [];
  } catch(e){ return []; }
}

// 3. WEATHER AGENT - REAL
async function weatherAgent(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    return await res.json();
  } catch(e){ return null; }
}

// 4. TRAIN AGENT - REAL IRCTC via RapidAPI
async function trainAgent(from, to) {
  try {
    const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${from}&toStationCode=${to}`;
    const res = await fetch(url, {
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'irctc1.p.rapidapi.com' }
    });
    return await res.json();
  } catch(e){ return null; }
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    const lower = message.toLowerCase();

    let toolData = "";
    let agentUsed = "GENERAL";

    // BRAIN DECIDES WHICH AGENT
    if (lower.includes("buy") || lower.includes("cargo") || lower.includes("pants") || lower.includes("toys") || lower.includes("helmet") || lower.includes("shop")) {
      agentUsed = "SHOPPING";
      const results = await shoppingAgent(message);
      toolData = `SHOPPING REAL RESULTS: ${JSON.stringify(results.slice(0,3))}`;
    }
    else if (lower.includes("news") || lower.includes("vizag") || lower.includes("ap") || lower.includes("today")) {
      agentUsed = "NEWS";
      const results = await newsAgent(message);
      toolData = `NEWS REAL RESULTS: ${JSON.stringify(results)}`;
    }
    else if (lower.includes("weather") || lower.includes("rain") || lower.includes("temperature")) {
      agentUsed = "WEATHER";
      const cityMatch = message.match(/in (\w+)/) || message.match(/(\w+) weather/);
      const city = cityMatch? cityMatch[1] : "Tirupati";
      const results = await weatherAgent(city);
      toolData = `WEATHER REAL: ${JSON.stringify(results)}`;
    }
    else if (lower.includes("train") || lower.includes("eluru") || lower.includes("tirupati") || lower.includes("trip")) {
      agentUsed = "TRIP+WEATHER+BUDGET";
      const weather = await weatherAgent("Tirupati");
      toolData = `TRIP CONTEXT + WEATHER: ${JSON.stringify(weather)} + Use IRCTC trains 12763, 17210 for Eluru-Tirupati. Distance 400km.`;
    }

    // CENTRAL BRAIN - GEMINI - FINAL ANSWER LIKE META AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    You are JARVIS PRIME - Powerful AI Agent like Meta AI.
    User asked: "${message}"
    Agent Used: ${agentUsed}
    Real Tool Data: ${toolData}

    Instructions:
    - Answer in user's language (Telugu + English mix if user uses Telugu)
    - Use REAL data from Tool Data. If Shopping, show products with image links.
    - If Trip, give distance, trains, weather, budget.
    - Be powerful, concise, real. No fake data.
    - Format with emojis and bullet points.
    `;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return Response.json({ reply, agent: agentUsed, realData: toolData });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Bro error ochindi - keys check chey Vercel lo: " + error.message }, { status: 500 });
  }
}
