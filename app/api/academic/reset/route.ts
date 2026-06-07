import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    await prisma.$transaction(async (tx: any) => {
      // Delete all enrollments for this user
      await tx.enrollment.deleteMany({
        where: { userId },
      });

      // Delete all calculation records
      await tx.calculation.deleteMany({
        where: { userId },
      });

      // Delete all academic snapshots
      await tx.academicSnapshot.deleteMany({
        where: { userId },
      });

      // Delete all plans
      await tx.plan.deleteMany({
        where: { userId },
      });

      // Detach the active snapshot
      await tx.user.update({
        where: { id: userId },
        data: { activeSnapshotId: null },
      });
    });

    return NextResponse.json({ success: true, message: "Academic data has been reset." });
  } catch (error) {
    console.error("[Academic Reset POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
