import { RegulationSystem } from "../schemas/regulation";

export const RSCOE_AUTONOMOUS_REGULATION: RegulationSystem = {
  id: "jspm",
  universityId: "jspm",
  regulationName: "JSPM Rajarshi Shahu College of Engineering",
  regulationYear: 2023,
  status: "active",
  nepAligned: true,
  academicStructure: {
    semesterCount: 8,
    creditRange: { min: 160, max: 170 },
    defaultCreditsPerSem: [22, 22, 22, 22, 22, 22, 20, 20],
    hasHonorsMinors: true,
    zeroCreditHandling: "strict_blocker",
    multidisciplinaryCredits: true
  },
  gradingScale: {
    gradingModel: "hybrid",
    grades: [
      { grade: "O",  points: 10, description: "Outstanding", isPass: true },
      { grade: "A+", points: 9,  description: "Excellent", isPass: true },
      { grade: "A",  points: 8,  description: "Very Good", isPass: true },
      { grade: "B+", points: 7,  description: "Good", isPass: true },
      { grade: "B",  points: 6,  description: "Above Average", isPass: true },
      { grade: "C",  points: 5,  description: "Average", isPass: true },
      { grade: "P",  points: 4,  description: "Pass", isPass: true },
      { grade: "PP", points: 0,  description: "Passed Audit Course", isPass: true },
      { grade: "NP", points: 0,  description: "Failed Audit Course", isPass: false },
      { grade: "F",  points: 0,  description: "Fail", isPass: false }
    ]
  },
  percentageFormula: {
    type: "linear",
    sgpaFormulaDescription: "SGPA * 8.9",
    cgpaFormulaDescription: "CGPA * 8.9",
    sgpaToPercentage: (sgpa) => parseFloat((sgpa * 8.9).toFixed(2)),
    cgpaToPercentage: (cgpa) => parseFloat((cgpa * 8.9).toFixed(2))
  },
  internalAssessment: {
    components: ["Continuous Internal Evaluation (CIE)", "Mid-Semester Evaluation (MSE)", "Semester End Examination (SEE)"],
    splitWeightage: "30/20/50"
  },
  externalAssessment: {
    theoryPracticalSeparation: true
  },
  passingInvariants: {
    minOverallMarks: 40,
    minCgpaForGraduation: 4.0,
    independentPassing: true
  },
  progressionRules: {
    atktAllowed: true,
    minCreditPercentProgress: 50,
    promotionOperator: "AND",
    yearDownOnFail: true
  },
  backlogPolicy: {
    retakeGradeDowngrade: false,
    gradeReplacement: "overwrite",
    supplementaryExams: true,
    summerTermAvailable: true
  },
  attendanceRules: {
    minAttendancePercent: 75,
    medicalExemptionLimit: 15,
    absoluteAttendanceFloor: 60,
    detentionTriggered: true
  },
  specialAnomalies: {
    hasSkillTranscript: false,
    valueAddedScrubbing: false,
    goldMedalFractionalBreaker: true,
    firstAppearanceRule: true
  },
  globalEquivalency: {
    wesGpaMapping: "linear_capped",
    ectsPercentileEnabled: false
  },
  validationRisks: {
    validationYearTrigger: 2023,
    facultyScope: ["engineering"]
  },
  aiAdvisory: {
    percentageTargeting: true,
    progressionSurvivalStats: true,
    standardDeviationForecast: false,
    internalsWarning: false
  }
};
