import { RegulationSystem } from "../schemas/regulation";

// COEP Technological University Regulation System
export const COEP_2022_REGULATION: RegulationSystem = {
  id: "coep",
  universityId: "coep",
  regulationName: "COEP Technological University UG Regulations 2022",
  regulationYear: 2022,
  status: "active",
  nepAligned: false,

  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 170 },
    defaultCreditsPerSem: [21, 21, 21, 21, 21, 21, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "exclude",
  },

  gradingScale: {
    gradingModel: "relative",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true },
      { grade: "B+", points: 7,  description: "Good", isPass: true },
      { grade: "B",  points: 6,  description: "Above Average", isPass: true },
      { grade: "C",  points: 5,  description: "Average", isPass: true },
      { grade: "P",  points: 4,  description: "Pass", isPass: true },
      { grade: "F",  points: 0,  description: "Fail", isPass: false },
    ],
  },

  percentageFormula: {
    type: "offset",
    sgpaFormulaDescription: "(SGPA - 0.5) * 10",
    cgpaFormulaDescription: "(CGPA - 0.5) * 10",
    sgpaToPercentage: (sgpa) => parseFloat(((sgpa - 0.5) * 10).toFixed(2)),
    cgpaToPercentage: (cgpa) => parseFloat(((cgpa - 0.5) * 10).toFixed(2)),
  },

  internalAssessment: {
    components: ["Continuous Evaluation (T1/T2)", "Mid-Semester Examination"],
    splitWeightage: "40/60",
  },

  externalAssessment: {
    seePassingMin: 40,
    theoryPracticalSeparation: false,
  },

  passingInvariants: {
    minOverallMarks: 40,
    minCgpaForGraduation: 5.0,
    independentPassing: false,
  },

  progressionRules: {
    atktAllowed: true,
    minCreditPercentProgress: 50,
    promotionOperator: "AND",
    yearDownOnFail: true,
  },

  backlogPolicy: {
    retakeGradeDowngrade: false,
    gradeReplacement: "best_of",
    supplementaryExams: true,
    summerTermAvailable: true,
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
    firstAppearanceRule: true,
  },

  globalEquivalency: {
    wesGpaMapping: "linear_capped",
    ectsPercentileEnabled: true,
  },

  validationRisks: {
    validationYearTrigger: 2022,
    facultyScope: ["engineering"],
  },

  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: true,
    internalsWarning: true,
  },
};
