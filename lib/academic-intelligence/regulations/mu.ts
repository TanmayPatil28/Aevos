import { RegulationSystem } from "../schemas/regulation";

// Mumbai University Regulation System
export const MU_2019_REGULATION: RegulationSystem = {
  id: "mu",
  universityId: "mu",
  regulationName: "MU Rev-2019 C-Scheme",
  regulationYear: 2019,
  status: "active",
  nepAligned: false,

  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 180 },
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "exclude",
  },

  gradingScale: {
    gradingModel: "absolute",
    grades: [
      { grade: "O", points: 10, description: "Outstanding", isPass: true, absoluteMinMarks: 80 },
      { grade: "A", points: 9,  description: "Excellent", isPass: true, absoluteMinMarks: 75 },
      { grade: "B", points: 8,  description: "Very Good", isPass: true, absoluteMinMarks: 70 },
      { grade: "C", points: 7,  description: "Good", isPass: true, absoluteMinMarks: 60 },
      { grade: "D", points: 6,  description: "Fair", isPass: true, absoluteMinMarks: 50 },
      { grade: "E", points: 5,  description: "Average", isPass: true, absoluteMinMarks: 45 },
      { grade: "P", points: 4,  description: "Pass", isPass: true, absoluteMinMarks: 40 },
      { grade: "F", points: 0,  description: "Fail", isPass: false, absoluteMinMarks: 0 },
    ],
  },

  percentageFormula: {
    type: "piecewise",
    sgpaFormulaDescription: "IF(SGPA < 7.0, 7.1 * SGPA + 12, 7.4 * SGPA + 12)",
    cgpaFormulaDescription: "IF(CGPA < 7.0, 7.1 * CGPA + 12, 7.4 * CGPA + 12)",
    sgpaToPercentage: (sgpa) => {
      const p = sgpa < 7 ? 7.1 * sgpa + 12 : 7.4 * sgpa + 12;
      return parseFloat(p.toFixed(2));
    },
    cgpaToPercentage: (cgpa) => {
      const p = cgpa < 7 ? 7.1 * cgpa + 12 : 7.4 * cgpa + 12;
      return parseFloat(p.toFixed(2));
    },
  },

  internalAssessment: {
    components: ["Internal Assessment (IA)", "Semester-End Examination (SEE)"],
    splitWeightage: "40/60",
    ciePassingMin: 40,
    cieVoidGate: false,
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
    maxBacklogCount: 4,
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
    medicalExemptionLimit: 25,
    absoluteAttendanceFloor: 50,
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
    facultyScope: ["engineering"],
  },

  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: false,
    internalsWarning: false,
  },
};
