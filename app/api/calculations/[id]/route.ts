// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


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

    // Verify ownership
    const calculation = await prisma.calculation.findUnique({ where: { id } });
    if (!calculation || calculation.userId !== userId) {
      return NextResponse.json({ error: "Not found or Unauthorized" }, { status: 403 });
    }

    await prisma.calculation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete calculation:", error);
    return NextResponse.json({ error: "Failed to delete calculation" }, { status: 500 });
  }
}
