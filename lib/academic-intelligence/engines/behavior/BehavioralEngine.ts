export interface BehavioralInput {
  creditLoad: number;
  recoveryPressure: number; // 0-100, high if target GPA is much higher than current
  attendance: number;
  backlogRisk: number; // 0-100 from BacklogPredictor
  volatilityTrend: string;
}

export type StabilityPersona = 
  | "Stable Performer"
  | "Last-Minute Survivor"
  | "Recovery Fighter"
  | "High-Risk Sprinter"
  | "Burnout Candidate"
  | "Silent Decliner"
  | "Consistent Climber"
  | "Volatile Genius";

export interface BehavioralResult {
  stressLevel: "High Cognitive Overload" | "Unsustainable Academic Pressure" | "Recovery Window Closing" | "Manageable Load";
  persona: StabilityPersona;
  confidenceMeter: "Confident" | "Uncertain" | "Vulnerable" | "Unstable";
}

export const BehavioralEngine = {
  /**
   * Academic Stress Detection Layer, Stability Personas, and Academic Confidence Meter.
   */
  calculate(input: BehavioralInput): BehavioralResult {
    const { creditLoad, recoveryPressure, attendance, backlogRisk, volatilityTrend } = input;
    
    // Stress Detection
    let stressLevel: BehavioralResult["stressLevel"] = "Manageable Load";
    if (creditLoad > 24 && recoveryPressure > 70) {
      stressLevel = "High Cognitive Overload";
    } else if (attendance < 75 && backlogRisk > 60) {
      stressLevel = "Unsustainable Academic Pressure";
    } else if (recoveryPressure > 90) {
      stressLevel = "Recovery Window Closing";
    }

    // Persona Logic
    let persona: StabilityPersona = "Stable Performer";
    if (volatilityTrend === "IMPROVING" && recoveryPressure > 50) {
      persona = "Recovery Fighter";
    } else if (volatilityTrend === "UNSTABLE_EXCELLENCE") {
      persona = "Volatile Genius";
    } else if (volatilityTrend === "OSCILLATING") {
      persona = "Last-Minute Survivor";
    } else if (volatilityTrend === "DECLINING" && attendance > 80) {
      persona = "Silent Decliner";
    } else if (stressLevel === "High Cognitive Overload") {
      persona = "Burnout Candidate";
    } else if (creditLoad > 22 && volatilityTrend === "OSCILLATING") {
      persona = "High-Risk Sprinter";
    } else if (volatilityTrend === "IMPROVING") {
      persona = "Consistent Climber";
    }

    // Confidence Meter
    let confidenceMeter: BehavioralResult["confidenceMeter"] = "Confident";
    if (stressLevel === "Unsustainable Academic Pressure" || persona === "Burnout Candidate") {
      confidenceMeter = "Unstable";
    } else if (backlogRisk > 50 || persona === "Silent Decliner") {
      confidenceMeter = "Vulnerable";
    } else if (volatilityTrend === "OSCILLATING" || recoveryPressure > 60) {
      confidenceMeter = "Uncertain";
    }

    return {
      stressLevel,
      persona,
      confidenceMeter,
    };
  },
};
