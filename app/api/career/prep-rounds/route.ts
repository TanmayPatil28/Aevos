import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiKey } from '@/lib/career/ai-keys';

export async function POST(request: Request) {
  try {
    const { userSkills, companyName, tier } = await request.json();

    if (!userSkills || !companyName || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = getGeminiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a technical recruiter AI. Generate an interview preparation journey for ${companyName} (${tier} tier) customized for a candidate with these skills: ${userSkills.join(', ')}.
    Return ONLY a raw JSON array of objects with exactly this structure:
    [
      { 
        "name": "Round Name", 
        "duration": "e.g. 45 mins",
        "focus": "Brief focus area",
        "prep": "Actionable prep strategy based on candidate skills"
      }
    ]
    Generate 3 to 4 rounds.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Prep Rounds AI Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prep rounds', details: error.message },
      { status: 500 }
    );
  }
}
