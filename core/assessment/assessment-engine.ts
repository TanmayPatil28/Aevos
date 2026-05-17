/**
 * core/assessment/assessment-engine.ts
 *
 * Runtime assessment pattern resolution and internal mark simulation.
 *
 * This engine resolves which assessment pattern applies to a given subject
 * using a cascading fallback strategy:
 *   1. Subject-level override (highest priority)
 *   2. Semester-level default
 *   3. University-level default
 *
 * All outputs are immutable and include explainability metadata.
 * Pure functions — no side effects, no state mutation.
 */

import type {
  AssessmentPattern,
  AssessmentComponent,
  AssessmentComponentType,
  AssessmentResolution,
  InternalMarkSimulation,
} from '../types';

// ─── Default Patterns (University-Level Fallbacks) ──────────────────────────

const DEFAULT_PATTERNS: Readonly<Record<string, AssessmentPattern>> = {
  /** SPPU 2019: 30 internal / 70 external */
  sppu: {
    internalWeight: 30,
    externalWeight: 70,
    components: [
      { type: 'ISE', maxMarks: 30, isMandatory: true },
      { type: 'ESE', maxMarks: 70, isMandatory: true },
    ],
    totalMarks: 100,
  },
  /** VTU 2022: 50 CIE / 50 SEE */
  vtu: {
    internalWeight: 50,
    externalWeight: 50,
    components: [
      { type: 'CIE', maxMarks: 50, isMandatory: true },
      { type: 'SEE', maxMarks: 50, isMandatory: true },
    ],
    totalMarks: 100,
  },
  /** Anna University R2021: 20 internal / 80 external */
  au: {
    internalWeight: 20,
    externalWeight: 80,
    components: [
      { type: 'CA', maxMarks: 20, isMandatory: true },
      { type: 'UE', maxMarks: 80, isMandatory: true },
    ],
    totalMarks: 100,
  },
  /** PCCOE / Autonomous SPPU-affiliated: 40 ISE / 60 ESE */
  pccoe: {
    internalWeight: 40,
    externalWeight: 60,
    components: [
      { type: 'FA1', maxMarks: 10, isMandatory: false },
      { type: 'FA2', maxMarks: 10, isMandatory: false },
      { type: 'ISE', maxMarks: 20, isMandatory: true },
      { type: 'ESE', maxMarks: 60, isMandatory: true },
    ],
    totalMarks: 100,
  },
  /** Mumbai University: 20 internal / 80 external */
  mu: {
    internalWeight: 20,
    externalWeight: 80,
    components: [
      { type: 'IA', maxMarks: 20, isMandatory: true },
      { type: 'ESE', maxMarks: 80, isMandatory: true },
    ],
    totalMarks: 100,
  },
};

/** Fallback pattern when no university-specific pattern is found */
const UNIVERSAL_FALLBACK: AssessmentPattern = {
  internalWeight: 30,
  externalWeight: 70,
  components: [
    { type: 'ISE', maxMarks: 30, isMandatory: true },
    { type: 'ESE', maxMarks: 70, isMandatory: true },
  ],
  totalMarks: 100,
};

// ─── Assessment Engine ──────────────────────────────────────────────────────

export class AssessmentEngine {
  /**
   * Resolves the applicable assessment pattern for a subject.
   *
   * Cascade: subject override → semester default → university default → universal fallback
   *
   * @param universityId - University identifier
   * @param subjectPattern - Subject-level assessment override (if any)
   * @param semesterPattern - Semester-level default (if any)
   * @returns Resolved assessment pattern with source metadata
   */
  static resolve(
    universityId: string,
    subjectPattern?: AssessmentPattern,
    semesterPattern?: AssessmentPattern
  ): AssessmentResolution {
    if (subjectPattern) {
      return { pattern: subjectPattern, source: 'subject', universityId };
    }

    if (semesterPattern) {
      return { pattern: semesterPattern, source: 'semester', universityId };
    }

    const uniDefault = DEFAULT_PATTERNS[universityId];
    if (uniDefault) {
      return { pattern: uniDefault, source: 'university-default', universityId };
    }

    return { pattern: UNIVERSAL_FALLBACK, source: 'university-default', universityId };
  }

  /**
   * Simulates a student's total marks given per-component input.
   *
   * @param pattern - The assessment pattern to simulate against
   * @param inputMarks - Map of component type → marks scored
   * @returns Immutable simulation result with full breakdown
   */
  static simulate(
    pattern: AssessmentPattern,
    inputMarks: ReadonlyMap<AssessmentComponentType, number>
  ): InternalMarkSimulation {
    const breakdown: {
      component: AssessmentComponentType;
      scored: number;
      maxMarks: number;
      contribution: number;
    }[] = [];

    let internalTotal = 0;
    let externalTotal = 0;

    for (const comp of pattern.components) {
      const scored = Math.min(inputMarks.get(comp.type) ?? 0, comp.maxMarks);
      const contribution = comp.weightage ? scored * comp.weightage : scored;

      const isInternal = AssessmentEngine.isInternalComponent(comp.type);

      if (isInternal) {
        internalTotal += contribution;
      } else {
        externalTotal += contribution;
      }

      breakdown.push({
        component: comp.type,
        scored,
        maxMarks: comp.maxMarks,
        contribution,
      });
    }

    const grandTotal = internalTotal + externalTotal;

    // Check if the student passes all mandatory components
    const passes = pattern.components
      .filter((c) => c.isMandatory)
      .every((c) => {
        const scored = inputMarks.get(c.type) ?? 0;
        const minRequired = c.minPassingMarks ?? Math.ceil(c.maxMarks * 0.4);
        return scored >= minRequired;
      });

    return {
      componentMarks: inputMarks,
      internalTotal: Number(internalTotal.toFixed(2)),
      externalTotal: Number(externalTotal.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      passes,
      breakdown,
    };
  }

  /**
   * Calculates the normalized internal and external weightage
   * for a given assessment pattern.
   */
  static calculateWeightage(pattern: AssessmentPattern): {
    normalizedInternal: number;
    normalizedExternal: number;
    componentWeights: readonly { type: AssessmentComponentType; weight: number }[];
  } {
    const totalMarks =
      pattern.totalMarks ?? pattern.components.reduce((sum, c) => sum + c.maxMarks, 0);

    const componentWeights = pattern.components.map((c) => ({
      type: c.type,
      weight: totalMarks > 0 ? Number((c.maxMarks / totalMarks).toFixed(4)) : 0,
    }));

    return {
      normalizedInternal: pattern.internalWeight / 100,
      normalizedExternal: pattern.externalWeight / 100,
      componentWeights,
    };
  }

  /**
   * Returns the default assessment pattern for a given university.
   */
  static getDefaultPattern(universityId: string): AssessmentPattern {
    return DEFAULT_PATTERNS[universityId] ?? UNIVERSAL_FALLBACK;
  }

  /**
   * Registers a custom default pattern for a university.
   * Used when loading presets dynamically.
   */
  static registerPattern(universityId: string, pattern: AssessmentPattern): void {
    (DEFAULT_PATTERNS as Record<string, AssessmentPattern>)[universityId] = pattern;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private static isInternalComponent(type: AssessmentComponentType): boolean {
    const internalTypes: ReadonlySet<AssessmentComponentType> = new Set<AssessmentComponentType>([
      'ISE',
      'FA1',
      'FA2',
      'IA',
      'CA',
      'CIE',
      'Quiz',
      'Assignment',
      'Attendance',
      'MSE',
      'TW',
    ]);
    return internalTypes.has(type);
  }
}
