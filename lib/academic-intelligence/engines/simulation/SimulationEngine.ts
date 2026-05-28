export interface SimulationInput {
  currentCgpa: number;
  completedCredits: number;
  totalDegreeCredits: number;
  currentTrend: "UP" | "DOWN" | "FLAT";
}

export interface SimulationResult {
  probabilities: {
    dropBelow7_5: number;
    backlogZone: number;
    placementIneligibility: number;
  };
  graduationOutcomes: {
    bestCase: number;
    mostLikely: number;
    worstSafe: number;
  };
  timelineProjections: string[];
}

export const SimulationEngine = {
  /**
   * Powers "Future Collapse Simulation" and "Graduation Outcome Prediction"
   */
  calculate(input: SimulationInput): SimulationResult {
    const { currentCgpa, completedCredits, totalDegreeCredits, currentTrend } = input;
    
    // Simple heuristic probabilities based on current trend and CGPA
    let dropBelow7_5 = 0;
    let backlogZone = 0;
    let placementIneligibility = 0;

    if (currentCgpa < 7.5) {
      dropBelow7_5 = 90;
    } else if (currentTrend === "DOWN") {
      dropBelow7_5 = 64; // High risk if trending down
    } else {
      dropBelow7_5 = 15;
    }

    if (currentCgpa < 6.5 || currentTrend === "DOWN") {
      backlogZone = 41;
      placementIneligibility = 37;
    } else {
      backlogZone = 12;
      placementIneligibility = 5;
    }

    const remainingCredits = totalDegreeCredits - completedCredits;
    const isLateStage = remainingCredits < totalDegreeCredits * 0.3;

    // Graduation outcomes
    let bestCase = currentCgpa + (isLateStage ? 0.3 : 0.8);
    let mostLikely = currentTrend === "DOWN" ? currentCgpa - 0.2 : currentCgpa + 0.1;
    let worstSafe = currentCgpa - (isLateStage ? 0.4 : 1.0);

    bestCase = Math.min(10, Math.round(bestCase * 100) / 100);
    mostLikely = Math.min(10, Math.max(0, Math.round(mostLikely * 100) / 100));
    worstSafe = Math.max(0, Math.round(worstSafe * 100) / 100);

    const timelineProjections = [
      `1 semester later: Projected range [${Math.max(0, mostLikely - 0.2).toFixed(2)} - ${Math.min(10, mostLikely + 0.2).toFixed(2)}]`,
      `2 semesters later: Projected range [${Math.max(0, worstSafe + 0.2).toFixed(2)} - ${bestCase.toFixed(2)}]`,
      `Graduation estimate: ${mostLikely.toFixed(2)}`,
    ];

    return {
      probabilities: {
        dropBelow7_5,
        backlogZone,
        placementIneligibility,
      },
      graduationOutcomes: {
        bestCase,
        mostLikely,
        worstSafe,
      },
      timelineProjections,
    };
  },
};
