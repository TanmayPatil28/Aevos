/**
 * core/analytics/risk-engine/dropout-risk.ts
 *
 * Deterministic dropout risk classification engine.
 *
 * Evaluates a student's feature vector to classify academic risk.
 * This powers early warning systems for the student dashboard.
 */

import type { StudentFeatureVector } from '../../types';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAnalysisResult {
  readonly level: RiskLevel;
  readonly score: number; // 0.0 to 100.0
  readonly riskFactors: readonly string[];
}

export class DropoutRiskEngine {
  /**
   * Analyzes student features to determine academic risk level.
   */
  static analyze(features: StudentFeatureVector): RiskAnalysisResult {
    let score = 0;
    const factors: string[] = [];

    // 1. Backlog Analysis
    if (features.backlogCount >= 4) {
      score += 40;
      factors.push(`Critical backlog count (${features.backlogCount})`);
    } else if (features.backlogCount > 0) {
      score += features.backlogCount * 8;
      factors.push(`Active backlogs (${features.backlogCount})`);
    }

    // 2. CGPA Analysis
    if (features.currentCgpa < 5.0) {
      score += 30;
      factors.push(`CGPA (${features.currentCgpa}) below standard passing threshold`);
    } else if (features.currentCgpa < 6.0) {
      score += 15;
      factors.push(`Marginal CGPA (${features.currentCgpa})`);
    }

    // 3. Trajectory Analysis (if history exists)
    if (features.semesterVelocity !== undefined && features.semesterVelocity < -0.5) {
      score += 20;
      factors.push('Sharp decline in recent academic performance');
    }

    // 4. Attendance Analysis
    if (features.attendanceRate < 0.75) {
      score += 25;
      factors.push(`Poor attendance rate (${(features.attendanceRate * 100).toFixed(0)}%)`);
    }

    // Clamp score
    score = Math.min(100, Math.max(0, score));

    // Determine level
    let level: RiskLevel;
    if (score >= 75) level = 'critical';
    else if (score >= 50) level = 'high';
    else if (score >= 25) level = 'medium';
    else level = 'low';

    return {
      level,
      score,
      riskFactors: factors,
    };
  }
}
