import { UniversityPreset, GraduationRule } from './types';

export interface GraduationStatus {
  isEligible: boolean;
  failedRules: GraduationRule[];
  reasons: string[];
}

export class GraduationEngine {
  /**
   * Validates if a student meets the graduation requirements of their university
   */
  static validate(
    preset: UniversityPreset,
    data: {
      cgpa: number;
      totalCredits: number;
      backlogs: number;
      semestersSpent: number;
      lowGradesCount?: number;
    }
  ): GraduationStatus {
    const rules = preset.graduationRules || [];
    const failedRules: GraduationRule[] = [];
    const reasons: string[] = [];

    for (const rule of rules) {
      switch (rule.type) {
        case 'min_cgpa':
          if (data.cgpa < rule.value) {
            failedRules.push(rule);
            reasons.push(`CGPA ${data.cgpa} is below minimum required ${rule.value}`);
          }
          break;
        case 'max_backlogs':
          if (data.backlogs > rule.value) {
            failedRules.push(rule);
            reasons.push(`Total backlogs ${data.backlogs} exceed maximum allowed ${rule.value}`);
          }
          break;
        case 'max_semesters':
          if (data.semestersSpent > rule.value) {
            failedRules.push(rule);
            reasons.push(
              `Total semesters ${data.semestersSpent} exceed maximum allowed ${rule.value}`
            );
          }
          break;
        case 'total_credits':
          if (data.totalCredits < rule.value) {
            failedRules.push(rule);
            reasons.push(`Total credits ${data.totalCredits} are below requirement ${rule.value}`);
          }
          break;
      }
    }

    return {
      isEligible: failedRules.length === 0,
      failedRules,
      reasons,
    };
  }
}
