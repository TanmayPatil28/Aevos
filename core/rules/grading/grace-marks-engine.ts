/**
 * core/rules/grading/grace-marks-engine.ts
 *
 * University-aware grace marks application engine.
 *
 * Grace marks rules vary significantly:
 * - VTU: Up to 5 grace marks per subject, max 2 subjects per semester
 * - SPPU: Condonation based on deficit from passing marks
 * - Mumbai University: 10-mark condonation in max 2 subjects
 * - Anna University: No grace marks policy
 *
 * This engine is config-driven — rules are injected, not hardcoded.
 * All outputs include explainability metadata.
 */

import type { GraceMarksConfig, RuleModification } from '../../types';

// ─── Grace Marks Input ──────────────────────────────────────────────────────

export interface GraceMarksInput {
  readonly subjectCode: string;
  readonly subjectName: string;
  readonly obtainedMarks: number;
  readonly maxMarks: number;
  readonly passingMarks: number;
}

// ─── Grace Marks Result ─────────────────────────────────────────────────────

export interface GraceMarksResult {
  /** Whether grace marks were applied */
  readonly applied: boolean;
  /** Number of grace marks added */
  readonly marksAdded: number;
  /** Revised total marks after grace */
  readonly revisedMarks: number;
  /** Whether the student now passes after grace application */
  readonly passesAfterGrace: boolean;
  /** Explainability */
  readonly modification: RuleModification | null;
}

// ─── Predefined Configurations ──────────────────────────────────────────────

export const GRACE_CONFIGS: Readonly<Record<string, GraceMarksConfig>> = {
  vtu: {
    maxPerSubject: 5,
    maxPerSemester: 10,
    maxSubjects: 2,
    minMarksForEligibility: 0,
    canPromoteGrade: false,
  },
  sppu: {
    maxPerSubject: 10,
    maxPerSemester: 10,
    maxSubjects: 2,
    minMarksForEligibility: 30,
    canPromoteGrade: false,
  },
  mu: {
    maxPerSubject: 10,
    maxPerSemester: 20,
    maxSubjects: 2,
    minMarksForEligibility: 20,
    canPromoteGrade: false,
  },
};

// ─── Grace Marks Engine ─────────────────────────────────────────────────────

export class GraceMarksEngine {
  private readonly config: GraceMarksConfig;

  constructor(config: GraceMarksConfig) {
    this.config = config;
  }

  /**
   * Creates a GraceMarksEngine from a university ID.
   * Falls back to a zero-grace config if no match.
   */
  static forUniversity(universityId: string): GraceMarksEngine {
    const config = GRACE_CONFIGS[universityId] ?? {
      maxPerSubject: 0,
      maxPerSemester: 0,
      maxSubjects: 0,
      minMarksForEligibility: 0,
      canPromoteGrade: false,
    };
    return new GraceMarksEngine(config);
  }

  /**
   * Evaluates whether grace marks can be applied to a single subject.
   * Pure function — no state mutation.
   */
  evaluateSubject(input: GraceMarksInput): GraceMarksResult {
    const deficit = input.passingMarks - input.obtainedMarks;

    // Already passing — no grace needed
    if (deficit <= 0) {
      return {
        applied: false,
        marksAdded: 0,
        revisedMarks: input.obtainedMarks,
        passesAfterGrace: true,
        modification: null,
      };
    }

    // Check eligibility
    if (input.obtainedMarks < this.config.minMarksForEligibility) {
      return {
        applied: false,
        marksAdded: 0,
        revisedMarks: input.obtainedMarks,
        passesAfterGrace: false,
        modification: null,
      };
    }

    // Check if deficit is within grace allowance
    if (deficit > this.config.maxPerSubject) {
      return {
        applied: false,
        marksAdded: 0,
        revisedMarks: input.obtainedMarks,
        passesAfterGrace: false,
        modification: null,
      };
    }

    // Apply grace
    const graceMarks = Math.min(deficit, this.config.maxPerSubject);
    const revisedMarks = input.obtainedMarks + graceMarks;

    return {
      applied: true,
      marksAdded: graceMarks,
      revisedMarks,
      passesAfterGrace: revisedMarks >= input.passingMarks,
      modification: {
        type: 'grace-marks',
        subjectCode: input.subjectCode,
        originalValue: input.obtainedMarks,
        modifiedValue: revisedMarks,
        explanation: `Applied ${graceMarks} grace marks to ${input.subjectName} (deficit: ${deficit})`,
      },
    };
  }

  /**
   * Evaluates grace marks for an entire semester.
   * Respects max-subjects and max-per-semester limits.
   */
  evaluateSemester(subjects: readonly GraceMarksInput[]): readonly GraceMarksResult[] {
    const failing = subjects
      .map((sub, index) => ({ sub, index, deficit: sub.passingMarks - sub.obtainedMarks }))
      .filter((s) => s.deficit > 0 && s.deficit <= this.config.maxPerSubject)
      .filter((s) => s.sub.obtainedMarks >= this.config.minMarksForEligibility)
      .sort((a, b) => a.deficit - b.deficit); // Smallest deficit first (most impactful)

    const results: GraceMarksResult[] = subjects.map((sub) => ({
      applied: false,
      marksAdded: 0,
      revisedMarks: sub.obtainedMarks,
      passesAfterGrace: sub.obtainedMarks >= sub.passingMarks,
      modification: null,
    }));

    let totalGraceUsed = 0;
    let subjectsGraced = 0;

    for (const { sub, index, deficit } of failing) {
      if (subjectsGraced >= this.config.maxSubjects) break;
      if (totalGraceUsed + deficit > this.config.maxPerSemester) break;

      const graceMarks = Math.min(deficit, this.config.maxPerSubject);
      const revisedMarks = sub.obtainedMarks + graceMarks;

      results[index] = {
        applied: true,
        marksAdded: graceMarks,
        revisedMarks,
        passesAfterGrace: revisedMarks >= sub.passingMarks,
        modification: {
          type: 'grace-marks',
          subjectCode: sub.subjectCode,
          originalValue: sub.obtainedMarks,
          modifiedValue: revisedMarks,
          explanation: `Applied ${graceMarks} grace marks to ${sub.subjectName}`,
        },
      };

      totalGraceUsed += graceMarks;
      subjectsGraced++;
    }

    return results;
  }
}
