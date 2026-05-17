/**
 * core/rules/backlog/backlog-resolver.ts
 *
 * Backlog resolution and grade replacement engine.
 *
 * When a student clears a backlog, the system must decide:
 * 1. Does the new grade replace the old one? (grade replacement)
 * 2. Is the best-of-two applied? (improvement exam)
 * 3. Does the CGPA require full recalculation? (Mumbai University)
 * 4. Should downstream events be emitted?
 *
 * This engine handles all these scenarios deterministically.
 * It produces events for the event bus to process.
 */

import type { AcademicEvent, BacklogClearedPayload } from '../../types';

// ─── Backlog Resolution Input ───────────────────────────────────────────────

export interface BacklogSubject {
  readonly subjectId: string;
  readonly subjectCode: string;
  readonly subjectName: string;
  readonly semesterId: string;
  readonly credits: number;
  readonly previousGradePoint: number;
  readonly previousGrade: string;
  readonly newGradePoint: number;
  readonly newGrade: string;
}

export interface BacklogResolutionConfig {
  /** Whether the new grade replaces the old grade outright */
  readonly replaceOnPass: boolean;
  /** Whether the best-of-two grades is used */
  readonly bestOfTwo: boolean;
  /** Whether clearing a backlog triggers full CGPA recalculation */
  readonly triggersCgpaRecalculation: boolean;
  /** Whether grade history is preserved */
  readonly preserveHistory: boolean;
  /** Whether the replacement affects CGPA retroactively */
  readonly affectsCgpaRetroactively: boolean;
}

// ─── Predefined Resolution Configs ──────────────────────────────────────────

export const BACKLOG_CONFIGS: Readonly<Record<string, BacklogResolutionConfig>> = {
  sppu: {
    replaceOnPass: true,
    bestOfTwo: false,
    triggersCgpaRecalculation: true,
    preserveHistory: true,
    affectsCgpaRetroactively: true,
  },
  mu: {
    replaceOnPass: true,
    bestOfTwo: false,
    triggersCgpaRecalculation: true,
    preserveHistory: true,
    affectsCgpaRetroactively: true,
  },
  vtu: {
    replaceOnPass: true,
    bestOfTwo: false,
    triggersCgpaRecalculation: true,
    preserveHistory: false,
    affectsCgpaRetroactively: true,
  },
  'bits-pilani': {
    replaceOnPass: false,
    bestOfTwo: true,
    triggersCgpaRecalculation: true,
    preserveHistory: true,
    affectsCgpaRetroactively: true,
  },
};

// ─── Backlog Resolution Result ──────────────────────────────────────────────

export interface BacklogResolutionResult {
  /** The final grade point to record */
  readonly resolvedGradePoint: number;
  /** The final grade to record */
  readonly resolvedGrade: string;
  /** Whether the backlog is now cleared */
  readonly isCleared: boolean;
  /** Whether CGPA needs full recalculation */
  readonly requiresRecalculation: boolean;
  /** Event to emit for downstream processing */
  readonly event: AcademicEvent<'backlog-cleared'> | null;
  /** Explainability */
  readonly explanation: string;
}

// ─── Backlog Resolver ───────────────────────────────────────────────────────

export class BacklogResolver {
  private readonly config: BacklogResolutionConfig;
  private readonly universityId: string;

  constructor(universityId: string, config?: BacklogResolutionConfig) {
    this.universityId = universityId;
    this.config = config ??
      BACKLOG_CONFIGS[universityId] ?? {
        replaceOnPass: true,
        bestOfTwo: false,
        triggersCgpaRecalculation: true,
        preserveHistory: true,
        affectsCgpaRetroactively: true,
      };
  }

  /**
   * Resolves how a cleared backlog should affect the academic record.
   * Pure function — does not mutate state.
   *
   * @param subject - The backlog subject with old and new grades
   * @param userId - The student's user ID (for event construction)
   */
  resolve(subject: BacklogSubject, userId: string): BacklogResolutionResult {
    const isPass = subject.newGradePoint > 0;

    if (!isPass) {
      return {
        resolvedGradePoint: subject.previousGradePoint,
        resolvedGrade: subject.previousGrade,
        isCleared: false,
        requiresRecalculation: false,
        event: null,
        explanation: `Re-exam failed for ${subject.subjectName}. Previous grade retained.`,
      };
    }

    // Determine final grade
    let finalGradePoint: number;
    let finalGrade: string;

    if (this.config.bestOfTwo) {
      // Take the better of the two grades
      if (subject.newGradePoint > subject.previousGradePoint) {
        finalGradePoint = subject.newGradePoint;
        finalGrade = subject.newGrade;
      } else {
        finalGradePoint = subject.previousGradePoint;
        finalGrade = subject.previousGrade;
      }
    } else if (this.config.replaceOnPass) {
      // Replace outright
      finalGradePoint = subject.newGradePoint;
      finalGrade = subject.newGrade;
    } else {
      // Keep original (unusual, but supported)
      finalGradePoint = subject.previousGradePoint;
      finalGrade = subject.previousGrade;
    }

    // Construct the event payload
    const payload: BacklogClearedPayload = {
      semesterId: subject.semesterId,
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      newGradePoint: finalGradePoint,
      newGrade: finalGrade,
      requiresFullRecalculation: this.config.triggersCgpaRecalculation,
    };

    const event: AcademicEvent<'backlog-cleared'> = {
      id: `evt-backlog-${subject.subjectId}-${Date.now()}`,
      type: 'backlog-cleared',
      userId,
      payload,
      timestamp: new Date(),
      processed: false,
    };

    return {
      resolvedGradePoint: finalGradePoint,
      resolvedGrade: finalGrade,
      isCleared: true,
      requiresRecalculation: this.config.triggersCgpaRecalculation,
      event,
      explanation: this.config.bestOfTwo
        ? `Best-of-two applied for ${subject.subjectName}: ${finalGrade} (${finalGradePoint})`
        : `Grade replaced for ${subject.subjectName}: ${subject.previousGrade} → ${finalGrade}`,
    };
  }
}
