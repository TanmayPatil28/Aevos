import { StudentState, DecisionNode } from "./decisionTypes";

export const decisionEngine = {
  applyDecision: (currentState: StudentState, decision: DecisionNode): StudentState => {
    // Basic deterministic math engine
    
    // Calculate new CGPA (simplified weighted average)
    // Assume 8 semesters total. 
    // This is a simplified mathematical model for MVP.
    // In reality, this would use the preset data and precise credit weights.
    const semesterWeight = 1 / Math.max(1, (currentState.completedSemesters + 1));
    const newCgpaRaw = currentState.currentCgpa + (decision.impact.gpaDelta * semesterWeight);
    const newCgpa = Math.max(0, Math.min(10, newCgpaRaw));

    const newSkill = Math.max(0, currentState.skillPoints + decision.impact.skillDelta);
    const newCareer = Math.max(0, Math.min(100, currentState.careerReadiness + decision.impact.careerDelta));
    const newStress = Math.max(0, Math.min(100, currentState.stressLevel + decision.impact.stressDelta));

    return {
      currentCgpa: parseFloat(newCgpa.toFixed(2)),
      completedSemesters: currentState.completedSemesters + 1,
      skillPoints: newSkill,
      careerReadiness: newCareer,
      stressLevel: newStress,
      logs: [...currentState.logs, decision.impact.narrative]
    };
  }
};
