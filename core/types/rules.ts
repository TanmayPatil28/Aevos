/**
 * core/types/rules.ts
 *
 * Academic rule engine types.
 *
 * Universities have complex, often contradictory rules:
 * - Grace marks (VTU: up to 5 per subject, SPPU: condonation)
 * - ATKT rules (backlog limits, carry-forward vs year-back)
 * - Improvement exams (replace previous grade, or take best-of)
 * - Backlog clearance triggers CGPA recalculation
 * - Relative grading adjustments
 * - Audit course dependencies
 *
 * All rules are:
 * - Versioned (tied to a regulation)
 * - Composable (can be combined without conflicts)
 * - Explainable (every decision produces a reason)
 * - University-aware (configurable, not hardcoded)
 */

// ─── Rule Types ─────────────────────────────────────────────────────────────

export type RuleCategory = 'grading' | 'progression' | 'backlog' | 'grace-marks' | 'graduation';

export interface RuleDefinition {
  /** Unique rule identifier */
  readonly id: string;
  /** Rule category */
  readonly category: RuleCategory;
  /** Human-readable rule name */
  readonly name: string;
  /** University this rule applies to (or "*" for universal) */
  readonly universityId: string;
  /** Regulation year this rule is valid for */
  readonly regulationYear?: number;
  /** Whether this rule is currently active */
  readonly isActive: boolean;
  /** Rule description */
  readonly description: string;
}

// ─── Rule Evaluation ────────────────────────────────────────────────────────

export interface RuleEvaluationInput {
  /** Student's current CGPA */
  readonly cgpa: number;
  /** Number of active backlogs */
  readonly activeBacklogs: number;
  /** Total credits completed */
  readonly creditsCompleted: number;
  /** Total semesters completed */
  readonly semestersCompleted: number;
  /** Subject-level data for the current evaluation */
  readonly subjectData?: readonly {
    readonly subjectCode: string;
    readonly gradePoint: number;
    readonly credits: number;
    readonly isBacklog: boolean;
    readonly marks?: number;
  }[];
}

export interface RuleEvaluationResult {
  /** Whether the rule passed */
  readonly passed: boolean;
  /** The rule that was evaluated */
  readonly rule: RuleDefinition;
  /** Human-readable reason for the result */
  readonly reason: string;
  /** Any modifications applied (e.g., grace marks added) */
  readonly modifications?: readonly RuleModification[];
}

// ─── Rule Modifications ─────────────────────────────────────────────────────

export type ModificationType =
  | 'grace-marks'
  | 'grade-replacement'
  | 'condonation'
  | 'curve-adjustment';

export interface RuleModification {
  /** Type of modification */
  readonly type: ModificationType;
  /** Subject affected */
  readonly subjectCode: string;
  /** Original value before modification */
  readonly originalValue: number;
  /** Modified value */
  readonly modifiedValue: number;
  /** Explanation of the modification */
  readonly explanation: string;
}

// ─── Grace Marks Configuration ──────────────────────────────────────────────

export interface GraceMarksConfig {
  /** Maximum grace marks per subject */
  readonly maxPerSubject: number;
  /** Maximum total grace marks per semester */
  readonly maxPerSemester: number;
  /** Maximum number of subjects that can receive grace marks */
  readonly maxSubjects: number;
  /** Minimum marks before grace can be applied */
  readonly minMarksForEligibility: number;
  /** Whether grace marks can promote a grade */
  readonly canPromoteGrade: boolean;
}

// ─── ATKT Configuration ─────────────────────────────────────────────────────

export type ATKTModel = 'carry-forward' | 'year-back' | 'conditional-promotion';

export interface ATKTConfig {
  /** The ATKT model used by the university */
  readonly model: ATKTModel;
  /** Maximum backlogs allowed for promotion */
  readonly maxBacklogsForPromotion: number;
  /** Maximum semesters of backlog carry-forward allowed */
  readonly maxCarryForwardSemesters?: number;
  /** Whether a minimum CGPA is required for ATKT promotion */
  readonly minCgpaForPromotion?: number;
  /** Minimum credits percentage required */
  readonly minCreditsPercentage?: number;
}

// ─── Promotion Decision ─────────────────────────────────────────────────────

export interface PromotionDecision {
  /** Whether the student is promoted */
  readonly isPromoted: boolean;
  /** ATKT status */
  readonly atktStatus: 'clear' | 'atkt-promoted' | 'year-back' | 'detained';
  /** Number of subjects under ATKT */
  readonly atktSubjects: number;
  /** Rules that determined this decision */
  readonly appliedRules: readonly RuleEvaluationResult[];
  /** Recommended actions */
  readonly recommendations: readonly string[];
}
