import { IntelligenceContext, IntelligenceResult, ExplanationTree, EngineTrace } from "../../types";

export interface DetentionRiskOutcome {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  activeBacklogs: number;
  maxAllowedBacklogs: number; // Institution-specific rule
}

/**
 * Detention Risk Engine
 * 
 * Analyzes active backlogs and academic progress against institutional rules 
 * to deterministically compute Year-Down (Detention) risk.
 */
export function runDetentionRiskEngine(
  context: IntelligenceContext
): IntelligenceResult<DetentionRiskOutcome> {
  const engineId = "risk_detention";
  const engineVersion = "1.0";
  const startTime = Date.now();

  const profile = context.authoritativeProfile;
  const activeBacklogs = profile.academic.activeBacklogsCount || 0;
  
  // Assume generic SPPU ATKT rule: max 4 backlogs allowed to progress to next academic year.
  // In a multi-university system, this threshold would be fetched from a Regulation Engine.
  const maxAllowedBacklogs = 4;

  let riskLevel: DetentionRiskOutcome["riskLevel"] = "LOW";
  let projectedImpact = "Safe to progress to the next academic year.";

  if (activeBacklogs >= maxAllowedBacklogs) {
    riskLevel = "CRITICAL";
    projectedImpact = "Year-down detention imminent. Must clear backlogs immediately.";
  } else if (activeBacklogs === maxAllowedBacklogs - 1) {
    riskLevel = "HIGH";
    projectedImpact = "One backlog away from detention. Extremely dangerous.";
  } else if (activeBacklogs > 0) {
    riskLevel = "MEDIUM";
    projectedImpact = "Backlogs exist but are currently within ATKT progression limits.";
  }

  const explanation: ExplanationTree = {
    assumptions: [
      `Institutional ATKT threshold is set to a maximum of ${maxAllowedBacklogs} backlogs.`
    ],
    calculations: [
      {
        step: "Active Backlog Count",
        formula: `Count(Courses where Grade in ['F', 'FF'])`,
        result: `${activeBacklogs} active backlogs detected.`
      },
      {
        step: "Threshold Comparison",
        formula: `Active Backlogs (${activeBacklogs}) >= Max Allowed (${maxAllowedBacklogs})`,
        result: activeBacklogs >= maxAllowedBacklogs ? "Exceeds Threshold (Detention)" : "Within Threshold (ATKT Allowed)"
      }
    ],
    dependencies: ["AcademicProfile.academic.activeBacklogsCount", "Institution Regulation Constraints"],
    constraints: [
      "Assumes current semester results are fully published.",
      `Detention occurs at >= ${maxAllowedBacklogs} active backlogs.`
    ],
    confidence: context.trustMetadata?.verified ? "HIGH" : "MEDIUM",
    projectedImpact,
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
      riskLevel,
      activeBacklogs,
      maxAllowedBacklogs,
    },
    explanation,
    trace,
    dataQualityContext: context.trustMetadata?.verified ? "Authoritative Verified Data" : "Unverified Import Data"
  };
}
