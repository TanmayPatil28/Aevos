import { StrategyResult } from "./types";

export interface CourseDifference {
  courseId: string;
  courseCode: string;
  courseName: string;
  safeGrade: string;
  balancedGrade: string;
  aggressiveGrade: string;
}

export interface StrategyComparisonResult {
  cgpaSafe: number;
  cgpaBalanced: number;
  cgpaAggressive: number;
  sgpaSafe: number;
  sgpaBalanced: number;
  sgpaAggressive: number;
  feasibilitySafe: number;
  feasibilityBalanced: number;
  feasibilityAggressive: number;
  courseDifferences: CourseDifference[];
  riskRewardSummary: string;
}

export const strategyComparator = {
  /**
   * Compares SAFE, BALANCED, and AGGRESSIVE strategies side-by-side.
   */
  compare(
    safe: StrategyResult,
    balanced: StrategyResult,
    aggressive: StrategyResult
  ): StrategyComparisonResult {
    const courseDifferences: CourseDifference[] = [];
    
    // Find courses that differ in their targets across the strategies
    const courseIds = safe.courseTargets.map(t => t.courseId);
    
    for (const id of courseIds) {
      const safeTarget = safe.courseTargets.find(t => t.courseId === id);
      const balancedTarget = balanced.courseTargets.find(t => t.courseId === id);
      const aggressiveTarget = aggressive.courseTargets.find(t => t.courseId === id);
      
      if (safeTarget && balancedTarget && aggressiveTarget) {
        // If it's a fixed grade, it won't differ, but we only list it if there's any difference
        if (
          safeTarget.targetGrade !== balancedTarget.targetGrade ||
          balancedTarget.targetGrade !== aggressiveTarget.targetGrade
        ) {
          courseDifferences.push({
            courseId: id,
            courseCode: safeTarget.courseCode,
            courseName: safeTarget.courseName,
            safeGrade: safeTarget.targetGrade,
            balancedGrade: balancedTarget.targetGrade,
            aggressiveGrade: aggressiveTarget.targetGrade
          });
        }
      }
    }

    // Generate explanatory text comparing the risk-reward tradeoff
    let riskRewardSummary = "";

    if (!balanced.isAchievable && !aggressive.isAchievable) {
      riskRewardSummary = `The target CGPA is mathematically unreachable in this single semester. The Safe Path is your most realistic option to stabilize your GPA, while the Push Path requires near-perfect grades and has an extremely low feasibility score (${aggressive.feasibilityScore}%). Consider lowering your target CGPA or spreading the improvement goal across multiple semesters.`;
    } else if (!balanced.isAchievable) {
      riskRewardSummary = `Your target CGPA is highly ambitious and cannot be reached with the Balanced Path. However, the Push Path (${aggressive.projectedCgpa.toFixed(2)} CGPA) gets you closest, though it carries substantial academic pressure. The Safe Path represents a low-stress option to maintain stability.`;
    } else {
      const cgpaGain = balanced.projectedCgpa - safe.projectedCgpa;
      if (cgpaGain > 0.3) {
        riskRewardSummary = `The Balanced Path successfully meets your target CGPA (${balanced.projectedCgpa.toFixed(2)}) but demands significantly higher grades in key courses. The Safe Path offers a fallback that is much easier to achieve (${safe.feasibilityScore}% feasibility) but will leave you trailing your target CGPA by ${cgpaGain.toFixed(2)} points.`;
      } else {
        riskRewardSummary = `Your target CGPA is within comfortable reach. The Balanced Path requires only a minor step-up in grades compared to the Safe Path. Choosing the Push Path is recommended if you wish to build a strong safety buffer for future semesters.`;
      }
    }

    return {
      cgpaSafe: safe.projectedCgpa,
      cgpaBalanced: balanced.projectedCgpa,
      cgpaAggressive: aggressive.projectedCgpa,
      sgpaSafe: safe.projectedSgpa,
      sgpaBalanced: balanced.projectedSgpa,
      sgpaAggressive: aggressive.projectedSgpa,
      feasibilitySafe: safe.feasibilityScore,
      feasibilityBalanced: balanced.feasibilityScore,
      feasibilityAggressive: aggressive.feasibilityScore,
      courseDifferences,
      riskRewardSummary
    };
  }
};
