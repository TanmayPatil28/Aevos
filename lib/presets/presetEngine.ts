/**
 * GradeFlow Academic Rule Abstraction Layer — Computation Engine
 *
 * This engine is COMPLETELY university-agnostic. It reads rules from
 * UniversityPreset objects and executes generic academic computations.
 * 
 * CRITICAL CONSTRAINT: NO switch/case on preset.id, NO university-specific
 * branching. ALL behavior variation comes from preset data fields.
 *
 * Architecture: presetRegistry → presetEngine → feature modules
 */

import { UniversityPreset, GradeScaleEntry } from "./types/universityPreset";

// ═══════════════════════════════════════════════════════════════════════════════
// SAFE FORMULA EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parses and evaluates simple mathematical expressions safely without eval() or Function().
 * Supports: +, -, *, /, parentheses, unary negation.
 */
function evaluateSimpleMath(expr: string): number {
  const s = expr.replace(/\s+/g, "");
  let pos = 0;

  function parsePrimary(): number {
    if (pos >= s.length) return 0;

    if (s[pos] === '(') {
      pos++; // consume '('
      const val = parseExpr();
      if (s[pos] === ')') {
        pos++; // consume ')'
      }
      return val;
    }

    const start = pos;
    if (s[pos] === '-' || s[pos] === '+') {
      pos++;
    }
    while (pos < s.length && ((s[pos] >= '0' && s[pos] <= '9') || s[pos] === '.')) {
      pos++;
    }
    const numStr = s.substring(start, pos);
    return parseFloat(numStr) || 0;
  }

  function parseMulDiv(): number {
    let val = parsePrimary();
    while (pos < s.length) {
      const op = s[pos];
      if (op === '*' || op === '/') {
        pos++;
        const nextVal = parsePrimary();
        if (op === '*') {
          val = val * nextVal;
        } else {
          val = val / nextVal;
        }
      } else {
        break;
      }
    }
    return val;
  }

  function parseExpr(): number {
    let val = parseMulDiv();
    while (pos < s.length) {
      const op = s[pos];
      if (op === '+' || op === '-') {
        pos++;
        const nextVal = parseMulDiv();
        if (op === '+') {
          val = val + nextVal;
        } else {
          val = val - nextVal;
        }
      } else {
        break;
      }
    }
    return val;
  }

  return parseExpr();
}

/**
 * Evaluates a university-specific formula string dynamically and safely.
 * Operates purely on algebraic string definitions with zero university-specific
 * branching or hardcoding.
 *
 * Supports:
 * - Variable substitution (CGPA, SGPA, CGPI, VALUE)
 * - Basic arithmetic (+, -, *, /)
 * - Conditional expressions: IF(condition, trueExpr, falseExpr)
 * - Comparison operators: <, >, <=, >=, ==, =
 */
function evaluateFormula(formula: string, value: number): number {
  if (!formula) return value * 10;

  const valueStr = value.toString();
  let expr = formula.replace(/CGPA|SGPA|CGPI|VALUE/gi, valueStr);
  expr = expr.replace(/\s+/g, "");

  // Handle IF(condition, trueExpr, falseExpr) conditional expressions
  if (expr.toUpperCase().startsWith("IF(")) {
    const body = expr.substring(3, expr.length - 1);

    // Split by top-level commas (respecting parentheses)
    const parts: string[] = [];
    let currentPart = "";
    let parenCount = 0;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '(') parenCount++;
      else if (char === ')') parenCount--;

      if (char === ',' && parenCount === 0) {
        parts.push(currentPart);
        currentPart = "";
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart);

    if (parts.length === 3) {
      const condition = parts[0];
      const trueBranch = parts[1];
      const falseBranch = parts[2];

      const match = condition.match(/(.+?)(<=|>=|<|>|==|=)(.+)/);
      if (match) {
        const leftVal = evaluateSimpleMath(match[1]);
        const op = match[2];
        const rightVal = evaluateSimpleMath(match[3]);

        let isTrue = false;
        switch (op) {
          case "<": isTrue = leftVal < rightVal; break;
          case ">": isTrue = leftVal > rightVal; break;
          case "<=": isTrue = leftVal <= rightVal; break;
          case ">=": isTrue = leftVal >= rightVal; break;
          case "==":
          case "=":
            isTrue = leftVal === rightVal;
            break;
        }

        expr = isTrue ? trueBranch : falseBranch;
      }
    }
  }

  return Math.max(0, evaluateSimpleMath(expr));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE CONVERSION — Marks ↔ Grade Points ↔ Letter Grades
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts percentage marks into a grade point using the preset's absolute gradeScale.
 * For relative grading presets (minMarks undefined), returns 0 to prevent surrogate calculations.
 */
export function convertMarksToGradePoint(marks: number, preset: UniversityPreset): number {
  const sortedScale = [...preset.gradeScale]
    .filter((entry) => entry.minMarks !== undefined)
    .sort((a, b) => (b.minMarks || 0) - (a.minMarks || 0));

  const match = sortedScale.find((entry) => marks >= (entry.minMarks || 0));
  return match ? match.points : 0;
}

/**
 * Converts a letter grade string (e.g., "A+", "AA", "O", "S") into its numerical grade point.
 * Handles both single-letter (O/A+/A) and double-letter (AA/AB/BB) notations.
 * Falls back to parsing as numeric if no letter match is found.
 */
export function convertLetterGradeToGradePoint(letter: string, preset: UniversityPreset): number {
  const clean = letter.trim().toUpperCase();
  const match = preset.gradeScale.find((entry) => entry.grade.toUpperCase() === clean);
  return match ? match.points : parseFloat(letter) || 0;
}

/**
 * Maps a numerical grade point back to its corresponding GradeScaleEntry.
 * Returns the nearest match or the lowest (failure) entry as fallback.
 */
export function convertGradePointToGrade(gp: number, preset: UniversityPreset): GradeScaleEntry {
  const match = preset.gradeScale.find((entry) => entry.points === gp);
  if (match) return match;

  return preset.gradeScale[preset.gradeScale.length - 1] || { grade: "F", points: 0, isPass: false };
}

/**
 * Converts running percentage directly to a GradeScaleEntry.
 * Uses the preset's absolute gradeScale for lookup.
 */
export function convertPercentageToGrade(pct: number, preset: UniversityPreset): GradeScaleEntry {
  const sortedScale = [...preset.gradeScale]
    .filter((entry) => entry.minMarks !== undefined)
    .sort((a, b) => (b.minMarks || 0) - (a.minMarks || 0));

  const match = sortedScale.find((entry) => pct >= (entry.minMarks || 0));
  return match || preset.gradeScale[preset.gradeScale.length - 1] || { grade: "F", points: 0, isPass: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GPA CALCULATIONS — SGPA & CGPA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculates Semester Grade Point Average (SGPA).
 * Automatically filters out 0-credit audit courses to avoid divide-by-zero errors.
 * This is a pure weighted average — entirely university-agnostic.
 */
export function calculateSGPA(
  subjects: { credits: number; gradePoint: number }[]
): number {
  const validSubjects = subjects.filter((s) => s.credits > 0);
  if (validSubjects.length === 0) return 0;

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  validSubjects.forEach((sub) => {
    totalCredits += sub.credits;
    totalWeightedPoints += Number(sub.credits) * Number(sub.gradePoint);
  });

  return totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
}

/**
 * Calculates Cumulative Grade Point Average (CGPA) across semesters.
 * Uses credit-weighted aggregation — entirely university-agnostic.
 */
export function calculateCGPA(
  semesters: { credits: number; sgpa: number }[]
): number {
  if (semesters.length === 0) return 0;

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  semesters.forEach((sem) => {
    totalCredits += sem.credits;
    totalWeightedPoints += Number(sem.credits) * Number(sem.sgpa);
  });

  return totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERCENTAGE CONVERSION — SGPA/CGPA ↔ Percentage
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts SGPA to percentage using the preset-specific formula string.
 */
export function sgpaToPercentage(sgpa: number, preset: UniversityPreset): number {
  return evaluateFormula(preset.sgpaToPercentage || "", sgpa);
}

/**
 * Converts CGPA to percentage using the preset-specific formula string.
 */
export function cgpaToPercentage(cgpa: number, preset: UniversityPreset): number {
  return evaluateFormula(preset.cgpaToPercentage || "", cgpa);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE SCALE INSPECTION — Generic Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Returns the active preset's full grade scale for reference/display.
 */
export function getGradeScale(preset: UniversityPreset): GradeScaleEntry[] {
  return preset.gradeScale;
}

/**
 * Returns the maximum grade point value in the preset's scale.
 * Typically 10 for Indian systems, 4.0 for US/Global.
 */
export function getMaxGradePoint(preset: UniversityPreset): number {
  return Math.max(...preset.gradeScale.map((e) => e.points));
}

/**
 * Returns the minimum passing grade point in the preset's scale.
 * This is the lowest grade point where isPass is not explicitly false.
 */
export function getPassingGradePoint(preset: UniversityPreset): number {
  const passingEntries = preset.gradeScale.filter((e) => e.isPass !== false && e.points > 0);
  if (passingEntries.length === 0) return 0;
  return Math.min(...passingEntries.map((e) => e.points));
}

/**
 * Checks whether a specific grade point constitutes a passing grade.
 * Uses the preset's grade scale to determine pass/fail boundary.
 */
export function isPassingGrade(gradePoint: number, preset: UniversityPreset): boolean {
  if (gradePoint <= 0) return false;
  const passingMin = getPassingGradePoint(preset);
  return gradePoint >= passingMin;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEGREE CLASSIFICATION — Based on Preset Brackets
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Returns the degree classification label for a given CGPA, based on the preset's
 * degreeClassification brackets. Returns null if no classification is defined.
 */
export function getDegreeClassification(cgpa: number, preset: UniversityPreset): string | null {
  if (!preset.degreeClassification || preset.degreeClassification.length === 0) {
    return null;
  }

  // Sort brackets by minCGPA descending to find the highest applicable classification
  const sorted = [...preset.degreeClassification].sort((a, b) => b.minCGPA - a.minCGPA);
  const match = sorted.find((bracket) => cgpa >= bracket.minCGPA);
  return match ? match.label : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUIRED GPA CALCULATION — Preset-Aware Target Pursuit
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculates the required GPA for remaining semesters to achieve a target CGPA.
 * Entirely university-agnostic — works with any credit/unit system.
 */
export function calculateRequiredGPA(
  targetCGPA: number,
  currentCGPA: number,
  completedCredits: number,
  remainingCredits: number
): number {
  const totalCreditsAtEnd = completedCredits + remainingCredits;
  const targetTotalPoints = targetCGPA * totalCreditsAtEnd;
  const currentTotalPoints = currentCGPA * completedCredits;

  const requiredTotalPoints = targetTotalPoints - currentTotalPoints;
  return requiredTotalPoints / remainingCredits;
}

/**
 * Returns a difficulty assessment for a required GPA target, relative to the
 * maximum grade point achievable in the preset's scale.
 */
export function getDifficultyLevel(
  requiredGPA: number,
  preset: UniversityPreset
): {
  label: string;
  color: string;
  borderColor: string;
  bgTint: string;
  subLabel: string;
} {
  const maxGP = getMaxGradePoint(preset);
  const ratio = requiredGPA / maxGP;

  if (ratio > 0.95) {
    return {
      label: "VERY HARD",
      color: "text-red-400",
      borderColor: "border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      bgTint: "bg-red-500/5",
      subLabel: "Requires maximum effort",
    };
  } else if (ratio >= 0.8) {
    return {
      label: "CHALLENGING",
      color: "text-yellow-400",
      borderColor: "border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.4)]",
      bgTint: "bg-yellow-500/5",
      subLabel: "Requires consistent focus",
    };
  } else if (ratio >= 0.7) {
    return {
      label: "ACHIEVABLE",
      color: "text-blue-400",
      borderColor: "border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      bgTint: "bg-blue-500/5",
      subLabel: "Manageable with dedication",
    };
  } else {
    return {
      label: "EASY",
      color: "text-green-400",
      borderColor: "border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
      bgTint: "bg-green-500/5",
      subLabel: "Well within your reach",
    };
  }
}
