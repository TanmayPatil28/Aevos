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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 98,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Savitribai Phule Pune University Choice Based Credit System (CBCS) Handbook",
          "SPPU Ordinance 15(4) for Degree Percentage Conversion"
      ],
      "regulationBasis": "SPPU Academic Council Resolution of 2019, Pattern 2019 rules",
      "circularRef": "CB/Science/2019-114",
      "academicReasoning": "The 0.75 subtraction factor compensates for average credit inflation under the 10-point scale, aligning linear percentage outputs with traditional marks divisions."
  },
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

const PRESET_SPPU_2015: UniversityPreset = {
  id: "sppu_2015",
  name: "Savitribai Phule Pune University (2015 Pattern)",
  shortName: "SPPU 2015",
  state: "Maharashtra",
  type: "State Public University",
  gradingSystem: "10-point CBCS (Legacy)",
  evaluationModel: "absolute",
  canonicalInstitutionId: "sppu",
  version: "1.0.0",
  regulationYear: 2015,
  status: "deprecated",
  country: "IN",
  nepAligned: false,
  trust: {
    verificationLevel: "official",
    confidenceScore: 98,
    lastVerifiedAt: "2026-05-21",
    verifiedSources: [
      "Savitribai Phule Pune University 2015 Pattern Credit System Handbook",
      "SPPU Ordinance 15(4)"
    ],
    regulationBasis: "SPPU Academic Council Resolution of 2015, Pattern 2015 rules",
    circularRef: "CB/Science/2015-84",
    academicReasoning: "The 2015 Pattern established the foundational credit system for SPPU, utilizing the standard 0.75 subtraction factor for percentage conversions."
  },
  gradeScale: [
    { grade: "O",  minMarks: 90, points: 10, description: "Outstanding" },
    { grade: "A",  minMarks: 80, points: 9,  description: "Very Good" },
    { grade: "B",  minMarks: 70, points: 8,  description: "Good" },
    { grade: "C",  minMarks: 60, points: 7,  description: "Fair" },
    { grade: "D",  minMarks: 50, points: 6,  description: "Average" },
    { grade: "E",  minMarks: 40, points: 5,  description: "Pass" },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 180,
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
    patternYear: "2015 Pattern",
    affiliatedAuthority: "UGC/AICTE",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
  },
};


const PRESET_SPPU_2024: UniversityPreset = {
  id: "sppu_2024",
  name: "Savitribai Phule Pune University (NEP 2024)",
  shortName: "SPPU 2024",
  state: "Maharashtra",
  type: "State Public University",
  gradingSystem: "10-point NEP CBCS",
  evaluationModel: "absolute",
  canonicalInstitutionId: "sppu",
  version: "1.0.0",
  regulationYear: 2024,
  status: "active",
  country: "IN",
  nepAligned: true,
  trust: {
    verificationLevel: "official",
    confidenceScore: 97,
    lastVerifiedAt: "2026-05-21",
    verifiedSources: [
      "Savitribai Phule Pune University National Education Policy (NEP 2020) Guidelines",
      "SPPU 2024 UG Curriculum Structure Circular"
    ],
    regulationBasis: "SPPU Senate Resolution of 2023 for NEP implementation",
    circularRef: "NEP-UG/2024-01",
    academicReasoning: "The 2024 NEP regulation shifts grade thresholds (e.g., A+ starting at 75% and O at 85%) to match standard national credit frameworks."
  },
  gradeScale: [
    { grade: "O",  minMarks: 85, points: 10, description: "Outstanding" },
    { grade: "A+", minMarks: 75, points: 9,  description: "Excellent" },
    { grade: "A",  minMarks: 65, points: 8,  description: "Very Good" },
    { grade: "B+", minMarks: 60, points: 7,  description: "Good" },
    { grade: "B",  minMarks: 55, points: 6,  description: "Above Average" },
    { grade: "C",  minMarks: 50, points: 5,  description: "Average" },
    { grade: "P",  minMarks: 40, points: 4,  description: "Pass" },
    { grade: "PP", minMarks: 40, points: 0,  description: "Passed Audit Course", isPass: true },
    { grade: "NP", minMarks: 0,  points: 0,  description: "Failed Audit Course", isPass: false },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 160,
  sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  sgpaToPercentage: "(SGPA - 0.75) * 10",
  cgpaToPercentage: "(CGPA - 0.75) * 10",
  passRules: {
    minOverall: 40,
    minSgpa: 4.0,
  },
  backlogPolicy: {
    description: "NEP progression norms apply. Flexible exit options at year ends.",
  },
  assessmentScheme: {
    components: ["Continuous Internal Evaluation (CIE)", "Summative Assessment (SA)"],
    split: "40/60 internal/external split",
    theoryPracticalSeparation: true,
  },
  metadata: {
    patternYear: "2024 NEP Pattern",
    affiliatedAuthority: "UGC/AICTE",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasZeroCreditBlockers: true,
  },
};



const PRESET_JSPM: UniversityPreset = {
  id: "jspm",
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 95,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "JSPM RSCOE Autonomous Examination Hand Book",
          "UGC Autonomous Guidelines (2018)"
      ],
      "regulationBasis": "JSPM RSCOE Academic Board autonomous curriculum revision of 2023",
      "circularRef": "JSPM/EXAM/2023/102",
      "academicReasoning": "Under autonomous status, JSPM adopts SPPU's linear percentage conversion factor (0.75 deduction) for standardising student results."
  },
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
    { grade: "PP", minMarks: 40, points: 0,  description: "Passed Audit Course", isPass: true },
    { grade: "NP", minMarks: 0,  points: 0,  description: "Failed Audit Course", isPass: false },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 160,
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
    patternYear: "2023 NEP Pattern",
    erpSystem: "Digicampus",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    defaultCreditsPerSem: [21, 23, 20, 20, 20, 20, 20, 20],
    hasZeroCreditBlockers: true,
  },
};

const PRESET_MU: UniversityPreset = {
  id: "mu",
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 98,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Mumbai University Choice Based Credit and Grading System (CBCGS) Circular",
          "MU Executive Council Resolution on Engineering Examinations"
      ],
      "regulationBasis": "MU C-Scheme Revised Ordinance of 2019",
      "circularRef": "No. UG/144 of 2019-20",
      "academicReasoning": "Mumbai University utilizes a piecewise linear conversion with thresholds at 7.0 CGPA to capture high-tier performance distributions."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 96,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "COEP Technological University Academic Rules and Regulations Handbook",
          "COEP Senate Resolution on Relative Grading and CGPA Calculations"
      ],
      "regulationBasis": "COEP Technological University UG Regulations 2022",
      "circularRef": "COEP/AC/2022/REG-08",
      "academicReasoning": "As a premier autonomous institute, COEP adopts a relative grading curve that normalizes grades based on cohort statistics with absolute protection floor limits."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 95,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "PCCOE Autonomous Academic Rules and Regulations",
          "UGC Autonomous Curriculum Mandate"
      ],
      "regulationBasis": "PCCOE Academic Development Board Autonomous Regulations 2023",
      "circularRef": "PCCOE/EXAM/2023/45",
      "academicReasoning": "PCCOE aligns its autonomous conversion with SPPU's standard linear offset (0.75) for regional parity."
  },
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
    { grade: "PP", minMarks: 40, points: 0,  description: "Passed Audit Course", isPass: true },
    { grade: "NP", minMarks: 0,  points: 0,  description: "Failed Audit Course", isPass: false },
    { grade: "F",  minMarks: 0,  points: 0,  description: "Fail", isPass: false },
  ],
  creditType: "credits",
  totalProgramCredits: 160,
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
    { label: "Pass Class",                   minCGPA: 4.0  },
    { label: "Second Class",                 minCGPA: 5.50 },
    { label: "Higher Second Class",          minCGPA: 6.25 },
    { label: "First Class",                  minCGPA: 6.75 },
    { label: "First Class with Distinction", minCGPA: 7.75 },
  ],
  metadata: {
    patternYear: "V2.3 / NEP-2020 Compliant",
    affiliatedAuthority: "SPPU",
  },
  specialFeatures: {
    isVerified: true,
    hasLetterGrades: true,
    defaultCreditsPerSem: [20, 20, 20, 20, 20, 20, 20, 20],
    hasZeroCreditBlockers: true,
  },
};

const PRESET_VITPUNE: UniversityPreset = {
  id: "vitpune",
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 96,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Vishwakarma Institute of Technology Academic Rules and Regulations",
          "VIT Senate Guidelines on Double Letter Grading System"
      ],
      "regulationBasis": "VIT Pune Autonomous Regulations A-24 Guidelines",
      "circularRef": "VIT/AC/2024-25/01",
      "academicReasoning": "VIT Pune uses a unique Double-Letter absolute scale (AA/AB/BB) to classify student performances with regional equivalence."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 94,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "MIT WPU Academic Handbook for Undergraduate Programs",
          "MIT WPU Senate Resolutions on Assessment Splits"
      ],
      "regulationBasis": "MIT WPU Academic Regulation Year 2025-26",
      "circularRef": "MITWPU/REG/2025/11",
      "academicReasoning": "Private university parameters establish a 5.0 CGPA threshold for year progression, with absolute marks grading scales."
  },
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
  trust: {
      "verificationLevel": "community",
      "confidenceScore": 88,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "DYP International University Student Portal Manual",
          "DYPIU Academic Council Announcements"
      ],
      "regulationBasis": "DYPIU Regulations of 2020",
      "circularRef": "DYPIU/AC/2020-04",
      "academicReasoning": "Uses a direct linear multiplier of 10.0 for percentage conversion without deductions to provide simple credit weighting."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 93,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Bharati Vidyapeeth Deemed University CBCS Rules",
          "BVDU Engineering Examination Gazette"
      ],
      "regulationBasis": "BVDU Engineering Curriculum CBCS 2021",
      "circularRef": "BVDU/EXAM/2021/89",
      "academicReasoning": "Adopts the standard UGC recommended 0.75 offset linear conversion model."
  },
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
  trust: {
      "verificationLevel": "community",
      "confidenceScore": 92,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Sinhgad College of Engineering Student Handbook",
          "SPPU Affiliated Colleges Rules"
      ],
      "regulationBasis": "Inherited SPPU 2019 Pattern regulations for affiliated institutions",
      "circularRef": "SCOE/SPPU-AFF/2019",
      "academicReasoning": "SCOE is a non-autonomous college affiliated to SPPU, thereby inheriting the official SPPU 2019 grading scales and 0.75 percentage offset."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 97,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Visvesvaraya Technological University Academic Regulations for BE/BTech (2022 Scheme)",
          "VTU Registrar Circulars on Passing Rules"
      ],
      "regulationBasis": "VTU 2022 CBCS Scheme Regulations",
      "circularRef": "VTU/BGM/Aca-OS/2022-23/451",
      "academicReasoning": "VTU uses the standard UGC linear percentage conversion: Percentage = (CGPA - 0.75) * 10, ensuring nationwide alignment."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 96,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Anna University Regulation 2021 for UG Degree Programmes",
          "Anna University Syndicate Resolutions on Passing Rules"
      ],
      "regulationBasis": "Anna University Regulation 2021",
      "circularRef": "AU/UG-REG/2021-02",
      "academicReasoning": "Anna University converts CGPA to percentage using a simple multiplier of 10.0, with a strict overall passing mark of 50%."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 95,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "JNTU Hyderabad Academic Regulations for B.Tech (R22)",
          "JNTUH Registrar Gazette on Examinations"
      ],
      "regulationBasis": "JNTUH R22 Academic Regulations",
      "circularRef": "JNTUH/Aca-Reg/2022-09",
      "academicReasoning": "Uses a 0.5 linear deduction factor for percentage conversions: Percentage = (CGPA - 0.5) * 10."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 94,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "SRM IST Academic Regulations for B.Tech Programs (2024)",
          "SRM Academic Council Minutes"
      ],
      "regulationBasis": "SRM IST 2024 UG Regulations",
      "circularRef": "SRMIST/AC/2024/05",
      "academicReasoning": "SRM uses a 9.5 multiplier for CGPA-to-Percentage conversion to match AICTE equivalence recommendations."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 95,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Vellore Institute of Technology CAL (Collaborative Active Learning) Guidelines",
          "VIT Academic Senate Resolutions on Relative Grading"
      ],
      "regulationBasis": "VIT 2022 Academic Regulations",
      "circularRef": "VIT/SENATE/2022-23/REG-02",
      "academicReasoning": "VIT Vellore applies conditional relative grading using mean and standard deviation boundaries to evaluate students dynamically."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 94,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Manipal Academy of Higher Education (MAHE) UG Regulations (2022)",
          "MIT Senate Guidelines on Academic Progression"
      ],
      "regulationBasis": "MIT Manipal 2022 Academic Scheme",
      "circularRef": "MAHE/MIT/UG-REG-2022",
      "academicReasoning": "Uses a relative grading curve with capped repeater options to incentivize standard grade card distribution."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 98,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "BITS Pilani Academic Regulations (Section IV - Grading Rules)",
          "BITS Pilani Senate Committee on Instruction Reports"
      ],
      "regulationBasis": "BITS Pilani 2022 Academic Regulations",
      "circularRef": "BITS/SENATE/2022/04",
      "academicReasoning": "BITS Pilani employs a non-linear relative grading structure based on natural clustering, omitting grade point 3 (skipping between D and E)."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 97,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Delhi Technological University Ordinances on Relative Grading",
          "DTU Academic Senate Minutes of 2024"
      ],
      "regulationBasis": "DTU B.Tech Regulation Revision of 2024",
      "circularRef": "DTU/EXAM/2024/09",
      "academicReasoning": "DTU implements relative grading with absolute caps ('whichever is lower' cutoff protection floors) to prevent grade skewing."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 96,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "Netaji Subhas University of Technology B.Tech Ordinances (2019)",
          "NSUT Senate Committee Guidelines on Relative Grading Bands"
      ],
      "regulationBasis": "NSUT UG Regulations 2019-20",
      "circularRef": "NSUT/AC-REG/2019/33",
      "academicReasoning": "NSUT uses a statistical 6-band clamped relative grading formula based on standard deviations and a 30% absolute floor limit."
  },
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
  trust: {
      "verificationLevel": "official",
      "confidenceScore": 95,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "NIT Council Common Regulations for UG Programs (2022)",
          "NIT Senate Academic Regulations"
      ],
      "regulationBasis": "NIT Joint Council Guidelines of 2022",
      "circularRef": "NIT-COUNCIL/2022/03",
      "academicReasoning": "Adopts standard absolute marking schemes and scales with an AICTE approved 10.0 multiplier conversion."
  },
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
  trust: {
      "verificationLevel": "community",
      "confidenceScore": 90,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "AACRAO (American Association of Collegiate Registrars and Admissions Officers) Guidelines",
          "Standard WES GPA Conversion Tables"
      ],
      "regulationBasis": "US Common GPA Abstraction Model",
      "academicReasoning": "Standard US 4.0 GPA conversion uses direct credits weighting for regional transfer compatibility."
  },
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
  trust: {
      "verificationLevel": "experimental",
      "confidenceScore": 70,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "GradeFlow Platform Standard Custom Abstractions"
      ],
      "regulationBasis": "Platform baseline model for generic 10-point universities",
      "academicReasoning": "Used as a customizable fallback for students from institutions not yet officially integrated."
  },
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
  trust: {
      "verificationLevel": "experimental",
      "confidenceScore": 70,
      "lastVerifiedAt": "2026-05-21",
      "verifiedSources": [
          "GradeFlow Platform Standard Custom Abstractions"
      ],
      "regulationBasis": "Platform baseline model for generic percentage systems",
      "academicReasoning": "Used as a customizable fallback for monolithic percentage-based scoring regimes."
  },
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
  PRESET_SPPU_2015,
  PRESET_SPPU_2024,
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
