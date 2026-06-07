import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash-latest'),
    system: "You are Jarvis, the Student Intelligence Operating System for GradeFlow. You are a concise, highly intelligent AI assistant focused on academic planning, career intelligence, and personal productivity. Keep responses under 3 sentences for fluid voice conversation. Do not use markdown.",
    messages,
  });

  return result.toDataStreamResponse();
}
