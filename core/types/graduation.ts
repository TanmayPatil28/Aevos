/**
 * core/types/graduation.ts
 *
 * Graduation dependency and NEP 2020 exit point types.
 *
 * Handles:
 * - Zero-credit mandatory courses (VTU: practical training, guest lectures)
 * - Audit course dependencies that block graduation
 * - NEP 2020 modular degree exit points (certificate, diploma, degree)
 * - Credit accumulation tracking for progressive degree completion
 *
 * CRITICAL: Zero-credit courses must never enter SGPA/CGPA calculations
 * but must be tracked for graduation eligibility.
 */

// ─── Exit Points (NEP 2020) ─────────────────────────────────────────────────

export type ExitPointType = 'certificate' | 'diploma' | 'degree' | 'honors' | 'research';

export interface ExitPoint {
  /** Type of academic credential at this exit */
  readonly type: ExitPointType;
  /** Credits required to qualify for this exit */
  readonly requiredCredits: number;
  /** Minimum CGPA required (if any) */
  readonly minCgpa?: number;
  /** Semesters typically completed by this exit */
  readonly typicalSemester: number;
  /** Human-readable label */
  readonly displayLabel: string;
}

/**
 * Standard NEP 2020 exit points for a 4-year UG program.
 */
export const NEP_EXIT_POINTS: readonly ExitPoint[] = [
  { type: 'certificate', requiredCredits: 44, typicalSemester: 2, displayLabel: 'UG Certificate' },
  { type: 'diploma', requiredCredits: 88, typicalSemester: 4, displayLabel: 'UG Diploma' },
  { type: 'degree', requiredCredits: 132, typicalSemester: 6, displayLabel: "Bachelor's Degree" },
  {
    type: 'honors',
    requiredCredits: 176,
    typicalSemester: 8,
    displayLabel: "Bachelor's (Honours)",
  },
  {
    type: 'research',
    requiredCredits: 176,
    minCgpa: 7.5,
    typicalSemester: 8,
    displayLabel: "Bachelor's (Honours with Research)",
  },
] as const;

// ─── Graduation Dependencies ────────────────────────────────────────────────

/**
 * Represents a course/requirement that is mandatory for graduation
 * but may not contribute to CGPA.
 *
 * Example: VTU requires practical training, study tours, and guest lectures
 * to be completed. These have 0 credits but block degree conferral.
 */
export interface GraduationDependency {
  /** Subject code or requirement identifier */
  readonly subjectCode: string;
  /** Human-readable name */
  readonly name: string;
  /** Whether completion is mandatory for graduation */
  readonly isMandatory: boolean;
  /** Whether this contributes to CGPA calculation */
  readonly contributesToCgpa: boolean;
  /** Semester(s) where this is typically completed */
  readonly typicalSemesters: readonly number[];
  /** Whether this dependency is currently satisfied */
  status?: 'pending' | 'completed' | 'waived';
}

// ─── Graduation Audit Result ────────────────────────────────────────────────

/**
 * Immutable result of a graduation eligibility audit.
 * Provides full explainability for why a student is/isn't eligible.
 */
export interface GraduationAuditResult {
  /** Whether the student is eligible to graduate */
  readonly isEligible: boolean;
  /** Credits earned so far */
  readonly creditsEarned: number;
  /** Credits required for graduation */
  readonly creditsRequired: number;
  /** Outstanding mandatory dependencies */
  readonly pendingDependencies: readonly GraduationDependency[];
  /** Applicable exit point based on current progress */
  readonly currentExitPoint: ExitPoint | null;
  /** Next achievable exit point */
  readonly nextExitPoint: ExitPoint | null;
  /** Human-readable reasons for ineligibility */
  readonly reasons: readonly string[];
}
