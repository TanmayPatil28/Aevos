import { PLACEMENT_SCORING_CONFIG } from './scoring-config';
import { AcademicSimulator } from '../calculations/simulator';
import { SemesterState } from '../stores/academic-store';

export interface Company {
  id: string;
  name: string;
  category: string;
  minCgpa: number;
  avgPackage: number;
  sector: string;
  logoUrl?: string | null;
  allowedBranches: string[];
  backlogTolerance: number | null;
}

export interface PlacementReadiness {
  company: Company;
  currentCgpa: number;
  requiredCgpa: number;
  readinessScore: number;
  cgpaGap: number;
  status: 'eligible' | 'near-threshold' | 'at-risk' | 'ineligible';
  reasons: string[];
  nextBestAction: string;
  trajectoryConfidence: 'high' | 'medium' | 'low';
}

export interface CategoryReadiness {
  sector: string;
  readinessScore: number;
  status: PlacementReadiness['status'];
}

export interface PlacementProfile {
  currentCgpa: number;
  semesters: SemesterState[];
  activeBacklogs: number;
}

/**
 * Pure engine for computing placement readiness insights.
 * Deterministic and explainable.
 */
export class PlacementReadinessEngine {
  private config = PLACEMENT_SCORING_CONFIG;
  private simulator: AcademicSimulator;

  constructor(private profile: PlacementProfile) {
    this.simulator = new AcademicSimulator(profile.semesters);
  }

  public computeCompanyReadiness(company: Company): PlacementReadiness {
    const { currentCgpa, activeBacklogs } = this.profile;
    const requiredCgpa = company.minCgpa;
    const cgpaGap = Number((requiredCgpa - currentCgpa).toFixed(2));

    // 1. Calculate Component Scores (0-100)
    const cgpaScore = this.calculateCgpaScore(currentCgpa, requiredCgpa);
    const consistencyScore = this.simulator.calculateConsistencyScore();
    const trendScore = this.calculateTrendScore();
    const backlogScore = this.calculateBacklogScore(activeBacklogs, company.backlogTolerance ?? 0);

    // 2. Weighted Readiness Score
    const rawScore =
      cgpaScore * this.config.cgpaWeight +
      consistencyScore * this.config.consistencyWeight +
      trendScore * this.config.trendWeight +
      backlogScore * this.config.backlogPenaltyWeight;

    const readinessScore = Math.round(rawScore);

    // 3. Determine Status
    const status = this.deriveStatus(
      readinessScore,
      cgpaGap,
      activeBacklogs,
      company.backlogTolerance ?? 0
    );

    // 4. Trajectory Confidence
    const trajectoryConfidence = this.calculateTrajectoryConfidence();

    // 5. Explainability & Next Best Action
    const reasons = this.generateReasons(
      company,
      cgpaScore,
      consistencyScore,
      trendScore,
      backlogScore
    );
    const nextBestAction = this.generateNextBestAction(
      company,
      status,
      cgpaGap,
      activeBacklogs,
      company.backlogTolerance ?? 0
    );

    return {
      company,
      currentCgpa,
      requiredCgpa,
      readinessScore,
      cgpaGap,
      status,
      reasons,
      nextBestAction,
      trajectoryConfidence,
    };
  }

  public computeCategoryReadiness(companies: Company[]): CategoryReadiness[] {
    const sectors = Array.from(new Set(companies.map((c) => c.sector)));

    return sectors.map((sector) => {
      const sectorCompanies = companies.filter((c) => c.sector === sector);
      const readinessScores = sectorCompanies.map(
        (c) => this.computeCompanyReadiness(c).readinessScore
      );
      const avgScore = readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length;

      let status: PlacementReadiness['status'] = 'ineligible';
      if (avgScore >= this.config.thresholds.eligible) status = 'eligible';
      else if (avgScore >= this.config.thresholds.nearThreshold) status = 'near-threshold';
      else if (avgScore >= this.config.thresholds.atRisk) status = 'at-risk';

      return {
        sector,
        readinessScore: Math.round(avgScore),
        status,
      };
    });
  }

  // --- Private Helper Methods ---

  private calculateCgpaScore(current: number, required: number): number {
    if (current >= required) return 100;
    // Score decreases as gap increases. If gap is 1.0 or more, score is 0.
    const gap = required - current;
    return Math.max(0, 100 - gap * 100);
  }

  private calculateTrendScore(): number {
    const velocity = this.simulator.calculateVelocity();
    // Neutral velocity (0) gives 70. Positive gives up to 100. Negative gives down to 0.
    const score = 70 + velocity * 30;
    return Math.max(0, Math.min(100, score));
  }

  private calculateBacklogScore(active: number, tolerance: number): number {
    if (active <= tolerance) return 100;
    const penalty = (active - tolerance) * this.config.penalties.activeBacklog;
    return Math.max(0, 100 - penalty);
  }

  private deriveStatus(
    score: number,
    gap: number,
    active: number,
    tolerance: number
  ): PlacementReadiness['status'] {
    if (gap <= 0 && active <= tolerance) return 'eligible';
    if (score >= this.config.thresholds.eligible) return 'eligible';
    if (score >= this.config.thresholds.nearThreshold) return 'near-threshold';
    if (score >= this.config.thresholds.atRisk) return 'at-risk';
    return 'ineligible';
  }

  private calculateTrajectoryConfidence(): 'high' | 'medium' | 'low' {
    const completedSems = this.profile.semesters.filter((s) => s.isCompleted);
    if (completedSems.length < 2) return 'medium';

    const sgpas = completedSems.map((s) => s.sgpa || 0);
    const mean = sgpas.reduce((a, b) => a + b, 0) / sgpas.length;
    const variance = sgpas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sgpas.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev <= 0.15) return 'high';
    if (stdDev <= 0.3) return 'medium';
    return 'low';
  }

  private generateReasons(
    company: Company,
    cgpaScore: number,
    consistency: number,
    trend: number,
    backlog: number
  ): string[] {
    const reasons: string[] = [];

    if (cgpaScore === 100) reasons.push('Strong CGPA academic standing');
    else if (cgpaScore < 50) reasons.push('Significant CGPA gap for this tier');

    if (consistency >= 85) reasons.push('Excellent semester-on-semester stability');
    else if (consistency < 60) reasons.push('High volatility in academic performance');

    if (trend > 75) reasons.push('Positive growth trajectory');
    else if (trend < 60) reasons.push('Declining performance trend');

    if (backlog === 100) reasons.push('Clean academic record (no backlogs)');
    else reasons.push(`Exceeds backlog tolerance for ${company.name}`);

    return reasons;
  }

  private generateNextBestAction(
    company: Company,
    status: string,
    gap: number,
    active: number,
    tolerance: number
  ): string {
    if (status === 'eligible') return 'Maintain current performance to secure eligibility.';

    if (active > tolerance) {
      return `Clear active backlogs to unlock ${company.category} tier companies.`;
    }

    if (gap > 0) {
      return `Increase CGPA by ${gap.toFixed(2)} to unlock ${company.name} eligibility.`;
    }

    return 'Focus on improving consistency score next semester.';
  }
}
