import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { BacklogStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

const backlogRecordSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  originalSemester: z.string().min(1, "Original semester is required"),
  originalGrade: z.string().min(1, "Original grade is required"),
  status: z.nativeEnum(BacklogStatus).optional().default(BacklogStatus.PENDING),
  attemptsCount: z.coerce.number().int().nonnegative().optional().default(0),
});

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backlogs = await prisma.backlogRecord.findMany({
      where: { userId: user.id },
      include: { course: true },
    });

    return NextResponse.json(backlogs);
  } catch (error) {
    console.error("[Backlogs GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const validation = backlogRecordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validated = validation.data;

    // Check if a backlog record already exists for this user and course
    const existing = await prisma.backlogRecord.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: validated.courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Backlog record already exists for this course" },
        { status: 400 }
      );
    }

    const newBacklog = await prisma.backlogRecord.create({
      data: {
        userId: user.id,
        courseId: validated.courseId,
        originalSemester: validated.originalSemester,
        originalGrade: validated.originalGrade,
        status: validated.status,
        attemptsCount: validated.attemptsCount,
      },
      include: { course: true },
    });

    return NextResponse.json(newBacklog, { status: 201 });
  } catch (error) {
    console.error("[Backlogs POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
