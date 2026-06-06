"use client";

import { useUSMStore } from "@/stores/usmStore";
import {
  selectDerivedGPA,
  selectAttendanceRisk,
  selectPlacementEligibility,
  selectAcademicHealth,
  selectCompositeRisk,
  selectRecoveryDifficulty,
  selectActiveCourses,
  selectSemesterCredits,
} from "@/stores/selectors";

/**
 * JARVIS Context Builder
 * Serializes the entire GradeFlow intelligence layer into a compact
 * context string that Gemini can reason over.
 */
export function buildJarvisContext(): string {
  const state = useUSMStore.getState();

  // Core GPA
  const gpa = selectDerivedGPA(state);
  const credits = selectSemesterCredits(state);
  const courses = selectActiveCourses(state);
  const attendance = selectAttendanceRisk(state);
  const placement = selectPlacementEligibility(state);
  const health = selectAcademicHealth(state);
  const risk = selectCompositeRisk(state);
  const recovery = selectRecoveryDifficulty(state);

  // Compact course list
  const courseList = courses.map(c => ({
    name: c.name,
    code: c.code,
    credits: c.credits,
    grade: c.grade || "N/A",
    attendancePercent: c.attendanceTotal > 0
      ? ((c.attendanceTotal - c.attendanceBunked) / c.attendanceTotal * 100).toFixed(1)
      : "N/A",
    attendanceTotal: c.attendanceTotal,
    attendanceBunked: c.attendanceBunked,
  }));

  // Compact attendance risks
  const attendanceSummary = attendance.courses.map(c => ({
    name: c.courseName,
    pct: c.percentage,
    safeBunks: c.safeBunks,
    recoveryNeeded: c.recoveryRequired,
    risk: c.detentionRisk,
    urgency: c.urgencyLevel,
  }));

  // Placement eligibility (safe access)
  let placementSummary: any = null;
  try {
    if (placement && typeof placement === "object") {
      placementSummary = placement;
    }
  } catch {
    placementSummary = null;
  }

  const context = {
    student: {
      name: state.identity?.studentIdentity?.name || "Student",
      university: state.presetId || "Unknown",
      programme: state.academic.programme || "B.Tech",
      branch: state.academic.branch || "Unknown",
      batchYear: state.academic.batchYear || "Unknown",
      completedSemesters: state.academic.completedSemesters,
    },
    gpa: {
      currentSGPA: gpa.sgpa,
      currentCGPA: gpa.cgpa,
      percentage: gpa.percentage,
      targetCGPA: state.academic.targetCgpa,
    },
    credits: {
      totalActive: credits.totalActiveCredits,
      earned: credits.earnedCredits,
      simulatedEarned: credits.simulatedEarnedCredits,
      failed: credits.failedCredits,
    },
    courses: courseList,
    attendance: {
      overallRisk: attendance.overallRisk,
      aggregatePercentage: attendance.aggregatePercentage,
      survivalScore: attendance.survivalScore,
      courseRisks: attendanceSummary,
    },
    recovery: {
      difficulty: recovery.difficulty,
      requiredSGPA: recovery.requiredSgpa,
      explanation: recovery.explainReason,
    },
    academicHealthScore: health,
    compositeRisk: risk,
    placement: placementSummary,
    career: {
      targetRole: state.career?.targetRole || null,
      targetPackage: state.career?.targetPackage || null,
      skills: state.career?.skills || [],
      targetCompanies: state.career?.targetCompanies || [],
    },
    backlogs: state.academic.activeBacklogsCount,
    semesterHistory: state.semesterHistory?.map(s => ({
      semester: s.semester,
      sgpa: s.sgpa,
      credits: s.credits,
    })) || [],
  };

  return JSON.stringify(context, null, 0);
}

/**
 * Returns a compact one-liner summary for quick Gemini prompts.
 */
export function buildJarvisQuickContext(): string {
  const state = useUSMStore.getState();
  const gpa = selectDerivedGPA(state);
  const attendance = selectAttendanceRisk(state);
  const health = selectAcademicHealth(state);

  return `CGPA:${gpa.cgpa} SGPA:${gpa.sgpa} Attendance:${attendance.aggregatePercentage}% Health:${health}/100 Backlogs:${state.academic.activeBacklogsCount} Semesters:${state.academic.completedSemesters}`;
}
