/**
 * core/rules/progression/atkt-engine.ts
 *
 * ATKT (Allowed to Keep Terms) and promotion rule engine.
 *
 * Indian universities use fundamentally different promotion models:
 * - Carry-Forward: Student can proceed with backlogs up to a limit (SPPU, MU)
 * - Year-Back: Student must repeat the entire year if backlogs exceed limit (VTU old)
 * - Conditional Promotion: CGPA + credit threshold required (BITS, NITs)
 *
 * This engine evaluates promotion eligibility using config-driven rules.
 * All decisions include full explainability.
 */

import type {
  ATKTConfig,
  ATKTModel,
  PromotionDecision,
  RuleDefinition,
  RuleEvaluationInput,
  RuleEvaluationResult,
} from '../../types';

// ─── Predefined ATKT Configs ────────────────────────────────────────────────

export const ATKT_CONFIGS: Readonly<Record<string, ATKTConfig>> = {
  sppu: {
    model: 'carry-forward',
    maxBacklogsForPromotion: 8,
    maxCarryForwardSemesters: 4,
    minCgpaForPromotion: undefined,
    minCreditsPercentage: 50,
  },
  mu: {
    model: 'carry-forward',
    maxBacklogsForPromotion: 6,
    maxCarryForwardSemesters: 3,
    minCgpaForPromotion: undefined,
    minCreditsPercentage: undefined,
  },
  vtu: {
    model: 'carry-forward',
    maxBacklogsForPromotion: 4,
    maxCarryForwardSemesters: 2,
    minCgpaForPromotion: undefined,
    minCreditsPercentage: undefined,
  },
  'bits-pilani': {
    model: 'conditional-promotion',
    maxBacklogsForPromotion: 0,
    minCgpaForPromotion: 5.0,
    minCreditsPercentage: 80,
  },
  'nit-council': {
    model: 'conditional-promotion',
    maxBacklogsForPromotion: 3,
    minCgpaForPromotion: 5.0,
    minCreditsPercentage: 75,
  },
};

// ─── ATKT Engine ────────────────────────────────────────────────────────────

export class ATKTEngine {
  private readonly config: ATKTConfig;
  private readonly universityId: string;

  constructor(universityId: string, config?: ATKTConfig) {
    this.universityId = universityId;
    this.config = config ??
      ATKT_CONFIGS[universityId] ?? {
        model: 'carry-forward' as ATKTModel,
        maxBacklogsForPromotion: 4,
      };
  }

  /**
   * Evaluates whether a student can be promoted to the next semester/year.
   * Pure function — deterministic output for same input.
   */
  evaluate(input: RuleEvaluationInput): PromotionDecision {
    const appliedRules: RuleEvaluationResult[] = [];

    // Rule 1: Backlog count check
    const backlogRule = this.evaluateBacklogLimit(input);
    appliedRules.push(backlogRule);

    // Rule 2: CGPA threshold (if applicable)
    if (this.config.minCgpaForPromotion !== undefined) {
      const cgpaRule = this.evaluateCgpaThreshold(input);
      appliedRules.push(cgpaRule);
    }

    // Rule 3: Credit percentage (if applicable)
    if (this.config.minCreditsPercentage !== undefined) {
      const creditRule = this.evaluateCreditPercentage(input);
      appliedRules.push(creditRule);
    }

    // Derive final decision
    const allPassed = appliedRules.every((r) => r.passed);
    const backlogCount = input.activeBacklogs;

    let atktStatus: PromotionDecision['atktStatus'];
    if (allPassed && backlogCount === 0) {
      atktStatus = 'clear';
    } else if (allPassed && backlogCount > 0) {
      atktStatus = 'atkt-promoted';
    } else if (this.config.model === 'year-back') {
      atktStatus = 'year-back';
    } else {
      atktStatus = 'detained';
    }

    return {
      isPromoted: allPassed,
      atktStatus,
      atktSubjects: backlogCount,
      appliedRules,
      recommendations: this.generateRecommendations(atktStatus, input),
    };
  }

  // ─── Private Rule Evaluators ──────────────────────────────────────────

  private evaluateBacklogLimit(input: RuleEvaluationInput): RuleEvaluationResult {
    const rule: RuleDefinition = {
      id: `${this.universityId}-backlog-limit`,
      category: 'progression',
      name: 'Backlog Limit',
      universityId: this.universityId,
      isActive: true,
      description: `Maximum ${this.config.maxBacklogsForPromotion} backlogs allowed for promotion`,
    };

    const passed = input.activeBacklogs <= this.config.maxBacklogsForPromotion;

    return {
      passed,
      rule,
      reason: passed
        ? `Active backlogs (${input.activeBacklogs}) within allowed limit (${this.config.maxBacklogsForPromotion})`
        : `Active backlogs (${input.activeBacklogs}) exceed allowed limit (${this.config.maxBacklogsForPromotion})`,
    };
  }

  private evaluateCgpaThreshold(input: RuleEvaluationInput): RuleEvaluationResult {
    const minCgpa = this.config.minCgpaForPromotion!;
    const rule: RuleDefinition = {
      id: `${this.universityId}-cgpa-threshold`,
      category: 'progression',
      name: 'CGPA Threshold',
      universityId: this.universityId,
      isActive: true,
      description: `Minimum CGPA of ${minCgpa} required for promotion`,
    };

    const passed = input.cgpa >= minCgpa;

    return {
      passed,
      rule,
      reason: passed
        ? `CGPA ${input.cgpa} meets minimum requirement of ${minCgpa}`
        : `CGPA ${input.cgpa} below minimum requirement of ${minCgpa}`,
    };
  }

  private evaluateCreditPercentage(input: RuleEvaluationInput): RuleEvaluationResult {
    const minPct = this.config.minCreditsPercentage!;
    // Estimate total expected credits based on completed semesters (avg ~20/sem)
    const estimatedTotal = input.semestersCompleted * 20;
    const actualPct =
      estimatedTotal > 0 ? Number(((input.creditsCompleted / estimatedTotal) * 100).toFixed(1)) : 0;

    const rule: RuleDefinition = {
      id: `${this.universityId}-credit-pct`,
      category: 'progression',
      name: 'Credit Percentage',
      universityId: this.universityId,
      isActive: true,
      description: `Minimum ${minPct}% credits required for promotion`,
    };

    const passed = actualPct >= minPct;

    return {
      passed,
      rule,
      reason: passed
        ? `Credit percentage ${actualPct}% meets requirement of ${minPct}%`
        : `Credit percentage ${actualPct}% below requirement of ${minPct}%`,
    };
  }

  // ─── Recommendation Generation ────────────────────────────────────────

  private generateRecommendations(
    status: PromotionDecision['atktStatus'],
    input: RuleEvaluationInput
  ): string[] {
    const recs: string[] = [];

    switch (status) {
      case 'clear':
        recs.push('All clear — no backlogs or deficits.');
        break;
      case 'atkt-promoted':
        recs.push(
          `Promoted with ${input.activeBacklogs} active backlog(s). Clear them before next evaluation.`
        );
        if (input.activeBacklogs >= this.config.maxBacklogsForPromotion - 1) {
          recs.push('WARNING: Approaching maximum backlog limit for next promotion.');
        }
        break;
      case 'year-back':
        recs.push('Year-back triggered. All subjects from the current year must be re-attempted.');
        break;
      case 'detained':
        recs.push('Promotion denied. Focus on clearing backlogs and meeting minimum thresholds.');
        if (this.config.minCgpaForPromotion && input.cgpa < this.config.minCgpaForPromotion) {
          recs.push(
            `Raise CGPA from ${input.cgpa} to at least ${this.config.minCgpaForPromotion}.`
          );
        }
        break;
    }

    return recs;
  }
}
