import { createHash } from "crypto";
import { AcademicProfile } from "@/types/academicProfile";

/**
 * Generates a deterministic structural hash for an AcademicProfile payload.
 * It ignores mutable metadata such as timestamps, identity trust scores,
 * or UI simulation flags. It strictly hashes the core academic record:
 * completed semesters, earned credits, and the actual course enrollments.
 * 
 * Order of properties is normalized to prevent same-data structural mismatches.
 */
export function generateStructuralHash(profile: AcademicProfile): string {
  // 1. Extract only the deterministic core academic data
  const normalizedCore = {
    presetId: profile.presetId,
    academic: {
      currentCgpa: profile.academic.currentCgpa,
      targetCgpa: profile.academic.targetCgpa,
      completedSemesters: profile.academic.completedSemesters,
      earnedCredits: profile.academic.earnedCredits,
      activeBacklogsCount: profile.academic.activeBacklogsCount,
    },
    // 2. Sort courses by code to ensure order-independence
    courses: [...profile.courses]
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(c => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        cieMarks: c.cieMarks,
        seeMarks: c.seeMarks,
        attendanceTotal: c.attendanceTotal,
        attendanceBunked: c.attendanceBunked,
      })),
    // 3. Sort semester history by semester index
    semesterHistory: profile.semesterHistory
      ? [...profile.semesterHistory]
          .sort((a, b) => a.semester - b.semester)
          .map(h => ({
            semester: h.semester,
            sgpa: h.sgpa,
            credits: h.credits,
            earnedCredits: h.earnedCredits,
          }))
      : []
  };

  // 4. Stringify payload deterministically (JSON.stringify guarantees order for arrays, 
  // and we've manually ordered the keys in the object literal above).
  const payloadString = JSON.stringify(normalizedCore);

  // 5. Generate SHA-256 Hash
  return createHash("sha256").update(payloadString).digest("hex");
}
