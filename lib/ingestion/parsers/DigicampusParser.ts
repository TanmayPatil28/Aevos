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
    let registrationId: string | undefined;
    let programme: string | undefined;
    let branch: string | undefined;
    let batchYear: number | undefined;

    // Extract Student Profile if available
    const profileNode = parsedArray.find(node => node.studentProfile);
    if (profileNode?.studentProfile) {
      studentName = profileNode.studentProfile.fullName || studentName;
      registrationId = profileNode.studentProfile.registrationId || registrationId;
      if (profileNode.studentProfile.academicDetails) {
        programme = profileNode.studentProfile.academicDetails.programme || programme;
        branch = profileNode.studentProfile.academicDetails.department || branch;
        // Basic batch year estimation from "2nd Year" if present, etc. (Optional, can be improved)
      }
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
      if (node.studentIdentity) {
        studentName = node.studentIdentity.name || node.studentIdentity.studentName || studentName;
        registrationId = node.studentIdentity.registrationId || node.studentIdentity.rollNumber || registrationId;
        programme = node.studentIdentity.programme || node.studentIdentity.degree || programme;
        branch = node.studentIdentity.branch || node.studentIdentity.department || branch;
        if (node.studentIdentity.batchYear) {
          batchYear = parseInt(node.studentIdentity.batchYear, 10) || batchYear;
        }
      }

      if (node.institution) {
        detectedInstitution = node.institution.toLowerCase();
      }

      const termLevelStr = node.academicTerm?.level || "";
      const termStr = node.academicTerm?.term || "";
      
      let semIndex = typeof node.semesterIndex === 'number' ? node.semesterIndex : 
                     (node.semesterIndex ? parseInt(node.semesterIndex, 10) : semesters.length + 1);
      
      if (isNaN(semIndex) || !node.semesterIndex) {
        const semMatch = (termLevelStr + " " + termStr).match(/sem(?:ester)?\s*(\d+)/i);
        if (semMatch && semMatch[1]) {
          semIndex = parseInt(semMatch[1], 10);
        } else if (termLevelStr.toLowerCase().includes("first year") && termStr.toLowerCase().includes("even")) {
          semIndex = 2;
        } else {
          semIndex = semesters.length + 1; // Last resort
        }
      }

      const courses = node.courses.map((c: any) => ({
        code: c.courseCode || "UNKNOWN",
        name: c.courseName || "Unknown Course",
        semester: semIndex,
        credits: typeof c.credits === "number" ? c.credits : parseFloat(c.credits) || 0,
        grade: c.grade || "-",
        internalMarks: c.internalMarks || c.cieMarks || 0,
        externalMarks: c.externalMarks || c.seeMarks || 0,
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
        isBacklogClearance: node.isBacklogClearance === true,
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
        registrationId,
        programme,
        branch,
        batchYear,
        semesters,
      }
    };
  }
};
