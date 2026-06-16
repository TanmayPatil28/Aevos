import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export const startRecoveryPayloadSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  failReason: z.string().min(1, "Failure reason is required"),
  calendarContext: z.string().min(1, "Calendar context is required"),
  timetableLoad: z.string().min(1, "Timetable load is required"),
  retryDays: z.number().int().nonnegative("Retry days must be a non-negative integer"),
});

function extractJson(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON block found in AI response");
  }
  const jsonString = text.substring(start, end + 1);
  return JSON.parse(jsonString);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Verify backlog record exists and belongs to the user
    const backlog = await prisma.backlogRecord.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!backlog || backlog.userId !== user.id) {
      return NextResponse.json({ error: "Backlog record not found" }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const validation = startRecoveryPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { subject, failReason, calendarContext, timetableLoad, retryDays } = validation.data;

    const fallbackPlan = {
      studyPlan: `Autonomous Study Recovery Pathway for ${subject}. Focus on daily revision and problem solving based on: ${failReason}.`,
      dailyHours: 2,
      recoveryProbability: 0.7,
      resources: [
        "University recommended textbook",
        "Lecture notes and past papers",
        "Online reference documentation"
      ],
      aiPlanGenerationFailed: true,
    };

    try {
      const origin = new URL(req.url).origin;
      const targetUrl = `${origin}/api/jarvis/v2`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const authHeader = req.headers.get("Authorization");
      if (authHeader) headers["Authorization"] = authHeader;
      const cookieHeader = req.headers.get("Cookie");
      if (cookieHeader) headers["Cookie"] = cookieHeader;

      const queryText = `Generate a structured backlog recovery plan.
Subject: ${subject}
Reason for Failure: ${failReason}
Academic Calendar Context: ${calendarContext}
Timetable Load: ${timetableLoad}
Days until retry/exam: ${retryDays}

You MUST output a JSON block containing EXACTLY these keys:
{
  "studyPlan": "string describing the detailed study plan",
  "dailyHours": number of hours to study daily (e.g. 2),
  "recoveryProbability": number representing probability of recovery between 0.0 and 1.0 (e.g. 0.85),
  "resources": ["array of resource strings"]
}`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        throw new Error(`Jarvis v2 responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsedLine = JSON.parse(trimmed);
            if (parsedLine.type === "chunk" && typeof parsedLine.text === "string") {
              assistantText += parsedLine.text;
            }
          } catch {
            // Not a chunk or not JSON, skip
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsedLine = JSON.parse(buffer.trim());
          if (parsedLine.type === "chunk" && typeof parsedLine.text === "string") {
            assistantText += parsedLine.text;
          }
        } catch {}
      }

      const parsedJson = extractJson(assistantText);

      // Validate parsed JSON fields
      if (
        typeof parsedJson.studyPlan !== "string" ||
        typeof parsedJson.dailyHours !== "number" ||
        typeof parsedJson.recoveryProbability !== "number" ||
        !Array.isArray(parsedJson.resources)
      ) {
        throw new Error("Parsed JSON fields are invalid or missing");
      }

      const finalPlan = {
        studyPlan: parsedJson.studyPlan,
        dailyHours: parsedJson.dailyHours,
        recoveryProbability: parsedJson.recoveryProbability,
        resources: parsedJson.resources.map(String),
      };

      const updatedRecord = await prisma.backlogRecord.update({
        where: { id },
        data: {
          status: "REGISTERED",
          recoveryPathway: JSON.stringify(finalPlan),
        },
        include: { course: true },
      });

      return NextResponse.json(updatedRecord);
    } catch (apiError) {
      console.warn("AI plan generation failed, using fallback plan:", apiError);
      const updatedRecord = await prisma.backlogRecord.update({
        where: { id },
        data: {
          status: "REGISTERED",
          recoveryPathway: JSON.stringify(fallbackPlan),
        },
        include: { course: true },
      });

      return NextResponse.json(updatedRecord);
    }
  } catch (error) {
    console.error("[Backlogs Start-Recovery Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
