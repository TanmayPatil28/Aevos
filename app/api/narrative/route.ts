import { narrativeAgent } from '@/lib/ai/agents/narrativeAgent';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await narrativeAgent.generate(prompt);

    // Mastra result.text is the string. But we want to simulate the stream for the UI, 
    // or just return the text. Wait, the frontend might expect a Vercel AI SDK text stream.
    // The previous mock used: x-vercel-ai-data-stream: v1 and format `0:"word"\n`.
    // Actually, `narrativeAgent.stream()` returns a stream we can adapt.
    
    const streamResult = await narrativeAgent.stream(prompt);

    return streamResult.toDataStreamResponse();

  } catch (error) {
    console.error("Narrative generation error:", error);
    return new Response("Error generating narrative", { status: 500 });
  }
}
