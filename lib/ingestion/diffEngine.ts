import { AcademicProfile } from "@/types/academicProfile";
import { ImportDiff, ValidationWarning } from "./types";
import { generateStructuralHash } from "../academic-intelligence/hashing/structuralHash";

/**
 * Import Diff Engine
 * Compares an incoming AcademicProfile against the active state.
 * Identifies duplicate imports, new semesters, backlog resolutions, and conflicts.
 */
export function computeImportDiff(activeProfile: AcademicProfile | null, incomingProfile: AcademicProfile): ImportDiff {
  const warnings: ValidationWarning[] = [];
  const newSemestersAdded: number[] = [];
  const coursesUpdated: string[] = [];
  const backlogsResolved: string[] = [];
  const sgpaChanges: Array<{ semester: number; oldSgpa: number; newSgpa: number }> = [];

  // If there's no active profile (empty state), everything is new
  if (!activeProfile || !activeProfile.courses || activeProfile.courses.length === 0) {
    incomingProfile.semesterHistory.forEach(s => newSemestersAdded.push(s.semester));
    return {
      isDuplicate: false,
      hasConflicts: false,
      newSemestersAdded,
      coursesUpdated,
      backlogsResolved,
      sgpaChanges,
      warnings,
      profileUpdated: true,
    };
  }

  // Check for profile identity changes
  let profileUpdated = false;
  if (incomingProfile.studentIdentity?.name && 
      incomingProfile.studentIdentity.name !== "Unknown Student" &&
      activeProfile.studentIdentity?.name !== incomingProfile.studentIdentity.name) {
    profileUpdated = true;
  }

  // 1. Structural Hash Check for exact duplicates
  const activeHash = generateStructuralHash(activeProfile);
  const incomingHash = generateStructuralHash(incomingProfile);

  if (activeHash === incomingHash && !profileUpdated) {
    return {
      isDuplicate: true,
      hasConflicts: false,
      newSemestersAdded,
      coursesUpdated,
      backlogsResolved,
      sgpaChanges,
      warnings,
      profileUpdated,
    };
  }

  // 2. Diff Semesters
  const activeSems = new Map(activeProfile.semesterHistory.map(s => [s.semester, s]));
  
  incomingProfile.semesterHistory.forEach(incSem => {
    const actSem = activeSems.get(incSem.semester);
    
    if (!actSem) {
      newSemestersAdded.push(incSem.semester);
    } else {
      // Check for SGPA conflicts/updates
      if (Math.abs(actSem.sgpa - incSem.sgpa) > 0.01) {
        sgpaChanges.push({
          semester: incSem.semester,
          oldSgpa: actSem.sgpa,
          newSgpa: incSem.sgpa,
        });
        warnings.push({
          type: "conflict",
          severity: "warning",
          message: `SGPA for Semester ${incSem.semester} changed from ${actSem.sgpa} to ${incSem.sgpa}.`,
          affectedEntity: `Semester ${incSem.semester}`,
        });
      }
    }
  });

  // 3. Diff Courses (Detect backlog resolutions and updates)
  const activeCourses = new Map(activeProfile.courses.map(c => [c.code, c]));

  incomingProfile.courses.forEach(incCourse => {
    const actCourse = activeCourses.get(incCourse.code);

    if (actCourse) {
      if (actCourse.grade !== incCourse.grade) {
        coursesUpdated.push(incCourse.code);
        
        const isOldBacklog = ["F", "FF", "FAIL", "ABSENT", "AB"].includes((actCourse.grade || "").toUpperCase());
        const isNewPass = !["F", "FF", "FAIL", "ABSENT", "AB"].includes((incCourse.grade || "").toUpperCase());

        if (isOldBacklog && isNewPass) {
          backlogsResolved.push(incCourse.code);
        } else if (actCourse.grade && incCourse.grade) {
          warnings.push({
            type: "conflict",
            severity: "info",
            message: `Grade for ${incCourse.code} updated from ${actCourse.grade} to ${incCourse.grade}.`,
            affectedEntity: incCourse.code,
          });
        }
      }
    }
  });

  return {
    isDuplicate: false,
    hasConflicts: warnings.some(w => w.type === "conflict" && w.severity !== "info"),
    newSemestersAdded,
    coursesUpdated,
    backlogsResolved,
    sgpaChanges,
    warnings,
    profileUpdated,
  };
}
