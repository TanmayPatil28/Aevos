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

    const day = new Date().getDay();
    const dayOfWeek = day === 0 ? 7 : day;

    const slots = await prisma.timetableSlot.findMany({
      where: {
        dayOfWeek,
        course: {
          enrollments: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("[Timetable Today GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
