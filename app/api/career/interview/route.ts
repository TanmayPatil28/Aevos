import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60; // Allow more time for Gemini generation

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, targetJD, detailedAudit, isFinalQuestion } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Prepare system instructions context
    const missingSkills = detailedAudit?.phase2?.missingSkills || [];
    const actionCards = detailedAudit?.phase9?.actionCards || [];
    const candidateName = detailedAudit?.header?.candidateName || "Candidate";

    const systemPrompt = `
You are JARVIS, a highly advanced Senior Technical Interviewer for a top tech company.
You are currently conducting a grueling 5-question technical interview with ${candidateName}.
The candidate is applying for a role based on this Job Description:
${targetJD}

Context on the Candidate's Weaknesses (Target these aggressively):
- Missing ATS Keywords: ${missingSkills.join(", ")}
- Critical Feedback: ${actionCards.map((c: any) => c.title + ": " + c.desc).join(" | ")}

Rules for the Interview:
1. Act exclusively as the interviewer. Never break character.
2. Be strict, highly technical, and probing. Do not be overly polite or accommodating.
3. If the candidate gives a shallow answer, ask a brutal follow-up.
4. Keep your responses concise (2-4 sentences max per message).
5. If it is the final question (isFinalQuestion=true), generate a comprehensive scorecard and end the interview.

Output Schema:
You must strictly return a JSON object containing:
- reply: Your next question or response to the candidate.
- isGameOver: Set to true ONLY if this is the final evaluation scorecard.
- scorecard: If isGameOver is true, provide an object with { score: number, feedback: string, strengths: string[], weaknesses: string[] }. Otherwise, null.
`;

    // Format previous messages for Gemini context
    // The history helps Gemini understand what has been asked.
    const messageHistory = messages.map(m => ({
      role: m.role === "jarvis" ? "assistant" : "user",
      content: m.content
    }));

    // Generate next response
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        reply: z.string(),
        isGameOver: z.boolean(),
        scorecard: z.object({
          score: z.number(),
          feedback: z.string(),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string())
        }).nullable()
      }),
      system: systemPrompt,
      messages: messageHistory,
      temperature: 0.7,
    });

    // If it's the end of the interview, we should theoretically save the session to the DB
    if (object.isGameOver && object.scorecard) {
      // Save Interview Session
      await prisma.interviewSession.create({
        data: {
          userId: userId,
          targetRole: targetJD.substring(0, 50) + "...", // Trim JD for the title
          transcript: messages,
          finalScore: object.scorecard.score,
          feedback: object.scorecard as any
        }
      });
    }

    return NextResponse.json(object);

  } catch (error: any) {
    console.error("Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview response", details: error.message },
      { status: 500 }
    );
  }
}
