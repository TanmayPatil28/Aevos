import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { validateSnapshotPayload } from "@/lib/academic-intelligence/hydration/hydrationEngine";
import { generateStructuralHash } from "@/lib/academic-intelligence/hashing/structuralHash";
import { z } from "zod";

const studentIdentitySchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  registrationId: z.string().optional().nullable(),
});

const academicStateSchema = z.object({
  currentCgpa: z.number(),
  completedSemesters: z.number(),
  earnedCredits: z.number(),
  activeBacklogsCount: z.number(),
  targetCgpa: z.number(),
  programme: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  batchYear: z.number().optional().nullable(),
  semesterStartDate: z.string().optional().nullable(),
  semesterEndDate: z.string().optional().nullable(),
});

const courseStateSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  semester: z.number(),
  credits: z.number(),
  grade: z.string().optional().nullable(),
  cieMarks: z.number(),
  seeMarks: z.number().optional().nullable(),
  attendanceTotal: z.number(),
  attendanceBunked: z.number(),
  recoverySemester: z.number().optional().nullable(),
});

const semesterHistoryEntrySchema = z.object({
  semester: z.number(),
  isBacklogClearance: z.boolean().optional().nullable(),
  sgpa: z.number(),
  credits: z.number(),
  earnedCredits: z.number(),
});

const timetableEntrySchema = z.object({
  id: z.string(),
  courseId: z.string(),
  type: z.enum(["LECTURE", "PRACTICAL", "LAB", "TUTORIAL"]),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional().nullable(),
  batch: z.string().optional().nullable(),
  faculty: z.string().optional().nullable(),
});

const timetableSchema = z.object({
  monday: z.array(timetableEntrySchema),
  tuesday: z.array(timetableEntrySchema),
  wednesday: z.array(timetableEntrySchema),
  thursday: z.array(timetableEntrySchema),
  friday: z.array(timetableEntrySchema),
  saturday: z.array(timetableEntrySchema),
  sunday: z.array(timetableEntrySchema),
});

const subTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

const academicEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  type: z.enum(["EXAM", "HOLIDAY", "EVENT", "FEST", "OTHER", "DEADLINE"]),
  subtasks: z.array(subTaskSchema).optional().nullable(),
});

const backlogSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  courseName: z.string(),
  originalSemester: z.number(),
  originalGrade: z.string(),
  status: z.enum(["PENDING", "REGISTERED", "EXAM_SCHEDULED", "CLEARED", "VOIDED"]),
  attemptsCount: z.number(),
  nextExamDate: z.string().optional().nullable(),
  recoveryPathway: z.string().optional().nullable(),
  recoveryPlan: z.object({
    studyPlan: z.string(),
    dailyHours: z.number(),
    recoveryProbability: z.number(),
    resources: z.array(z.string()),
    aiPlanGenerationFailed: z.boolean().optional().nullable(),
  }).optional().nullable(),
});

const academicProfileSchema = z.object({
  studentIdentity: studentIdentitySchema,
  institution: z.string(),
  presetId: z.string(),
  regulation: z.string(),
  academic: academicStateSchema,
  courses: z.array(courseStateSchema),
  semesterHistory: z.array(semesterHistoryEntrySchema),
  timetable: timetableSchema.optional().nullable(),
  academicCalendar: z.array(academicEventSchema).optional().nullable(),
  backlogs: z.array(backlogSchema).optional().nullable(),
});

const snapshotPayloadSchema = z.object({
  academicProfile: academicProfileSchema,
  sourceType: z.string(),
  sourceInstitution: z.string(),
  snapshotType: z.string().optional().default("official_import"),
  parserVersion: z.string().optional().default("1.0"),
  regulationVersion: z.string().optional().default("1.0"),
  normalizationVersion: z.string().optional().default("1.0"),
  confidenceScore: z.number().optional().default(100),
});

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const activeOnly = searchParams.get("activeOnly") === "true";

    if (activeOnly) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { activeSnapshotId: true },
      });

      if (!dbUser?.activeSnapshotId) {
        return NextResponse.json({ snapshot: null });
      }

      const activeSnapshot = await prisma.academicSnapshot.findUnique({
        where: { id: dbUser.activeSnapshotId },
      });

      return NextResponse.json({ snapshot: activeSnapshot });
    }

    const snapshots = await prisma.academicSnapshot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("[AcademicSnapshots GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonBody = await req.json();
    const parsed = snapshotPayloadSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { 
      academicProfile, 
      sourceType, 
      sourceInstitution, 
      snapshotType,
      parserVersion,
      regulationVersion,
      normalizationVersion,
      confidenceScore,
    } = parsed.data;

    // 1. Validate JSON strictly through the Hydration Engine
    let validatedProfile;
    try {
      validatedProfile = validateSnapshotPayload(academicProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Validation Error: ${errorMessage}` }, { status: 400 });
    }

    // 2. Generate Structural Hash to prevent duplicate identical imports
    const checksumHash = generateStructuralHash(validatedProfile);

    // 3. Create Immutable Snapshot and Update User Pointer atomically
    const newSnapshot = await prisma.$transaction(async (tx: any) => {
      const snapshot = await tx.academicSnapshot.create({
        data: {
          userId: user.id,
          sourceType,
          sourceInstitution,
          snapshotType,
          parserVersion,
          regulationVersion,
          normalizationVersion,
          confidenceScore,
          checksumHash,
          verificationStatus: "verified", // Assume newly imported payloads are verified for now
          academicProfile: validatedProfile as any,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { activeSnapshotId: snapshot.id },
      });

      return snapshot;
    });

    return NextResponse.json({ success: true, snapshot: newSnapshot }, { status: 201 });
  } catch (error) {
    console.error("[AcademicSnapshots POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Remove active pointer
      await tx.user.update({
        where: { id: user.id },
        data: { activeSnapshotId: null },
      });
      // 2. Delete all snapshots for user
      await tx.academicSnapshot.deleteMany({
        where: { userId: user.id },
      });
    });

    return NextResponse.json({ success: true, message: "All academic data wiped." }, { status: 200 });
  } catch (error) {
    console.error("[AcademicSnapshots DELETE Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
