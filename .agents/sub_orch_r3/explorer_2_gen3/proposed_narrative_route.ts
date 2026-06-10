import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      system: "You are an AI career and academic advisor. Based on the following scenario, provide a brief narrative (1 paragraph) about the immediate consequences of this decision on the student's academic standing and career readiness.",
      prompt: `Scenario: ${prompt}`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Narrative generation error:", error);
    return new Response("Error generating narrative", { status: 500 });
  }
}
