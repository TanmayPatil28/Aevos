import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ROLE_SKILL_MAP } from '@/lib/career/careerData';

import { getGeminiKey } from '@/lib/career/ai-keys';

export async function POST(request: Request) {
  try {
    const { userSkills, targetRole } = await request.json();

    if (!userSkills || !targetRole) {
      return NextResponse.json({ error: 'Missing skills or targetRole' }, { status: 400 });
    }

    const apiKey = getGeminiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const roleSkills = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP["Frontend Developer"];
    const allRequired = Object.values(roleSkills).flat();

    const prompt = `You are a career intelligence engine. Analyze the user's skills against the target role requirements using semantic matching.
    Target Role: ${targetRole}
    Required Skills: ${allRequired.join(", ")}
    User Skills: ${userSkills.join(", ")}

    Determine which required skills the user possesses (even if the wording is different but semantically equivalent, e.g. "React" = "ReactJS", "Next.js" satisfies "React" etc).
    Return ONLY a raw JSON object with this exact structure:
    {
      "role": "${targetRole}",
      "presentSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3", "skill4"],
      "readinessPercentage": 85
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean markdown if present
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Skill Gap AI Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill gap', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
