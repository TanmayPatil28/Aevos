import { TraceMetadata } from "../../stores/selectors";
import { pluggableRegulationEngine } from "../academic-intelligence/regulations/regulationEngine";

export interface CourseAttendanceMetrics {
  percentage: number;
  detentionRisk: "LOW" | "MEDIUM" | "HIGH";
  safeBunks: number;
  recoveryRequired: number;
}

export interface AttendanceEngineResult {
  metrics: CourseAttendanceMetrics;
  trace: TraceMetadata;
}

export interface AggregateAttendanceMetrics {
  aggregatePercentage: number;
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  totalAttended: number;
  totalConducted: number;
}

export interface AggregateAttendanceResult {
  metrics: AggregateAttendanceMetrics;
  trace: TraceMetadata;
}

/**
 * Deterministic Attendance Calculation Engine
 * stateless, robust, handles edge cases (like zero lectures conducted),
 * and provides full TraceMetadata audit-grade explainability.
 */
export const attendanceEngine = {
  /**
   * Computes granular attendance metrics for a single course.
   */
  calculateCourseAttendance(
    attended: number,
    conducted: number,
    minAttendance: number = 75,
    presetId: string = "sppu"
  ): AttendanceEngineResult {
    // 1. Boundary Guards
    const safeConducted = Math.max(0, conducted);
    const safeAttended = Math.max(0, Math.min(safeConducted, attended));
    const safeMinAtt = Math.max(1, Math.min(100, minAttendance));
    const minAttDecimal = safeMinAtt / 100;

    // 2. Base percentage calculation
    const percentage = safeConducted > 0 ? (safeAttended / safeConducted) * 100 : 100;

    // 3. Bunks & Recovery Math
    let safeBunks = 0;
    let recoveryRequired = 0;

    if (percentage >= safeMinAtt) {
      // Bunks safe: floor((Attended - (minAttDecimal * Conducted)) / minAttDecimal)
      // Since each bunk conducts another lecture, if a student bunks, total conducted increases by 1,
      // but attended stays the same. The formula is: Attended / (Conducted + Bunks) >= minAttDecimal
      // Attended >= minAttDecimal * Conducted + minAttDecimal * Bunks
      // Bunks * minAttDecimal <= Attended - minAttDecimal * Conducted
      // Bunks <= (Attended - minAttDecimal * Conducted) / minAttDecimal
      // Bunks <= Attended / minAttDecimal - Conducted
      if (minAttDecimal > 0) {
        safeBunks = Math.floor(safeAttended / minAttDecimal - safeConducted);
      }
      safeBunks = Math.max(0, safeBunks);
    } else {
      // Recovery required: If you attend all future classes,
      // (Attended + Recovery) / (Conducted + Recovery) >= minAttDecimal
      // Attended + Recovery >= minAttDecimal * Conducted + minAttDecimal * Recovery
      // Recovery * (1 - minAttDecimal) >= minAttDecimal * Conducted - Attended
      // Recovery >= (minAttDecimal * Conducted - Attended) / (1 - minAttDecimal)
      const denominator = 1 - minAttDecimal;
      if (denominator > 0) {
        recoveryRequired = Math.ceil((minAttDecimal * safeConducted - safeAttended) / denominator);
      }
      recoveryRequired = Math.max(0, recoveryRequired);
    }

    // 4. Detention Risk Mapping
    let detentionRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (percentage < safeMinAtt) {
      detentionRisk = "HIGH";
    } else if (percentage < safeMinAtt + 5) {
      detentionRisk = "MEDIUM";
    }

    // 5. Ordinance Mapping (Trace Metadata)
    const resolvedTrace = pluggableRegulationEngine.resolveAttendanceTrace(presetId);
    const sourceClause = resolvedTrace.sourceClause;
    const sourceCircular = resolvedTrace.sourceCircular;
    const sourceRegulationId = resolvedTrace.sourceRegulationId;

    const attWarnings: string[] = [];
    if (percentage < safeMinAtt) {
      attWarnings.push(`Course attendance is below the mandatory threshold of ${safeMinAtt}%: current percentage is ${percentage.toFixed(1)}%.`);
    }

    const attFallbacks: string[] = [];
    if (safeConducted === 0) {
      attFallbacks.push("Total conducted classes is 0. Defaulted course attendance to 100% and risk parameters to LOW.");
    }

    const trace: TraceMetadata = {
      formulaApplied: percentage >= safeMinAtt
        ? `SafeBunks = Math.floor(Attended / ${minAttDecimal.toFixed(2)} - Conducted)`
        : `RecoveryRequired = Math.ceil((${minAttDecimal.toFixed(2)} * Conducted - Attended) / ${(1 - minAttDecimal).toFixed(2)})`,
      sourceRegulationId,
      sourceClause,
      sourceCircular,
      lastVerifiedAt: "2026-05-21T00:00:00Z",
      confidenceScore: 99,
      assumptions: [
        `Assumes constant class size and uniform lecture schedule`,
        `Assumes standard minimum required attendance threshold of ${safeMinAtt}%`
      ],
      warnings: attWarnings.length > 0 ? attWarnings : undefined,
      fallbackConditions: attFallbacks.length > 0 ? attFallbacks : undefined,
    };

    return {
      metrics: {
        percentage: parseFloat(percentage.toFixed(1)),
        detentionRisk,
        safeBunks,
        recoveryRequired,
      },
      trace,
    };
  },

  /**
   * Computes aggregate attendance metrics across multiple courses.
   */
  calculateAggregateAttendance(
    courses: Array<{ attended: number; conducted: number }>,
    minAttendance: number = 75,
    presetId: string = "sppu"
  ): AggregateAttendanceResult {
    let totalAttended = 0;
    let totalConducted = 0;

    for (const c of courses) {
      totalAttended += Math.max(0, c.attended);
      totalConducted += Math.max(0, c.conducted);
    }

    const percentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;

    let overallRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (percentage < minAttendance) {
      overallRisk = "HIGH";
    } else if (percentage < minAttendance + 5) {
      overallRisk = "MEDIUM";
    }

    const aggWarnings: string[] = [];
    if (percentage < minAttendance) {
      aggWarnings.push(`Aggregate attendance is below the mandatory university threshold of ${minAttendance}%.`);
    }

    const aggFallbacks: string[] = [];
    if (totalConducted === 0) {
      aggFallbacks.push("Total conducted classes across all courses is 0. Defaulting aggregate attendance to 100%.");
    }

    const trace: TraceMetadata = {
      formulaApplied: "AggregatePercentage = (TotalAttended / TotalConducted) * 100",
      sourceRegulationId: `${presetId.toUpperCase()}-GEN-ATTENDANCE`,
      sourceClause: "Aggregate Attendance Policy",
      sourceCircular: "General University Ordinances",
      lastVerifiedAt: "2026-05-21T00:00:00Z",
      confidenceScore: 98,
      assumptions: [
        "Assumes credit-hours do not skew attendance weighting",
        "Assumes equal weighting across all registered courses"
      ],
      warnings: aggWarnings.length > 0 ? aggWarnings : undefined,
      fallbackConditions: aggFallbacks.length > 0 ? aggFallbacks : undefined,
    };

    return {
      metrics: {
        aggregatePercentage: parseFloat(percentage.toFixed(1)),
        overallRisk,
        totalAttended,
        totalConducted,
      },
      trace,
    };
  },
};
