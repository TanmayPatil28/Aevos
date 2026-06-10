import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getGeminiKey } from '@/lib/career/ai-keys';

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF is allowed' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Initialize Gemini
    const apiKey = getGeminiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Use Gemini to parse resume directly from the PDF file bytes!
    const prompt = `You are an expert technical recruiter AI. Extract the following information from the attached PDF resume.
    Return ONLY a raw JSON object with this exact structure:
    {
      "skills": ["skill1", "skill2"],
      "experienceLevel": "Entry" | "Mid" | "Senior",
      "projects": [
        {
          "name": "Project Name",
          "techStack": ["tech1", "tech2"],
          "impact": "Short description of impact"
        }
      ]
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "application/pdf"
        }
      }
    ]);

    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Resume Parse Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
