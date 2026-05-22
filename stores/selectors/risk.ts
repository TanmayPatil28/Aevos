import { USMStoreState, RiskState } from "../usmStore";
import { selectDerivedGPA } from "./academic";
import { selectAttendanceRisk } from "./attendance";
import { selectPlacementEligibility } from "./placement";
import { selectVolatility, selectTrajectorySlope } from "./forecasting";
import { createSelector } from "./memo";

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

/**
 * Academic Health Score Selector (0 - 100).
 * Uses the approved stateless math weighting:
 * - CGPA (40%)
 * - Attendance (30%)
 * - Active Backlogs (15%)
 * - Placement Compliance (15%)
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectAcademicHealth = createSelector((state: USMStoreState): number => {
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
});

/**
 * Composite Risk Selector.
 * Derives a complete RiskState from live academic data instead of requiring manual setting.
 * Uses: health score, volatility, trajectory slope, attendance, backlogs, placement eligibility.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectCompositeRisk = createSelector((state: USMStoreState): RiskState => {
  const healthScore = selectAcademicHealth(state);
  const volatility = selectVolatility(state);
  const slope = selectTrajectorySlope(state);
  const { overallRisk: attendanceOverallRisk } = selectAttendanceRisk(state);
  const backlogs = state.academic.activeBacklogsCount;
  const { overallStatus: placementOverall } = selectPlacementEligibility(state);

  // Attendance Risk: directly from attendance selector
  const attendanceRisk = attendanceOverallRisk;

  // Backlog Risk: 0 = LOW, 1 = MEDIUM, 2+ = HIGH
  let backlogRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (backlogs >= 2) {
    backlogRisk = "HIGH";
  } else if (backlogs === 1) {
    backlogRisk = "MEDIUM";
  }

  // Detention Risk: based on attendance + backlogs combined
  let detentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (attendanceRisk === "HIGH" || (backlogs >= 2 && attendanceRisk === "MEDIUM")) {
    detentionRisk = "HIGH";
  } else if (attendanceRisk === "MEDIUM" || backlogs >= 1) {
    detentionRisk = "MEDIUM";
  }

  // Placement Risk: from eligibility engine
  let placementRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (placementOverall === "INELIGIBLE") {
    placementRisk = "HIGH";
  } else if (placementOverall === "BORDERLINE") {
    placementRisk = "MEDIUM";
  }

  // CGPA Volatility: use the computed volatility directly
  const cgpaVolatility = volatility;

  return {
    attendanceRisk,
    backlogRisk,
    detentionRisk,
    placementRisk,
    cgpaVolatility,
  };
});
