import { RegulationSystem } from "../schemas/regulation";

// VTU 2022 Scheme Regulation System
export const VTU_2022_REGULATION: RegulationSystem = {
  id: "vtu",
  universityId: "vtu",
  regulationName: "VTU 2022 CBCS Scheme",
  regulationYear: 2022,
  status: "active",
  nepAligned: false,

  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 175 },
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "strict_blocker",
  },

  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 90 },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 80 },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 70 },
      { grade: "B+", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "B",  points: 6,  description: "Above Average", isPass: true, absoluteMinMarks: 55 },
      { grade: "C",  points: 5,  description: "Average", isPass: true, absoluteMinMarks: 50 },
      { grade: "P",  points: 4,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
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
    components: ["Continuous Internal Evaluation (CIE)", "Semester End Examination (SEE)"],
    splitWeightage: "50/50",
    ciePassingMin: 40,
    cieVoidGate: false,
  },

  externalAssessment: {
    seePassingMin: 35, // 35% in SEE minimum, 40% overall (CIE + SEE)
    theoryPracticalSeparation: true,
  },

  passingInvariants: {
    minOverallMarks: 40,
    minCgpaForGraduation: 5.0,
    independentPassing: true,
  },

  progressionRules: {
    atktAllowed: true,
    minCreditPercentProgress: 50,
    promotionOperator: "AND",
    yearDownOnFail: true,
  },

  backlogPolicy: {
    retakeGradeDowngrade: false,
    gradeReplacement: "overwrite",
    supplementaryExams: true,
    summerTermAvailable: false,
  },

  attendanceRules: {
    minAttendancePercent: 75,
    medicalExemptionLimit: 10,
    absoluteAttendanceFloor: 65,
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
    ectsPercentileEnabled: false,
  },

  validationRisks: {
    validationYearTrigger: 2022,
    facultyScope: ["engineering"],
  },

  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: false,
    internalsWarning: false,
  },
};
