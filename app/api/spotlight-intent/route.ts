import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { IntentCategory } from "@/lib/ai/intentRegistry";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are GradeFlow AI, the brain behind a B.Tech Student Intelligence OS.
Your job is to classify the user's input into one of the following exact intents:
- "attendance_analysis": Anything related to bunking, absence, attendance limits, classes to attend.
- "placement_analysis": Jobs, placements, career, eligibility, internships, skills.
- "academic_risk": Backlogs, failing, at-risk, passing marks, survival.
- "cgpa_calculation": Calculating SGPA, CGPA, target grades, pointers.
- "roadmap_generator": Semesters, roadmap, future planning.
- "timeline": History, timeline, past semesters.
- "unknown": If it doesn't clearly match any of the above.

Respond ONLY with a JSON object. No markdown formatting or code blocks.
Format:
{
  "intent": "category_name_here",
  "confidence": 0.0 to 1.0
}

User input: "${query}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);

    return NextResponse.json({
      intent: data.intent || "unknown",
      confidence: data.confidence || 0
    });

  } catch (error: any) {
    console.error("Spotlight Intent Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error", intent: "unknown" }, { status: 500 });
  }
}
