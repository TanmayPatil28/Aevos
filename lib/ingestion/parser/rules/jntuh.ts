import { AcademicDocumentParser, ParsedAcademicDocument, ParsedSemester, ParsedCurrentCourse } from "../types";

export class JntuhDocumentParser implements AcademicDocumentParser {
  supports(presetId: string): boolean {
    return presetId.toLowerCase() === "jntuh";
  }

  parse(rawText: string): ParsedAcademicDocument {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

    // Default values
    let currentCgpa = { value: 0, confidence: 50 };
    let targetCgpa = { value: 0, confidence: 50 };
    let activeBacklogsCount = { value: 0, confidence: 50 };
    const semesterHistory: ParsedSemester[] = [];
    const currentSemesterCourses: ParsedCurrentCourse[] = [];

    // Parse CGPA
    const cgpaMatch = rawText.match(/(?:CURRENT\s+)?CGPA\s*[:=-]?\s*([0-9.]+)/i);
    if (cgpaMatch) {
      const val = parseFloat(cgpaMatch[1]);
      currentCgpa = { value: val, confidence: isNaN(val) ? 20 : 98 };
    }

    // Parse Target CGPA
    const targetMatch = rawText.match(/TARGET\s+(?:CGPA)?\s*[:=-]?\s*([0-9.]+)/i);
    if (targetMatch) {
      const val = parseFloat(targetMatch[1]);
      targetCgpa = { value: val, confidence: isNaN(val) ? 20 : 98 };
    }

    // Parse Backlogs
    const backlogMatch = rawText.match(/(?:ACTIVE\s+)?BACKLOGS(?:\s+COUNT)?\s*[:=-]?\s*([0-9]+)/i);
    if (backlogMatch) {
      const val = parseInt(backlogMatch[1], 10);
      activeBacklogsCount = { value: val, confidence: isNaN(val) ? 20 : 98 };
    }

    let currentSemNum: number | null = null;
    let inCurrentSemesterSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check current courses section
      if (/CURRENT\s+COURSES/i.test(line) || /CURRENT\s+SEMESTER\s+COURSES/i.test(line)) {
        inCurrentSemesterSection = true;
        currentSemNum = null;
        continue;
      }

      // Check for semester header
      const semHeaderMatch = line.match(/^SEMESTER\s*[:=-]?\s*([0-9]+)/i);
      if (semHeaderMatch) {
        currentSemNum = parseInt(semHeaderMatch[1], 10);
        inCurrentSemesterSection = false;

        let semObj = semesterHistory.find(s => s.semester.value === currentSemNum);
        if (!semObj) {
          semObj = {
            semester: { value: currentSemNum, confidence: 95 },
            sgpa: { value: 0, confidence: 50 },
            credits: { value: 0, confidence: 50 },
            earnedCredits: { value: 0, confidence: 50 },
            courses: []
          };
          semesterHistory.push(semObj);
        }
        continue;
      }

      if (inCurrentSemesterSection) {
        // Parse current semester courses
        // Format: MA201BS Ordinary Differential Equations 4 CIE: 45 ATT: 40 BUNK: 1
        const courseMatch = line.match(/^([A-Z0-9-]+)\s+(.+?)\s+(\d+)(?:\s+CIE:\s*(\d+))?(?:\s+ATT:\s*(\d+))?(?:\s+BUNK:\s*(\d+))?$/i);
        if (courseMatch) {
          const code = courseMatch[1].trim().toUpperCase();
          const name = courseMatch[2].trim();
          const credits = parseInt(courseMatch[3], 10);
          const cieMarks = courseMatch[4] ? parseInt(courseMatch[4], 10) : undefined;
          const attendanceTotal = courseMatch[5] ? parseInt(courseMatch[5], 10) : undefined;
          const attendanceBunked = courseMatch[6] ? parseInt(courseMatch[6], 10) : undefined;

          currentSemesterCourses.push({
            code: { value: code, confidence: 95 },
            name: { value: name, confidence: 95 },
            credits: { value: credits, confidence: 95 },
            cieMarks: cieMarks !== undefined ? { value: cieMarks, confidence: 98 } : undefined,
            attendanceTotal: attendanceTotal !== undefined ? { value: attendanceTotal, confidence: 98 } : undefined,
            attendanceBunked: attendanceBunked !== undefined ? { value: attendanceBunked, confidence: 98 } : undefined,
          });
        }
      } else if (currentSemNum !== null) {
        // Parse semester courses or SGPA or Credits
        const sgpaMatch = line.match(/^SGPA\s*[:=-]?\s*([0-9.]+)/i);
        if (sgpaMatch) {
          const val = parseFloat(sgpaMatch[1]);
          const semObj = semesterHistory.find(s => s.semester.value === currentSemNum);
          if (semObj) {
            semObj.sgpa = { value: val, confidence: 98 };
          }
          continue;
        }

        const creditsMatch = line.match(/^CREDITS\s*[:=-]?\s*(\d+)(?:\s+EARNED\s*[:=-]?\s*(\d+))?/i);
        if (creditsMatch) {
          const credVal = parseInt(creditsMatch[1], 10);
          const earnedVal = creditsMatch[2] ? parseInt(creditsMatch[2], 10) : credVal;
          const semObj = semesterHistory.find(s => s.semester.value === currentSemNum);
          if (semObj) {
            semObj.credits = { value: credVal, confidence: 98 };
            semObj.earnedCredits = { value: earnedVal, confidence: 98 };
          }
          continue;
        }

        // Course matching
        // e.g. MA101BS Matrices and Calculus 4 A
        const courseMatch = line.match(/^([A-Z0-9-]+)\s+(.+?)\s+(\d+)\s+([A-Z+]+)$/i);
        if (courseMatch) {
          const code = courseMatch[1].trim().toUpperCase();
          const name = courseMatch[2].trim();
          const credits = parseInt(courseMatch[3], 10);
          const grade = courseMatch[4].trim().toUpperCase();

          const semObj = semesterHistory.find(s => s.semester.value === currentSemNum);
          if (semObj && semObj.courses) {
            semObj.courses.push({
              code: { value: code, confidence: 96 },
              name: { value: name, confidence: 96 },
              credits: { value: credits, confidence: 96 },
              grade: { value: grade, confidence: 96 }
            });
          }
        }
      }
    }

    // Fallback/post-process credits if not explicitly set
    semesterHistory.forEach(sem => {
      if (sem.credits.value === 0 && sem.courses && sem.courses.length > 0) {
        const totalCreds = sem.courses.reduce((sum, c) => sum + c.credits.value, 0);
        sem.credits = { value: totalCreds, confidence: 85 };
        // In JNTUH, 'F' is the fail grade
        const earnedCreds = sem.courses
          .filter(c => c.grade.value !== "F" && c.grade.value !== "Ab")
          .reduce((sum, c) => sum + c.credits.value, 0);
        sem.earnedCredits = { value: earnedCreds, confidence: 85 };
      }
    });

    return {
      presetId: { value: "jntuh", confidence: 100 },
      currentCgpa,
      targetCgpa,
      activeBacklogsCount,
      semesterHistory,
      currentSemesterCourses: currentSemesterCourses.length > 0 ? currentSemesterCourses : undefined
    };
  }
}
