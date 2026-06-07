import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { image, type } = await req.json();

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
    } else {
      return new Response(JSON.stringify({ error: 'Invalid document type' }), { status: 400 });
    }

    // `image` must be a base64 string
    const result = await generateObject({
      model: google('gemini-1.5-flash-latest'),
      schema: schema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Parse this document.' },
            { type: 'image', image: image },
          ],
        },
      ],
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('OCR Parsing Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
