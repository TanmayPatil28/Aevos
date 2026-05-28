/**
 * Savitribai Phule Pune University / Savitribai Phule Pune University
 * Savitribai Phule Pune University /Savvy Academic Regulation Intelligence Schemas
 * 
 * Part of the GradeFlow Academic Rule Abstraction Layer.
 * Codifies 14 key dimensions of academic policy and institutional governance.
 */

export interface AcademicStructure {
  semesterCount: number;
  creditRange: { min: number; max: number };
  defaultCreditsPerSem: number[];
  hasHonorsMinors: boolean;
  zeroCreditHandling: "exclude" | "include_but_zero_point" | "strict_blocker";
  multidisciplinaryCredits?: boolean;
}

export interface GradeScaleEntry {
  grade: string;
  points: number;
  description: string;
  isPass: boolean;
  absoluteMinMarks?: number; // Lower bound percentage (only for absolute/hybrid)
}

export interface GradingScaleConfig {
  gradingModel: "absolute" | "relative" | "hybrid";
  grades: GradeScaleEntry[];
}

export interface PercentageFormulaConfig {
  type: "piecewise" | "linear" | "offset" | "direct_scalar" | "none";
  sgpaFormulaDescription: string;
  cgpaFormulaDescription: string;
  sgpaToPercentage: (sgpa: number) => number;
  cgpaToPercentage: (cgpa: number) => number;
}

export interface InternalAssessmentConfig {
  components: string[];
  splitWeightage: string; // e.g., "40/60", "30/70"
  ciePassingMin?: number;  // Continuous Internal Evaluation minimum marks
  cieVoidGate?: boolean;  // If true, failing CIE cancels Semester End Exam (SEE)
}

export interface ExternalAssessmentConfig {
  seePassingMin?: number;  // Semester End Exam minimum marks
  theoryPracticalSeparation: boolean;
}

export interface PassingInvariantsConfig {
  minOverallMarks: number;    // E.g., 40 or 50
  minCgpaForGraduation: number; // E.g., 4.5 or 5.0
  independentPassing: boolean; // Must pass internals and externals separately
}

export interface ProgressionRulesConfig {
  atktAllowed: boolean;
  maxBacklogCount?: number;
  minCreditPercentProgress?: number; // E.g., 50%
  promotionOperator: "AND" | "OR";   // Logical gate (e.g., CGPA >= 5.0 OR Credits >= 50% for MIT-WPU)
  yearDownOnFail: boolean;
}

export interface BacklogPolicyConfig {
  retakeGradeDowngrade: boolean;
  gradeReplacement: "overwrite" | "average" | "best_of";
  supplementaryExams: boolean;
  summerTermAvailable: boolean;
}

export interface AttendanceRulesConfig {
  minAttendancePercent: number;  // Standard, e.g., 75%
  medicalExemptionLimit?: number; // Max exemption limit, e.g., 25%
  absoluteAttendanceFloor: number; // Minimum after medical, e.g., 50%
  detentionTriggered: boolean;
}

export interface SpecialAnomaliesConfig {
  hasSkillTranscript: boolean;     // Parallel competency sheet (e.g., VIT Pune)
  valueAddedScrubbing: boolean;    // Failures of value-added courses deleted from gradecard (e.g., Anna Uni)
  goldMedalFractionalBreaker: boolean; // Tie-breaker rules for university ranks
  firstAppearanceRule: boolean;    // First-attempt rules for Distinction (e.g., NIT Trichy)
}

export interface GlobalEquivalencyConfig {
  wesGpaMapping: "descriptor_mapping" | "linear_capped";
  ectsPercentileEnabled: boolean;
}

export interface ValidationRiskConfig {
  validationYearTrigger?: number;
  facultyScope?: string[]; // e.g., ["engineering"]
}

export interface AIAdvisoryConfig {
  percentageTargeting: boolean;
  progressionSurvivalStats: boolean;
  standardDeviationForecast: boolean;
  internalsWarning: boolean;
}

export interface RegulationSystem {
  id: string;                      // Unique ID (e.g., 'sppu_2024')
  universityId: string;            // Parent group (e.g., 'sppu')
  regulationName: string;          // e.g., '2024 NEP Pattern'
  regulationYear: number;          // e.g., 2024
  status: "active" | "deprecated" | "experimental";
  nepAligned: boolean;

  // 14 Regulatory Dimensions
  academicStructure: AcademicStructure;
  gradingScale: GradingScaleConfig;
  percentageFormula: PercentageFormulaConfig;
  internalAssessment: InternalAssessmentConfig;
  externalAssessment: ExternalAssessmentConfig;
  passingInvariants: PassingInvariantsConfig;
  progressionRules: ProgressionRulesConfig;
  backlogPolicy: BacklogPolicyConfig;
  attendanceRules: AttendanceRulesConfig;
  specialAnomalies: SpecialAnomaliesConfig;
  globalEquivalency: GlobalEquivalencyConfig;
  validationRisks: ValidationRiskConfig;
  aiAdvisory: AIAdvisoryConfig;
}
