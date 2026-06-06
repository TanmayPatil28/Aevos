import { AcademicProfile } from "@/types/academicProfile";
import { IntermediateExtractionModel } from "./types";

/**
 * Normalization Engine
 * Converts an Intermediate Extraction Model (from any parser) into the strict, 
 * canonical AcademicProfile structure required by GradeFlow's internal domain.
 */
export function normalizeExtraction(model: IntermediateExtractionModel): AcademicProfile {
  let completedSemesters = 0;
  let currentCgpa = 0;
  let earnedCredits = 0;
  let totalCredits = 0;
  let totalPoints = 0;
  let activeBacklogsCount = 0;

  const courses: AcademicProfile["courses"] = [];
  const semesterHistory: AcademicProfile["semesterHistory"] = [];

  // Sort semesters logically
  const sortedSemesters = [...model.semesters].sort((a, b) => a.semesterIndex - b.semesterIndex);

  sortedSemesters.forEach((sem) => {
    // If it's a historical semester with SGPA
    if (sem.sgpa !== undefined) {
      completedSemesters++;
      const semCredits = sem.credits || 0;
      const semEarned = sem.earnedCredits || semCredits;
      
      totalCredits += semCredits;
      totalPoints += (sem.sgpa * semCredits);
      earnedCredits += semEarned;

      semesterHistory.push({
        semester: sem.semesterIndex,
        isBacklogClearance: sem.isBacklogClearance,
        sgpa: sem.sgpa,
        credits: semCredits,
        earnedCredits: semEarned,
      });
    }

    // Process courses
    sem.courses.forEach(c => {
      // Determine backlog logic: if grade is F, Backlog, etc.
      if (c.grade && ["F", "FF", "FAIL", "ABSENT", "AB"].includes(c.grade.toUpperCase())) {
        activeBacklogsCount++;
      }

      courses.push({
        id: crypto.randomUUID(),
        code: c.code,
        name: c.name,
        semester: sem.semesterIndex,
        credits: c.credits,
        grade: c.grade,
        cieMarks: c.internalMarks || 0,
        seeMarks: c.externalMarks,
        attendanceTotal: 0,
        attendanceBunked: 0,
      });
    });
  });

  if (totalCredits > 0) {
    currentCgpa = parseFloat((totalPoints / totalCredits).toFixed(2));
  }

  return {
    studentIdentity: {
      name: model.studentName,
      registrationId: model.registrationId,
    },
    presetId: model.institutionId,
    institution: model.institutionId,
    regulation: model.regulation || "unknown",
    academic: {
      currentCgpa,
      targetCgpa: 8.0, // Default goal
      completedSemesters,
      earnedCredits,
      activeBacklogsCount,
      programme: model.programme,
      branch: model.branch,
      batchYear: model.batchYear,
    },
    courses,
    semesterHistory,
  };
}
