import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const { actions } = body;

    if (!Array.isArray(actions)) {
      return NextResponse.json({ error: "Invalid actions array" }, { status: 400 });
    }

    console.log(`[API Sync] Processing ${actions.length} sync actions for user ${userId}...`);

    await prisma.$transaction(async (tx) => {
      for (const action of actions) {
        const { type, payload } = action;

        switch (type) {
          case "SEMESTER_UPDATE": {
            if (payload.presetId) {
              await tx.user.update({
                where: { id: userId },
                data: { university: payload.presetId },
              });
            }

            if (Array.isArray(payload.courses)) {
              const uniqueCourses = Array.from(new Map(payload.courses.map((c: any) => [c.code, c])).values());
              for (const c of uniqueCourses as any[]) {
                let course = await tx.course.findUnique({ where: { code: c.code } });
                if (!course) {
                  course = await tx.course.create({
                    data: {
                      code: c.code,
                      name: c.name || `Course ${c.code}`,
                      credits: c.credits || 3,
                      prereqs: [],
                    },
                  });
                }
                await tx.enrollment.upsert({
                  where: { userId_courseId: { userId, courseId: course.id } },
                  update: {
                    grade: c.grade || null,
                    cieMarks: c.cieMarks ?? 0,
                    seeMarks: c.seeMarks ?? null,
                    attendanceTotal: c.attendanceTotal ?? 0,
                    attendanceBunked: c.attendanceBunked ?? 0,
                    semester: c.semester?.toString() || "1",
                  },
                  create: {
                    userId,
                    courseId: course.id,
                    grade: c.grade || null,
                    cieMarks: c.cieMarks ?? 0,
                    seeMarks: c.seeMarks ?? null,
                    attendanceTotal: c.attendanceTotal ?? 0,
                    attendanceBunked: c.attendanceBunked ?? 0,
                    semester: c.semester?.toString() || "1",
                  },
                });
              }
            }

            if (Array.isArray(payload.semesterHistory)) {
              const incomingSemesters = payload.semesterHistory.map((s: any) => s.semester?.toString());
              if (incomingSemesters.length > 0) {
                await tx.calculation.deleteMany({
                  where: { userId, semester: { in: incomingSemesters } }
                });
                
                for (const sem of payload.semesterHistory) {
                  await tx.calculation.create({
                    data: {
                      userId,
                      semester: sem.semester?.toString() || "1",
                      sgpa: sem.sgpa || 0,
                      cgpa: sem.sgpa || 0,
                      total_credits: sem.credits || 0,
                      subjects: [],
                    }
                  });
                }
              }
            }
            break;
          }

          case "ATTENDANCE_EDIT":
          case "OCR_CORRECTION": {
            const { courseId, updates } = payload;
            if (!courseId) break;

            const enrollment = await tx.enrollment.findFirst({
              where: { userId, course: { id: courseId } },
            });

            if (enrollment) {
              const dataToUpdate: Record<string, any> = {};
              if (updates.grade !== undefined) dataToUpdate.grade = updates.grade;
              if (updates.cieMarks !== undefined) dataToUpdate.cieMarks = updates.cieMarks;
              if (updates.seeMarks !== undefined) dataToUpdate.seeMarks = updates.seeMarks;
              if (updates.attendanceTotal !== undefined) dataToUpdate.attendanceTotal = updates.attendanceTotal;
              if (updates.attendanceBunked !== undefined) dataToUpdate.attendanceBunked = updates.attendanceBunked;

              await tx.enrollment.update({
                where: { id: enrollment.id },
                data: dataToUpdate,
              });

              if (updates.attendanceBunked !== undefined) {
                await tx.attendanceLog.create({
                  data: {
                    enrollmentId: enrollment.id,
                    status: "ABSENT",
                    date: new Date(),
                  },
                });
              }
            }
            break;
          }

          case "SIMULATION_SAVE": {
            if (payload.snapshot && payload.snapshot.name) {
              console.log(`[API Sync] Simulation Snapshot saved: ${payload.snapshot.name}`);
            }
            break;
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Sync] Fatal Error:", error);
    return NextResponse.json({ error: "Failed to process actions" }, { status: 500 });
  }
}
