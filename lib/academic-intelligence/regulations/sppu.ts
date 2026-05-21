import { RegulationSystem } from "../schemas/regulation";

// SPPU 2019 Pattern Regulation System
export const SPPU_2019_REGULATION: RegulationSystem = {
  id: "sppu",
  universityId: "sppu",
  regulationName: "SPPU 2019 Pattern (CBCS)",
  regulationYear: 2019,
  status: "active",
  nepAligned: false,

  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 180 },
    defaultCreditsPerSem: [22, 22, 22, 22, 22, 22, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "exclude",
  },

  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 80 },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 70 },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "B+", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 55 },
      { grade: "B",  points: 6,  description: "Above Average", isPass: true, absoluteMinMarks: 50 },
      { grade: "C",  points: 5,  description: "Average", isPass: true, absoluteMinMarks: 45 },
      { grade: "D",  points: 4,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
      { grade: "F",  points: 0,  description: "Fail", isPass: false, absoluteMinMarks: 0 },
    ],
  },

  percentageFormula: {
    type: "linear",
    sgpaFormulaDescription: "(SGPA - 0.75) * 10",
    cgpaFormulaDescription: "(CGPA - 0.75) * 10",
    sgpaToPercentage: (sgpa) => parseFloat(((sgpa - 0.75) * 10).toFixed(2)),
    cgpaToPercentage: (cgpa) => parseFloat(((cgpa - 0.75) * 10).toFixed(2)),
  },

  internalAssessment: {
    components: ["In-Semester Evaluation (ISE)"],
    splitWeightage: "30/70",
  },

  externalAssessment: {
    seePassingMin: 40,
    theoryPracticalSeparation: true,
  },

  passingInvariants: {
    minOverallMarks: 40,
    minCgpaForGraduation: 4.0,
    independentPassing: true,
  },

  progressionRules: {
    atktAllowed: true,
    minCreditPercentProgress: 50,
    promotionOperator: "AND",
    yearDownOnFail: true,
  },

  backlogPolicy: {
    retakeGradeDowngrade: true,
    gradeReplacement: "overwrite",
    supplementaryExams: false,
    summerTermAvailable: false,
  },

  attendanceRules: {
    minAttendancePercent: 75,
    medicalExemptionLimit: 15,
    absoluteAttendanceFloor: 60,
    detentionTriggered: true,
  },

  specialAnomalies: {
    hasSkillTranscript: false,
    valueAddedScrubbing: false,
    goldMedalFractionalBreaker: true,
    firstAppearanceRule: false,
  },

  globalEquivalency: {
    wesGpaMapping: "linear_capped",
    ectsPercentileEnabled: false,
  },

  validationRisks: {
    validationYearTrigger: 2019,
    facultyScope: ["engineering", "science", "arts", "commerce"],
  },

  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: false,
    internalsWarning: false,
  },
};

// SPPU 2015 Pattern Regulation System
export const SPPU_2015_REGULATION: RegulationSystem = {
  ...SPPU_2019_REGULATION,
  id: "sppu_2015",
  regulationName: "SPPU 2015 Pattern (Legacy)",
  regulationYear: 2015,
  status: "deprecated",
  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 90 },
      { grade: "A",  points: 9,  description: "Very Good", isPass: true, absoluteMinMarks: 80 },
      { grade: "B",  points: 8,  description: "Good", isPass: true, absoluteMinMarks: 70 },
      { grade: "C",  points: 7,  description: "Fair", isPass: true, absoluteMinMarks: 60 },
      { grade: "D",  points: 6,  description: "Average", isPass: true, absoluteMinMarks: 50 },
      { grade: "E",  points: 5,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
      { grade: "F",  points: 0,  description: "Fail", isPass: false, absoluteMinMarks: 0 },
    ],
  },
};

// SPPU 2024 NEP Regulation System
export const SPPU_2024_REGULATION: RegulationSystem = {
  ...SPPU_2019_REGULATION,
  id: "sppu_2024",
  regulationName: "SPPU 2024 NEP Pattern",
  regulationYear: 2024,
  status: "active",
  nepAligned: true,
  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 176 },
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "strict_blocker",
    multidisciplinaryCredits: true,
  },
  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 85 },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 75 },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 65 },
      { grade: "B+", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "B",  points: 6,  description: "Above Average", isPass: true, absoluteMinMarks: 55 },
      { grade: "C",  points: 5,  description: "Average", isPass: true, absoluteMinMarks: 50 },
      { grade: "P",  points: 4,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
      { grade: "F",  points: 0,  description: "Fail", isPass: false, absoluteMinMarks: 0 },
    ],
  },
  internalAssessment: {
    components: ["Continuous Internal Evaluation (CIE)", "Summative Assessment (SA)"],
    splitWeightage: "40/60",
    ciePassingMin: 40,
    cieVoidGate: false,
  },
};
