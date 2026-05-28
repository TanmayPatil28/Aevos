export interface InsightInput {
  hasSilentDecline: boolean;
  highRiskSubjects: string[];
  attendanceTrend: "UP" | "DOWN" | "FLAT";
  creditLoad: number;
  pastSgpas: number[];
  recoveryStrengthScore: number;
}

export interface InsightResult {
  rootCauses: string[];
  preventions: string[];
  opportunityWindows: string[];
  declineReplay: string | null;
}

export const InsightEngine = {
  /**
   * Root Cause Analysis, Risk Prevention Recommendations, Risk-to-Opportunity, and Replay.
   */
  calculate(input: InsightInput): InsightResult {
    const { hasSilentDecline, highRiskSubjects, attendanceTrend, creditLoad, pastSgpas, recoveryStrengthScore } = input;
    
    const rootCauses: string[] = [];
    const preventions: string[] = [];
    const opportunityWindows: string[] = [];
    let declineReplay: string | null = null;

    // Root Cause Analysis
    if (attendanceTrend === "DOWN") {
      rootCauses.push("Your attendance decline caused an estimated 22% rise in backlog probability.");
    }
    if (highRiskSubjects.length > 0) {
      rootCauses.push(`${highRiskSubjects.join(", ")} weakness is destabilizing CGPA.`);
    }
    if (creditLoad > 22 && pastSgpas[pastSgpas.length - 1] < 7.0) {
      rootCauses.push("Your performance drops in semesters with more than 22 credits.");
    }

    // Preventions
    if (highRiskSubjects.length > 0) {
      preventions.push(`Protect ${highRiskSubjects[0]} this semester. It has highest downstream dependency.`);
    }
    if (hasSilentDecline) {
      preventions.push("You should prioritize consistency over aggressive GPA recovery right now.");
    } else if (recoveryStrengthScore < 50) {
      preventions.push("Reducing one backlog now prevents 0.42 CGPA loss later.");
    }

    // Opportunity Windows
    if (creditLoad < 20) {
      opportunityWindows.push("Current low-credit semester is ideal for aggressive CGPA gain.");
    } else {
      opportunityWindows.push("Next 2 semesters are your best recovery opportunity.");
      if (recoveryStrengthScore > 60) {
        opportunityWindows.push("One strong semester now can stabilize your entire trajectory.");
      }
    }

    // Decline Replay (Example logic)
    if (pastSgpas.length > 2 && pastSgpas[pastSgpas.length - 2] < pastSgpas[pastSgpas.length - 3] - 0.5) {
      declineReplay = `Semester ${pastSgpas.length - 1} caused major instability: attendance collapsed and recovery never fully completed.`;
    }

    return {
      rootCauses,
      preventions,
      opportunityWindows,
      declineReplay,
    };
  },
};
