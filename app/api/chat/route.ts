import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { memorizeUserDetail, retrieveMemories } from '@/lib/ai/memory';
import { getGeminiKey } from '@/lib/ai/keys';

const google = createGoogleGenerativeAI({
  apiKey: getGeminiKey(),
});

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const chatPayloadSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system', 'data']),
    content: z.string()
  }).passthrough()),
  documentContext: z.string().optional(),
  documentFilterId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jsonBody = await req.json();
    const parsed = chatPayloadSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid payload", details: parsed.error.format() }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { messages, documentContext, documentFilterId } = parsed.data;

    // Get the last user message to query the vector DB for context
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const memories = await retrieveMemories(lastUserMessage, 3, 0.5);
    
    const memoryContext = memories.length > 0 
      ? `Here are some relevant things you remember about the user: ${memories.map(m => m.content).join('; ')}`
      : "";

    let dbDocumentContext = "";
    if (documentFilterId) {
      const { data: docMemories, error } = await supabase
        .from('user_memories')
        .select('content')
        .eq('document_id', documentFilterId);
        
      if (!error && docMemories) {
        dbDocumentContext = docMemories.map(m => m.content).join("\n\n");
      }
    }

    const finalDocContext = dbDocumentContext || documentContext;

    const docContextString = finalDocContext 
      ? `\n\nIMPORTANT DOCUMENT CONTEXT:\nYou are currently analyzing the following document. Answer the user's questions strictly based on this context if relevant.\n\n${finalDocContext}\n`
      : "";

    const systemPrompt = `You are Jarvis, the Student Intelligence Operating System for GradeFlow. You are a concise, highly intelligent AI assistant focused on academic planning, career intelligence, and personal productivity. Keep responses under 3 sentences for fluid voice conversation. Do not use markdown.
${memoryContext}${docContextString}`;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
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

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return new Response(JSON.stringify({ error: "Bad Request", details: error?.message || String(error) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
