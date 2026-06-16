// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan || plan.userId !== userId) {
      return NextResponse.json({ error: "Not found or Unauthorized" }, { status: 403 });
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete plan:", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
