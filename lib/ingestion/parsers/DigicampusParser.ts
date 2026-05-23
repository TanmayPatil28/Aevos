import { AcademicParser, ParserResult, ValidationWarning, IntermediateExtractionModel } from "../types";

export const DigicampusParser: AcademicParser = {
  parserId: "digicampus_v1",
  version: "1.0",
  
  canParse: (rawInput: string) => {
    try {
      const parsed = JSON.parse(rawInput);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr.length > 0 && 
             (arr[0]?.studentProfile || arr.some((p: any) => p?.institution === "JSPMUNI" || p?.academicTerm));
    } catch {
      return false;
    }
  },

  parse: (rawInput: string): ParserResult => {
    const warnings: ValidationWarning[] = [];
    let confidenceScore = 100;
    
    let parsedArray: any[];
    try {
      const result = JSON.parse(rawInput);
      parsedArray = Array.isArray(result) ? result : [result];
    } catch (err) {
      return {
        detectedInstitution: "unknown",
        parserVersion: "1.0",
        confidenceScore: 0,
        validationWarnings: [{
          type: "format_mismatch",
          severity: "critical",
          message: "Input is not valid JSON.",
        }],
        extractedData: { institutionId: "unknown", semesters: [] }
      };
    }

    const semesters: IntermediateExtractionModel["semesters"] = [];
    let studentName = "Unknown Student";
    let detectedInstitution = "jspm_university_wagholi"; // Default for Digicampus

    // Extract Student Profile if available
    const profileNode = parsedArray.find(node => node.studentProfile);
    if (profileNode?.studentProfile?.fullName) {
      studentName = profileNode.studentProfile.fullName;
    }

    // Extract Academic Terms
    const termNodes = parsedArray.filter(node => node.academicTerm && Array.isArray(node.courses));
    
    if (termNodes.length === 0 && !profileNode) {
      warnings.push({
        type: "missing_field",
        severity: "critical",
        message: "No academic terms with courses or profile found in payload.",
      });
      confidenceScore -= 50;
    } else if (termNodes.length === 0) {
      warnings.push({
        type: "missing_field",
        severity: "info",
        message: "No courses found, only profile data extracted.",
      });
    }

    termNodes.forEach((node: any) => {
      const termLevelStr = node.academicTerm?.level || "";
      const termStr = node.academicTerm?.term || "";
      
      // Heuristic to guess semester index (e.g. "UG First Year", "Even Term" -> Sem 2)
      // For now, let's just infer from length or simple text parsing
      let semIndex = semesters.length + 1;
      if (termLevelStr.includes("First Year") && termStr.includes("Odd")) semIndex = 1;
      else if (termLevelStr.includes("First Year") && termStr.includes("Even")) semIndex = 2;
      else if (termLevelStr.includes("Second Year") && termStr.includes("Odd")) semIndex = 3;
      else if (termLevelStr.includes("Second Year") && termStr.includes("Even")) semIndex = 4;
      else if (termLevelStr.includes("Third Year") && termStr.includes("Odd")) semIndex = 5;
      else if (termLevelStr.includes("Third Year") && termStr.includes("Even")) semIndex = 6;
      else if (termLevelStr.includes("Fourth Year") && termStr.includes("Odd")) semIndex = 7;
      else if (termLevelStr.includes("Fourth Year") && termStr.includes("Even")) semIndex = 8;

      if (node.institution) {
        detectedInstitution = node.institution.toLowerCase();
      }

      const courses = node.courses.map((c: any) => ({
        code: c.courseCode || "UNKNOWN",
        name: c.courseName || "Unknown Course",
        credits: typeof c.credits === "number" ? c.credits : parseFloat(c.credits) || 0,
        grade: c.grade || "-",
      }));

      // Calculate simple SGPA if missing
      let sgpa = node.performance?.majorSGPA;
      if (typeof sgpa !== "number") {
         sgpa = parseFloat(sgpa) || 0;
      }
      
      let earnedCredits = courses.reduce((acc: number, c: any) => c.grade !== "F" && c.grade !== "FF" ? acc + c.credits : acc, 0);
      let totalCredits = courses.reduce((acc: number, c: any) => acc + c.credits, 0);

      semesters.push({
        semesterIndex: semIndex,
        sgpa,
        credits: totalCredits,
        earnedCredits: earnedCredits,
        courses,
      });
    });

    // Cap confidence
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      detectedInstitution,
      parserVersion: "1.0",
      confidenceScore,
      validationWarnings: warnings,
      extractedData: {
        institutionId: detectedInstitution,
        studentName,
        semesters,
      }
    };
  }
};
