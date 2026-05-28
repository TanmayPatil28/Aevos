import { AcademicState, CourseState, CareerState, RiskState, SemesterHistoryEntry } from "@/stores/usmStore";

export interface DemoPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  presetId: string;
  academic: AcademicState;
  courses: CourseState[];
  semesterHistory: SemesterHistoryEntry[];
  career: CareerState;
  risk: RiskState;
}

export const demoPersonas: Record<string, DemoPersona> = {
  arjun: {
    id: "arjun",
    name: "Arjun Mehta",
    role: "High Performer",
    description: "CGPA 9.2, zero backlogs, 95% attendance. Targeting FAANG companies.",
    presetId: "sppu",
    academic: {
      currentCgpa: 9.2,
      completedSemesters: 4,
      earnedCredits: 80,
      activeBacklogsCount: 0,
      targetCgpa: 9.5,
    },
    courses: [
      {
        id: "cs-401",
        code: "CS-401",
        name: "Theory of Computation",
        credits: 4,
        grade: "O",
        cieMarks: 28,
        seeMarks: 75,
        attendanceTotal: 40,
        attendanceBunked: 3, semester: 4
      },
      {
        id: "cs-402",
        code: "CS-402",
        name: "Database Management Systems",
        credits: 4,
        grade: "A+",
        cieMarks: 27,
        seeMarks: 70,
        attendanceTotal: 40,
        attendanceBunked: 2, semester: 4
      },
      {
        id: "cs-403",
        code: "CS-403",
        name: "Computer Networks",
        credits: 3,
        grade: "O",
        cieMarks: 29,
        seeMarks: 78,
        attendanceTotal: 30,
        attendanceBunked: 2, semester: 4
      },
      {
        id: "cs-404",
        code: "CS-404",
        name: "Machine Learning",
        credits: 3,
        grade: "A+",
        cieMarks: 26,
        seeMarks: 68,
        attendanceTotal: 30,
        attendanceBunked: 1, semester: 4
      },
      {
        id: "cs-405",
        code: "CS-405",
        name: "Software Engineering Lab",
        credits: 2,
        grade: "O",
        cieMarks: 29,
        seeMarks: 82,
        attendanceTotal: 20,
        attendanceBunked: 0, semester: 4
      },
    ],
    semesterHistory: [
      { semester: 1, sgpa: 7.5, credits: 20, earnedCredits: 20 },
      { semester: 2, sgpa: 8.2, credits: 20, earnedCredits: 40 },
      { semester: 3, sgpa: 8.8, credits: 20, earnedCredits: 60 },
      { semester: 4, sgpa: 9.2, credits: 20, earnedCredits: 80 },
    ],
    career: {
      targetCompanies: ["faang", "tcs", "cognizant"],
      wesGpaEquivalent: 3.9,
      ectsStandingBand: "A",
      branch: "Computer Science",
      skills: ["Java", "Python", "React", "DSA"],
      targetRole: "Software Development Engineer",
      targetPackage: "Product (15LPA+)"
    },
    risk: {
      attendanceRisk: "LOW",
      backlogRisk: "LOW",
      detentionRisk: "LOW",
      placementRisk: "LOW",
      cgpaVolatility: 0.1,
    },
  },
  priya: {
    id: "priya",
    name: "Priya Sharma",
    role: "Recovery Student",
    description: "CGPA 6.8, 1 active backlog, 77.5% attendance. Targeting TCS/Cognizant, working to recover to 8.0 CGPA.",
    presetId: "sppu",
    academic: {
      currentCgpa: 6.8,
      completedSemesters: 4,
      earnedCredits: 78,
      activeBacklogsCount: 1,
      targetCgpa: 8.0,
    },
    courses: [
      {
        id: "cs-401",
        code: "CS-401",
        name: "Design & Analysis of Algorithms",
        credits: 4,
        cieMarks: 22,
        attendanceTotal: 40,
        attendanceBunked: 8, semester: 4
      },
      {
        id: "cs-402",
        code: "CS-402",
        name: "System Programming",
        credits: 4,
        cieMarks: 18,
        attendanceTotal: 40,
        attendanceBunked: 11, semester: 4
      },
      {
        id: "cs-403",
        code: "CS-403",
        name: "Operating Systems",
        credits: 3,
        cieMarks: 20,
        attendanceTotal: 30,
        attendanceBunked: 6, semester: 4
      },
      {
        id: "cs-404",
        code: "CS-404",
        name: "Web Technology",
        credits: 3,
        cieMarks: 19,
        attendanceTotal: 30,
        attendanceBunked: 8, semester: 4
      },
      {
        id: "cs-405",
        code: "CS-405",
        name: "Microprocessor Lab",
        credits: 2,
        cieMarks: 24,
        attendanceTotal: 20,
        attendanceBunked: 3, semester: 4
      },
    ],
    semesterHistory: [
      { semester: 1, sgpa: 6.0, credits: 20, earnedCredits: 20 },
      { semester: 2, sgpa: 5.8, credits: 20, earnedCredits: 38 },
      { semester: 3, sgpa: 7.2, credits: 20, earnedCredits: 58 },
      { semester: 4, sgpa: 7.5, credits: 20, earnedCredits: 78 },
    ],
    career: {
      targetCompanies: ["tcs", "cognizant"],
      wesGpaEquivalent: 3.1,
      ectsStandingBand: "C",
      branch: "Computer Science",
      skills: ["Java", "HTML", "CSS"],
      targetRole: "Frontend Developer",
      targetPackage: "Service (3-6LPA)"
    },
    risk: {
      attendanceRisk: "MEDIUM",
      backlogRisk: "MEDIUM",
      detentionRisk: "LOW",
      placementRisk: "MEDIUM",
      cgpaVolatility: 0.3,
    },
  },
  rahul: {
    id: "rahul",
    name: "Rahul Verma",
    role: "At-Risk Student",
    description: "CGPA 5.5, 2 active backlogs, 68.1% attendance. High detention risk, working to avoid placement disqualification.",
    presetId: "sppu",
    academic: {
      currentCgpa: 5.5,
      completedSemesters: 3,
      earnedCredits: 52,
      activeBacklogsCount: 2,
      targetCgpa: 6.5,
    },
    courses: [
      {
        id: "cs-301",
        code: "CS-301",
        name: "Formal Languages & Automata",
        credits: 4,
        cieMarks: 14,
        attendanceTotal: 40,
        attendanceBunked: 14, semester: 4
      },
      {
        id: "cs-302",
        code: "CS-302",
        name: "Computer Organization",
        credits: 4,
        cieMarks: 12,
        attendanceTotal: 40,
        attendanceBunked: 15, semester: 4
      },
      {
        id: "cs-303",
        code: "CS-303",
        name: "Digital Electronics",
        credits: 3,
        cieMarks: 15,
        attendanceTotal: 30,
        attendanceBunked: 8, semester: 4
      },
      {
        id: "cs-304",
        code: "CS-304",
        name: "Data Structures",
        credits: 3,
        cieMarks: 13,
        attendanceTotal: 30,
        attendanceBunked: 10, semester: 4
      },
      {
        id: "cs-305",
        code: "CS-305",
        name: "Programming Laboratory",
        credits: 2,
        cieMarks: 15,
        attendanceTotal: 20,
        attendanceBunked: 4, semester: 4
      },
    ],
    semesterHistory: [
      { semester: 1, sgpa: 7.0, credits: 20, earnedCredits: 20 },
      { semester: 2, sgpa: 6.2, credits: 18, earnedCredits: 34 },
      { semester: 3, sgpa: 5.5, credits: 16, earnedCredits: 52 },
    ],
    career: {
      targetCompanies: ["cognizant"],
      wesGpaEquivalent: 2.5,
      ectsStandingBand: "E",
      branch: "Computer Science",
      skills: ["HTML"],
      targetRole: "Frontend Developer",
      targetPackage: "Service (3-6LPA)"
    },
    risk: {
      attendanceRisk: "HIGH",
      backlogRisk: "HIGH",
      detentionRisk: "HIGH",
      placementRisk: "HIGH",
      cgpaVolatility: 0.5,
    },
  },
};
