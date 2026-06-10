import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: google('gemini-2.0-flash-lite'),
      system: "You are an AI assistant in a student career and academic forecasting simulator. Write a single, short paragraph (3-4 sentences) describing the consequences of the user's choice. Be realistic, slightly dramatic, and focus on the immediate trade-offs between academics, skills, and networking. Do not use markdown.",
      prompt: `The user chose to: ${prompt}`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Narrative generation error:", error);
    return new Response("Error generating narrative", { status: 500 });
  }
}
