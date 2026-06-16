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

  // Timetable check
  const activeTimetableStr = JSON.stringify(activeProfile.timetable || {});
  const incomingTimetableStr = JSON.stringify(incomingProfile.timetable || {});
  if (activeTimetableStr !== incomingTimetableStr) {
    profileUpdated = true;
  }

  // Academic Calendar check
  const activeCalendarStr = JSON.stringify(activeProfile.academicCalendar || []);
  const incomingCalendarStr = JSON.stringify(incomingProfile.academicCalendar || []);
  if (activeCalendarStr !== incomingCalendarStr) {
    profileUpdated = true;
  }

  // Backlogs check
  const activeBacklogsStr = JSON.stringify(activeProfile.backlogs || []);
  const incomingBacklogsStr = JSON.stringify(incomingProfile.backlogs || []);
  if (activeBacklogsStr !== incomingBacklogsStr) {
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
        
        const isOldBacklog = ["F", "FF", "FAIL", "ABSENT", "AB", "NP"].includes((actCourse.grade || "").toUpperCase());
        const isNewPass = !["F", "FF", "FAIL", "ABSENT", "AB", "NP"].includes((incCourse.grade || "").toUpperCase());

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

export function mergeProfiles(activeProfile: AcademicProfile | null, incomingProfile: AcademicProfile): AcademicProfile {
  if (!activeProfile || !activeProfile.courses || activeProfile.courses.length === 0) {
    return incomingProfile;
  }

  // Timetable merge
  let mergedTimetable = activeProfile.timetable || incomingProfile.timetable;
  if (activeProfile.timetable && incomingProfile.timetable) {
    mergedTimetable = {
      monday: [...activeProfile.timetable.monday, ...incomingProfile.timetable.monday.filter(inc => !activeProfile.timetable!.monday.some(act => act.id === inc.id))],
      tuesday: [...activeProfile.timetable.tuesday, ...incomingProfile.timetable.tuesday.filter(inc => !activeProfile.timetable!.tuesday.some(act => act.id === inc.id))],
      wednesday: [...activeProfile.timetable.wednesday, ...incomingProfile.timetable.wednesday.filter(inc => !activeProfile.timetable!.wednesday.some(act => act.id === inc.id))],
      thursday: [...activeProfile.timetable.thursday, ...incomingProfile.timetable.thursday.filter(inc => !activeProfile.timetable!.thursday.some(act => act.id === inc.id))],
      friday: [...activeProfile.timetable.friday, ...incomingProfile.timetable.friday.filter(inc => !activeProfile.timetable!.friday.some(act => act.id === inc.id))],
      saturday: [...activeProfile.timetable.saturday, ...incomingProfile.timetable.saturday.filter(inc => !activeProfile.timetable!.saturday.some(act => act.id === inc.id))],
      sunday: [...activeProfile.timetable.sunday, ...incomingProfile.timetable.sunday.filter(inc => !activeProfile.timetable!.sunday.some(act => act.id === inc.id))],
    };
  }

  // Academic Calendar merge
  const mergedCalendar = [...(activeProfile.academicCalendar || [])];
  if (incomingProfile.academicCalendar) {
    incomingProfile.academicCalendar.forEach(incEvent => {
      const idx = mergedCalendar.findIndex(evt => evt.id === incEvent.id || (evt.name === incEvent.name && evt.startDate === incEvent.startDate));
      if (idx >= 0) {
        mergedCalendar[idx] = { ...mergedCalendar[idx], ...incEvent };
      } else {
        mergedCalendar.push(incEvent);
      }
    });
  }

  // Backlogs merge
  const mergedBacklogs = [...(activeProfile.backlogs || [])];
  if (incomingProfile.backlogs) {
    incomingProfile.backlogs.forEach(incBacklog => {
      const idx = mergedBacklogs.findIndex(b => b.id === incBacklog.id || b.courseCode === incBacklog.courseCode);
      if (idx >= 0) {
        mergedBacklogs[idx] = { ...mergedBacklogs[idx], ...incBacklog };
      } else {
        mergedBacklogs.push(incBacklog);
      }
    });
  }

  const mergedCourses = [...activeProfile.courses];
  incomingProfile.courses.forEach(incomingCourse => {
    const existingIndex = mergedCourses.findIndex(c => 
      c.id === incomingCourse.id || (c.code && incomingCourse.code && c.code === incomingCourse.code && c.semester === incomingCourse.semester)
    );
    if (existingIndex >= 0) {
      mergedCourses[existingIndex] = {
        ...mergedCourses[existingIndex],
        ...incomingCourse,
        semester: mergedCourses[existingIndex].semester
      };
    } else {
      mergedCourses.push(incomingCourse);
    }
  });

  const mergedHistory = [...activeProfile.semesterHistory];
  incomingProfile.semesterHistory.forEach(incomingSem => {
    const existingIndex = mergedHistory.findIndex(h => h.semester === incomingSem.semester);
    if (existingIndex >= 0) {
      mergedHistory[existingIndex] = { ...mergedHistory[existingIndex], ...incomingSem };
    } else {
      mergedHistory.push(incomingSem);
    }
  });

  const totalCredits = mergedHistory.reduce((sum, h) => sum + h.credits, 0);
  const totalPoints = mergedHistory.reduce((sum, h) => sum + (h.sgpa * h.credits), 0);
  const currentCgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : activeProfile.academic.currentCgpa;

  return {
    ...activeProfile,
    studentIdentity: incomingProfile.studentIdentity?.name !== "Unknown Student" ? incomingProfile.studentIdentity : activeProfile.studentIdentity,
    courses: mergedCourses,
    semesterHistory: mergedHistory.sort((a, b) => a.semester - b.semester),
    academic: {
      ...activeProfile.academic,
      ...incomingProfile.academic,
      currentCgpa,
      completedSemesters: mergedHistory.length,
      earnedCredits: mergedHistory.reduce((sum, h) => sum + h.earnedCredits, 0),
    },
    timetable: mergedTimetable,
    academicCalendar: mergedCalendar,
    backlogs: mergedBacklogs,
  };
}
