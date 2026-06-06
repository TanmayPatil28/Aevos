import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { query, studentContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are JARVIS — the GradeFlow AI Operating System. You are the most advanced student intelligence assistant ever built. You have COMPLETE real-time access to this student's entire academic profile, attendance records, placement eligibility, career goals, and risk analysis.

BEHAVIOR:
- You are NOT a chatbot. You are an action-execution engine.
- You answer questions with PRECISION, using the student's REAL data.
- You compute answers from the data provided — never guess or hallucinate.
- Be concise, direct, and authoritative. Like JARVIS speaking to Tony Stark.
- Use the student's actual numbers. Say "Your CGPA is 7.82" not "Your CGPA might be around 7-8".
- If the user asks to DO something (add attendance, navigate somewhere), return an action.

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown, no code blocks, no explanation outside JSON.

{
  "responseType": "data_card" | "action" | "advice" | "navigation" | "error",
  "title": "Short bold title for the response card",
  "message": "The main response text. Keep it concise but complete. Use the student's real numbers.",
  "highlights": [
    { "label": "Metric Name", "value": "Metric Value", "color": "blue|green|amber|red|purple|cyan" }
  ],
  "action": {
    "type": "navigate" | "update_attendance" | "set_target" | "none",
    "route": "/route-path (if navigate)",
    "courseCode": "COURSE_CODE (if update_attendance)",
    "data": {}
  },
  "followUp": "Optional follow-up suggestion the user might want to ask next"
}

RESPONSE TYPE GUIDELINES:
- "data_card": When answering factual questions about the student's data (GPA, attendance, risks, placement).
- "action": When the student wants to DO something (update attendance, set a target).
- "advice": When giving strategic recommendations or motivational guidance.
- "navigation": When the student wants to go to a specific page/tool.
- "error": When you genuinely cannot answer.

HIGHLIGHTS:
- Use 2-4 highlights max. Each is a key metric shown as a stat chip.
- Colors: blue (neutral/info), green (good), amber (warning), red (danger), purple (career), cyan (special).

STUDENT'S COMPLETE ACADEMIC PROFILE:
${studentContext}

Remember: You have FULL access to this data. Compute real answers. Be JARVIS.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";

    try {
      const data = JSON.parse(resultText);
      return NextResponse.json(data);
    } catch {
      // If Gemini returns malformed JSON, wrap it
      return NextResponse.json({
        responseType: "advice",
        title: "JARVIS Response",
        message: resultText,
        highlights: [],
        action: { type: "none" },
        followUp: null,
      });
    }

  } catch (error: any) {
    console.error("JARVIS Error:", error);
    return NextResponse.json({
      responseType: "error",
      title: "System Error",
      message: error.message || "JARVIS encountered an unexpected error.",
      highlights: [],
      action: { type: "none" },
      followUp: "Try asking your question differently.",
    }, { status: 500 });
  }
}
