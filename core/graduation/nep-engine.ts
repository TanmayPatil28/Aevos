/**
 * core/graduation/nep-engine.ts
 *
 * New Education Policy (NEP) 2020 graduation and certification engine.
 * Handles modular exits (Certificate, Diploma, Degree, Honors) and
 * Academic Bank of Credits (ABC) interoperability.
 */

import type { StudentFeatureVector, NepExitCertification } from '../types';

export class NEPEngine {
  /**
   * Evaluates a student's eligibility for NEP 2020 exit certifications.
   * Based on the general framework:
   * - 1 Year (2 Sems) -> Undergraduate Certificate
   * - 2 Years (4 Sems) -> Undergraduate Diploma
   * - 3 Years (6 Sems) -> Bachelor's Degree
   * - 4 Years (8 Sems) -> Bachelor's Degree with Honors / Research
   */
  static evaluateExitOptions(features: StudentFeatureVector): NepExitCertification[] {
    const options: NepExitCertification[] = [];
    const sems = features.semestersCompleted;
    const credits = features.creditsCompleted;

    // Minimum passing CGPA threshold (typically 5.0)
    if (features.currentCgpa < 5.0 || features.backlogCount > 0) {
      return []; // Must clear backlogs to claim an exit certificate
    }

    if (sems >= 2 && credits >= 40) {
      options.push({
        type: 'certificate',
        title: 'Undergraduate Certificate',
        minCreditsRequired: 40,
        eligible: true,
      });
    }

    if (sems >= 4 && credits >= 80) {
      options.push({
        type: 'diploma',
        title: 'Undergraduate Diploma',
        minCreditsRequired: 80,
        eligible: true,
      });
    }

    if (sems >= 6 && credits >= 120) {
      options.push({
        type: 'degree',
        title: "Bachelor's Degree",
        minCreditsRequired: 120,
        eligible: true,
      });
    }

    if (sems >= 8 && credits >= 160) {
      options.push({
        type: 'honors',
        title: "Bachelor's Degree with Honors/Research",
        minCreditsRequired: 160,
        eligible: true,
      });
    }

    return options;
  }
}
