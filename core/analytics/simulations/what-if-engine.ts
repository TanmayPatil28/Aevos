/**
 * core/analytics/simulations/what-if-engine.ts
 *
 * What-If scenario engine for the Semester Planner.
 * Allows students to simulate "What if I get an A in DSA?"
 * and see the immediate impact on SGPA and CGPA.
 */

export interface WhatIfInput {
  readonly currentCgpa: number;
  readonly totalCreditsCompleted: number;
  readonly simulatedSemesterCredits: number;
  readonly simulatedSgpa: number;
}

export interface WhatIfResult {
  readonly newCgpa: number;
  readonly cgpaDelta: number;
  readonly targetAchieved: boolean;
}

export class WhatIfEngine {
  /**
   * Simulates the impact of a specific semester SGPA on the overall CGPA.
   */
  static simulateCgpaImpact(input: WhatIfInput, targetCgpa?: number): WhatIfResult {
    const currentTotalPoints = input.currentCgpa * input.totalCreditsCompleted;
    const simulatedPoints = input.simulatedSgpa * input.simulatedSemesterCredits;

    const newTotalCredits = input.totalCreditsCompleted + input.simulatedSemesterCredits;
    const newCgpa =
      newTotalCredits > 0 ? (currentTotalPoints + simulatedPoints) / newTotalCredits : 0;

    const formattedNewCgpa = Number(newCgpa.toFixed(2));
    const delta = Number((formattedNewCgpa - input.currentCgpa).toFixed(2));

    return {
      newCgpa: formattedNewCgpa,
      cgpaDelta: delta,
      targetAchieved: targetCgpa !== undefined && formattedNewCgpa >= targetCgpa,
    };
  }

  /**
   * Calculates the required SGPA to reach a target CGPA.
   */
  static calculateRequiredSgpa(
    currentCgpa: number,
    totalCreditsCompleted: number,
    targetCgpa: number,
    creditsRemaining: number
  ): number | 'impossible' {
    const targetPoints = targetCgpa * (totalCreditsCompleted + creditsRemaining);
    const currentPoints = currentCgpa * totalCreditsCompleted;

    const requiredPoints = targetPoints - currentPoints;
    const requiredSgpa = requiredPoints / creditsRemaining;

    if (requiredSgpa > 10.0) {
      return 'impossible';
    }

    return Number(Math.max(0, requiredSgpa).toFixed(2));
  }
}
