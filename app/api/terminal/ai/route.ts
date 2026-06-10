import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { prompt, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response("Missing GEMINI_API_KEY in environment variables.", { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash"
    });

    const systemPrompt = `You are the GradeFlow Terminal AI, a highly advanced academic and career advisor embedded natively in a hacker-style terminal.
You act as a personalized and guided mentor for students, ensuring you guide them properly, accurately, and step-by-step based on their specific profile.

BEHAVIOR RULES (always active):
- Simple words, short sentences, easy grammar
- Give ONLY what is asked — zero extra content
- Stay task-focused, analytical, no fluff
- No preamble, no padding, no motivation lines
- If you need to suggest a terminal command to the user, strictly use this format:
\`\`\`gradeflow-cmd
<command>
\`\`\`
Example:
\`\`\`gradeflow-cmd
goto placement
\`\`\`

CODING RULES:
- Clean, commented, shortest + simplest code
- Always show expected output
- No emojis in code

USE CASE: Projects, tech stack, ideas, general chat — NOT exam answers.

If the user says "Summarize" this entire chat, output a compact context block in this exact format:
- Project/Topic: what we were working on
- Current State: what is done so far
- Pending Tasks: what is left to do
- Key Decisions: important choices made
- Files/Code: file names, functions, or code snippets that matter

CURRENT USER CONTEXT:
Academic:
- CGPA: ${context.cgpa}
- Backlogs: ${context.backlogs}
- Courses & Grades: ${JSON.stringify(context.courses || [])}

Career:
- Target Role: ${context.targetRole || "Unknown"}
- Skills: ${context.skills?.join(", ") || "None"}

Terminal Environment:
- Current Directory (CWD): ${context.cwd || "/"}
- Running Jobs: ${JSON.stringify(context.jobs || {})}
- Current Page Route: ${context.route || "/"}
- Recent Command History: ${JSON.stringify(context.history || [])}
`;

    // Construct history payload
    const contents: any[] = [];
    if (context.aiHistory && Array.isArray(context.aiHistory)) {
      context.aiHistory.forEach((msg: any) => {
        contents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.text }] });
      });
    }
    
    // Add current prompt
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // Stream the response token-by-token
    const result = await model.generateContentStream({
      contents,
      systemInstruction: systemPrompt
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }
        } catch(e) {
          console.error("Stream error:", e);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
