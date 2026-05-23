import { IntelligenceContext, IntelligenceResult, ExplanationTree, EngineTrace } from "../../types";
import { IntelligenceSandbox } from "../../sandbox/IntelligenceSandbox";

export interface TargetCgpaParams {
  targetCgpa: number;
  upcomingSemesterCredits: number;
}

export interface TargetCgpaOutcome {
  isPossible: boolean;
  requiredSgpa: number;
  shortfallAmount?: number;
}

/**
 * Target CGPA Strategy Engine
 * 
 * Computes the required SGPA in the next semester to hit a specific Target CGPA.
 * Generates mathematically explainable projection trees handling credit constraints.
 */
export function runTargetCgpaEngine(
  context: IntelligenceContext, 
  params: TargetCgpaParams
): IntelligenceResult<TargetCgpaOutcome> {
  const engineId = "strategy_target_cgpa";
  const engineVersion = "1.0";
  const startTime = Date.now();

  const sandbox = new IntelligenceSandbox(context);
  const profile = sandbox.getProjectedProfile();

  // 1. Gather Current Standing
  let currentTotalCredits = 0;
  let currentTotalPoints = 0;

  profile.semesterHistory.forEach(sem => {
    currentTotalCredits += sem.credits;
    currentTotalPoints += (sem.sgpa * sem.credits);
  });

  const currentCgpa = currentTotalCredits > 0 ? (currentTotalPoints / currentTotalCredits) : 0;

  // 2. Perform Goal-Seek Math
  const targetTotalCredits = currentTotalCredits + params.upcomingSemesterCredits;
  const targetTotalPoints = params.targetCgpa * targetTotalCredits;
  const requiredPointsNextSem = targetTotalPoints - currentTotalPoints;
  
  const requiredSgpa = requiredPointsNextSem / params.upcomingSemesterCredits;
  const roundedRequiredSgpa = parseFloat(requiredSgpa.toFixed(2));

  // 3. Evaluate Institutional Constraints (e.g., max SGPA is 10.0)
  const isPossible = roundedRequiredSgpa <= 10.0;
  
  // 4. Construct Explanation Tree
  const explanation: ExplanationTree = {
    assumptions: [
      `Upcoming semester will carry exactly ${params.upcomingSemesterCredits} credits.`,
      `Past semesters are authoritative and immutable.`
    ],
    calculations: [
      {
        step: "Current Total Grade Points",
        formula: `Σ(Past SGPAs × Credits) = ${currentTotalPoints.toFixed(2)}`,
        result: `${currentTotalPoints.toFixed(2)} points over ${currentTotalCredits} credits`
      },
      {
        step: "Required Total Grade Points",
        formula: `Target CGPA (${params.targetCgpa}) × Total Projected Credits (${targetTotalCredits})`,
        result: `${targetTotalPoints.toFixed(2)} points required`
      },
      {
        step: "Required Upcoming SGPA",
        formula: `(Required Total Points - Current Total Points) / Upcoming Credits`,
        result: `(${targetTotalPoints.toFixed(2)} - ${currentTotalPoints.toFixed(2)}) / ${params.upcomingSemesterCredits} = ${roundedRequiredSgpa}`
      }
    ],
    dependencies: ["AcademicProfile.semesterHistory", "User Target Input"],
    constraints: [
      "Maximum achievable SGPA in a single semester is 10.0."
    ],
    confidence: context.trustMetadata?.verified ? "HIGH" : "MEDIUM",
    projectedImpact: isPossible 
      ? `Achievable. Requires a minimum SGPA of ${roundedRequiredSgpa}.` 
      : `Mathematically impossible. Maximum achievable CGPA is ${parseFloat(((currentTotalPoints + (10 * params.upcomingSemesterCredits)) / targetTotalCredits).toFixed(2))}.`
  };

  const trace: EngineTrace = {
    engineId,
    engineVersion,
    inputs: params as any,
    assumptions: explanation.assumptions,
    executionTimestamp: startTime,
  };

  return {
    outcome: {
      isPossible,
      requiredSgpa: roundedRequiredSgpa,
      shortfallAmount: !isPossible ? (roundedRequiredSgpa - 10.0) : undefined,
    },
    explanation,
    trace,
    dataQualityContext: context.trustMetadata?.verified ? "Authoritative Verified Data" : "Unverified Import Data"
  };
}
