import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { image, type } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400 });
    }

    // Determine the schema and prompt based on the type
    let schema;
    let systemPrompt;

    if (type === 'marksheet') {
      schema = z.object({
        university: z.string(),
        studentName: z.string(),
        semester: z.string(),
        sgpa: z.number().optional(),
        cgpa: z.number().optional(),
        totalCredits: z.number().optional(),
        subjects: z.array(z.object({
          code: z.string(),
          name: z.string(),
          credits: z.number(),
          grade: z.string(),
        })),
      });
      systemPrompt = "You are an expert OCR parser. Extract the academic marksheet data from the image into the exact JSON structure provided. Be accurate with numbers and subject names.";
    } else if (type === 'resume') {
      schema = z.object({
        name: z.string(),
        email: z.string().optional(),
        skills: z.array(z.string()),
        experience: z.array(z.object({
          company: z.string(),
          role: z.string(),
          duration: z.string(),
        })),
        education: z.array(z.object({
          institution: z.string(),
          degree: z.string(),
        })),
      });
      systemPrompt = "You are an expert ATS resume parser. Extract the candidate's data from the resume image into the exact JSON structure provided.";
    } else if (type === 'timetable') {
      const { courses } = body;
      const courseList = Array.isArray(courses) ? courses.map((c: any) => `- "${c.code}" (courseId: "${c.id}", name: "${c.name}")`).join("\n") : "";
      
      const entrySchema = z.object({
        courseId: z.string(),
        type: z.enum(["LECTURE", "PRACTICAL", "LAB", "TUTORIAL"]).default("LECTURE"),
        startTime: z.string(),
        endTime: z.string(),
        room: z.string().optional(),
        batch: z.string().optional(),
        faculty: z.string().optional()
      });

      schema = z.object({
        monday: z.array(entrySchema).default([]),
        tuesday: z.array(entrySchema).default([]),
        wednesday: z.array(entrySchema).default([]),
        thursday: z.array(entrySchema).default([]),
        friday: z.array(entrySchema).default([]),
        saturday: z.array(entrySchema).default([]),
        sunday: z.array(entrySchema).default([])
      });
      
      systemPrompt = `You are an expert OCR parser. Extract the weekly timetable from the image into the exact JSON structure provided.
RULES:
1. Use ONLY the courseId values from the following list of registered courses. Do not invent courseIds. If a class doesn't match any course, skip it or use the closest match.
Registered Courses:
${courseList || "(No courses provided - do your best to extract the raw text into courseId field)"}
2. Use 24-hour time format for startTime and endTime (e.g., "08:15", "14:30").
3. If a class is for all batches, set batch to "ALL" or omit it. If it's specific (e.g., H1, H2), set the batch field.
4. Include room numbers and faculty names if visible.
5. Skip BREAK, LUNCH, or LIBRARY periods. Only include actual classes.`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid document type' }), { status: 400 });
    }

    // STEP 1: Extract Text via OCR.space Free API
    const ocrApiKey = process.env.OCR_SPACE_API_KEY || 'K88933579388957';
    
    const formData = new FormData();
    formData.append('base64image', image);
    formData.append('apikey', ocrApiKey);
    formData.append('OCREngine', '2'); // Engine 2 is generally better for tables/structured text

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR.space API Error: ${ocrResponse.statusText}`);
    }

    const ocrResult = await ocrResponse.json();
    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(`OCR Processing Failed: ${ocrResult.ErrorMessage?.join(', ')}`);
    }

    const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || "";
    
    if (!extractedText.trim()) {
      throw new Error("OCR extracted no text from the image.");
    }

    // STEP 2: Parse Extracted Text via Gemini REST API (Bypassing AI SDK to avoid versioning bugs)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }

    const geminiPayload = {
      contents: [{
        parts: [{
          text: systemPrompt + "\n\nDOCUMENT TEXT TO PARSE:\n" + extractedText
        }]
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
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        console.warn(`[Gemini Fallback] ${errorMessage}`);
        lastError = errorMessage;
        // Continue to the next model
      }
    }

    if (!generatedJsonText) {
      console.warn(`All Gemini models failed. Last error: ${lastError}`);
      return new Response(JSON.stringify({ error: "Failed to parse timetable via AI. Please verify the image or enter data manually." }), { status: 503 });
    }

    let parsedObject;
    try {
      parsedObject = JSON.parse(generatedJsonText);
    } catch (e) {
      throw new Error("Failed to parse Gemini output as JSON.");
    }

    return new Response(JSON.stringify(parsedObject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OCR Parsing Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
