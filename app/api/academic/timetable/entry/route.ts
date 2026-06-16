import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

const timetableSlotSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"),
  room: z.string().min(1, "Room is required"),
  instructor: z.string().optional().nullable(),
  section: z.string().optional().nullable(),
  semester: z.string().min(1, "Semester is required"),
  academicYear: z.string().min(1, "Academic year is required"),
}).refine((data) => {
  const start = timeToMinutes(data.startTime);
  const end = timeToMinutes(data.endTime);
  return start < end;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

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

    const validation = timetableSlotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validated = validation.data;

    // Fetch user's enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // If student is not enrolled in any course, they can't have a conflict, but we should make sure we have slots.
    // Fetch all existing slots for user's enrolled courses on the same dayOfWeek
    const existingSlots = await prisma.timetableSlot.findMany({
      where: {
        courseId: { in: courseIds },
        dayOfWeek: validated.dayOfWeek,
      },
    });

    const newStart = timeToMinutes(validated.startTime);
    const newEnd = timeToMinutes(validated.endTime);

    const overlap = existingSlots.some((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      return newStart < slotEnd && slotStart < newEnd;
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Time conflict with an existing slot" },
        { status: 400 }
      );
    }

    // Create the timetable slot
    const newSlot = await prisma.timetableSlot.create({
      data: {
        courseId: validated.courseId,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        room: validated.room,
        instructor: validated.instructor,
        section: validated.section,
        semester: validated.semester,
        academicYear: validated.academicYear,
      },
    });

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error("[Timetable POST Entry Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
