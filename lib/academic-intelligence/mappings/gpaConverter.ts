/**
 * GradeFlow Global Equivalency Translators
 * 
 * Implements non-linear WES US 4.0 GPA Conversions and ECTS Percentile curves.
 * 
 * CRITICAL CONSTRAINT:
 * All returned values are explicitly marked as "estimated equivalencies"
 * with detailed disclaimers, exposed methodology, and raw academic assumptions.
 */

export interface WESConversionResult {
  gpa: number;
  letterGrade: string;
  descriptor: string;
  methodology: string;
  assumptions: string;
  disclaimer: string;
}

export interface ECTSConversionResult {
  ectsGrade: string;
  percentileRank: number;
  methodology: string;
  assumptions: string;
  disclaimer: string;
}

/**
 * Converts a marks percentage into a standardized WES descriptor-bound US 4.0 GPA.
 * Returns estimated equivalency, methodology, assumptions, and disclaimers.
 */
export function convertPercentageToWES(percentage: number): WESConversionResult {
  let gpa = 0.0;
  let letterGrade = "F";
  let descriptor = "Fail";

  if (percentage >= 80) {
    gpa = 4.0;
    letterGrade = "A";
    descriptor = "Excellent";
  } else if (percentage >= 75) {
    gpa = 3.7;
    letterGrade = "A-";
    descriptor = "Excellent";
  } else if (percentage >= 70) {
    gpa = 3.3;
    letterGrade = "B+";
    descriptor = "Very Good";
  } else if (percentage >= 65) {
    gpa = 3.0;
    letterGrade = "B";
    descriptor = "Very Good";
  } else if (percentage >= 60) {
    gpa = 2.7;
    letterGrade = "B-";
    descriptor = "Good";
  } else if (percentage >= 55) {
    gpa = 2.3;
    letterGrade = "C+";
    descriptor = "Good";
  } else if (percentage >= 50) {
    gpa = 2.0;
    letterGrade = "C";
    descriptor = "Satisfactory";
  } else if (percentage >= 45) {
    gpa = 1.7;
    letterGrade = "C-";
    descriptor = "Satisfactory";
  } else if (percentage >= 40) {
    gpa = 1.0;
    letterGrade = "D";
    descriptor = "Pass";
  } else {
    gpa = 0.0;
    letterGrade = "F";
    descriptor = "Fail";
  }

  return {
    gpa,
    letterGrade,
    descriptor,
    methodology: "WES US 4.0 standard linear-capped percentage mapping. Percentage scores are mapped directly to US Letter grade equivalents.",
    assumptions: "Assumes standard Indian 10-point scale or absolute marks conversions have already been resolved into local percentages.",
    disclaimer: "ESTIMATED EQUIVALENCY ONLY. This is an unofficial, algorithmic calculation of academic standing. Official evaluation by World Education Services (WES) or accredited institutions may vary depending on program credits, university status, and specific course requirements.",
  };
}

/**
 * Evaluates a student's standing against a cohort marks array and assigns an ECTS Grade.
 * Top 10% = A, Next 25% = B, Next 30% = C, Next 25% = D, Bottom 10% = E.
 */
export function convertToECTS(
  studentMark: number,
  cohortMarks: number[]
): ECTSConversionResult {
  if (cohortMarks.length === 0) {
    return {
      ectsGrade: "C",
      percentileRank: 50.0,
      methodology: "ECTS default grading scale mapping.",
      assumptions: "Cohort data is completely absent. Assuming median-level performance.",
      disclaimer: "ESTIMATED EQUIVALENCY ONLY. This calculation is a relative cohort projection and lacks official certification.",
    };
  }

  // Sort cohort in ascending order
  const sorted = [...cohortMarks].sort((a, b) => a - b);
  const count = sorted.length;

  // Find student's index (rank)
  const index = sorted.indexOf(studentMark);
  const rank = index === -1 ? count / 2 : index; // Fallback to median rank if not found
  const percentileRank = parseFloat(((rank / count) * 100).toFixed(2));

  // Determine ECTS grade based on standing:
  // ECTS standard distributions: A (Top 10%), B (Next 25%), C (Next 30%), D (Next 25%), E (Bottom 10%)
  const standingPercent = 100 - percentileRank;
  let ectsGrade = "E";

  if (standingPercent <= 10.0) {
    ectsGrade = "A";
  } else if (standingPercent <= 35.0) {
    ectsGrade = "B";
  } else if (standingPercent <= 65.0) {
    ectsGrade = "C";
  } else if (standingPercent <= 90.0) {
    ectsGrade = "D";
  } else {
    ectsGrade = "E";
  }

  return {
    ectsGrade,
    percentileRank,
    methodology: "ECTS Relative grading scale based on standard cohort percentile distribution bounds: A (Top 10%), B (Next 25%), C (Next 30%), D (Next 25%), E (Bottom 10%).",
    assumptions: `Calculated from a cohort of ${count} students using standard sorting algorithm.`,
    disclaimer: "ESTIMATED EQUIVALENCY ONLY. ECTS conversions are inherently relative to cohort distributions. Results are unofficial estimations and may differ from official transcripts issued by ECTS-aligned institutions.",
  };
}
