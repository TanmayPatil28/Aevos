import { RegulationSystem } from "../schemas/regulation";

// JNTUH R22 Scheme Regulation System
export const JNTUH_2022_REGULATION: RegulationSystem = {
  id: "jntuh",
  universityId: "jntuh",
  regulationName: "JNTUH R22 Academic Regulations",
  regulationYear: 2022,
  status: "active",
  nepAligned: false,

  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 170 },
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "exclude",
  },

  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 90 },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 80 },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 70 },
      { grade: "B+", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "B",  points: 6,  description: "Average", isPass: true, absoluteMinMarks: 50 },
      { grade: "C",  points: 5,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
      { grade: "F",  points: 0,  description: "Fail", isPass: false, absoluteMinMarks: 0 },
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
    components: ["Internal Evaluation", "External Examination"],
    splitWeightage: "30/70",
    ciePassingMin: 40, // 16 out of 40 is 40%
    cieVoidGate: true,  // Void gate cancels SEE on CIE failure
  },

  externalAssessment: {
    seePassingMin: 35, // 35% in SEE minimum
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
    internalsWarning: true,
  },
};
