import { USMStoreState } from "../usmStore";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { selectActiveCourses, selectDerivedGPA } from "./academic";
import { createSelector } from "./memo";

export interface DerivedAttendanceCourseRisk {
  courseId: string;
  courseName: string;
  courseCode: string;
  percentage: number;
  status: "PRESENT" | "ABSENT" | "CANCELLED" | "LOW_RISK" | "MED_RISK" | "HIGH_RISK";
  detentionRisk: "LOW" | "MEDIUM" | "HIGH";
  safeBunks: number;
  recoveryRequired: number;
}

export interface DerivedAttendanceStatus {
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  aggregatePercentage: number;
  courses: DerivedAttendanceCourseRisk[];
}

export interface DerivedRecoveryPlan {
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME" | "IMPOSSIBLE";
  requiredSgpa: number;
  explainReason: string;
}

/**
 * Attendance Risk Selector.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectAttendanceRisk = createSelector((state: USMStoreState): DerivedAttendanceStatus => {
  const activeCourses = selectActiveCourses(state);
  const preset = getPresetById(state.presetId);
  const minAttendance = preset?.passRules?.minAttendance || 75;

  let totalAttendedSum = 0;
  let totalConductedSum = 0;

  const courses: DerivedAttendanceCourseRisk[] = activeCourses.map((course) => {
    const conducted = course.attendanceTotal;
    const bunked = course.attendanceBunked;
    const attended = Math.max(0, conducted - bunked);

    totalAttendedSum += attended;
    totalConductedSum += conducted;

    const percentage = conducted > 0 ? (attended / conducted) * 100 : 100;
    
    let safeBunks = 0;
    let recoveryRequired = 0;

    const attendanceDecimal = minAttendance / 100;
    if (percentage >= minAttendance) {
      safeBunks = Math.floor((attended - attendanceDecimal * conducted) / attendanceDecimal);
      safeBunks = Math.max(0, safeBunks);
    } else {
      recoveryRequired = Math.ceil(
        (attendanceDecimal * conducted - attended) / (1 - attendanceDecimal)
      );
      recoveryRequired = Math.max(0, recoveryRequired);
    }

    let detentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (percentage < minAttendance) {
      detentionRisk = "HIGH";
    } else if (percentage < minAttendance + 5) {
      detentionRisk = "MEDIUM";
    }

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      percentage: parseFloat(percentage.toFixed(1)),
      status: percentage < minAttendance ? "HIGH_RISK" : percentage < minAttendance + 5 ? "MED_RISK" : "LOW_RISK",
      detentionRisk,
      safeBunks,
      recoveryRequired,
    };
  });

  const aggregatePercentage =
    totalConductedSum > 0 ? (totalAttendedSum / totalConductedSum) * 100 : 100;

  let overallRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (aggregatePercentage < minAttendance) {
    overallRisk = "HIGH";
  } else if (aggregatePercentage < minAttendance + 5) {
    overallRisk = "MEDIUM";
  }

  return {
    overallRisk,
    aggregatePercentage: parseFloat(aggregatePercentage.toFixed(1)),
    courses,
  };
});

/**
 * Recovery Difficulty & Target Back-Solver Selector.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectRecoveryDifficulty = createSelector((state: USMStoreState): DerivedRecoveryPlan => {
  const { cgpa } = selectDerivedGPA(state);
  const targetCgpa = state.academic.targetCgpa;
  const earnedCredits = state.academic.earnedCredits;
  
  const activeCourses = selectActiveCourses(state);
  const currentSemesterCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);

  if (currentSemesterCredits === 0) {
    return {
      difficulty: "MODERATE",
      requiredSgpa: 0,
      explainReason: "No credit courses registered in the current active semester.",
    };
  }

  const requiredSgpa =
    (targetCgpa * (earnedCredits + currentSemesterCredits) - cgpa * earnedCredits) /
    currentSemesterCredits;

  let difficulty: DerivedRecoveryPlan["difficulty"] = "EASY";
  let explainReason = "";

  if (requiredSgpa <= 6.0) {
    difficulty = "EASY";
    explainReason = `Requires SGPA of ${requiredSgpa.toFixed(2)}, which is standard and easily achievable.`;
  } else if (requiredSgpa <= 7.5) {
    difficulty = "MODERATE";
    explainReason = `Requires SGPA of ${requiredSgpa.toFixed(2)}. Maintain steady performance and solid CIE marks.`;
  } else if (requiredSgpa <= 8.5) {
    difficulty = "CHALLENGING";
    explainReason = `Requires SGPA of ${requiredSgpa.toFixed(2)}. You need to secure A/A+ grades in core theory courses.`;
  } else if (requiredSgpa <= 9.5) {
    difficulty = "EXTREME";
    explainReason = `Requires SGPA of ${requiredSgpa.toFixed(2)}. This warrants exceptional scores in both internals and SEE.`;
  } else {
    difficulty = "IMPOSSIBLE";
    explainReason = `Requires SGPA of ${requiredSgpa.toFixed(2)}, which exceeds the maximum limit of 10.0. Readjust target CGPA.`;
  }

  return {
    difficulty,
    requiredSgpa: parseFloat(Math.max(0, requiredSgpa).toFixed(2)),
    explainReason,
  };
});
