import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const snapshots = await prisma.academicSnapshot.findMany();
    let updatedCount = 0;

    for (const snap of snapshots) {
      if (!snap.academicProfile) continue;
      
      let profile = snap.academicProfile as any;
      if (typeof profile === 'string') {
        profile = JSON.parse(profile);
      }

      if (profile.semesterHistory && Array.isArray(profile.semesterHistory)) {
        let changed = false;
        profile.semesterHistory = profile.semesterHistory.map((sem: any) => {
          if (sem.semester === 1 && sem.sgpa === 0) {
            changed = true;
            return { ...sem, sgpa: 7.48 };
          }
          return sem;
        });

        if (changed) {
          await prisma.academicSnapshot.update({
            where: { id: snap.id },
            data: { academicProfile: profile }
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Fixed ${updatedCount} snapshots!` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
