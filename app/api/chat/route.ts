import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { memorizeUserDetail, retrieveMemories } from '@/lib/ai/memory';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the last user message to query the vector DB for context
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const memories = await retrieveMemories(lastUserMessage, 3, 0.5);
  
  const memoryContext = memories.length > 0 
    ? `Here are some relevant things you remember about the user: ${memories.map(m => m.content).join('; ')}`
    : "";

  const systemPrompt = `You are Jarvis, the Student Intelligence Operating System for GradeFlow. You are a concise, highly intelligent AI assistant focused on academic planning, career intelligence, and personal productivity. Keep responses under 3 sentences for fluid voice conversation. Do not use markdown.
${memoryContext}`;

  const result = await streamText({
    model: google('gemini-1.5-flash-latest'),
    system: systemPrompt,
    messages,
    tools: {
      memorizeUserDetail: tool({
        description: 'Call this tool when the user tells you something important about themselves that you should remember permanently (e.g., goals, study habits, target companies, specific struggles).',
        parameters: z.object({
          content: z.string().describe('A concise sentence describing what you should remember about the user.'),
        }),
        execute: async ({ content }) => {
          const success = await memorizeUserDetail(content);
          if (success) {
            return `Successfully memorized: "${content}"`;
          }
          return `Failed to memorize: "${content}"`;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
