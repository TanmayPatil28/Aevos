// Simple delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // In production, this would be:
    // const { stream } = await streamText({ ... })
    // return stream.toDataStreamResponse();

    // Mock generation based on the decision context
    const mockParagraphs = [
      "The consequences of this choice are immediate. Your professors notice your shift in focus, and your academic standing fluctuates slightly. However, you feel a surge of real-world confidence as you start tackling problems outside the textbook.",
      "You commit fully to this path. Late nights turn into early mornings. While your stress levels spike temporarily, you start seeing a tangible increase in your core competencies. Recruiters might just start noticing this pattern.",
      "A bold move. By reallocating your time, you sacrifice some short-term academic safety for long-term career positioning. You meet a few key contacts, but you'll have to cram hard before finals to maintain your baseline.",
      "This decision balances the scales. You manage to maintain your grades while slowly building your portfolio. It's a grueling marathon, not a sprint, but your readiness for the industry quietly climbs upward.",
      "Your network expands significantly as you step out of your comfort zone. The academic cost is noticeable on paper, but the implicit skills you're acquiring cannot be measured by a standard GPA."
    ];

    // Pick a random paragraph
    const selectedText = mockParagraphs[Math.floor(Math.random() * mockParagraphs.length)];
    const words = selectedText.split(" ");

    // Create a ReadableStream that yields chunks like an LLM
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          // Simulate typing delay (faster for MVP, ~50ms per word)
          await delay(50);
          
          // AI SDK expects specific formatting for useCompletion: "0:\"word\""
          const chunk = words[i] + (i === words.length - 1 ? "" : " ");
          controller.enqueue(new TextEncoder().encode(`0:"${chunk}"\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      },
    });
  } catch (error) {
    console.error("Narrative generation error:", error);
    return new Response("Error generating narrative", { status: 500 });
  }
}
