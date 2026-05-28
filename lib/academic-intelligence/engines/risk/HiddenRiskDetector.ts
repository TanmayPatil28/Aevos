export interface HiddenRiskInput {
  cgpaTrend: "UP" | "DOWN" | "FLAT";
  attendanceTrend: "UP" | "DOWN" | "FLAT";
  averageInternalMarks: number;
  relianceOnEasySubjects: boolean; // e.g. true if mostly high marks in 1-2 credit courses
  completedCreditsRatio: number; // e.g. 0.2 means early semesters, 0.8 means near graduation
}

export interface HiddenRiskResult {
  hasSilentDecline: boolean;
  fragilityScore: number; // 0-100 (how dangerous one bad semester is)
  insights: string[];
}

export const HiddenRiskDetector = {
  /**
   * Detects "Silent Academic Decline" and evaluates "Semester Fragility".
   */
  calculate(input: HiddenRiskInput): HiddenRiskResult {
    const insights: string[] = [];
    let hasSilentDecline = false;
    let fragilityScore = 0;

    // Detect silent decline
    if (input.cgpaTrend === "FLAT" || input.cgpaTrend === "UP") {
      if (input.attendanceTrend === "DOWN") {
        hasSilentDecline = true;
        insights.push("GPA is stable, but attendance is decreasing gradually. This is a silent decline pattern.");
      }
      if (input.averageInternalMarks < 60) {
        hasSilentDecline = true;
        insights.push("Overall GPA is masking weakening internal marks.");
      }
      if (input.relianceOnEasySubjects) {
        hasSilentDecline = true;
        insights.push("Your high GPA is overly dependent on low-credit or non-core subjects.");
      }
    }

    if (hasSilentDecline) {
      insights.push("You are still safe, but entering a hidden instability phase.");
    }

    // Calculate fragility (How dangerous is one bad semester?)
    // Early semesters = high fragility (less credits to absorb shock).
    // Near graduation = moderate fragility (harder to recover, but less impact per subject).
    if (input.completedCreditsRatio < 0.3) {
      fragilityScore = 85;
      insights.push("Your academic system currently has low shock resistance due to early semesters.");
    } else if (input.completedCreditsRatio > 0.8) {
      fragilityScore = 60;
      insights.push("One low semester can permanently lock your final CGPA.");
    } else {
      fragilityScore = 40;
    }

    return {
      hasSilentDecline,
      fragilityScore,
      insights,
    };
  },
};
