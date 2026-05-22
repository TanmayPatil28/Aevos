import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { actions } = body;

    if (!Array.isArray(actions)) {
      return NextResponse.json({ error: "Invalid actions array" }, { status: 400 });
    }

    console.log(`[API Sync] Processing ${actions.length} sync actions for user ${userId}...`);

    for (const action of actions) {
      const { type, payload } = action;

      switch (type) {
        case "SEMESTER_UPDATE": {
          // 1. Update university preset preference if presetId is provided
          if (payload.presetId) {
            await prisma.user.update({
              where: { id: userId },
              data: { university: payload.presetId },
            });
          }

          // 2. Synchronize entire courses set (upsert Enrollments)
          if (Array.isArray(payload.courses)) {
            for (const c of payload.courses) {
              // Ensure the course exists in the database catalog
              let course = await prisma.course.findUnique({
                where: { code: c.code },
              });

              if (!course) {
                // If it doesn't exist, create a fallback course
                course = await prisma.course.create({
                  data: {
                    code: c.code,
                    name: c.name || `Course ${c.code}`,
                    credits: c.credits || 3,
                    prereqs: [],
                  },
                });
              }

              // Upsert enrollment record
              await prisma.enrollment.upsert({
                where: {
                  userId_courseId: {
                    userId,
                    courseId: course.id,
                  },
                },
                update: {
                  grade: c.grade || null,
                  cieMarks: c.cieMarks ?? 0,
                  seeMarks: c.seeMarks ?? null,
                  attendanceTotal: c.attendanceTotal ?? 0,
                  attendanceBunked: c.attendanceBunked ?? 0,
                  semester: "Current",
                },
                create: {
                  userId,
                  courseId: course.id,
                  grade: c.grade || null,
                  cieMarks: c.cieMarks ?? 0,
                  seeMarks: c.seeMarks ?? null,
                  attendanceTotal: c.attendanceTotal ?? 0,
                  attendanceBunked: c.attendanceBunked ?? 0,
                  semester: "Current",
                },
              });
            }
          }
          break;
        }

        case "ATTENDANCE_EDIT":
        case "OCR_CORRECTION": {
          const { courseId, updates } = payload;
          if (!courseId) break;

          // Find the enrollment matching this course
          const enrollment = await prisma.enrollment.findFirst({
            where: {
              userId,
              course: {
                id: courseId,
              },
            },
          });

          if (enrollment) {
            const dataToUpdate: Record<string, string | number | null | undefined> = {};
            if (updates.grade !== undefined) dataToUpdate.grade = updates.grade;
            if (updates.cieMarks !== undefined) dataToUpdate.cieMarks = updates.cieMarks;
            if (updates.seeMarks !== undefined) dataToUpdate.seeMarks = updates.seeMarks;
            if (updates.attendanceTotal !== undefined) dataToUpdate.attendanceTotal = updates.attendanceTotal;
            if (updates.attendanceBunked !== undefined) dataToUpdate.attendanceBunked = updates.attendanceBunked;

            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: dataToUpdate as Record<string, unknown>,
            });

            // Create an attendance log entry if attendance edit occurred
            if (updates.attendanceBunked !== undefined) {
              await prisma.attendanceLog.create({
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
          // Simulation is guest-first but we can log that a simulation occurred or update target
          if (payload.snapshot && payload.snapshot.name) {
            console.log(`[API Sync] Simulation Snapshot saved: ${payload.snapshot.name}`);
          }
          break;
        }

        default:
          console.warn(`[API Sync] Unhandled action type: ${type}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Sync] Fatal Error:", error);
    return NextResponse.json({ error: "Failed to process actions" }, { status: 500 });
  }
}
