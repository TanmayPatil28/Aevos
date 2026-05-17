/**
 * core/types/grading.ts
 *
 * Canonical grading system types.
 *
 * Supports ALL grading architectures found in Indian higher education:
 * - Absolute grading (SPPU, VTU, Anna University)
 * - Relative grading (VIT Vellore, DTU)
 * - Hybrid grading (VIT Pune — subject-level choice)
 * - Statistical/Z-Score grading (MIT Manipal, NSUT)
 * - Unit-based systems (BITS Pilani)
 *
 * All grading engines must produce deterministic, explainable outputs.
 */

// ─── Grading System Types ───────────────────────────────────────────────────

export type GradingSystemType = 'absolute' | 'relative' | 'hybrid' | 'statistical' | 'z-score';
export type CreditType = 'credits' | 'units';

// ─── Grade Rule ─────────────────────────────────────────────────────────────

export interface GradeRule {
  /** Grade letter (e.g., "O", "A+", "S", "AB") */
  readonly grade: string;
  /** Grade points awarded */
  readonly points: number;
  /** Minimum marks/percentage for this grade (absolute grading) */
  readonly minMarks?: number;
  /** Minimum percentage for this grade */
  readonly minPercentage?: number;
  /** Maximum marks for this grade range */
  readonly maxMarks?: number;
  /** Human-readable description */
  readonly description?: string;
  /** Whether this grade constitutes a passing grade */
  readonly isPass?: boolean;
}

// ─── Pass Criteria ──────────────────────────────────────────────────────────

export interface PassCriteria {
  /** Minimum grade point required to pass a subject */
  readonly minGradePoint?: number;
  /** Minimum SGPA required to pass a semester */
  readonly minSgpa?: number;
  /** Minimum CGPA required for graduation */
  readonly minCgpaForGraduation?: number;
  /** Minimum credits percentage for promotion */
  readonly minCreditsPercentageForPromotion?: number;
  /** ATKT condition description */
  readonly atktCondition?: string;
  /** Maximum backlogs allowed for promotion */
  readonly maxBacklogsAllowed?: number;
  /** Maximum low grades allowed per semester */
  readonly maxLowGradesPerSem?: { readonly grade: string; readonly count: number };
  /** Absolute lower cutoff (below which a student cannot pass) */
  readonly absoluteLowerCutoffPercentage?: number;
}

// ─── Grading System Configuration ───────────────────────────────────────────

export interface GradingSystemConfig {
  /** Type of grading system */
  readonly type: GradingSystemType;
  /** Grade scale rules */
  readonly scale: readonly GradeRule[];
  /** SGPA calculation formula */
  readonly sgpaFormula: string;
  /** CGPA calculation formula (if different from SGPA) */
  readonly cgpaFormula?: string;
  /** Credit measurement type */
  readonly creditType: CreditType;
  /** Percentage conversion formulas */
  readonly percentageConversion?: {
    readonly sgpa?: string;
    readonly cgpa?: string;
  };
  /** Pass/promotion criteria */
  readonly passCriteria?: PassCriteria;
  /** Whether this system uses relative grading curves */
  readonly isRelativeGrading?: boolean;
  /** Whether statistical curve analysis is supported */
  readonly supportsStatisticalCurves?: boolean;
  /** Whether grade replacement on re-exam is supported */
  readonly supportsGradeReplacement?: boolean;
  /** Curve logic description (for relative/statistical) */
  readonly curveLogic?: string;
  /** Credits that are excluded from CGPA (e.g., ["Open Elective", "Human Values"]) */
  readonly creditsExclusions?: readonly string[];
}

// ─── Grading Result ─────────────────────────────────────────────────────────

/**
 * Immutable, explainable result of a grading computation.
 * Every calculation engine must produce this output format.
 */
export interface GradingResult {
  /** Calculated SGPA */
  readonly sgpa: number;
  /** Calculated CGPA (if applicable) */
  readonly cgpa?: number;
  /** Equivalent percentage (using university-specific formula) */
  readonly percentage?: number;
  /** Total credits considered in calculation */
  readonly totalCredits: number;
  /** Total grade points earned */
  readonly totalGradePoints: number;
  /** Whether zero-credit courses were excluded correctly */
  readonly zeroCreditExcluded: boolean;
  /** Explainability: per-subject contribution */
  readonly breakdown: readonly {
    readonly subjectName: string;
    readonly credits: number;
    readonly gradePoint: number;
    readonly grade: string;
    readonly weightedContribution: number;
    readonly isExcludedFromCgpa: boolean;
  }[];
}
