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
  };
}
