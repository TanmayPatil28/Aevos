import { UniversityPreset, UniversityCapabilities } from './types';

export class FormulaEngine {
  /**
   * Resolves university capabilities at runtime
   */
  static getCapabilities(preset: UniversityPreset): UniversityCapabilities {
    return {
      supportsRelativeGrading: preset.gradingSystem.type !== 'absolute',
      supportsCreditTransfer: !!preset.creditTransferRules && preset.creditTransferRules.length > 0,
      supportsGradeReplacement: !!preset.gradingSystem.supportsGradeReplacement,
      supportsAuditCourses: preset.branches.some((b) => b.subjects.some((s) => s.type === 'audit')),
      supportsUnitSystem: preset.gradingSystem.creditType === 'units',
      supportsDynamicPassCriteria: !!preset.gradingSystem.passCriteria,
    };
  }

  /**
   * Executes a formula string for SGPA/CGPA to Percentage conversion
   * Supported variables: SGPA, CGPA, CGPI
   */
  static executeConversion(formula: string, value: number): number {
    if (!formula || value === 0) return 0;

    const normalizedFormula = formula.toUpperCase().replace(/\s/g, '');

    // 1. Mumbai University Piecewise Logic
    if (normalizedFormula.includes('PIECEWISE')) {
      if (normalizedFormula.includes('MU')) {
        if (value < 7) return Number((7.1 * value + 12).toFixed(2));
        return Number((7.4 * value + 12).toFixed(2));
      }
    }

    // 2. Standard (X - 0.75) * 10
    if (normalizedFormula.includes('-0.75)*10')) {
      return Math.max(0, Number(((value - 0.75) * 10).toFixed(2)));
    }

    // 3. Simple Multiplier (e.g. CGPA * 10 or CGPA * 8.9 or CGPA * 9.5)
    const multiplierMatch = normalizedFormula.match(/\*([\d.]+)/);
    if (multiplierMatch && multiplierMatch[1]) {
      const multiplier = parseFloat(multiplierMatch[1]);
      return Number((value * multiplier).toFixed(2));
    }

    // Default Fallback: Simple Multiplier of 10
    return Number((value * 10).toFixed(2));
  }

  /**
   * Calculates SGPA based on credits and grade points
   */
  static calculateSgpa(subjects: { credits: number; gradePoint: number }[]): number {
    if (subjects.length === 0) return 0;

    let totalCredits = 0;
    let totalWeightedPoints = 0;

    subjects.forEach((sub) => {
      totalCredits += sub.credits;
      totalWeightedPoints += sub.credits * sub.gradePoint;
    });

    return totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
  }
}
