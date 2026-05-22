import { getPresetById } from "../presets/presetRegistry";
import { ForecastEngineInput, ForecastScenario } from "./types";
import { trajectoryProjector } from "./trajectoryProjector";

export const scenarioFactory = {
  /**
   * Generates Maintain, Improve, and Decline forecast scenarios.
   */
  generateAll(input: ForecastEngineInput, presetId: string): ForecastScenario[] {
    const preset = getPresetById(presetId);
    const gradeScale = preset?.gradeScale || [];
    const maxGradePoint = Math.max(...gradeScale.map(g => g.points), 10.0);

    const { currentSgpa, targetCgpa } = input;

    // Scenarios:
    // 1. Maintain: assumedSgpa = currentSgpa
    // 2. Improve: assumedSgpa = min(currentSgpa + 0.5, maxGP)
    // 3. Decline: assumedSgpa = max(currentSgpa - 0.5, 0)
    const maintainSgpa = Math.min(Math.max(0, currentSgpa), maxGradePoint);
    const improveSgpa = Math.min(currentSgpa + 0.5, maxGradePoint);
    const declineSgpa = Math.max(currentSgpa - 0.5, 0);

    const scenariosConfigs = [
      {
        id: "maintain",
        name: "Maintain Performance",
        description: "Assumes you continue at your latest semester GPA level.",
        assumedSgpa: maintainSgpa
      },
      {
        id: "improve",
        name: "Steady Improvement",
        description: "Assumes academic push, improving your GPA by +0.50 points.",
        assumedSgpa: improveSgpa
      },
      {
        id: "decline",
        name: "Decline Risk",
        description: "Assumes drop in performance, decreasing your GPA by -0.50 points.",
        assumedSgpa: declineSgpa
      }
    ];

    return scenariosConfigs.map(config => {
      const projections = trajectoryProjector.project(input, config.assumedSgpa, maxGradePoint);
      const finalCgpa = projections.length > 0 ? projections[projections.length - 1].projectedCgpa : input.currentCgpa;
      const meetsTarget = finalCgpa >= targetCgpa;

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        assumedSgpa: parseFloat(config.assumedSgpa.toFixed(2)),
        projections,
        finalCgpa: parseFloat(finalCgpa.toFixed(2)),
        meetsTarget
      };
    });
  }
};
