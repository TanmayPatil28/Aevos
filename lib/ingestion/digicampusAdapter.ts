import { AcademicImportPayload, ImportSemesterData } from "./types";
import { getPresetById } from "../presets/presetRegistry";
import { UniversityPreset } from "../presets/types/universityPreset";

// ─── Raw Digicampus Institutional DTOs ─────────────────────────────────────────

export interface DigicampusStudentProfile {
  fullName: string;
  registrationId: string;
  applicationNumber?: string | null;
  contactDetails?: {
    email?: string;
    phone?: string;
  };
  academicDetails?: {
    programme?: string;
    department?: string;
    batchYear?: number;
    academicStatus?: string;
    currentYear?: string;
    currentTerm?: string;
    quota?: string;
    admissionType?: string;
    expectedYearOfPassing?: number | null;
    expectedDateOfPassing?: string | null;
    section?: string;
  };
}

export interface DigicampusCourse {
  courseName: string;
  courseCode: string;
  enrollmentType: "Regular" | "Backlog" | "Improvement" | "Summer" | "Supplementary" | string;
  credits: number;
  grade: string | null;
  gradePoint: number | null;
}

export interface DigicampusTermData {
  institution: string;
  academicTerm: {
    term: "Odd Term" | "Even Term" | "Summer Term" | string;
    academicYear: string;
    semester?: number;
    level?: string;
  };
  performance: {
    status: "Result Declared" | "Grades Published" | "Not Published" | string;
    majorSGPA: number | null;
  };
  courses: DigicampusCourse[];
}

export interface IngestionSourceProvenance {
  source: string;
  confidenceScore: number;
  traceabilityLog: string[];
  regulationVersion: string;
}

// ─── Digicampus Adapter ────────────────────────────────────────────────────────

export class DigicampusAdapter {
  /**
   * Normalizes a collection of Digicampus DTOs into a unified GradeFlow AcademicImportPayload.
   * Leverages data-first normalization, handles retroactive backlog grade replacement,
   * detects current vs completed terms, and logs verification provenance.
   */
  static normalize(
    rawElements: any[],
    targetPresetId?: string
  ): { payload: AcademicImportPayload; provenance: IngestionSourceProvenance } {
    const traceLogs: string[] = [];
    
    // 1. Identify Student Profile and Term Data objects
    let studentProfile: DigicampusStudentProfile | undefined;
    const terms: DigicampusTermData[] = [];

    rawElements.forEach((el, idx) => {
      if (el && el.studentProfile) {
        studentProfile = el.studentProfile;
        traceLogs.push(`Found student profile for: ${el.studentProfile.fullName}`);
      } else if (el && el.academicTerm && Array.isArray(el.courses)) {
        terms.push(el as DigicampusTermData);
        traceLogs.push(
          `Found academic term: ${el.academicTerm.term} (${el.academicTerm.academicYear}) with ${el.courses.length} courses`
        );
      }
    });

    // 2. Select matching preset based on student profile or manual parameter
    let presetId = targetPresetId || "jspm_university_wagholi"; // Wagholi private campus by default
    if (studentProfile?.contactDetails?.email?.includes("jspmuni.edu.in")) {
      presetId = "jspm_university_wagholi";
      traceLogs.push("Auto-detected Wagholi campus from student email domain (*@jspmuni.edu.in)");
    } else if (studentProfile?.academicDetails?.programme?.toLowerCase().includes("university")) {
      presetId = "jspm_university_wagholi";
      traceLogs.push("Auto-detected Wagholi campus from B.Tech University programme string");
    }

    const preset = getPresetById(presetId) || getPresetById("jspm_university_wagholi")!;
    traceLogs.push(`Selected Academic Preset: '${preset.name}' (${presetId})`);

    // 3. Map terms sequentially to semesters
    // Odd Term 2024-25 -> Sem 1
    // Even Term 2024-25 -> Sem 2
    // Odd Term 2025-26 -> Sem 3
    // Even Term 2025-26 -> Sem 4
    const resolvedTerms: Array<{
      semesterNum: number;
      isSummer: boolean;
      termData: DigicampusTermData;
    }> = [];

    terms.forEach((term) => {
      const termType = term.academicTerm.term;
      const year = term.academicTerm.academicYear;
      
      let semesterNum = term.academicTerm.semester;
      let isSummer = termType.toLowerCase().includes("summer");

      if (semesterNum === undefined) {
        // Infer from academic year and term
        if (year === "2024-25") {
          semesterNum = termType.toLowerCase().includes("odd") ? 1 : 2;
        } else if (year === "2025-26") {
          semesterNum = termType.toLowerCase().includes("odd") ? 3 : 4;
        } else if (year === "2026-27") {
          semesterNum = termType.toLowerCase().includes("odd") ? 5 : 6;
        } else {
          semesterNum = termType.toLowerCase().includes("odd") ? 1 : 2;
        }
      }

      resolvedTerms.push({
        semesterNum,
        isSummer,
        termData: term,
      });
    });

    // Sort regular semesters ascending
    const regularTerms = resolvedTerms
      .filter((t) => !t.isSummer)
      .sort((a, b) => a.semesterNum - b.semesterNum);

    const summerTerms = resolvedTerms.filter((t) => t.isSummer);

    // 4. Backlog Grade Replacement Extraction
    // Collect all passing backlog retake grades from Summer Terms or explicit backlog courses
    const backlogReplacements = new Map<string, { grade: string; gradePoint: number }>();
    
    // Scan Summer Terms first
    summerTerms.forEach((sTerm) => {
      sTerm.termData.courses.forEach((course) => {
        if (course.grade && course.gradePoint !== null && course.grade !== "F" && course.grade !== "NP") {
          backlogReplacements.set(course.courseCode, {
            grade: course.grade,
            gradePoint: course.gradePoint,
          });
          traceLogs.push(
            `Collected Summer Term backlog clearance for ${course.courseCode} (${course.courseName}): Passed with ${course.grade}`
          );
        }
      });
    });

    // Scan regular semesters for backlog retake clearance too (in case passed in a regular sem later)
    regularTerms.forEach((sem) => {
      sem.termData.courses.forEach((course) => {
        if (
          course.enrollmentType === "Backlog" &&
          course.grade &&
          course.gradePoint !== null &&
          course.grade !== "F" &&
          course.grade !== "NP"
        ) {
          backlogReplacements.set(course.courseCode, {
            grade: course.grade,
            gradePoint: course.gradePoint,
          });
          traceLogs.push(
            `Collected regular term backlog clearance for ${course.courseCode}: Passed with ${course.grade}`
          );
        }
      });
    });

    // 5. Build normalized semesters history and current active semester courses
    const semesterHistory: ImportSemesterData[] = [];
    let currentSemesterCourses: any[] = [];

    regularTerms.forEach((sem) => {
      const isPublished = sem.termData.performance.status !== "Not Published";
      
      // Retroactively replace failed grades in this semester courses using the backlogReplacements map
      const normalizedCourses = sem.termData.courses.map((course) => {
        const replacement = backlogReplacements.get(course.courseCode);
        
        let grade = course.grade;
        let gradePoint = course.gradePoint;

        if (replacement && (course.grade === "F" || course.grade === "NP" || course.grade === null)) {
          grade = replacement.grade;
          gradePoint = replacement.gradePoint;
          traceLogs.push(
            `[Backlog Replacement] Retroactively replaced failed/null grade in course ${course.courseCode} (${course.courseName}) with passed grade ${replacement.grade} in Semester ${sem.semesterNum}`
          );
        }

        return {
          code: course.courseCode.toUpperCase(),
          name: course.courseName,
          credits: course.credits,
          grade: grade || undefined,
          gradePoint: gradePoint !== null ? gradePoint : undefined,
          enrollmentType: course.enrollmentType.toLowerCase() as any,
        };
      });

      if (isPublished) {
        // Recalculate SGPA dynamically after backlog replacement
        const creditCourses = normalizedCourses.filter((c) => c.credits > 0);
        let totalWeightedPoints = 0;
        let totalCredits = 0;

        creditCourses.forEach((c) => {
          if (c.gradePoint !== undefined) {
            totalWeightedPoints += c.gradePoint * c.credits;
            totalCredits += c.credits;
          }
        });

        const calculatedSgpa = totalCredits > 0 ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2)) : 0;
        const originalSgpa = sem.termData.performance.majorSGPA || calculatedSgpa;

        // Earned credits sum
        const earnedCredits = normalizedCourses.reduce((sum, c) => {
          const scale = preset.gradeScale.find((g) => g.grade === c.grade);
          const isPass = scale ? scale.isPass !== false : true;
          return (isPass && c.grade && c.grade !== "F" && c.grade !== "NP") ? sum + c.credits : sum;
        }, 0);

        semesterHistory.push({
          semester: sem.semesterNum,
          sgpa: calculatedSgpa,
          credits: totalCredits,
          earnedCredits: earnedCredits,
          courses: normalizedCourses.map(c => ({
            code: c.code,
            name: c.name,
            credits: c.credits,
            grade: c.grade || "F",
          })),
        });

        traceLogs.push(
          `Normalized Semester ${sem.semesterNum}: Credits = ${totalCredits}, Earned = ${earnedCredits}, calculated SGPA = ${calculatedSgpa} (original = ${originalSgpa})`
        );
      } else {
        // This is the current active semester
        currentSemesterCourses = normalizedCourses.map((c) => ({
          code: c.code,
          name: c.name,
          credits: c.credits,
          grade: c.grade,
          cieMarks: 0,
          attendanceTotal: 0,
          attendanceBunked: 0,
        }));
        traceLogs.push(
          `Mapped active incomplete term to currentSemesterCourses (Semester ${sem.semesterNum}) with ${currentSemesterCourses.length} courses`
        );
      }
    });

    // 6. Calculate cumulative CGPA and active backlogs
    let cumulativeWeightedPoints = 0;
    let cumulativeCredits = 0;
    let activeBacklogsCount = 0;

    semesterHistory.forEach((sem) => {
      cumulativeWeightedPoints += sem.sgpa * sem.credits;
      cumulativeCredits += sem.credits;
    });

    const currentCgpa = cumulativeCredits > 0 ? parseFloat((cumulativeWeightedPoints / cumulativeCredits).toFixed(2)) : 0.0;
    
    // Dynamic active backlog count: any course that is currently failed (F/NP) and not replaced
    regularTerms.forEach((sem) => {
      sem.termData.courses.forEach((course) => {
        if (course.grade === "F" || course.grade === "NP") {
          const replaced = backlogReplacements.has(course.courseCode);
          if (!replaced) {
            activeBacklogsCount++;
            traceLogs.push(`Active Backlog Detected: ${course.courseCode} (${course.courseName}) is currently unresolved.`);
          }
        }
      });
    });

    traceLogs.push(
      `Aggregated Cumulative History: Total Completed Credits = ${cumulativeCredits}, Calculated Cumulative CGPA = ${currentCgpa}, Active Backlog Count = ${activeBacklogsCount}`
    );

    const payload: AcademicImportPayload = {
      presetId,
      currentCgpa,
      targetCgpa: currentCgpa >= 8.5 ? 9.0 : 8.5,
      activeBacklogsCount,
      semesterHistory,
      currentSemesterCourses: currentSemesterCourses.length > 0 ? currentSemesterCourses : undefined,
    };

    const provenance: IngestionSourceProvenance = {
      source: studentProfile ? "Digicampus Direct Profile Export JSON" : "Digicampus Term Sheet JSON",
      confidenceScore: 100, // 100% confidence for structured JSON payloads
      traceabilityLog: traceLogs,
      regulationVersion: preset.metadata?.patternYear || "2023 NEP Pattern",
    };

    return { payload, provenance };
  }
}
