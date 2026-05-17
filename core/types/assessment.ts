/**
 * core/types/assessment.ts
 *
 * Assessment pattern engine types.
 *
 * Universities use fundamentally different assessment structures:
 * - SPPU: 30:70 (ISE:ESE)
 * - PCCOE: 40:60 with FA1/FA2 components
 * - VTU: 50:50 with CIE/SEE
 * - Anna University: 20:80
 * - BITS Pilani: Quizzes + Mid + Comprehensive
 *
 * This type system normalizes all variants into composable patterns
 * that power grade simulations, exam planners, and forecasting engines.
 */

// ─── Assessment Component Types ─────────────────────────────────────────────

export type AssessmentComponentType =
  | 'MSE' // Mid-Semester Examination
  | 'ISE' // In-Semester Examination
  | 'ESE' // End-Semester Examination
  | 'TW' // Term Work
  | 'PR' // Practical
  | 'OR' // Oral
  | 'FA1' // Formative Assessment 1
  | 'FA2' // Formative Assessment 2
  | 'IA' // Internal Assessment
  | 'UE' // University Examination
  | 'CA' // Continuous Assessment
  | 'CWS' // Course Work Submission
  | 'CIE' // Continuous Internal Evaluation
  | 'SEE' // Semester End Examination
  | 'Quiz' // Quiz component
  | 'Assignment' // Assignment component
  | 'Attendance' // Attendance-based marks
  | 'Viva'; // Viva voce

// ─── Assessment Component ───────────────────────────────────────────────────

export interface AssessmentComponent {
  /** Type of assessment component */
  readonly type: AssessmentComponentType;
  /** Maximum marks for this component */
  readonly maxMarks: number;
  /** Minimum passing marks for this component (if applicable) */
  readonly minPassingMarks?: number;
  /** Weightage as a fraction of total (0.0 - 1.0) */
  readonly weightage?: number;
  /** Whether this component is mandatory to pass */
  readonly isMandatory?: boolean;
}

// ─── Assessment Pattern ─────────────────────────────────────────────────────

export interface AssessmentPattern {
  /** Internal assessment weight (0-100) */
  readonly internalWeight: number;
  /** External assessment weight (0-100), must sum to 100 with internalWeight */
  readonly externalWeight: number;
  /** Individual assessment components */
  readonly components: readonly AssessmentComponent[];
  /** Total marks across all components */
  readonly totalMarks?: number;
}

// ─── Assessment Resolution Result ───────────────────────────────────────────

export interface AssessmentResolution {
  /** The resolved pattern for a specific subject */
  readonly pattern: AssessmentPattern;
  /** Source of the resolution (subject-level, semester-level, or university-default) */
  readonly source: 'subject' | 'semester' | 'university-default';
  /** University ID this resolution belongs to */
  readonly universityId: string;
}

// ─── Internal Mark Simulation ───────────────────────────────────────────────

export interface InternalMarkSimulation {
  /** Input marks per component */
  readonly componentMarks: ReadonlyMap<AssessmentComponentType, number>;
  /** Calculated internal total */
  readonly internalTotal: number;
  /** Calculated external total */
  readonly externalTotal: number;
  /** Combined total */
  readonly grandTotal: number;
  /** Whether the student passes based on minimum criteria */
  readonly passes: boolean;
  /** Explainability: which components contribute what */
  readonly breakdown: readonly {
    readonly component: AssessmentComponentType;
    readonly scored: number;
    readonly maxMarks: number;
    readonly contribution: number;
  }[];
}
