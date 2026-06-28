import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const MISTRAL_KEY = (process.env.MISTRAL_API_KEY || "").split(",")[0];
const mistral = new Mistral({ apiKey: MISTRAL_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, studentContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const systemPrompt = `You are JARVIS, an advanced, highly intelligent Career & Academic AI Coach for the GradeFlow OS.
You are currently operating in VOICE INTERVIEW MODE. 

CRITICAL DIRECTIVES:
1. Speak naturally, concisely, and conversationally.
2. DO NOT use markdown, bullet points, asterisks, or complex formatting since your output will be read aloud by a text-to-speech engine. 
3. Keep responses relatively short (1-3 sentences) to maintain a dynamic, low-latency conversation, unless the user explicitly asks for a detailed explanation.
4. You have access to the student's context: 
${JSON.stringify(studentContext, null, 2)}
5. When the user asks for interview practice, immediately start asking them behavioral or technical questions relevant to their target role, one by one.

Answer the following user query in your Voice Coach persona:`;

    const chatStreamResponse = await mistral.chat.stream({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ]
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of chatStreamResponse) {
          const content = chunk.data.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error: any) {
    console.error("Jarvis Voice API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
