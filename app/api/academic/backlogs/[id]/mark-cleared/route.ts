import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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

    const backlog = await prisma.backlogRecord.findUnique({
      where: { id },
    });

    if (!backlog || backlog.userId !== user.id) {
      return NextResponse.json({ error: "Backlog record not found" }, { status: 404 });
    }

    const updated = await prisma.backlogRecord.update({
      where: { id },
      data: { status: "CLEARED" },
      include: { course: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Backlogs Mark-Cleared Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
