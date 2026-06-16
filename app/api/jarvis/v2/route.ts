import { jarvisAgent } from "@/lib/ai/agents/jarvis";
import { saveMessage, getRecentConversationContext } from "@/lib/ai/chatMemory";
import { getGeminiKey } from "@/lib/ai/keys";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";

const jarvisPayloadSchema = z.object({
  query: z.string().min(1),
  studentContext: z.string().optional(),
  sessionId: z.string().optional().default("default-session"),
  mode: z.enum(["text", "voice"]).optional().default("text"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "127.0.0.1";
  
  const limitResult = rateLimit(ip, 30, 60000);
  if (!limitResult.success) {
    return new Response(
      JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded. Please try again in a minute." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const jsonBody = await req.json();
    const parsed = jarvisPayloadSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: parsed.error.format() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { query, studentContext, sessionId, mode } = parsed.data;

    // 1. Persist the incoming user message
    await saveMessage(user.id, sessionId, "user", query);

    // 2. Build the full context
    const memoryContext = await getRecentConversationContext(user.id, sessionId, 10);
    let fullPrompt = `
STUDENT'S COMPLETE ACADEMIC PROFILE:
${studentContext || "No profile provided."}

RECENT CONVERSATION HISTORY (Last 10 turns):
${memoryContext}

USER'S LATEST MESSAGE: 
${query}
`;

    if (mode === "voice") {
      fullPrompt += "\n\nVOICE MODE ACTIVE: Keep responses under 3 sentences for fluid voice conversation. Do not use markdown.\n";
    }

    // Ensure the key is available for Mastra (using our rotation util)
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = getGeminiKey();

    // 3. Process via Mastra Agent
    // We use .generate() to ensure we fully execute and capture tool calls before streaming
    // the text. This guarantees the UI metadata chunk includes the tool actions.
    const result = await jarvisAgent.generate(fullPrompt, { maxSteps: 5 });

    const message = result.text || "";
    let action: any = { type: "none" };
    let highlights: any[] = [];

    // Map Mastra tool calls to Jarvis UI actions
    if (result.toolResults && result.toolResults.length > 0) {
      for (const tr of result.toolResults) {
        // Mastra v1.41.0 wraps tool results in a `payload` object
        const toolAction = (tr as any).payload?.result?.action || (tr as any).result?.action;
        if (toolAction) {
          action = toolAction;
        }
      }
    }

    // 4. Persist the assistant's response
    await saveMessage(user.id, sessionId, "assistant", message, { action });

    // 5. Build the UI metadata
    const metadata = {
      responseType: action.type !== "none" ? "action" : "data_card",
      title: "JARVIS",
      highlights,
      action,
      followUp: null,
      suggestedActions: [],
    };

    // 6. Stream identically to the existing API
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // First chunk: metadata JSON line
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "metadata", ...metadata }) + "\n")
          );

          // Stream the message word-by-word
          const words = message.split(/(\s+)/); // preserve whitespace tokens
          for (const word of words) {
            if (word.length === 0) continue;
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "chunk", text: word }) + "\n"
              )
            );
            // Small delay to simulate natural typing cadence (simulating real streaming)
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          // Final chunk: signal completion
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "done" }) + "\n")
          );
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Stream processing failed";
          console.error("JARVIS v2 stream error:", errorMessage);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                message: errorMessage,
              }) + "\n"
            )
          );
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("JARVIS v2 Error:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
