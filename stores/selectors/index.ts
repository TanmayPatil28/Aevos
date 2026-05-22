import { USMStoreState, CourseState } from "../usmStore";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { getScaleMode } from "../../lib/presets/types/universityPreset";

// ─── Interfaces & Outputs ───────────────────────────────────────────────────

export interface TraceMetadata {
  formulaApplied: string;
  sourceRegulationId: string;
  sourceClause: string;
  sourceCircular: string;
  lastVerifiedAt: string;
  confidenceScore: number;
  assumptions?: string[];
  warnings?: string[];
  fallbackConditions?: string[];
}

export interface PlacementCompany {
  name: string;
  cgpaCutoff: number;
  maxBacklogs: number;
  requiredCredits: number;
  eligible: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  reason: string;
}

export interface DerivedPlacementStatus {
  overallStatus: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  companies: PlacementCompany[];
  eligibleCount: number;
  totalCount: number;
}

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

export interface DerivedSemesterCredits {
  totalActiveCredits: number;
  earnedCredits: number;
  simulatedEarnedCredits: number;
  failedCredits: number;
}

export interface DerivedRecoveryPlan {
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME" | "IMPOSSIBLE";
  requiredSgpa: number;
  explainReason: string;
}

// ─── Standard Company Placement Cutoffs Benchmark ───────────────────────────
const COMPANYS_DATA = [
  { name: "TCS", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Infosys", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Cognizant", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60 },
  { name: "Accenture", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Wipro", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60 },
  { name: "FAANG / Top Tier", cgpaCutoff: 8.0, maxBacklogs: 0, requiredCredits: 80 },
];

// ─── Selectors Implementation ────────────────────────────────────────────────
// ─── Cache / Memoization Layer ────────────────────────────────────────────────
let lastActiveCoursesState: USMStoreState | null = null;
let lastActiveCoursesResult: CourseState[] | null = null;

let lastDerivedGPAState: USMStoreState | null = null;
let lastDerivedGPAResult: { sgpa: number; cgpa: number; percentage: number } | null = null;

// ─── Selectors Implementation ────────────────────────────────────────────────

/**
 * Computes active courses, taking simulated edits into account if simulation is running.
 */
export function selectActiveCourses(state: USMStoreState): CourseState[] {
  if (state === lastActiveCoursesState && lastActiveCoursesResult) {
    return lastActiveCoursesResult;
  }

  const { courses, simulation } = state;
  let result: CourseState[];
  if (!simulation.isSimulating) {
    result = courses;
  } else {
    result = courses.map((course) => {
      const simCourse = simulation.simulatedCourses[course.id] || {};
      const simAtt = simulation.simulatedAttendance[course.id] || {};

      const updatedBunked = Math.max(
        0,
        course.attendanceBunked + (simAtt.bunkedOffset || 0)
      );

      // If simulated marks are set, we might also derive a simulated grade
      let grade = course.grade;
      if (simCourse.grade !== undefined) {
        grade = simCourse.grade;
      }

      return {
        ...course,
        cieMarks: simCourse.cieMarks !== undefined ? simCourse.cieMarks : course.cieMarks,
        seeMarks: simCourse.seeMarks !== undefined ? simCourse.seeMarks : course.seeMarks,
        grade,
        attendanceBunked: updatedBunked,
      };
    });
  }

  lastActiveCoursesState = state;
  lastActiveCoursesResult = result;
  return result;
}

/**
 * Calculates current or simulated semester SGPA and active CGPA.
 */
export function selectDerivedGPA(state: USMStoreState): {
  sgpa: number;
  cgpa: number;
  percentage: number;
} {
  if (state === lastDerivedGPAState && lastDerivedGPAResult) {
    return lastDerivedGPAResult;
  }

  const activeCourses = selectActiveCourses(state);
  const preset = getPresetById(state.presetId);
  
  if (!preset) {
    return { sgpa: 0, cgpa: 0, percentage: 0 };
  }

  // Filter out audit courses (0 credits) as verified in VTU test
  const creditCourses = activeCourses.filter((c) => c.credits > 0);
  
  let totalGradePoints = 0;
  let totalCredits = 0;

  for (const course of creditCourses) {
    if (course.grade) {
      const scaleEntry = preset.gradeScale.find((g) => g.grade === course.grade);
      if (scaleEntry) {
        totalGradePoints += scaleEntry.points * course.credits;
        totalCredits += course.credits;
      }
    }
  }

  const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  
  // Calculate simulated/derived CGPA
  const completedSemesters = state.academic.completedSemesters;
  const currentCgpa = state.academic.currentCgpa;
  const earnedCredits = state.academic.earnedCredits;

  let derivedCgpa = currentCgpa;
  if (totalCredits > 0) {
    // Weighted formula: (CGPA * completedCredits + SGPA * semesterCredits) / (completedCredits + semesterCredits)
    derivedCgpa =
      (currentCgpa * earnedCredits + sgpa * totalCredits) / (earnedCredits + totalCredits);
  }

  // Convert CGPA to percentage using the preset formula
  let percentage = 0;
  
  // High fidelity deterministic percentage calculator
  if (state.presetId === "mu" || state.presetId === "mu_cbcs") {
    // Mumbai University piecewise linear percentage conversion
    if (derivedCgpa < 7.0) {
      percentage = 7.1 * derivedCgpa + 12.0;
    } else {
      percentage = 7.4 * derivedCgpa + 12.0;
    }
  } else if (state.presetId === "jntuh") {
    percentage = (derivedCgpa - 0.5) * 10;
  } else {
    // Standard SPPU & VTU: (CGPA - 0.75) * 10
    percentage = (derivedCgpa - 0.75) * 10;
  }

  percentage = Math.max(0, Math.min(100, percentage));

  const result = {
    sgpa: parseFloat(sgpa.toFixed(2)),
    cgpa: parseFloat(derivedCgpa.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2)),
  };

  lastDerivedGPAState = state;
  lastDerivedGPAResult = result;
  return result;
}

/**
 * 1. Placement Eligibility Selector
 */
export function selectPlacementEligibility(state: USMStoreState): DerivedPlacementStatus {
  const { cgpa } = selectDerivedGPA(state);
  const backlogs = state.academic.activeBacklogsCount;
  const totalCredits = state.academic.earnedCredits;

  const companies: PlacementCompany[] = COMPANYS_DATA.map((company) => {
    let eligible: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE" = "ELIGIBLE";
    const reasons: string[] = [];

    if (cgpa < company.cgpaCutoff) {
      if (company.cgpaCutoff - cgpa <= 0.25) {
        eligible = "BORDERLINE";
        reasons.push(`CGPA is ${cgpa} (Cutoff: ${company.cgpaCutoff})`);
      } else {
        eligible = "INELIGIBLE";
        reasons.push(`CGPA is below cutoff by ${(company.cgpaCutoff - cgpa).toFixed(2)}`);
      }
    }

    if (backlogs > company.maxBacklogs) {
      eligible = "INELIGIBLE";
      reasons.push(`Active backlogs: ${backlogs} (Max allowed: ${company.maxBacklogs})`);
    }

    if (totalCredits < company.requiredCredits) {
      if (company.requiredCredits - totalCredits <= 6) {
        if (eligible !== "INELIGIBLE") eligible = "BORDERLINE";
        reasons.push(`Earned credits: ${totalCredits} (Required: ${company.requiredCredits})`);
      } else {
        eligible = "INELIGIBLE";
        reasons.push(`Insufficient credits: ${totalCredits}/${company.requiredCredits}`);
      }
    }

    return {
      name: company.name,
      cgpaCutoff: company.cgpaCutoff,
      maxBacklogs: company.maxBacklogs,
      requiredCredits: company.requiredCredits,
      eligible,
      reason: reasons.length > 0 ? reasons.join(", ") : "Meets all baseline requirements",
    };
  });

  const eligibleCount = companies.filter((c) => c.eligible === "ELIGIBLE").length;
  const isAnyIneligible = companies.some((c) => c.eligible === "INELIGIBLE");
  const isAnyBorderline = companies.some((c) => c.eligible === "BORDERLINE");

  const overallStatus = isAnyIneligible
    ? "INELIGIBLE"
    : isAnyBorderline
    ? "BORDERLINE"
    : "ELIGIBLE";

  return {
    overallStatus,
    companies,
    eligibleCount,
    totalCount: companies.length,
  };
}

/**
 * 2. Attendance Risk Selector
 */
export function selectAttendanceRisk(state: USMStoreState): DerivedAttendanceStatus {
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
    
    // Calculate Safe Bunks & Recovery Required
    // Safe bunks: floor((Attended - (minAttendance% * conducted)) / minAttendance%)
    // Let's use standard formulas:
    // Max Safe Bunks: floor((Attended - (0.75 * Total)) / 0.25)
    // Required Attendance to Recover: ceil(3 * Absent - Attended)
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
}

/**
 * 3. Recovery Difficulty & Target Back-Solver Selector
 */
export function selectRecoveryDifficulty(state: USMStoreState): DerivedRecoveryPlan {
  const { cgpa } = selectDerivedGPA(state);
  const targetCgpa = state.academic.targetCgpa;
  const completedSemesters = state.academic.completedSemesters;
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

  // Solve for required SGPA:
  // targetCGPA = (currentCGPA * earnedCredits + requiredSGPA * currentSemCredits) / (earnedCredits + currentSemCredits)
  // requiredSGPA * currentSemCredits = targetCGPA * (earnedCredits + currentSemCredits) - currentCGPA * earnedCredits
  // requiredSGPA = (targetCGPA * (earnedCredits + currentSemCredits) - currentCGPA * earnedCredits) / currentSemCredits
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
}

/**
 * 4. Semester Credits Selector
 */
export function selectSemesterCredits(state: USMStoreState): DerivedSemesterCredits {
  const activeCourses = selectActiveCourses(state);
  
  const totalActiveCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const earnedCredits = state.academic.earnedCredits;

  // Simulated earned credits in this active semester
  const preset = getPresetById(state.presetId);
  const simEarned = activeCourses.reduce((sum, c) => {
    if (c.grade && preset) {
      const scale = preset.gradeScale.find((g) => g.grade === c.grade);
      if (scale && scale.isPass !== false) {
        return sum + c.credits;
      }
    }
    return sum;
  }, 0);

  const failedCredits = activeCourses.reduce((sum, c) => {
    if (c.grade && preset) {
      const scale = preset.gradeScale.find((g) => g.grade === c.grade);
      if (scale && scale.isPass === false) {
        return sum + c.credits;
      }
    }
    return sum;
  }, 0);

  return {
    totalActiveCredits,
    earnedCredits,
    simulatedEarnedCredits: earnedCredits + simEarned,
    failedCredits,
  };
}

/**
 * 5. Academic Health Score Selector (0 - 100)
 * Uses the approved stateless math weighting:
 * - CGPA (40%)
 * - Attendance (30%)
 * - Active Backlogs (15%)
 * - Placement Compliance (15%)
 */
export function selectAcademicHealth(state: USMStoreState): number {
  const { cgpa } = selectDerivedGPA(state);
  const targetCgpa = state.academic.targetCgpa || 8.5;
  const backlogs = state.academic.activeBacklogsCount;
  
  const { aggregatePercentage } = selectAttendanceRisk(state);
  const { eligibleCount, totalCount } = selectPlacementEligibility(state);
  
  // A. CGPA Contribution (max 40 pts)
  // Scale score relative to target CGPA. If current >= target, full 40 pts.
  // Else, linear ratio down to passing 4.0 GP floor.
  const targetDiff = targetCgpa - 4.0;
  const cgpaFactor = targetDiff > 0 ? (cgpa - 4.0) / targetDiff : 1;
  const cgpaScore = Math.max(0, Math.min(1, cgpaFactor)) * 40;

  // B. Attendance Contribution (max 30 pts)
  // 85% and above = full 30 pts.
  // Between 75% and 85% = linear from 15 to 30 pts.
  // Below 75% = sharp drop (percentage * 0.15, max 15 pts) to represent high risk.
  let attendanceScore = 0;
  if (aggregatePercentage >= 85) {
    attendanceScore = 30;
  } else if (aggregatePercentage >= 75) {
    attendanceScore = 15 + ((aggregatePercentage - 75) / 10) * 15;
  } else {
    attendanceScore = (aggregatePercentage / 75) * 10; // Capped below 10 pts
  }

  // C. Backlog Penalty Contribution (max 15 pts)
  // Zero backlogs = 15 pts. Each backlog drops score by 5 pts.
  const backlogScore = Math.max(0, 15 - backlogs * 5);

  // D. Placement Safety Contribution (max 15 pts)
  // Proportion of eligible companies
  const placementScore = totalCount > 0 ? (eligibleCount / totalCount) * 15 : 15;

  const totalScore = cgpaScore + attendanceScore + backlogScore + placementScore;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}
