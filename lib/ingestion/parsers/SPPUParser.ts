import { AcademicParser, ParserResult, ValidationWarning, IntermediateExtractionModel } from "../types";

export const SPPUParser: AcademicParser = {
  parserId: "sppu_v1",
  version: "1.0",
  
  canParse: (rawInput: string) => {
    try {
      const parsed = JSON.parse(rawInput);
      return parsed.presetId === "sppu" || parsed.institution === "sppu";
    } catch {
      return false;
    }
  },

  parse: (rawInput: string): ParserResult => {
    const warnings: ValidationWarning[] = [];
    let confidenceScore = 100;
    
    let parsed: any;
    try {
      parsed = JSON.parse(rawInput);
    } catch (err) {
      return {
        detectedInstitution: "sppu",
        parserVersion: "1.0",
        confidenceScore: 0,
        validationWarnings: [{
          type: "format_mismatch",
          severity: "critical",
          message: "Input is not valid JSON.",
        }],
        extractedData: { institutionId: "sppu", semesters: [] }
      };
    }

    const semesters: IntermediateExtractionModel["semesters"] = [];

    // Map semesterHistory
    if (Array.isArray(parsed.semesterHistory)) {
      parsed.semesterHistory.forEach((sem: any) => {
        if (!sem.semester || typeof sem.sgpa !== "number") {
          warnings.push({
            type: "missing_field",
            severity: "error",
            message: "Missing semester index or SGPA",
            affectedEntity: `Semester ${sem.semester || "Unknown"}`
          });
          confidenceScore -= 10;
          return;
        }

        const courses = Array.isArray(sem.courses) ? sem.courses.map((c: any) => ({
          code: c.code || "UNKNOWN",
          name: c.name || "Unknown Course",
          credits: c.credits || 0,
          grade: c.grade,
        })) : [];

        semesters.push({
          semesterIndex: sem.semester,
          sgpa: sem.sgpa,
          credits: sem.credits,
          earnedCredits: sem.earnedCredits,
          courses,
        });
      });
    } else {
      warnings.push({
        type: "missing_field",
        severity: "warning",
        message: "No semester history found in payload.",
      });
      confidenceScore -= 20;
    }

    // Map active courses if present
    if (Array.isArray(parsed.currentSemesterCourses) || Array.isArray(parsed.courses)) {
      const currentCourses = parsed.currentSemesterCourses || parsed.courses;
      
      // Determine what the "current" semester index should be
      const maxSem = semesters.length > 0 ? Math.max(...semesters.map(s => s.semesterIndex)) : 0;
      const currentSemIndex = maxSem + 1;

      semesters.push({
        semesterIndex: currentSemIndex,
        courses: currentCourses.map((c: any) => ({
          code: c.code || "UNKNOWN",
          name: c.name || "Unknown Course",
          credits: c.credits || 0,
          grade: c.grade,
          internalMarks: c.cieMarks,
          externalMarks: c.seeMarks,
        }))
      });
    }

    // Cap confidence
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      detectedInstitution: "sppu",
      parserVersion: "1.0",
      confidenceScore,
      validationWarnings: warnings,
      extractedData: {
        institutionId: "sppu",
        studentName: parsed.studentName,
        semesters,
      }
    };
  }
};
