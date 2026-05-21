import { RegulationSystem } from "../schemas/regulation";

// Anna University Regulation System
export const ANNA_2021_REGULATION: RegulationSystem = {
  id: "anna",
  universityId: "anna",
  regulationName: "Anna University Regulation 2021 for UG",
  regulationYear: 2021,
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
      { grade: "O",  points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 90 },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 80 },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 70 },
      { grade: "B+", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "B",  points: 6,  description: "Average", isPass: true, absoluteMinMarks: 55 },
      { grade: "C",  points: 5,  description: "Pass", isPass: true, absoluteMinMarks: 50 },
      { grade: "F",  points: 0,  description: "Re-Appearance", isPass: false, absoluteMinMarks: 0 },
    ],
  },

  percentageFormula: {
    type: "direct_scalar",
    sgpaFormulaDescription: "SGPA * 10",
    cgpaFormulaDescription: "CGPA * 10",
    sgpaToPercentage: (sgpa) => parseFloat((sgpa * 10).toFixed(2)),
    cgpaToPercentage: (cgpa) => parseFloat((cgpa * 10).toFixed(2)),
  },

  internalAssessment: {
    components: ["Continuous Assessment (CA)"],
    splitWeightage: "50/50",
  },

  externalAssessment: {
    seePassingMin: 50,
    theoryPracticalSeparation: true,
  },

  passingInvariants: {
    minOverallMarks: 50,
    minCgpaForGraduation: 5.0,
    independentPassing: true,
  },

  progressionRules: {
    atktAllowed: true,
    maxBacklogCount: 5,
    promotionOperator: "AND",
    yearDownOnFail: false,
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
    valueAddedScrubbing: true, // Value-added course failures are scrubbed from gradecard
    goldMedalFractionalBreaker: true,
    firstAppearanceRule: true, // First-attempt rule for Distinction
  },

  globalEquivalency: {
    wesGpaMapping: "linear_capped",
    ectsPercentileEnabled: false,
  },

  validationRisks: {
    validationYearTrigger: 2021,
    facultyScope: ["engineering"],
  },

  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: true,
    internalsWarning: true,
  },
};
