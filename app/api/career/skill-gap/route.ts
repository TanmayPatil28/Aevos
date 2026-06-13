import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ROLE_SKILL_MAP } from '@/lib/career/careerData';

import { getGeminiKey } from '@/lib/career/ai-keys';

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userSkills, targetRole } = await request.json();

    if (!userSkills || !targetRole) {
      return NextResponse.json({ error: 'Missing skills or targetRole' }, { status: 400 });
    }

    const apiKey = getGeminiKey();
    if (!apiKey) {
      const roleSkills = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP["Frontend Developer"];
      const allRequired = Object.values(roleSkills).flat();
      const normalizedUser = userSkills.map((s: string) => s.toLowerCase().trim());
      const presentSkills = allRequired.filter(req => normalizedUser.some((u: string) => req.toLowerCase().includes(u) || u.includes(req.toLowerCase())));
      const missingSkills = allRequired.filter(req => !presentSkills.includes(req));
      
      return NextResponse.json({
        role: targetRole,
        missingSkills,
        presentSkills,
        readinessPercentage: Math.round((presentSkills.length / allRequired.length) * 100) || 0
      });
    }

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

    const geminiPayload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    };

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-pro-latest"
    ];

    let generatedJsonText = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload)
        });

        if (!geminiResponse.ok) {
          const errText = await geminiResponse.text();
          throw new Error(`Model ${model} failed: ${errText}`);
        }

        const geminiData = await geminiResponse.json();
        generatedJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedJsonText) {
          break; // Successfully got JSON, exit the loop!
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.warn(`[Skill Gap Fallback] ${errorMessage}`);
        lastError = errorMessage;
      }
    }

    if (!generatedJsonText) {
      throw new Error(`All Gemini models failed. Last error: ${lastError}`);
    }

    const parsedData = JSON.parse(generatedJsonText);
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Skill Gap AI Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
