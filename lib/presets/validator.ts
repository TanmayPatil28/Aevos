import { UniversityPreset, SubjectPreset } from './types';

export class AcademicValidator {
  /**
   * Validates a complete University Preset
   */
  static validateUniversityPreset(preset: UniversityPreset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!preset.university) errors.push('University name is missing');
    if (!preset.shortName) errors.push('Short name is missing');
    if (!preset.pattern) errors.push('Academic pattern is missing');

    if (!preset.gradingSystem) {
      errors.push('Grading system configuration is missing');
    } else {
      if (!preset.gradingSystem.scale || preset.gradingSystem.scale.length === 0) {
        errors.push('Grading scale rules are empty');
      }
      if (!preset.gradingSystem.sgpaFormula) {
        errors.push('SGPA calculation formula is missing');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates credit consistency for a semester
   */
  static validateCredits(subjects: SubjectPreset[], expectedTotal?: number): boolean {
    const actualTotal = subjects.reduce((sum, s) => sum + s.credits, 0);
    if (expectedTotal && actualTotal !== expectedTotal) return false;
    return actualTotal > 0;
  }

  /**
   * Validates assessment weightage
   */
  static validateAssessments(subject: SubjectPreset): boolean {
    if (!subject.assessments || subject.assessments.length === 0) return true;

    const totalMarks = subject.assessments.reduce((sum, a) => sum + a.maxMarks, 0);
    return totalMarks > 0;
  }
}
