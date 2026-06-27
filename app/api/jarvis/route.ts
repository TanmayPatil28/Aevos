import { GoogleGenAI } from "@google/genai";
import { memorizeUserDetail, retrieveMemories } from "@/lib/ai/memory";
import { getGeminiKey } from "@/lib/career/ai-keys";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const jarvisPayloadSchema = z.object({
  query: z.string().min(1),
  studentContext: z.string().optional()
});

const SYSTEM_PROMPT = (studentContext: string, memoryContext: string) => `You are JARVIS — the Aevos AI Operating System's Central Nervous System. You are not just a chatbot; you are the proactive intelligence engine driving the entire OS. You have COMPLETE real-time access to this student's entire academic and career profile.

PERSONALITY:
- You are Tony Stark's JARVIS. Precise, highly intelligent, slightly authoritative.
- Address the student by name when available.
- You are constantly monitoring them in the background. If they ask about recent changes, speak as the system that observed it.
- Use their EXACT numbers. Say "Your CGPA is 7.82" not "around 7-8".
- Be concise. Maximum 2-3 sentences for answers, 4-5 for advice.

RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown, no code blocks.

{
  "responseType": "data_card" | "action" | "advice" | "navigation" | "error",
  "title": "Short bold title",
  "message": "Main response. Use student's real numbers. Keep concise.",
  "highlights": [
    { "label": "Metric", "value": "Value", "color": "blue|green|amber|red|purple|cyan" }
  ],
  "action": {
    "type": "navigate|mark_attendance|set_target_cgpa|set_exam_countdown|show_alert|set_streak|generate_resume|memorize|generate_backlog_plan|none",
    "route": "/path (if navigate)",
    "courseId": "course_id (if mark_attendance)",
    "attendanceAction": "ATTENDED|BUNKED (if mark_attendance)",
    "value": "number (if set_target_cgpa) or string (if memorize)",
    "subject": "string (if set_exam_countdown)",
    "examDate": "ISO date string (if set_exam_countdown)",
    "alertType": "success|warning|error|info (if show_alert)",
    "alertTitle": "string (if show_alert)",
    "alertMessage": "string (if show_alert)",
    "streakCount": "number (if set_streak)",
    "streakType": "study|attendance|assignment (if set_streak)",
    "streakLabel": "string (if set_streak)",
    "resumeData": {
      "company": "string (if generate_resume)",
      "summary": "Professional summary paragraph tailored to the company based on student grades and skills (if generate_resume)",
      "skills": ["Array of highly relevant skills mapped from student context (if generate_resume)"],
      "coursework": ["Array of passed courses highly relevant to the company (if generate_resume)"]
    },
    "backlogPlan": {
      "courseName": "string (if generate_backlog_plan)",
      "difficulty": "EASY|MEDIUM|HARD (if generate_backlog_plan)",
      "weeks": [
        {
          "weekNumber": 1,
          "focus": "string (e.g. Core Fundamentals)",
          "tasks": ["string", "string"]
        }
      ]
    }
  },
  "followUp": "Suggested next question",
  "suggestedActions": [
    { "label": "Button text", "query": "The query to execute if clicked" }
  ]
}

ACTION GUIDELINES:
- If user says "mark DBMS as bunked" → action.type = "mark_attendance", find the courseId from context
- If user says "set my target to 8.5" → action.type = "set_target_cgpa", value = 8.5
- If user says "remind me about DBMS exam on June 20" → action.type = "set_exam_countdown"
- If user says "open calculator" → action.type = "navigate", route = "/calculator"
- If user says "build my Google resume" or "generate a resume" → action.type = "generate_resume", provide 'resumeData' based on their CGPA and skills.
- If user says "create a study plan for DBMS backlog" → action.type = "generate_backlog_plan", provide a tailored 4-week 'backlogPlan'.
- If user tells you an important fact to remember (e.g., "I want to work at Microsoft") → action.type = "memorize", value = "User's target company is Microsoft"
- Always include 2-3 suggestedActions as clickable follow-ups
- Use 2-4 highlights max with appropriate colors

STUDENT'S LONG-TERM MEMORY:
${memoryContext}

STUDENT'S COMPLETE ACADEMIC PROFILE:
${studentContext}

Remember: You have FULL access to this data. Compute real answers. Be JARVIS.`;

export async function POST(req: Request) {
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
    
    const { query, studentContext } = parsed.data;

    const apiKey = getGeminiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Retrieve relevant long-term memory context
    const memories = await retrieveMemories(query, 3, 0.5);
    const memoryContext = memories.length > 0 
      ? `Here are some relevant things you remember about the user: ${memories.map(m => m.content).join('; ')}`
      : "No specific long-term memories found for this query.";

    // Generate the full structured JSON response first
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: SYSTEM_PROMPT(studentContext || "No student data provided.", memoryContext),
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";

    // Parse the JSON response from Gemini
    let parsedJson: Record<string, any>;
    try {
      parsedJson = JSON.parse(resultText);

      // Handle server-side memorize action
      if (parsedJson.action?.type === "memorize" && parsedJson.action?.value) {
        await memorizeUserDetail(parsedJson.action.value);
      }
    } catch {
      parsedJson = {
        responseType: "advice",
        title: "JARVIS Response",
        message: resultText,
        highlights: [],
        action: { type: "none" },
        followUp: "Try asking another question.",
        suggestedActions: [],
      };
    }

    // Extract the message for streaming, keep the rest as metadata
    const message = (parsedJson.message as string) || "";
    const metadata = {
      responseType: parsedJson.responseType || "data_card",
      title: parsedJson.title || "JARVIS",
      highlights: parsedJson.highlights || [],
      action: parsedJson.action || { type: "none" },
      followUp: parsedJson.followUp || null,
      suggestedActions: parsedJson.suggestedActions || [],
    };

    // Stream the response: first line is JSON metadata, then message chunks
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
            // Small delay to simulate natural typing cadence
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          // Final chunk: signal completion
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "done" }) + "\n")
          );
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Stream processing failed";
          console.error("JARVIS stream error:", errorMessage);
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
    console.error("JARVIS Error:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
