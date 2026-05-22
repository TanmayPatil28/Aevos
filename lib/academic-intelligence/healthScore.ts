import { TraceMetadata } from "../../stores/selectors";

export interface HealthScoreInput {
  cgpa: number;
  targetCgpa: number;
  activeBacklogs: number;
  aggregateAttendancePercentage: number;
  eligibleCompaniesCount: number;
  totalCompaniesCount: number;
  presetId?: string;
}

export interface HealthScoreBreakdown {
  cgpaScore: number;       // out of 40
  attendanceScore: number; // out of 30
  backlogScore: number;    // out of 15
  placementScore: number;  // out of 15
  totalScore: number;      // out of 100
}

export interface HealthScoreResult {
  score: number;
  breakdown: HealthScoreBreakdown;
  status: "CRITICAL" | "CAUTION" | "EXCELLENT";
  reasons: string[];
  trace: TraceMetadata;
}

export const healthScoreEngine = {
  /**
   * Computes the unified 0-100 Academic Health score and returns detailed analysis with TraceMetadata.
   */
  calculate(input: HealthScoreInput): HealthScoreResult {
    const {
      cgpa,
      targetCgpa = 8.5,
      activeBacklogs,
      aggregateAttendancePercentage,
      eligibleCompaniesCount,
      totalCompaniesCount,
    } = input;

    const reasons: string[] = [];

    // A. CGPA Contribution (40% - max 40 points)
    // Floor is passing 4.0. Target CGPA represents 100% of this contribution.
    const targetDiff = Math.max(1, targetCgpa - 4.0);
    const cgpaFactor = (cgpa - 4.0) / targetDiff;
    const cgpaScore = Math.max(0, Math.min(1, cgpaFactor)) * 40;

    if (cgpa < 6.0) {
      reasons.push("CGPA is below 6.0, affecting general job eligibility.");
    } else if (cgpa < targetCgpa) {
      reasons.push(`CGPA (${cgpa.toFixed(2)}) is trailing your target of ${targetCgpa.toFixed(2)}.`);
    } else {
      reasons.push("Academic CGPA is performing on-track or exceeding target.");
    }

    // B. Attendance Contribution (30% - max 30 points)
    // >= 85% = full 30 pts.
    // 75% - 85% = linear from 15 to 30 pts.
    // < 75% = sharp drop (percentage * 0.15, max 15 pts) to represent high detention risk.
    let attendanceScore = 0;
    if (aggregateAttendancePercentage >= 85) {
      attendanceScore = 30;
    } else if (aggregateAttendancePercentage >= 75) {
      attendanceScore = 15 + ((aggregateAttendancePercentage - 75) / 10) * 15;
      reasons.push(`Aggregate attendance is caution-level (${aggregatePercentageString(aggregateAttendancePercentage)}), close to the 75% detention threshold.`);
    } else {
      attendanceScore = (aggregateAttendancePercentage / 75) * 10;
      reasons.push(`Critical detention risk! Aggregate attendance is ${aggregatePercentageString(aggregateAttendancePercentage)} (below mandatory 75% threshold).`);
    }

    // C. Active Backlogs Contribution (15% - max 15 points)
    // Zero backlogs = 15 pts. Each backlog drops score by 5 pts. Capped at 0.
    const backlogScore = Math.max(0, 15 - activeBacklogs * 5);
    if (activeBacklogs > 0) {
      reasons.push(`Active backlogs count (${activeBacklogs}) triggers a progression hazard and placement exclusion.`);
    } else {
      reasons.push("Zero active backlogs status maintained.");
    }

    // D. Placement Safety Contribution (15% - max 15 points)
    // Percentage of eligible companies mapped to 15 points.
    const placementRatio = totalCompaniesCount > 0 ? eligibleCompaniesCount / totalCompaniesCount : 1;
    const placementScore = placementRatio * 15;

    if (placementRatio < 0.5) {
      reasons.push("Placement eligibility is severely restricted by academic cutoffs.");
    } else if (placementRatio < 1.0) {
      reasons.push("Eligible for majority of recruitment partners, with minor borderline cutoffs.");
    } else {
      reasons.push("100% placement eligibility achieved across all default corporate recruiters.");
    }

    // Total score calculation
    const totalScore = cgpaScore + attendanceScore + backlogScore + placementScore;
    const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    let status: HealthScoreResult["status"] = "EXCELLENT";
    if (finalScore < 60 || activeBacklogs > 0 || aggregateAttendancePercentage < 75) {
      status = "CRITICAL";
    } else if (finalScore < 80) {
      status = "CAUTION";
    }

    const hsWarnings: string[] = [];
    if (status === "CRITICAL") {
      hsWarnings.push("Critical academic indicators detected! Take immediate corrective action on attendance or backlog clearance.");
    }
    if (aggregateAttendancePercentage < 75) {
      hsWarnings.push("Attendance is below the mandatory 75% threshold, placing you at risk of detention.");
    }
    if (activeBacklogs > 0) {
      hsWarnings.push(`Active backlogs (${activeBacklogs}) restrict placement opportunities and progression.`);
    }

    // Traceability metadata
    const trace: TraceMetadata = {
      formulaApplied: `AcademicHealth = 0.40 * CGPAScore(${cgpaScore.toFixed(1)}/40) + 0.30 * AttendanceScore(${attendanceScore.toFixed(1)}/30) + 0.15 * BacklogScore(${backlogScore.toFixed(1)}/15) + 0.15 * PlacementScore(${placementScore.toFixed(1)}/15)`,
      sourceRegulationId: "GF-AHS-V1",
      sourceClause: "GradeFlow Academic Health Scoring Model v1",
      sourceCircular: "GradeFlow Academic Intelligence Framework",
      lastVerifiedAt: "2026-05-21T00:00:00Z",
      confidenceScore: 99,
      assumptions: [
        "Assumes 75% minimum attendance threshold across all courses",
        "Assumes linear SGPA to CGPA progression weights",
        "Assumes standard recruitment benchmarks (TCS, Infosys, Cognizant, Accenture, Wipro, FAANG)"
      ],
      warnings: hsWarnings.length > 0 ? hsWarnings : undefined,
    };

    return {
      score: finalScore,
      breakdown: {
        cgpaScore: parseFloat(cgpaScore.toFixed(2)),
        attendanceScore: parseFloat(attendanceScore.toFixed(2)),
        backlogScore: parseFloat(backlogScore.toFixed(2)),
        placementScore: parseFloat(placementScore.toFixed(2)),
        totalScore: parseFloat(totalScore.toFixed(2)),
      },
      status,
      reasons,
      trace,
    };
  },
};

function aggregatePercentageString(pct: number): string {
  return `${pct.toFixed(1)}%`;
}
