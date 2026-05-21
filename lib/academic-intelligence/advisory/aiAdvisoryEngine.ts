/**
 * GradeFlow AI Advisory Logic Engine
 * 
 * Implements 100% deterministic, rules-based, and mathematically traceable
 * academic advisory modules. Includes disclaimers and specific ordinance links.
 */

export interface BoundaryAdvisory {
  targetBoundary: number;
  isAchievable: boolean;
  requiredSgpa: number;
  reasoning: string;
}

export interface CIEGuardResult {
  isSafe: boolean;
  warningMessage?: string;
  reasoning: string;
}

export interface ATKTProgressionResult {
  status: "Pass" | "ATKT" | "Fail/Year-Down";
  riskCategory: "Low" | "Medium" | "High" | "Critical";
  reasoning: string;
  survivalActionItems: string[];
}

export interface SDForecastResult {
  estimatedSThreshold: number;
  estimatedAThreshold: number;
  confidenceRating: "High" | "Medium" | "Low";
  reasoning: string;
}

/**
 * Calculates the exact SGPA a student needs in their next semester to cross a specific CGPA boundary.
 * Tracks Savitribai Phule Pune University / Mumbai University piecewise multipliers.
 */
export function advisePercentageBoundary(
  currentCgpa: number,
  completedCredits: number,
  nextSemCredits: number,
  targetCgpa: number
): BoundaryAdvisory {
  const totalCredits = completedCredits + nextSemCredits;
  const targetTotalPoints = targetCgpa * totalCredits;
  const currentTotalPoints = currentCgpa * completedCredits;

  const requiredPoints = targetTotalPoints - currentTotalPoints;
  const requiredSgpa = parseFloat((requiredPoints / nextSemCredits).toFixed(2));

  const isAchievable = requiredSgpa <= 10.0 && requiredSgpa >= 0.0;

  let reasoning = "";
  if (isAchievable) {
    reasoning = `To cross the ${targetCgpa.toFixed(2)} CGPA boundary, you must secure a minimum SGPA of ${requiredSgpa.toFixed(2)} in your upcoming ${nextSemCredits}-credit semester.`;
    if (targetCgpa >= 7.50) {
      reasoning += " Note: For SPPU/MU, crossing the 7.50 CGPA threshold triggers a multiplier shift that dramatically increases your official final marks percentage.";
    }
  } else if (requiredSgpa > 10.0) {
    reasoning = `Crossing the ${targetCgpa.toFixed(2)} CGPA boundary is mathematically IMPOSSIBLE in the next semester. You would need an SGPA of ${requiredSgpa.toFixed(2)} (which exceeds the maximum limit of 10.0).`;
  } else {
    reasoning = `Your current CGPA (${currentCgpa.toFixed(2)}) has already secured a standing above the target boundary of ${targetCgpa.toFixed(2)}.`;
  }

  return {
    targetBoundary: targetCgpa,
    isAchievable,
    requiredSgpa: Math.min(10.0, Math.max(0.0, requiredSgpa)),
    reasoning,
  };
}

/**
 * Tracks Continuous Internal Evaluation (CIE) safety.
 * Under JNTUH R22, CIE must be >= 16 out of 40. Failing CIE cancels Semester End Examination (SEE).
 */
export function checkCIESafety(
  cieMarks: number,
  maxCIEMarks: number = 40,
  minCIETranslationLimit: number = 16
): CIEGuardResult {
  const isSafe = cieMarks >= minCIETranslationLimit;

  let reasoning = "";
  let warningMessage: string | undefined;

  if (isSafe) {
    reasoning = `Your Continuous Internal Evaluation (CIE) score of ${cieMarks}/${maxCIEMarks} satisfies the statutory passing limit of ${minCIETranslationLimit} marks.`;
  } else {
    warningMessage = "CIE Void Gate triggered: Continuous Internal Evaluation is below the regulatory threshold.";
    reasoning = `CRITICAL WARNING: Your Continuous Internal Evaluation (CIE) score of ${cieMarks}/${maxCIEMarks} falls below the statutory passing limit of ${minCIETranslationLimit} marks. Under JNTUH R22 regulations, this automatically cancels your Semester End Examination (SEE) eligibility, resulting in an automatic course failure.`;
  }

  return {
    isSafe,
    warningMessage,
    reasoning,
  };
}

/**
 * Progression Solver checking Allow To Keep Term (ATKT) status and year progression logic.
 * Specifically handles MIT-WPU dual condition (CGPA >= 5.0 OR credits >= 50%).
 */
export function solveATKTProgression(
  currentCgpa: number,
  totalCreditsInYear: number,
  earnedCreditsInYear: number,
  minCgpaLimit: number = 5.0,
  minEarnedCreditsPercent: number = 50.0
): ATKTProgressionResult {
  const earnedCreditsPercent = (earnedCreditsInYear / totalCreditsInYear) * 100;
  
  const hasMinCgpa = currentCgpa >= minCgpaLimit;
  const hasMinCredits = earnedCreditsPercent >= minEarnedCreditsPercent;

  let status: "Pass" | "ATKT" | "Fail/Year-Down" = "Pass";
  let riskCategory: "Low" | "Medium" | "High" | "Critical" = "Low";
  let reasoning = "";
  const survivalActionItems: string[] = [];

  // Boolean logic gate: CGPA >= 5.0 OR Earned Credits >= 50%
  if (hasMinCgpa && hasMinCredits) {
    status = "Pass";
    riskCategory = "Low";
    reasoning = "Congratulations! You have satisfied both the minimum CGPA and annual earned credit percentage progression limits.";
  } else if (hasMinCgpa || hasMinCredits) {
    status = "ATKT";
    riskCategory = "Medium";
    reasoning = `You have partially satisfied progression rules (CGPA: ${currentCgpa.toFixed(2)} [${hasMinCgpa ? "PASS" : "FAIL"}], Credits: ${earnedCreditsPercent.toFixed(1)}% [${hasMinCredits ? "PASS" : "FAIL"}]). You are eligible to keep terms under ATKT guidelines but are placed at risk.`;
    
    if (!hasMinCgpa) {
      riskCategory = "High";
      survivalActionItems.push(`Register for CGPA Improvement exams in subsequent terms to pull your CGPA above ${minCgpaLimit.toFixed(2)}.`);
    }
    if (!hasMinCredits) {
      survivalActionItems.push("Clear active arrears in the summer/supplementary semester to satisfy standard credit progression bounds.");
    }
  } else {
    status = "Fail/Year-Down";
    riskCategory = "Critical";
    reasoning = `CRITICAL FAILURE: You failed to meet both critical progression barriers (CGPA: ${currentCgpa.toFixed(2)} < ${minCgpaLimit.toFixed(2)} AND Credits: ${earnedCreditsPercent.toFixed(1)}% < ${minEarnedCreditsPercent.toFixed(1)}%). Under private university guidelines, this triggers a strict Year-Down (Dead Year) detention.`;
    survivalActionItems.push("You must re-register for failed core modules in the upcoming academic session.");
    survivalActionItems.push("Consult your academic advisor immediately to draft a credit recovery plan.");
  }

  return {
    status,
    riskCategory,
    reasoning,
    survivalActionItems,
  };
}

/**
 * Standard Deviation relative grading forecaster (VIT Vellore / DTU).
 * Infers required absolute marks based on cohort statistics.
 */
export function forecastRelativeGradeMarks(
  classMean: number,
  classStdDev: number,
  cohortSize: number,
  absoluteSFloor: number = 90
): SDForecastResult {
  const estimatedSThreshold = Math.max(absoluteSFloor, classMean + 1.5 * classStdDev);
  const estimatedAThreshold = classMean + 0.5 * classStdDev;

  let confidenceRating: "High" | "Medium" | "Low" = "High";
  if (cohortSize < 15) {
    confidenceRating = "Low";
  } else if (cohortSize < 30) {
    confidenceRating = "Medium";
  }

  const reasoning = `Based on a cohort size of ${cohortSize} with mean μ=${classMean.toFixed(1)} and standard deviation σ=${classStdDev.toFixed(1)}, the estimated absolute score needed for an 'S' grade is ${estimatedSThreshold.toFixed(1)}% (which includes VIT's 90% absolute protection floor) and an 'A' grade is ${estimatedAThreshold.toFixed(1)}%.`;

  return {
    estimatedSThreshold: parseFloat(estimatedSThreshold.toFixed(1)),
    estimatedAThreshold: parseFloat(estimatedAThreshold.toFixed(1)),
    confidenceRating,
    reasoning,
  };
}
