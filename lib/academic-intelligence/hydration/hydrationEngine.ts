import { AcademicProfile } from "@/types/academicProfile";

export class HydrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HydrationError";
  }
}

/**
 * Validates and normalizes raw JSON payload from the database into a strict AcademicProfile.
 * Prevents corrupted or malicious JSON from crashing the client store.
 */
export function validateSnapshotPayload(rawPayload: unknown): AcademicProfile {
  if (!rawPayload || typeof rawPayload !== "object") {
    throw new HydrationError("Payload is not a valid JSON object.");
  }

  const payload = rawPayload as any;

  // 1. Validate Core Identity & Institution Metadata
  if (typeof payload.institution !== "string" || typeof payload.presetId !== "string") {
    throw new HydrationError("Missing critical institution or preset metadata.");
  }

  // 2. Validate Academic State
  const academic = payload.academic;
  if (!academic || typeof academic.currentCgpa !== "number" || typeof academic.completedSemesters !== "number") {
    throw new HydrationError("Corrupted or missing academic cumulative state.");
  }

  // 3. Normalize & Validate Courses
  if (!Array.isArray(payload.courses)) {
    throw new HydrationError("Courses payload must be an array.");
  }

  const normalizedCourses = payload.courses.map((c: any) => {
    if (!c.id || !c.code || !c.name || typeof c.credits !== "number") {
      throw new HydrationError(`Invalid course schema detected: ${c.code || "UNKNOWN"}`);
    }
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      semester: typeof c.semester === "number" ? c.semester : 1,
      credits: c.credits,
      grade: c.grade,
      cieMarks: typeof c.cieMarks === "number" ? c.cieMarks : 0,
      seeMarks: typeof c.seeMarks === "number" ? c.seeMarks : null,
      attendanceTotal: typeof c.attendanceTotal === "number" ? c.attendanceTotal : 0,
      attendanceBunked: typeof c.attendanceBunked === "number" ? c.attendanceBunked : 0,
    };
  });

  // 4. Normalize & Validate Semester History
  if (!Array.isArray(payload.semesterHistory)) {
    throw new HydrationError("Semester history must be an array.");
  }

  const normalizedHistory = payload.semesterHistory.map((h: any) => {
    if (typeof h.semester !== "number" || typeof h.sgpa !== "number" || typeof h.credits !== "number") {
      throw new HydrationError(`Invalid semester history record: Sem ${h.semester}`);
    }
    return {
      semester: h.semester,
      sgpa: h.sgpa,
      credits: h.credits,
      earnedCredits: typeof h.earnedCredits === "number" ? h.earnedCredits : h.credits,
    };
  });

  // 5. Normalize & Validate Timetable
  const normalizedTimetable = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
  if (payload.timetable && typeof payload.timetable === "object") {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const day of days) {
      if (Array.isArray(payload.timetable[day])) {
        (normalizedTimetable as any)[day] = payload.timetable[day].map((entry: any) => {
          if (!entry.id || !entry.courseId || !entry.type || !entry.startTime || !entry.endTime) {
            throw new HydrationError(`Invalid timetable entry under ${day}`);
          }
          return {
            id: entry.id,
            courseId: entry.courseId,
            type: entry.type,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: typeof entry.room === "string" ? entry.room : undefined,
            batch: typeof entry.batch === "string" ? entry.batch : undefined,
            faculty: typeof entry.faculty === "string" ? entry.faculty : undefined,
          };
        });
      }
    }
  }

  // 6. Normalize & Validate Academic Calendar
  let normalizedCalendar: any[] = [];
  if (Array.isArray(payload.academicCalendar)) {
    normalizedCalendar = payload.academicCalendar.map((event: any) => {
      if (!event.id || !event.name || !event.startDate || !event.type) {
        throw new HydrationError("Invalid academic event in calendar.");
      }
      return {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: typeof event.endDate === "string" ? event.endDate : undefined,
        type: event.type,
        subtasks: Array.isArray(event.subtasks)
          ? event.subtasks.map((st: any) => {
              if (!st.id || !st.title) {
                throw new HydrationError("Invalid subtask in academic event.");
              }
              return {
                id: st.id,
                title: st.title,
                completed: typeof st.completed === "boolean" ? st.completed : false,
              };
            })
          : [],
      };
    });
  }

  // 7. Normalize & Validate Backlogs
  let normalizedBacklogs: any[] = [];
  if (Array.isArray(payload.backlogs)) {
    normalizedBacklogs = payload.backlogs.map((b: any) => {
      if (!b.id || !b.courseId || !b.courseCode || !b.courseName || typeof b.originalSemester !== "number" || typeof b.originalGrade !== "string" || typeof b.attemptsCount !== "number" || !b.status) {
        throw new HydrationError("Invalid backlog record detected.");
      }
      return {
        id: b.id,
        courseId: b.courseId,
        courseCode: b.courseCode,
        courseName: b.courseName,
        originalSemester: b.originalSemester,
        originalGrade: b.originalGrade,
        status: b.status,
        attemptsCount: b.attemptsCount,
        nextExamDate: typeof b.nextExamDate === "string" ? b.nextExamDate : null,
        recoveryPathway: typeof b.recoveryPathway === "string" ? b.recoveryPathway : null,
        recoveryPlan: b.recoveryPlan && typeof b.recoveryPlan === "object"
          ? {
              studyPlan: typeof b.recoveryPlan.studyPlan === "string" ? b.recoveryPlan.studyPlan : "",
              dailyHours: typeof b.recoveryPlan.dailyHours === "number" ? b.recoveryPlan.dailyHours : 0,
              recoveryProbability: typeof b.recoveryPlan.recoveryProbability === "number" ? b.recoveryPlan.recoveryProbability : 0,
              resources: Array.isArray(b.recoveryPlan.resources) ? b.recoveryPlan.resources : [],
              aiPlanGenerationFailed: typeof b.recoveryPlan.aiPlanGenerationFailed === "boolean" ? b.recoveryPlan.aiPlanGenerationFailed : undefined,
            }
          : null,
      };
    });
  }

  // Return the strictly validated and normalized profile
  return {
    studentIdentity: {
      id: payload.studentIdentity?.id || null,
      name: payload.studentIdentity?.name || null,
    },
    institution: payload.institution,
    presetId: payload.presetId,
    regulation: payload.regulation || "unknown",
    academic: {
      currentCgpa: academic.currentCgpa,
      targetCgpa: typeof academic.targetCgpa === "number" ? academic.targetCgpa : 8.0,
      completedSemesters: academic.completedSemesters,
      earnedCredits: typeof academic.earnedCredits === "number" ? academic.earnedCredits : 0,
      activeBacklogsCount: typeof academic.activeBacklogsCount === "number" ? academic.activeBacklogsCount : 0,
    },
    courses: normalizedCourses,
    semesterHistory: normalizedHistory,
    timetable: normalizedTimetable,
    academicCalendar: normalizedCalendar,
    backlogs: normalizedBacklogs,
  };
}
