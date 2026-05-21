/**
 * GradeFlow Academic Rule Abstraction Layer — Preset Registry
 *
 * SINGLE SOURCE OF TRUTH: Academic_University_Presets_Research.md
 * 
 * Every preset is a structured academic intelligence object containing the
 * complete rule set for a specific institution. Feature modules consume
 * these objects through the presetEngine — they NEVER contain institution-
 * specific logic themselves.
 *
 * Architecture: presetRegistry → presetEngine → feature modules
 */

import { UniversityPreset } from "./types/universityPreset";
import { validateAllPresets } from "./presetValidator";

// ═══════════════════════════════════════════════════════════════════════════════
// MAHARASHTRA ACADEMIC SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════

const PRESET_SPPU: UniversityPreset = {
  id: "sppu",
  name: "Savitribai Phule Pune University",
  shortName: "SPPU",
  state: "Maharashtra",
  type: "State Public University",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "sppu",
  version: "1.0.0",
  regulationYear: 2019,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "D",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 170,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minOverall: 40,
    minSgpa: 4.0,
  },
  backlogPolicy: {
    description: "Minimum 50% credits must be cleared for year progression",
    retakePenalty: "Grade downgraded by one level in re-examination",
    replacementPolicy: "New passing grade overwrites F grade point value but retains transcript marker",
  },
  assessmentScheme: {
    components: ["In-Semester Evaluation (ISE)", "End-Semester Evaluation (ESE)"],
    split: "30/70 internal/external for theory courses",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "2019 Pattern",
    affiliatedAuthority: "UGC/AICTE",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_JSPM: UniversityPreset = {
  id: "jspm",
  name: "JSPM Rajarshi Shahu College of Engineering",
  shortName: "JSPM RSCOE",
  state: "Maharashtra",
  type: "Autonomous Affiliated",
  gradingSystem: "10-point Autonomous",
  evaluationModel: "absolute",
  canonicalInstitutionId: "jspm",
  version: "1.0.0",
  regulationYear: 2023,
  status: "active",
  country: "IN",
  nepAligned: true,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 55, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minAttendance: 75,
  },
  backlogPolicy: {
    description: "SPPU ATKT norms apply. New grade permanently replaces old in CGPA on retake.",
    replacementPolicy: "New grade permanently replaces old in CGPA calculation upon retake",
  },
  assessmentScheme: {
    components: ["In-Semester Evaluation (ISE)", "Mid-Semester Evaluation (MSE)", "End-Semester Evaluation (ESE)"],
    split: "Continuous tripartite split",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "2023",
    erpSystem: "Digicampus",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    defaultCreditsPerSem: [21, 23, 20, 20, 20, 20, 20, 20],
  },
};

const PRESET_MU: UniversityPreset = {
  id: "mu",
  name: "Mumbai University",
  shortName: "MU",
  state: "Maharashtra",
  type: "State Public University",
  gradingSystem: "10-point CBCGS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "mu",
  version: "1.0.0",
  regulationYear: 2019,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O", minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A", minMarks: 75, points: 9,  description: "Excellent" },
    { grade: "B", minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "C", minMarks: 60, points: 7,  description: "Good" },
    { grade: "D", minMarks: 50, points: 6,  description: "Fair" },
    { grade: "E", minMarks: 45, points: 5,  description: "Average" },
    { grade: "P", minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F", minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 160,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "IF(SGPA < 7, 7.1 * SGPA + 12, 7.4 * SGPA + 12)",
  cgpaToPercentage: "IF(CGPA < 7, 7.1 * CGPA + 12, 7.4 * CGPA + 12)",
  passRules: {
    minInternal: 40,
    minExternal: 40,
    minOverall: 40,
    independentPassing: true,
  },
  backlogPolicy: {
    description: "Failure in >4 subjects results in year detention (year drop)",
    maxBacklogs: 4,
    replacementPolicy: "Internal marks carried forward if only external exam is failed",
  },
  assessmentScheme: {
    components: ["Internal Assessment (IA)", "Semester-End Examination (SEE)"],
    split: "40/60 for theory components",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "REV-2019 C-Scheme",
    erpSystem: "MU Digital Portal",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_COEP: UniversityPreset = {
  id: "coep",
  name: "COEP Technological University",
  shortName: "COEP",
  state: "Maharashtra",
  type: "Unitary Public University",
  gradingSystem: "10-point Relative",
  evaluationModel: "relative",
  canonicalInstitutionId: "coep",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  points: 10, description: "Outstanding" },
    { grade: "A+", points: 9,  description: "Excellent" },
    { grade: "A",  points: 8,  description: "Very Good" },
    { grade: "B+", points: 7,  description: "Good" },
    { grade: "B",  points: 6,  description: "Above Average" },
    { grade: "C",  points: 5,  description: "Average" },
    { grade: "P",  points: 4,  description: "Pass" },
    { grade: "F",  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 166,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.5) * 10",
  cgpaToPercentage: "(CGPA - 0.5) * 10",
  passRules: {
    minCgpa: 5.0,
  },
  backlogPolicy: {
    description: "Supplementary semesters in summer. CGPA improvement scheme if final CGPA < 5.0.",
    supplementaryExams: true,
    replacementPolicy: "Best-of policy applied during improvement attempts",
  },
  assessmentScheme: {
    components: ["Continuous Evaluation (T1/T2)", "Mid-Semester Examination", "End-Semester Examination"],
    split: "Continuous evaluation format",
  },
  relativeGrading: {
    model: "statistical_relative_hybrid",
    curveDescription: "Dynamic thresholds from class mean (μ), median (M), and standard deviation (σ). Absolute Lower Bound (LB) protection: if Median ≤ 30 → LB=30; if 30 < Median/2 ≤ 40 → LB=Median/2; if Median/2 > 40 → LB=40.",
    usesStandardDeviation: true,
    usesMean: true,
    usesMedian: true,
    hasAbsoluteFloor: true,
    absoluteFloorValue: 30,
  },
  metadata: {
    patternYear: "2022 Curriculum Revision",
    erpSystem: "MIS",
  },
  specialFeatures: {
    hasRelativeCurve: true,
    hasLetterGrades: true,
  },
};

const PRESET_PCCOE: UniversityPreset = {
  id: "pccoe",
  name: "Pimpri Chinchwad College of Engineering",
  shortName: "PCCOE",
  state: "Maharashtra",
  type: "Autonomous Affiliated",
  gradingSystem: "10-point Autonomous",
  evaluationModel: "absolute",
  canonicalInstitutionId: "pccoe",
  version: "1.0.0",
  regulationYear: 2023,
  status: "active",
  country: "IN",
  nepAligned: true,
  gradeScale: [
    { grade: "O",  minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minCgpa: 4.0,
  },
  backlogPolicy: {
    description: "Standard SPPU ATKT norms apply for year-to-year progression",
  },
  assessmentScheme: {
    components: ["Continuous Internal Evaluation (CIE)", "End Semester Examination (ESE)"],
    split: "Defined per course type (Theory vs Practical)",
    theoryPracticalSeparation: true,
  },
  degreeClassification: [
    { label: "First Class with Distinction", minCGPA: 7.75 },
    { label: "First Class",                  minCGPA: 6.75 },
    { label: "Higher Second Class",          minCGPA: 6.25 },
    { label: "Second Class",                 minCGPA: 5.50 },
    { label: "Pass Class",                   minCGPA: 4.0  },
  ],
  metadata: {
    patternYear: "V2.3 / NEP-2020 Compliant",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
  },
};

const PRESET_VITPUNE: UniversityPreset = {
  id: "vitpune",
  name: "Vishwakarma Institute of Technology",
  shortName: "VIT Pune",
  state: "Maharashtra",
  type: "Autonomous Affiliated",
  gradingSystem: "Double-Letter 10-point",
  evaluationModel: "absolute",
  canonicalInstitutionId: "vitpune",
  version: "1.0.0",
  regulationYear: 2024,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "AA", minMarks: 80, points: 10, description: "Excellent" },
    { grade: "AB", minMarks: 70, points: 9,  description: "Very Good" },
    { grade: "BB", minMarks: 60, points: 8,  description: "Good" },
    { grade: "BC", minMarks: 55, points: 7,  description: "Fair" },
    { grade: "CC", minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "CD", minMarks: 45, points: 5,  description: "Average" },
    { grade: "DD", minMarks: 40, points: 4,  description: "Marginal Pass" },
    { grade: "FF", minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minAttendance: 75,
    minOverall: 40,
  },
  backlogPolicy: {
    description: "Summer Term for FY/Final year students with FF/XX/II grades. Re-registration allowed with fee penalty.",
    supplementaryExams: true,
  },
  assessmentScheme: {
    components: ["In-Semester Assessment", "Mid-Semester Assessment", "End-Semester Assessment"],
    split: "Varies dynamically based on course instructor parameters",
  },
  metadata: {
    patternYear: "A-24",
    erpSystem: "VIERP",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    hasDoubleLetter: true,
  },
};

const PRESET_MITWPU: UniversityPreset = {
  id: "mitwpu",
  name: "MIT World Peace University",
  shortName: "MIT-WPU",
  state: "Maharashtra",
  type: "Private University",
  gradingSystem: "10-point CBCS Custom",
  evaluationModel: "absolute",
  canonicalInstitutionId: "mitwpu",
  version: "1.0.0",
  regulationYear: 2025,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minInternal: 40,
    minExternal: 40,
    minAttendance: 75,
    independentPassing: true,
    minCgpa: 5.0,
  },
  backlogPolicy: {
    description: "CGPA >= 5 OR 50% credits cleared required for progression. Year down if both conditions unmet.",
  },
  assessmentScheme: {
    components: ["Formative Assessment (FAT)", "Mid-Term Examination", "Summative Term End Examination"],
    split: "15% FAT / 30% Mid-Term / 55% Summative",
  },
  metadata: {
    patternYear: "2025-26 Manual",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_DYPIU: UniversityPreset = {
  id: "dypiu",
  name: "D Y Patil International University",
  shortName: "DYPIU",
  state: "Maharashtra",
  type: "Private University",
  gradingSystem: "10-point Scheme",
  evaluationModel: "absolute",
  canonicalInstitutionId: "dypiu",
  version: "1.0.0",
  regulationYear: 2020,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  passRules: {
    minCgpa: 4.5,
    minAttendance: 75,
  },
  backlogPolicy: {
    description: "Semester drop if CGPA falls below 4.5. Must pass concurrent evaluation to sit for End Term.",
  },
  assessmentScheme: {
    components: ["Concurrent Evaluation", "Practical Assessment", "End Term Theory Examination"],
    split: "Continuous formative evaluation",
  },
  metadata: {},
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_BVDU: UniversityPreset = {
  id: "bvdu",
  name: "Bharati Vidyapeeth Deemed University",
  shortName: "BVDU",
  state: "Maharashtra",
  type: "Deemed to be University",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "bvdu",
  version: "1.0.0",
  regulationYear: 2021,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 40, points: 5,  description: "Pass" },
    { grade: "D",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minInternal: 25,
    independentPassing: true,
  },
  backlogPolicy: {
    description: "Can clear failed IA or UE independently without retaking the passed counterpart.",
  },
  assessmentScheme: {
    components: ["Internal Assessment (IA)", "University Examination (UE)"],
    split: "Program dependent (often 40/60)",
  },
  metadata: {
    patternYear: "CBCS 2021",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_SCOE: UniversityPreset = {
  id: "scoe",
  name: "Sinhgad College of Engineering",
  shortName: "Sinhgad SCOE",
  state: "Maharashtra",
  type: "Autonomous Affiliated",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "scoe",
  version: "1.0.0",
  regulationYear: 2019,
  status: "active",
  country: "IN",
  nepAligned: false,
  // Sinhgad inherits SPPU configuration per research
  gradeScale: [
    { grade: "O",  minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "D",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minOverall: 40,
    minSgpa: 4.0,
  },
  backlogPolicy: {
    description: "SPPU ATKT rules apply. Retake grade downgraded by one level.",
    retakePenalty: "Grade downgraded by one level in re-examination",
  },
  assessmentScheme: {
    components: ["In-Semester Evaluation (ISE)", "End-Semester Evaluation (ESE)"],
    split: "30/70 internal/external for theory courses",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "SPPU 2019",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NATIONAL / INSTITUTIONAL SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════

const PRESET_VTU: UniversityPreset = {
  id: "vtu",
  name: "Visvesvaraya Technological University",
  shortName: "VTU",
  state: "Karnataka",
  type: "State Public University",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "vtu",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 55, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 50, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  defaultCreditsPerSem: 20,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  backlogPolicy: {
    description: "ATKT limits strictly enforced based on active scheme (2015/2018/2022).",
  },
  assessmentScheme: {
    components: ["Continuous Internal Evaluation (CIE)", "Semester End Examination (SEE)"],
    split: "50/50",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "2022 Scheme",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    hasZeroCreditBlockers: true,
  },
};

const PRESET_ANNA: UniversityPreset = {
  id: "anna",
  name: "Anna University",
  shortName: "Anna Uni",
  state: "Tamil Nadu",
  type: "State Public University",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "anna",
  version: "1.0.0",
  regulationYear: 2021,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 55, points: 6,  description: "Average" },
    { grade: "C",  minMarks: 50, points: 5,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Re-Appearance", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  passRules: {
    minOverall: 50,
    minGradePoint: 5,
  },
  backlogPolicy: {
    description: "Regulated strictly per semester progression (typically 3-5 active arrears maximum).",
    maxBacklogs: 5,
  },
  assessmentScheme: {
    components: ["Continuous Assessment (CA)", "End Semester Examination (ESE)"],
    split: "50/50",
  },
  metadata: {
    patternYear: "Regulation 2021",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_JNTUH: UniversityPreset = {
  id: "jntuh",
  name: "Jawaharlal Nehru Technological University Hyderabad",
  shortName: "JNTUH",
  state: "Telangana",
  type: "State Public University",
  gradingSystem: "10-point Scale",
  evaluationModel: "absolute",
  canonicalInstitutionId: "jntuh",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Average" },
    { grade: "C",  minMarks: 40, points: 5,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.5) * 10",
  cgpaToPercentage: "(CGPA - 0.5) * 10",
  passRules: {
    minOverall: 40,
    minGradePoint: 5,
    minSgpa: 5.0,
  },
  backlogPolicy: {
    description: "Regulated credit progression limits per R-scheme.",
  },
  assessmentScheme: {
    components: ["Internal Evaluation", "External Examination"],
    split: "30/70",
  },
  metadata: {
    patternYear: "R22",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_SRM: UniversityPreset = {
  id: "srm",
  name: "SRM Institute of Science and Technology",
  shortName: "SRM IST",
  state: "Tamil Nadu",
  type: "Deemed to be University",
  gradingSystem: "10-point Scale",
  evaluationModel: "absolute",
  canonicalInstitutionId: "srm",
  version: "1.0.0",
  regulationYear: 2024,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 91, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 81, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 71, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 61, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 56, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 50, points: 5,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 9.5",
  cgpaToPercentage: "CGPA * 9.5",
  passRules: {
    minOverall: 50,
  },
  backlogPolicy: {
    description: "Arrears examinations available in subsequent semesters.",
    supplementaryExams: true,
  },
  assessmentScheme: {
    components: ["Continuous Internal Evaluation (CIE)", "Semester End Examination (SEE)"],
    split: "50/50",
  },
  metadata: {
    patternYear: "2024 Regulations",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

const PRESET_VITVELLORE: UniversityPreset = {
  id: "vitvellore",
  name: "Vellore Institute of Technology",
  shortName: "VIT Vellore",
  state: "Tamil Nadu",
  type: "Deemed to be University",
  gradingSystem: "10-point Relative",
  evaluationModel: "relative",
  canonicalInstitutionId: "vitvellore",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "S", points: 10, description: "Outstanding" },
    { grade: "A", points: 9,  description: "Excellent" },
    { grade: "B", points: 8,  description: "Very Good" },
    { grade: "C", points: 7,  description: "Good" },
    { grade: "D", points: 6,  description: "Above Average" },
    { grade: "E", points: 5,  description: "Pass" },
    { grade: "F", points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  relativeGrading: {
    model: "conditional_relative",
    curveDescription: "Relative grading triggered when class strength > 10. Grade S requires > μ+1.5σ AND ≥ 90%. Lab failure (< 50%) fails entire embedded course ('N' grade).",
    usesStandardDeviation: true,
    usesMean: true,
    hasAbsoluteFloor: true,
    absoluteFloorValue: 50,
    minClassStrength: 10,
  },
  passRules: {
    minAttendance: 75,
  },
  backlogPolicy: {
    description: "Lab failure fails entire embedded course ('N' grade). Re-registration available.",
  },
  assessmentScheme: {
    components: ["Continuous Assessment (CAT)", "Laboratory Evaluations", "Term End Examinations (TEE)"],
    split: "Varies by course type (PBL vs RBL)",
  },
  metadata: {},
  specialFeatures: {
    hasRelativeCurve: true,
    hasLetterGrades: true,
  },
};

const PRESET_MITMANIPAL: UniversityPreset = {
  id: "mitmanipal",
  name: "Manipal Institute of Technology",
  shortName: "MIT Manipal",
  state: "Karnataka",
  type: "Deemed to be University",
  gradingSystem: "10-point Relative",
  evaluationModel: "relative",
  canonicalInstitutionId: "mitmanipal",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "A+", points: 10, description: "Outstanding" },
    { grade: "A",  points: 9,  description: "Excellent" },
    { grade: "B",  points: 8,  description: "Very Good" },
    { grade: "C",  points: 7,  description: "Good" },
    { grade: "D",  points: 6,  description: "Above Average" },
    { grade: "E",  points: 5,  description: "Pass" },
    { grade: "F",  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  relativeGrading: {
    model: "relative",
    curveDescription: "Z-score dynamic model with binomial distribution fitting. A+ ≈ μ+2σ or μ+1.5σ, grades descend by σ intervals.",
    usesStandardDeviation: true,
    usesMean: true,
  },
  passRules: {
    minCgpa: 5.0,
  },
  backlogPolicy: {
    description: "Retake attempts capped permanently at 'C' grade upon re-registration after an 'F'.",
    retakePenalty: "Maximum attainable grade permanently capped at 'C'",
  },
  assessmentScheme: {
    components: ["In-Semester Assessment", "End-Semester Examination"],
    split: "Continuous format",
  },
  metadata: {
    patternYear: "2022 Scheme",
  },
  specialFeatures: {
    hasRelativeCurve: true,
    hasLetterGrades: true,
  },
};

const PRESET_BITS: UniversityPreset = {
  id: "bitspilani",
  name: "Birla Institute of Technology and Science",
  shortName: "BITS Pilani",
  state: "Rajasthan",
  type: "Deemed to be University",
  gradingSystem: "10-point Relative (Unit-based)",
  evaluationModel: "relative",
  canonicalInstitutionId: "bitspilani",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "A",  points: 10, description: "Excellent" },
    { grade: "A-", points: 9,  description: "Very Good" },
    { grade: "B",  points: 8,  description: "Good" },
    { grade: "B-", points: 7,  description: "Above Average" },
    { grade: "C",  points: 6,  description: "Average" },
    { grade: "C-", points: 5,  description: "Below Average" },
    { grade: "D",  points: 4,  description: "Pass" },
    { grade: "E",  points: 2,  description: "Marginal Pass", isPass: true },
    { grade: "NC", points: 0,  description: "Not Cleared", isPass: false },
  ],
  creditType: "units",
  sgpaFormula: "SUM(CourseUnits * GradePoints) / SUM(CourseUnits)",
  cgpaFormula: "SUM(TotalUnitsPoints) / SUM(TotalUnitsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  relativeGrading: {
    model: "histogram_clustering",
    curveDescription: "Instructors plot marks in descending order to identify natural performance clusters (gaps in score distribution). Non-linear grade point scale: A(10) A-(9) B(8) B-(7) C(6) C-(5) D(4) E(2). Grade point 3 is skipped entirely.",
    usesStandardDeviation: false,
    usesMean: false,
  },
  passRules: {
    minCgpa: 4.5,
  },
  backlogPolicy: {
    description: "Not Cleared (NC) mandates course repetition without grade card erasure.",
  },
  assessmentScheme: {
    components: ["Test-1", "Test-2", "Quizzes/Assignments", "Comprehensive Examination"],
    split: "Continuous and highly customizable by the Instructor-in-Charge",
  },
  metadata: {},
  specialFeatures: {
    hasLetterGrades: true,
    hasMinusGrades: true,
  },
};

const PRESET_DTU: UniversityPreset = {
  id: "dtu",
  name: "Delhi Technological University",
  shortName: "DTU",
  state: "Delhi",
  type: "State Public University",
  gradingSystem: "10-point Relative",
  evaluationModel: "relative",
  canonicalInstitutionId: "dtu",
  version: "1.0.0",
  regulationYear: 2024,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  points: 10, description: "Outstanding" },
    { grade: "A+", points: 9,  description: "Excellent" },
    { grade: "A",  points: 8,  description: "Very Good" },
    { grade: "B+", points: 7,  description: "Good" },
    { grade: "B",  points: 6,  description: "Above Average" },
    { grade: "C",  points: 5,  description: "Average" },
    { grade: "P",  points: 4,  description: "Pass" },
    { grade: "F",  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  relativeGrading: {
    model: "relative_with_absolute_caps",
    curveDescription: "Whichever-is-lower algorithm: cutoff = min(statistical_relative, absolute_floor). O: μ+1.5σ OR 91%. A+: μ+1.0σ OR 82%. Pass: Mean-1.5σ OR 37% (whichever is lower).",
    usesStandardDeviation: true,
    usesMean: true,
    hasAbsoluteFloor: true,
    absoluteFloorValue: 37,
  },
  passRules: {
    minGradePoint: 4,
  },
  backlogPolicy: {
    description: "Subject to semester offering and credit limits.",
  },
  assessmentScheme: {
    components: ["Mid-Term Examination (MTE)", "Class Work Assessment (CWS)", "End-Term Examination (ETE)"],
    split: "25% MTE / 25% CWS / 50% ETE",
  },
  metadata: {
    patternYear: "2024 Revision",
  },
  specialFeatures: {
    hasRelativeCurve: true,
    hasLetterGrades: true,
  },
};

const PRESET_NSUT: UniversityPreset = {
  id: "nsut",
  name: "Netaji Subhas University of Technology",
  shortName: "NSUT",
  state: "Delhi",
  type: "State Public University",
  gradingSystem: "10-point Relative",
  evaluationModel: "relative",
  canonicalInstitutionId: "nsut",
  version: "1.0.0",
  regulationYear: 2019,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  points: 10, description: "Outstanding" },
    { grade: "A+", points: 9,  description: "Excellent" },
    { grade: "A",  points: 8,  description: "Very Good" },
    { grade: "B+", points: 7,  description: "Good" },
    { grade: "B",  points: 6,  description: "Above Average" },
    { grade: "C",  points: 5,  description: "Average" },
    { grade: "P",  points: 4,  description: "Pass" },
    { grade: "F",  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  relativeGrading: {
    model: "banded_relative",
    curveDescription: "OL/DL clamped dynamic grading. OL = min(μ+1.5σ, 95) floored at 84.99. DL = max(μ-1.5σ, 29.99) capped at 40. d = (OL-DL)/6. Grades layered in intervals of d.",
    usesStandardDeviation: true,
    usesMean: true,
    hasAbsoluteFloor: true,
    absoluteFloorValue: 30,
    bandCount: 6,
  },
  backlogPolicy: {
    description: "Standard relative rules re-applied to repeaters in subsequent cohorts.",
  },
  assessmentScheme: {
    components: ["Continuous Evaluation", "Mid-Semester Examination", "End-Semester Examination"],
    split: "Continuous evaluation",
  },
  metadata: {
    patternYear: "2019-20 onward",
  },
  specialFeatures: {
    hasRelativeCurve: true,
    hasLetterGrades: true,
  },
};

const PRESET_NIT: UniversityPreset = {
  id: "nit",
  name: "National Institutes of Technology",
  shortName: "NIT Council",
  state: "National",
  type: "Institute of National Importance",
  gradingSystem: "10-point CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "nit",
  version: "1.0.0",
  regulationYear: 2022,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "S", minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A", minMarks: 80, points: 9,  description: "Excellent" },
    { grade: "B", minMarks: 70, points: 8,  description: "Very Good" },
    { grade: "C", minMarks: 60, points: 7,  description: "Good" },
    { grade: "D", minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "E", minMarks: 40, points: 5,  description: "Pass" },
    { grade: "F", minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 10",
  cgpaToPercentage: "CGPA * 10",
  passRules: {
    minOverall: 40,
    minCgpa: 5.0,
  },
  degreeClassification: [
    { label: "First Division", minCGPA: 6.5 },
  ],
  backlogPolicy: {
    description: "REX maximum grade strictly capped at E (base pass limit).",
    retakePenalty: "Maximum grade capped at E on re-examination",
  },
  assessmentScheme: {
    components: ["Continuous Assessment", "Mid-term Examination", "End-term Examination"],
    split: "Typically 20/30/50",
  },
  metadata: {},
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM / LEGACY / GLOBAL SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════

const PRESET_US: UniversityPreset = {
  id: "us",
  name: "US / Global 4-Point System",
  shortName: "Global 4.0",
  state: "International",
  type: "Custom",
  gradingSystem: "4-point scale",
  evaluationModel: "absolute",
  canonicalInstitutionId: "us",
  version: "1.0.0",
  regulationYear: 2020,
  status: "active",
  country: "US",
  nepAligned: false,
  gradeScale: [
    { grade: "A", minMarks: 90, points: 4.0, description: "Excellent" },
    { grade: "B", minMarks: 80, points: 3.0, description: "Good" },
    { grade: "C", minMarks: 70, points: 2.0, description: "Satisfactory" },
    { grade: "D", minMarks: 60, points: 1.0, description: "Poor" },
    { grade: "F", minMarks: 0,  points: 0.0, description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 120,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA / 4.0) * 100",
  cgpaToPercentage: "(CGPA / 4.0) * 100",
  passRules: {
    minCgpa: 2.0,
  },
  backlogPolicy: {
    description: "Grade replacement varies by institution.",
  },
  assessmentScheme: {
    components: ["Continuous Evaluation", "Final Examination"],
    split: "Varies by instructor syllabus",
  },
  metadata: {},
  specialFeatures: {
    hasLetterGrades: true,
  },
};

const PRESET_CUSTOM10: UniversityPreset = {
  id: "custom_10",
  name: "Custom (10.0 Scale)",
  shortName: "Custom 10",
  state: "Custom",
  type: "Custom",
  gradingSystem: "10-point scale",
  evaluationModel: "absolute",
  canonicalInstitutionId: "custom_10",
  version: "1.0.0",
  regulationYear: 2020,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "O",  minMarks: 80, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 70, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 60, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 55, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 50, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 45, points: 5,  description: "Average" },
    { grade: "D",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA * 9.5",
  cgpaToPercentage: "CGPA * 9.5",
  passRules: {
    minOverall: 40,
  },
  assessmentScheme: {
    components: ["Continuous Assessments", "Final Examination"],
    split: "50/50 baseline assumption",
  },
  metadata: {},
  specialFeatures: {
    hasLetterGrades: true,
  },
};

const PRESET_PERCENT: UniversityPreset = {
  id: "custom_percent",
  name: "Custom (Percentage)",
  shortName: "Custom %",
  state: "Custom",
  type: "Custom",
  gradingSystem: "Percentage scale",
  evaluationModel: "absolute",
  canonicalInstitutionId: "custom_percent",
  version: "1.0.0",
  regulationYear: 2020,
  status: "active",
  country: "IN",
  nepAligned: false,
  gradeScale: [
    { grade: "Pass", minMarks: 40, points: 100 },
    { grade: "Fail", minMarks: 0,  points: 0, isPass: false },
  ],
  creditType: "credits",
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "SGPA",
  cgpaToPercentage: "CGPA",
  passRules: {
    minOverall: 40,
  },
  assessmentScheme: {
    components: ["Monolithic Annual/Semester Examination"],
    split: "100% monolithic evaluation",
  },
  metadata: {},
  specialFeatures: {},
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const PRESETS: UniversityPreset[] = [
  // Maharashtra (10)
  PRESET_JSPM,
  PRESET_SPPU,
  PRESET_MU,
  PRESET_COEP,
  PRESET_PCCOE,
  PRESET_VITPUNE,
  PRESET_MITWPU,
  PRESET_DYPIU,
  PRESET_BVDU,
  PRESET_SCOE,
  // National / Institutional (10)
  PRESET_VTU,
  PRESET_ANNA,
  PRESET_JNTUH,
  PRESET_SRM,
  PRESET_VITVELLORE,
  PRESET_MITMANIPAL,
  PRESET_BITS,
  PRESET_DTU,
  PRESET_NSUT,
  PRESET_NIT,
  // Custom / Legacy (3)
  PRESET_US,
  PRESET_CUSTOM10,
  PRESET_PERCENT,
];

// ─── Load-Time Validation & Production Isolation ─────────────────────────────

const PRESET_MAP = new Map<string, UniversityPreset>();
const VERIFIED_PRESETS: UniversityPreset[] = [];

// Perform validation at load time
const validationResults = validateAllPresets(PRESETS);

if (!validationResults.success) {
  const isDev = process.env.NODE_ENV !== "production";
  const errorDetails = Object.entries(validationResults.errors)
    .map(([presetId, errors]) => `Preset '${presetId}':\n  - ${errors.join("\n  - ")}`)
    .join("\n\n");

  const message = `GradeFlow Academic Preset Registry Validation Failed!\n\n${errorDetails}`;

  if (isDev) {
    throw new Error(message);
  } else {
    console.error(`[GradeFlow Presets Telemetry] Validation failed for some presets. Isolating corrupted presets.\n${message}`);
  }
}

// Populate VERIFIED_PRESETS and PRESET_MAP
for (const preset of PRESETS) {
  const errorsForPreset = validationResults.errors[preset.id];
  if (errorsForPreset && errorsForPreset.length > 0) {
    // Isolate corrupted preset in production
    continue;
  }
  VERIFIED_PRESETS.push(preset);
  PRESET_MAP.set(preset.id, preset);
}

// Fallback protection: if all presets are corrupted in production, ensure custom scale is loaded
if (VERIFIED_PRESETS.length === 0) {
  VERIFIED_PRESETS.push(PRESET_CUSTOM10);
  PRESET_MAP.set(PRESET_CUSTOM10.id, PRESET_CUSTOM10);
}

// ─── Lookup Functions ──────────────────────────────────────────────────────────

export function getPresetById(id: string): UniversityPreset | undefined {
  return PRESET_MAP.get(id);
}

export function getAllPresets(): UniversityPreset[] {
  return VERIFIED_PRESETS;
}

export function getPresetIds(): string[] {
  return VERIFIED_PRESETS.map((p) => p.id);
}

// ─── Grouping & Search Functions ───────────────────────────────────────────────

export interface PresetGroup {
  label: string;
  presets: UniversityPreset[];
}

/**
 * Groups presets by state/region for structured display in selectors.
 * Order: Maharashtra → National states → International/Custom
 */
export function getPresetsByState(): PresetGroup[] {
  const stateOrder = [
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "Rajasthan",
    "Delhi",
    "National",
    "International",
    "Custom",
  ];

  const grouped = new Map<string, UniversityPreset[]>();

  for (const preset of VERIFIED_PRESETS) {
    const state = preset.state;
    if (!grouped.has(state)) {
      grouped.set(state, []);
    }
    grouped.get(state)!.push(preset);
  }

  const result: PresetGroup[] = [];
  for (const state of stateOrder) {
    const presets = grouped.get(state);
    if (presets && presets.length > 0) {
      result.push({ label: state, presets });
    }
  }

  // Catch any remaining states not in the order list
  Array.from(grouped.entries()).forEach(([state, presets]) => {
    if (!stateOrder.includes(state)) {
      result.push({ label: state, presets });
    }
  });

  return result;
}

/**
 * Fuzzy search across preset name, shortName, state, and gradingSystem.
 * Returns matching presets scored by relevance.
 */
export function searchPresets(query: string): UniversityPreset[] {
  if (!query.trim()) return VERIFIED_PRESETS;

  const q = query.toLowerCase().trim();

  return VERIFIED_PRESETS.filter((p) => {
    const searchable = [
      p.name,
      p.shortName,
      p.state,
      p.gradingSystem,
      p.type,
      p.id,
    ].join(" ").toLowerCase();

    return searchable.includes(q);
  });
}
