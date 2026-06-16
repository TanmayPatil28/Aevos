import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
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

    const today = new Date();
    let targetDate = event.startDate;
    if (event.startDate < today) {
      targetDate = event.endDate;
    }

    const diffMs = targetDate.getTime() - today.getTime();
    const weeksRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));

    return NextResponse.json({ weeksRemaining });
  } catch (error) {
    console.error("[AcademicCalendar Weeks-Remaining GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
