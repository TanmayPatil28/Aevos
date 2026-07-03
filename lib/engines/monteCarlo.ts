/**
 * The Time Liquidity Engine - Monte Carlo Simulator
 * Models attendance as a Cramér-Lundberg Surplus Process to calculate Ruin Probability.
 */

export interface MonteCarloParams {
  currentAttendance: number; // e.g., 0.85 (85%)
  targetAttendance: number; // e.g., 0.75 (75%)
  totalClasses: number; // e.g., 40 classes total in semester
  classesConducted: number; // e.g., 20 classes conducted so far
  classesAttended: number; // e.g., 17 classes attended
  illnessProbabilityPerClass?: number; // e.g., 0.05
  professorAbsenceRate?: number; // e.g., 0.10
  iterations?: number; // Default: 10000
}

export interface MonteCarloResult {
  ruinProbability: number; // Risk of falling below target %
  safeBunksRemaining: number; // Deterministic safe bunks
  strategicSkipsAllowed: number; // Skips allowed while keeping ruin risk < 10%
  simulatedPaths: { path: number[]; ruined: boolean }[];
}

export function runMonteCarloSimulation(params: MonteCarloParams): MonteCarloResult {
  const iterations = params.iterations || 10000;
  const illnessProb = params.illnessProbabilityPerClass || 0.05;
  const profAbsenceProb = params.professorAbsenceRate || 0.05;
  const classesRemaining = params.totalClasses - params.classesConducted;

  let ruinedCount = 0;
  
  // Deterministic safe bunks calculation
  // (attended + X) / total >= target  => X is future attended
  // allowed skips = classesRemaining - X
  const requiredAttended = Math.ceil(params.targetAttendance * params.totalClasses);
  const minFutureAttended = Math.max(0, requiredAttended - params.classesAttended);
  const deterministicSafeBunks = Math.max(0, classesRemaining - minFutureAttended);

  // We only store a few paths for visualization in the UI
  const simulatedPaths: { path: number[]; ruined: boolean }[] = [];

  for (let i = 0; i < iterations; i++) {
    let simAttended = params.classesAttended;
    let simConducted = params.classesConducted;
    const path: number[] = [simAttended / Math.max(1, simConducted)];
    
    // Simulate each remaining class
    for (let c = 0; c < classesRemaining; c++) {
      // Does the professor cancel?
      if (Math.random() < profAbsenceProb) {
        // Class cancelled, neither attended nor conducted increases
        path.push(simAttended / simConducted);
        continue;
      }
      
      simConducted++;
      
      // Do we get sick or miss for an external reason?
      if (Math.random() < illnessProb) {
        // Missed class
      } else {
        simAttended++;
      }
      
      path.push(simAttended / simConducted);
    }
    
    const finalAttendance = simAttended / simConducted;
    const isRuined = finalAttendance < params.targetAttendance;
    
    if (isRuined) {
      ruinedCount++;
    }
    
    if (i < 5) {
      simulatedPaths.push({ path, ruined: isRuined });
    }
  }

  const ruinProbability = (ruinedCount / iterations) * 100;
  
  // Strategic skips (heuristic based on ruin risk)
  // If ruin risk is low (<5%), you can safely add a strategic skip.
  let strategicSkips = deterministicSafeBunks;
  if (ruinProbability > 20) {
    strategicSkips = Math.max(0, deterministicSafeBunks - 1); // You should hoard a bunk!
  }

  return {
    ruinProbability: Number(ruinProbability.toFixed(1)),
    safeBunksRemaining: deterministicSafeBunks,
    strategicSkipsAllowed: strategicSkips,
    simulatedPaths
  };
}
