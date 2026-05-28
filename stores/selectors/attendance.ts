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
  detentionRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  safeBunks: number;
  recoveryRequired: number;
  
  // New Mock Data for Risk Intelligence
  facultyStrictness: "CHILL" | "MODERATE" | "STRICT";
  internalsImpact: number; // Potential marks lost
  urgencyLevel: "STABLE" | "WARNING" | "CRITICAL";
}

export interface DerivedAttendanceStatus {
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  aggregatePercentage: number;
  survivalScore: "STABLE" | "RISKY" | "CRITICAL" | "ACADEMIC EMERGENCY";
  courses: DerivedAttendanceCourseRisk[];
  worstCourseId: string | null;
}

export interface DerivedRecoveryPlan {
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME" | "IMPOSSIBLE";
  requiredSgpa: number;
  explainReason: string;
}

/**
 * Helper to generate pseudo-random strictness based on course code
 */
const getStrictness = (code: string): "CHILL" | "MODERATE" | "STRICT" => {
  const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (hash % 3 === 0) return "STRICT";
  if (hash % 3 === 1) return "MODERATE";
  return "CHILL";
};

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
  
  let worstPercentage = 100;
  let worstCourseId: string | null = null;

  const courses: DerivedAttendanceCourseRisk[] = activeCourses.map((course) => {
    const conducted = course.attendanceTotal;
    const bunked = course.attendanceBunked;
    const attended = Math.max(0, conducted - bunked);

    totalAttendedSum += attended;
    totalConductedSum += conducted;

    const percentage = conducted > 0 ? (attended / conducted) * 100 : 100;
    
    if (percentage < worstPercentage) {
      worstPercentage = percentage;
      worstCourseId = course.id;
    }
    
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

    let detentionRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (percentage < minAttendance - 10) {
      detentionRisk = "CRITICAL";
    } else if (percentage < minAttendance) {
      detentionRisk = "HIGH";
    } else if (percentage < minAttendance + 5) {
      detentionRisk = "MEDIUM";
    }

    const facultyStrictness = getStrictness(course.code);
    
    let urgencyLevel: "STABLE" | "WARNING" | "CRITICAL" = "STABLE";
    if (detentionRisk === "CRITICAL" || (detentionRisk === "HIGH" && facultyStrictness === "STRICT")) {
      urgencyLevel = "CRITICAL";
    } else if (detentionRisk === "HIGH" || detentionRisk === "MEDIUM") {
      urgencyLevel = "WARNING";
    }

    // Mock internal marks impact calculation
    let internalsImpact = 0;
    if (urgencyLevel === "CRITICAL") internalsImpact = Math.floor(Math.random() * 4) + 2; // 2-5 marks
    else if (urgencyLevel === "WARNING") internalsImpact = Math.floor(Math.random() * 2) + 1; // 1-2 marks

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      percentage: parseFloat(percentage.toFixed(1)),
      status: percentage < minAttendance ? "HIGH_RISK" : percentage < minAttendance + 5 ? "MED_RISK" : "LOW_RISK",
      detentionRisk,
      safeBunks,
      recoveryRequired,
      facultyStrictness,
      internalsImpact,
      urgencyLevel
    };
  });

  const aggregatePercentage =
    totalConductedSum > 0 ? (totalAttendedSum / totalConductedSum) * 100 : 100;

  let overallRisk: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY" = "LOW";
  let survivalScore: "STABLE" | "RISKY" | "CRITICAL" | "ACADEMIC EMERGENCY" = "STABLE";

  if (aggregatePercentage < minAttendance - 10) {
    overallRisk = "EMERGENCY";
    survivalScore = "ACADEMIC EMERGENCY";
  } else if (aggregatePercentage < minAttendance) {
    overallRisk = "HIGH";
    survivalScore = "CRITICAL";
  } else if (aggregatePercentage < minAttendance + 5) {
    overallRisk = "MEDIUM";
    survivalScore = "RISKY";
  }

  return {
    overallRisk,
    aggregatePercentage: parseFloat(aggregatePercentage.toFixed(1)),
    survivalScore,
    courses,
    worstCourseId
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

