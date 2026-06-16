import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = params;
    if (!subjectId) {
      return NextResponse.json({ error: "Invalid subjectId format" }, { status: 400 });
    }

    const count = await prisma.timetableSlot.count({
      where: {
        courseId: subjectId,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[Timetable Scheduled-Count GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
