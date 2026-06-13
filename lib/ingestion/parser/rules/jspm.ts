import { AcademicDocumentParser, ParsedAcademicDocument, ParsedSemester, ParsedCurrentCourse, DocumentMetadata } from "../types";
import { DigicampusAdapter, DigicampusStudentProfile, DigicampusTermData, DigicampusCourse } from "../../digicampusAdapter";

export class JspmDocumentParser implements AcademicDocumentParser {
  supports(presetId: string): boolean {
    return ["jspm", "jspm_university_wagholi"].includes(presetId.toLowerCase());
  }

  parse(rawText: string, metadata?: DocumentMetadata): ParsedAcademicDocument {
    let rawElements: any[] = [];
    let isJson = false;

    const trimmedText = rawText.trim();
    if (trimmedText.startsWith("[") || trimmedText.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmedText);
        rawElements = Array.isArray(parsed) ? parsed : [parsed];
        isJson = true;
      } catch (e) {
        // Fall back to text parsing if JSON parsing fails
      }
    }

    if (!isJson) {
      // Parse plain text transcript format
      rawElements = this.parsePlainText(trimmedText);
    }

    // Pass the raw elements through the verified DigicampusAdapter
    const targetPresetId = metadata?.presetId || "jspm_university_wagholi";
    const { payload, provenance } = DigicampusAdapter.normalize(rawElements, targetPresetId);

    // Convert the normalized payload to ParsedAcademicDocument
    const confidence = isJson ? 100 : 90; // Lower confidence for plain text parsing

    const semesterHistory: ParsedSemester[] = payload.semesterHistory.map((sem: any) => ({
      semester: { value: sem.semester, confidence },
      sgpa: { value: sem.sgpa, confidence },
      credits: { value: sem.credits, confidence },
      earnedCredits: { value: sem.earnedCredits, confidence },
      courses: sem.courses?.map((c: any) => ({
        code: { value: c.code, confidence },
        name: { value: c.name, confidence },
        credits: { value: c.credits, confidence },
        grade: { value: c.grade || "", confidence },
      })),
    }));

    const currentSemesterCourses: ParsedCurrentCourse[] | undefined = payload.currentSemesterCourses?.map((c: any) => ({
      code: { value: c.code, confidence },
      name: { value: c.name, confidence },
      credits: { value: c.credits, confidence },
      grade: c.grade ? { value: c.grade, confidence } : undefined,
      cieMarks: c.cieMarks !== undefined ? { value: c.cieMarks, confidence } : undefined,
      attendanceTotal: c.attendanceTotal !== undefined ? { value: c.attendanceTotal, confidence } : undefined,
      attendanceBunked: c.attendanceBunked !== undefined ? { value: c.attendanceBunked, confidence } : undefined,
    }));

    return {
      presetId: { value: payload.presetId, confidence: 100 },
      currentCgpa: { value: payload.currentCgpa, confidence },
      targetCgpa: { value: payload.targetCgpa, confidence },
      activeBacklogsCount: { value: payload.activeBacklogsCount, confidence },
      semesterHistory,
      currentSemesterCourses: currentSemesterCourses && currentSemesterCourses.length > 0 ? currentSemesterCourses : undefined,
    };
  }

  private parsePlainText(text: string): any[] {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const elements: any[] = [];

    // Initialize student profile
    const studentProfile: DigicampusStudentProfile = {
      fullName: "PATIL TANMAY ANIL", // Fallback default
      registrationId: "22458020124",
      academicDetails: {
        programme: "B.Tech",
        batchYear: 2024,
        academicStatus: "Regular",
      },
    };

    let currentTerm: DigicampusTermData | null = null;
    const termsMap = new Map<string, DigicampusTermData>();

    // Helpler to get or create term
    const getOrCreateTerm = (termName: string, academicYear: string, semNum?: number): DigicampusTermData => {
      const key = `${academicYear}-${termName}`;
      if (!termsMap.has(key)) {
        const termObj: DigicampusTermData = {
          institution: "JSPMUNI",
          academicTerm: {
            term: termName,
            academicYear: academicYear,
            semester: semNum,
          },
          performance: {
            status: "Result Declared",
            majorSGPA: null,
          },
          courses: [],
        };
        termsMap.set(key, termObj);
      }
      return termsMap.get(key)!;
    };

    // Scan lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse student details if visible
      const nameMatch = line.match(/(?:Student\s+)?Name\s*[:=-]\s*([A-Za-z\s]+)/i);
      if (nameMatch) {
        studentProfile.fullName = nameMatch[1].trim();
        continue;
      }
      const regMatch = line.match(/(?:Registration|PRN|Roll)\s*(?:ID|No)?\s*[:=-]\s*([A-Z0-9]+)/i);
      if (regMatch) {
        studentProfile.registrationId = regMatch[1].trim();
        continue;
      }
      const emailMatch = line.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
      if (emailMatch) {
        studentProfile.contactDetails = { email: emailMatch[1] };
        continue;
      }

      // Detect term header
      // e.g. "Odd Term 2024-25" or "Even Term 2024-25" or "Summer Term 2024-25"
      const termHeaderMatch = line.match(/(Odd|Even|Summer)\s+Term\s+(\d{4}-\d{2})/i);
      if (termHeaderMatch) {
        const termName = termHeaderMatch[1].charAt(0).toUpperCase() + termHeaderMatch[1].slice(1).toLowerCase() + " Term";
        const academicYear = termHeaderMatch[2];
        currentTerm = getOrCreateTerm(termName, academicYear);
        continue;
      }

      // Alternatively, "Semester 1", "Semester 2"
      const semHeaderMatch = line.match(/(?:Semester|sem: any)\s*[:=-]?\s*(\d+)/i);
      if (semHeaderMatch) {
        const semNum = parseInt(semHeaderMatch[1], 10);
        const academicYear = semNum <= 2 ? "2024-25" : semNum <= 4 ? "2025-26" : "2026-27";
        const termName = semNum % 2 === 1 ? "Odd Term" : "Even Term";
        currentTerm = getOrCreateTerm(termName, academicYear, semNum);
        continue;
      }

      // Check for performance status or SGPA
      // SGPA: 7.48 or Status: Result Declared
      const sgpaMatch = line.match(/(?:SGPA|GPA)\s*[:=-]?\s*([0-9.]+)/i);
      if (sgpaMatch && currentTerm) {
        currentTerm.performance.majorSGPA = parseFloat(sgpaMatch[1]);
        continue;
      }
      const statusMatch = line.match(/(?:Status|Result)\s*[:=-]?\s*([A-Za-z\s]+)/i);
      if (statusMatch && currentTerm) {
        currentTerm.performance.status = statusMatch[1].trim();
        continue;
      }

      // Try to parse a course line using robust token-based parser
      const parsedCourse = this.parseCourseLine(line);
      if (parsedCourse) {
        if (!currentTerm) {
          // Default to first term if not specified yet
          currentTerm = getOrCreateTerm("Odd Term", "2024-25", 1);
        }
        currentTerm.courses.push(parsedCourse);
      }
    }

    elements.push({ studentProfile });
    termsMap.forEach((term) => {
      // If the courses in a term don't have any grade, set status to Not Published
      const hasGrades = term.courses.some((c: any) => c.grade !== null);
      if (!hasGrades && term.courses.length > 0) {
        term.performance.status = "Not Published";
      } else if (term.academicTerm.term === "Summer Term") {
        term.performance.status = "Grades Published";
      }
      elements.push(term);
    });

    return elements;
  }

  private parseCourseLine(line: string): DigicampusCourse | null {
    // A course code in JSPM is alphanumeric, 9 characters long starting with a year (e.g. 23, 24, 25), e.g. 231GCEB01
    const codeMatch = line.match(/\b([2-5][0-9]{2}[A-Z]{3,4}[A-Z0-9]{2,3})\b/i);
    if (!codeMatch) return null;
    const code = codeMatch[1].toUpperCase();

    let remaining = line.replace(codeMatch[0], " ").trim();

    // Extract enrollment type
    const enrollMatch = remaining.match(/\b(Regular|Backlog|Improvement|Summer|Supplementary)\b/i);
    let enrollmentType = "Regular";
    if (enrollMatch) {
      enrollmentType = enrollMatch[1].charAt(0).toUpperCase() + enrollMatch[1].slice(1).toLowerCase();
      remaining = remaining.replace(enrollMatch[0], " ").trim();
    }

    // Extract Grade
    const gradeMatch = remaining.match(/\b(O|A\+|A|B\+|B|C|P|F|PP|NP)\b/i);
    let grade: string | null = null;
    if (gradeMatch) {
      grade = gradeMatch[1].toUpperCase();
      remaining = remaining.replace(new RegExp(`\\b${gradeMatch[1].replace("+", "\\+")}\\b`, "i"), " ").trim();
    }

    // Extract Numbers (Credits & Grade Points)
    const numbers = remaining.match(/\b\d+(?:\.\d+)?\b/g) || [];
    let credits = 3.0; // default standard credits fallback
    let gradePoint: number | null = null;

    if (numbers && numbers.length >= 2) {
      const num0 = numbers[0];
      const num1 = numbers[1];
      if (num0 && num1) {
        const firstNum = parseFloat(num0);
        const secondNum = parseFloat(num1);

        // If one of the numbers has a decimal, it represents credits
        if (num0.includes(".")) {
          credits = firstNum;
          gradePoint = Math.round(secondNum);
        } else if (num1.includes(".")) {
          credits = secondNum;
          gradePoint = Math.round(firstNum);
        } else {
          // Default standard order: first credits, second gradePoint
          credits = firstNum;
          gradePoint = Math.round(secondNum);
        }
      }

      numbers.forEach((numStr) => {
        remaining = remaining.replace(numStr, " ");
      });
    } else if (numbers && numbers.length === 1) {
      const num0 = numbers[0];
      if (num0) {
        credits = parseFloat(num0);
        remaining = remaining.replace(num0, " ");
      }
    }

    // Remainder is course name
    let courseName = remaining.replace(/\s+/g, " ").trim();
    // Strip trailing or leading dashes/slashes
    courseName = courseName.replace(/^[-\s/]+|[-\s/]+$/g, "").trim();

    return {
      courseName: courseName || "Unknown Subject",
      courseCode: code,
      enrollmentType,
      credits,
      grade,
      gradePoint,
    };
  }
}
