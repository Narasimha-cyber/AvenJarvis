import { NextResponse } from "next/server";

// 🦚 SINGLE ROUTE - BRAIN + VOICE - MAHABHARATAM
const AGENTS = {
  KRISHNA: "Nuvvu Krishna vi - AvenJarvis brain Eluru - Dharmo Rakshati Rakshitah - Deep divine voice pitch 0.52 rate 0.48 - Telugu+English mix - Prabhu ani piluvu",
  DRAUPADI: "Nuvvu Draupadi vi - Shopping queen Eluru style",
  ARJUNA: "Nuvvu Arjuna vi - Coding warrior",
  BHIMA: "Nuvvu Bhima vi - Food expert",
  SAHADEVA: "Nuvvu Sahadeva vi - Travel gyani",
  NAKULA: "Nuvvu Nakula vi - Health expert",
  KUBERA: "Nuvvu Kubera vi - Money advisor",
  VYASA: "Nuvvu Vyasa vi - Study guru",
  GANDHARVA: "Nuvvu Gandharva vi - Music soul",
  KARNA: "Nuvvu Karna vi - Fighter",
  YUDHISHTIRA: "Nuvvu Yudhishtira vi - Peace dharma",
};

const VOICE = {
  url: "/voices/brain_intro.mp3",
  settings: { pitch: 0.52, rate: 0.48, lang: "te-IN", volume: 0.9 },
};

export async function POST(req) {
  const { message, activeAgent = "KRISHNA", location = "Eluru, AP", type } = await req.json();

  // 1. VOICE REQUEST
  if (type === "voice") {
    return NextResponse.json({
      voiceUrl: VOICE.url,
      settings: VOICE.settings,
      agent: activeAgent,
      status: "VOICE_READY",
    });
  }

  // 2. BRAIN REQUEST
  const systemPrompt = `${AGENTS[activeAgent] || AGENTS.KRISHNA} Location:${location} Theme:Mahabharatam Jarvis - face,motion,pinch,loops. Voice ${VOICE.settings.pitch} pitch. Rules: Short 100 words, ${activeAgent} la matladu.`;

  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return NextResponse.json({
      reply: `${activeAgent} Prabhu 🙏 ${location} nunchi - Dharmo Rakshati Rakshitah - "${message}" ki siddham. Voice ${VOICE.url} ready. Jarvis autonomous loops active.`,
      agent: activeAgent,
      voiceUrl: VOICE.url,
      voiceSettings: VOICE.settings,
      status: "LOCAL_BRAIN_VOICE_COMBINED",
    });
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\nUser:${message}` }] }] }),
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Kshaminchandi Prabhu.";

    return NextResponse.json({
      reply,
      agent: activeAgent,
      location,
      voiceUrl: VOICE.url,
      voiceSettings: VOICE.settings,
      features: ["brain","voice","face","motion","pinch","loops"],
    });
  } catch {
    return NextResponse.json({ reply: "Dharmo Rakshati Rakshitah Prabhu - Brain lo avarodham", agent: "KRISHNA", voiceUrl: VOICE.url, voiceSettings: VOICE.settings });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AVENJARVIS SINGLE ROUTE - BRAIN + VOICE COMBINED",
    agents: Object.keys(AGENTS),
    voice: VOICE,
    location: "Eluru, AP",
    endpoints: {
      brain: "POST {message, activeAgent}",
      voice: "POST {type:'voice', activeAgent}"
    }
  });
}
