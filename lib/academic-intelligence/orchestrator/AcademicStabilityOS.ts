import { healthScoreEngine, HealthScoreInput, HealthScoreResult } from "../healthScore";
import { VolatilityEngine, VolatilityInput, VolatilityResult } from "../engines/volatility/VolatilityEngine";
import { BacklogPredictor, SubjectPerformance, BacklogProbability } from "../engines/risk/BacklogPredictor";
import { HiddenRiskDetector, HiddenRiskInput, HiddenRiskResult } from "../engines/risk/HiddenRiskDetector";
import { RecoveryEngine, RecoveryInput, RecoveryResult } from "../engines/recovery/RecoveryEngine";
import { SimulationEngine, SimulationInput, SimulationResult } from "../engines/simulation/SimulationEngine";
import { BehavioralEngine, BehavioralInput, BehavioralResult } from "../engines/behavior/BehavioralEngine";
import { InsightEngine, InsightInput, InsightResult } from "../engines/insights/InsightEngine";

export interface AcademicStabilityOSInput {
  healthInput: HealthScoreInput;
  volatilityInput: VolatilityInput;
  subjects: SubjectPerformance[];
  hiddenRiskInput: HiddenRiskInput;
  recoveryInput: RecoveryInput;
  simulationInput: SimulationInput;
  behavioralInput: Partial<BehavioralInput>; // Partially derived
}

export interface LiveAcademicStabilityStatus {
  healthIndex: HealthScoreResult;
  volatility: VolatilityResult;
  backlogProbabilities: BacklogProbability[];
  hiddenRisks: HiddenRiskResult;
  recoveryStrength: RecoveryResult;
  simulations: SimulationResult;
  behavioralProfile: BehavioralResult;
  insights: InsightResult;
  lastCalculatedAt: string;
}

export const AcademicStabilityOS = {
  /**
   * The core integration layer. Takes raw student data and produces a single unified LiveAcademicStabilityStatus.
   */
  generateLiveStatus(input: AcademicStabilityOSInput): LiveAcademicStabilityStatus {
    const healthIndex = healthScoreEngine.calculate(input.healthInput);
    const volatility = VolatilityEngine.calculate(input.volatilityInput);
    const backlogProbabilities = BacklogPredictor.calculate(input.subjects);
    const hiddenRisks = HiddenRiskDetector.calculate(input.hiddenRiskInput);
    const recoveryStrength = RecoveryEngine.calculate(input.recoveryInput);
    const simulations = SimulationEngine.calculate(input.simulationInput);

    // Derived Behavioral Input
    const avgBacklogRisk = backlogProbabilities.reduce((sum, b) => sum + b.probability, 0) / (backlogProbabilities.length || 1);
    
    const behavioralProfile = BehavioralEngine.calculate({
      creditLoad: input.behavioralInput.creditLoad || 20,
      recoveryPressure: input.healthInput.targetCgpa > input.healthInput.cgpa + 0.5 ? 80 : 30,
      attendance: input.healthInput.aggregateAttendancePercentage,
      backlogRisk: avgBacklogRisk,
      volatilityTrend: volatility.trend,
    });

    const highRiskSubjects = backlogProbabilities.filter(b => b.riskLevel === "HIGH").map(b => b.subjectName);

    const insights = InsightEngine.calculate({
      hasSilentDecline: hiddenRisks.hasSilentDecline,
      highRiskSubjects,
      attendanceTrend: input.hiddenRiskInput.attendanceTrend,
      creditLoad: input.behavioralInput.creditLoad || 20,
      pastSgpas: input.volatilityInput.pastSgpas,
      recoveryStrengthScore: recoveryStrength.recoveryStrengthScore,
    });

    return {
      healthIndex,
      volatility,
      backlogProbabilities,
      hiddenRisks,
      recoveryStrength,
      simulations,
      behavioralProfile,
      insights,
      lastCalculatedAt: new Date().toISOString(),
    };
  },
};
