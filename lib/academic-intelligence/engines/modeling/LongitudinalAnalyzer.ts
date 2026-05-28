import { IntelligenceContext, IntelligenceResult, ExplanationTree, EngineTrace } from "../../types";

export interface LongitudinalOutcome {
  trendDirection: "UPWARD" | "DOWNWARD" | "STABLE" | "VOLATILE";
  velocity: number; // Rate of SGPA change per semester
  consecutiveDrops: number;
}

/**
 * Longitudinal Analyzer
 * 
 * Computes historical academic momentum, velocity, and trend direction.
 * Essential for predicting early burnout or identifying recovery patterns.
 */
export function runLongitudinalAnalyzer(
  context: IntelligenceContext
): IntelligenceResult<LongitudinalOutcome> {
  const engineId = "modeling_longitudinal";
  const engineVersion = "1.0";
  const startTime = Date.now();

  const history = [...context.authoritativeProfile.semesterHistory].sort((a, b) => a.semester - b.semester);

  let velocity = 0;
  let consecutiveDrops = 0;
  let trendDirection: LongitudinalOutcome["trendDirection"] = "STABLE";

  if (history.length > 1) {
    const latest = history[history.length - 1].sgpa;
    const previous = history[history.length - 2].sgpa;
    
    // Simple 1-semester velocity
    velocity = parseFloat((latest - previous).toFixed(2));

    // Calculate consecutive drops
    for (let i = history.length - 1; i > 0; i--) {
      if (history[i].sgpa < history[i - 1].sgpa) {
        consecutiveDrops++;
      } else {
        break;
      }
    }

    if (consecutiveDrops >= 2) {
      trendDirection = "DOWNWARD";
    } else if (velocity > 0.5) {
      trendDirection = "UPWARD";
    } else if (Math.abs(velocity) < 0.2) {
      trendDirection = "STABLE";
    } else {
      trendDirection = "VOLATILE";
    }
  }

  const explanation: ExplanationTree = {
    assumptions: [
      "Semester sequence is chronologically unbroken."
    ],
    calculations: [
      {
        step: "Recent Velocity",
        formula: `Latest SGPA - Previous SGPA`,
        result: history.length > 1 ? `${history[history.length - 1].sgpa} - ${history[history.length - 2].sgpa} = ${velocity}` : "N/A"
      },
      {
        step: "Consecutive Drop Count",
        formula: `Count(n where SGPA[n] < SGPA[n-1])`,
        result: `${consecutiveDrops} consecutive drops detected.`
      }
    ],
    dependencies: ["AcademicProfile.semesterHistory"],
    constraints: ["Requires at least 2 completed semesters for velocity calculation."],
    confidence: context.trustMetadata?.verified ? "HIGH" : "MEDIUM",
    projectedImpact: trendDirection === "DOWNWARD" 
      ? "Warning: Sustained downward trajectory detected. Immediate intervention recommended."
      : trendDirection === "UPWARD" 
        ? "Positive momentum detected. Strategy should focus on maintaining consistency."
        : "Academic performance is stable."
  };

  const trace: EngineTrace = {
    engineId,
    engineVersion,
    inputs: {},
    assumptions: explanation.assumptions,
    executionTimestamp: startTime,
  };

  return {
    outcome: {
      trendDirection,
      velocity,
      consecutiveDrops,
    },
    explanation,
    trace,
    dataQualityContext: context.trustMetadata?.verified ? "Authoritative Verified Data" : "Unverified Import Data"
  };
}
