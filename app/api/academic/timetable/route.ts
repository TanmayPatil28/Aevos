import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    const slots = await prisma.timetableSlot.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        course: true
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("[Timetable GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
