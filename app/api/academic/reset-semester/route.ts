import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { semester } = await req.json();
    if (!semester) {
      return NextResponse.json({ error: "Semester is required" }, { status: 400 });
    }

    const userId = user.id;

    await prisma.$transaction(async (tx: any) => {
      // Delete enrollments for this semester
      await tx.enrollment.deleteMany({
        where: { userId, semester: String(semester) },
      });

      // Delete calculations for this semester
      await tx.calculation.deleteMany({
        where: { userId, semester: String(semester) },
      });

      // Update the AcademicSnapshot to remove the semester's data from JSON
      const activeUser = await tx.user.findUnique({
        where: { id: userId },
        select: { activeSnapshotId: true }
      });

      if (activeUser?.activeSnapshotId) {
        const snapshot = await tx.academicSnapshot.findUnique({
          where: { id: activeUser.activeSnapshotId }
        });

        if (snapshot && snapshot.academicProfile) {
          const profile = snapshot.academicProfile as any;
          if (profile.courses) {
            profile.courses = profile.courses.filter((c: any) => String(c.semester) !== String(semester));
          }
          if (profile.semesterHistory) {
            profile.semesterHistory = profile.semesterHistory.filter((s: any) => String(s.semester) !== String(semester));
          }

          await tx.academicSnapshot.update({
            where: { id: snapshot.id },
            data: { academicProfile: profile }
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: `Semester ${semester} data has been removed.` });
  } catch (error) {
    console.error("[Academic Reset Semester POST Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
