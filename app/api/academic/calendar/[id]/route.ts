import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const calendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.string().optional().nullable(),
});

export async function PUT(
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

    const event = await prisma.academicCalendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Calendar event not found" }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const validation = calendarEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const validated = validation.data;
    const updatedEvent = await prisma.academicCalendarEvent.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        eventType: validated.eventType,
        startDate: validated.startDate,
        endDate: validated.endDate,
        academicYear: validated.academicYear,
        semester: validated.semester,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("[AcademicCalendar PUT Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
