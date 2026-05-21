/**
 * GradeFlow Academic Rule Abstraction Layer — Preset Validator
 * 
 * Strict semantic, structural, and mathematical validation for UniversityPreset objects.
 * Prevents corrupted, incomplete, or logically inconsistent academic rules from loading.
 * 
 * Enforces strict quality standards:
 * - Specific, highly detailed, and developer-friendly error logs.
 * - Absolute mathematical alignment and range validations.
 * - Dry-run formula evaluations to preemptively catch syntax/parsing errors.
 */

import { UniversityPreset } from "./types/universityPreset";
import { sgpaToPercentage, cgpaToPercentage } from "./presetEngine";

export interface ValidationResult {
  success: boolean;
  errors: string[];
}

/**
 * Validates a single UniversityPreset against strict structural and academic invariants.
 * Returns a result object containing verification status and detailed error messages.
 */
export function validatePreset(preset: UniversityPreset): ValidationResult {
  const errors: string[] = [];

  // ─── 1. IDENTITY INTEGRITY ──────────────────────────────────────────────────
  if (!preset.id) {
    errors.push("Missing unique identifier 'id'.");
  } else if (!/^[a-z0-9_]+$/.test(preset.id)) {
    errors.push(`Invalid id '${preset.id}': must contain only lowercase alphanumeric characters and underscores.`);
  }

  const prefix = preset.id ? `[Preset: ${preset.id}]` : "[Unknown Preset]";

  if (!preset.name || !preset.name.trim()) {
    errors.push(`${prefix} Missing 'name'.`);
  }
  if (!preset.shortName || !preset.shortName.trim()) {
    errors.push(`${prefix} Missing 'shortName'.`);
  }
  if (!preset.state || !preset.state.trim()) {
    errors.push(`${prefix} Missing 'state'.`);
  }
  if (!preset.type) {
    errors.push(`${prefix} Missing institution 'type'.`);
  }

  // ─── 2. ACADEMIC SYSTEM FLAGS ────────────────────────────────────────────────
  if (!preset.gradingSystem || !preset.gradingSystem.trim()) {
    errors.push(`${prefix} Missing 'gradingSystem' definition (e.g., '10-point CBCS').`);
  }
  if (!preset.evaluationModel) {
    errors.push(`${prefix} Missing 'evaluationModel' definition.`);
  } else if (!["absolute", "relative", "hybrid"].includes(preset.evaluationModel)) {
    errors.push(`${prefix} Invalid evaluationModel '${preset.evaluationModel}': must be 'absolute', 'relative', or 'hybrid'.`);
  }

  // ─── 3. GRADE SCALE CONSISTENCY ──────────────────────────────────────────────
  const scale = preset.gradeScale;
  if (!scale || !Array.isArray(scale) || scale.length < 2) {
    errors.push(`${prefix} Grade scale must contain at least 2 entries.`);
  } else {
    // A scale must contain at least one non-passing (fail) entry
    const hasFailEntry = scale.some(entry => entry.isPass === false || entry.points === 0);
    if (!hasFailEntry) {
      errors.push(`${prefix} Grade scale is missing a fail-state (explicitly marked with isPass: false or points: 0).`);
    }

    // Verify unique points and unique grades
    const pointsSeen = new Set<number>();
    const gradesSeen = new Set<string>();

    scale.forEach((entry, idx) => {
      const entryRef = entry.grade || `Index ${idx}`;
      if (!entry.grade || !entry.grade.trim()) {
        errors.push(`${prefix} Empty grade character at index ${idx}.`);
      } else {
        const uGrade = entry.grade.toUpperCase();
        if (gradesSeen.has(uGrade)) {
          errors.push(`${prefix} Duplicate grade entry '${entry.grade}' in gradeScale.`);
        }
        gradesSeen.add(uGrade);
      }

      if (entry.points === undefined || isNaN(entry.points) || entry.points < 0) {
        errors.push(`${prefix} Invalid points for grade '${entryRef}': must be a positive number.`);
      } else {
        if (pointsSeen.has(entry.points) && (entry.isPass !== false && entry.points > 0)) {
          // Allow duplicate points ONLY for failing entries (e.g., F and NP both mapping to 0)
          errors.push(`${prefix} Duplicate non-zero grade points value '${entry.points}' at grade '${entryRef}'.`);
        }
        pointsSeen.add(entry.points);
      }
    });

    // Check descending consistency based on points (excluding zero-point fail/audit entries)
    const sortedByPoints = [...scale]
      .filter(e => e.points > 0)
      .sort((a, b) => b.points - a.points);
    
    // Validate marks alignment for absolute/hybrid presets
    if (preset.evaluationModel === "absolute" || preset.evaluationModel === "hybrid") {
      const absoluteEntries = scale.filter(e => e.minMarks !== undefined);

      if (absoluteEntries.length === 0 && preset.evaluationModel === "absolute") {
        errors.push(`${prefix} Absolute evaluation model is missing absolute marks thresholds ('minMarks') in grade scale.`);
      }

      // Check minMarks align and decrease alongside points
      for (let i = 0; i < sortedByPoints.length - 1; i++) {
        const current = sortedByPoints[i];
        const next = sortedByPoints[i + 1];

        if (current.minMarks !== undefined && next.minMarks !== undefined) {
          if (current.minMarks <= next.minMarks) {
            errors.push(
              `${prefix} Grade scale threshold ordering violated: grade '${current.grade}' (${current.minMarks}%) must have a higher threshold than '${next.grade}' (${next.minMarks}%).`
            );
          }
          if (current.points <= next.points) {
            errors.push(
              `${prefix} Grade points ordering violated: grade '${current.grade}' (${current.points} pts) must have more points than '${next.grade}' (${next.points} pts).`
            );
          }
        }
      }

      // Check for overlapping boundaries (adjacent minMarks check)
      absoluteEntries.forEach(entry => {
        if (entry.minMarks! < 0 || entry.minMarks! > 100) {
          errors.push(`${prefix} Grade '${entry.grade}' threshold '${entry.minMarks}%' is out of bounds (must be 0-100%).`);
        }
      });
    }

    // Validate relative grading presets rules (marks omitted to prevent surrogate absolute calculations)
    if (preset.evaluationModel === "relative") {
      const hasMarks = scale.some(entry => entry.minMarks !== undefined && entry.minMarks > 0);
      if (hasMarks) {
        errors.push(`${prefix} Relative grading preset must NOT define absolute 'minMarks' bounds for standard letter grades.`);
      }
    }
  }

  // ─── 4. FORMULA SYNTAX & DRY-RUN COMPILATION ─────────────────────────────────
  if (!preset.sgpaFormula || !preset.sgpaFormula.trim()) {
    errors.push(`${prefix} Missing 'sgpaFormula'.`);
  }
  if (!preset.cgpaFormula || !preset.cgpaFormula.trim()) {
    errors.push(`${prefix} Missing 'cgpaFormula'.`);
  }

  // Dry-run percentage conversions to verify formula compilation safety and bounds
  const maxPt = scale && scale.length > 0 ? Math.max(...scale.map((e) => e.points || 0)) : 10;
  const testValGp = maxPt > 0 ? maxPt * 0.8 : 8.0;

  if (preset.sgpaToPercentage) {
    try {
      const testVal = sgpaToPercentage(testValGp, preset);
      if (isNaN(testVal) || testVal < 0 || testVal > 100) {
        errors.push(`${prefix} Dry-run of sgpaToPercentage at SGPA=${testValGp} yielded invalid value: ${testVal}%.`);
      }
      const testMax = sgpaToPercentage(maxPt, preset);
      if (testMax > 100) {
        errors.push(`${prefix} Percentage Formula Overflow: sgpaToPercentage at max SGPA=${maxPt} yielded value ${testMax}% exceeding 100%.`);
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      errors.push(`${prefix} Dry-run of sgpaToPercentage at SGPA=${testValGp} crashed: ${errMsg}`);
    }
  } else {
    errors.push(`${prefix} Missing 'sgpaToPercentage' formula.`);
  }

  if (preset.cgpaToPercentage) {
    try {
      const testVal = cgpaToPercentage(testValGp, preset);
      if (isNaN(testVal) || testVal < 0 || testVal > 100) {
        errors.push(`${prefix} Dry-run of cgpaToPercentage at CGPA=${testValGp} yielded invalid value: ${testVal}%.`);
      }
      const testMax = cgpaToPercentage(maxPt, preset);
      if (testMax > 100) {
        errors.push(`${prefix} Percentage Formula Overflow: cgpaToPercentage at max CGPA=${maxPt} yielded value ${testMax}% exceeding 100%.`);
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      errors.push(`${prefix} Dry-run of cgpaToPercentage at CGPA=${testValGp} crashed: ${errMsg}`);
    }
  } else {
    errors.push(`${prefix} Missing 'cgpaToPercentage' formula.`);
  }

  // ─── 5. NUMERICAL LIMIT GUARDRAILS ───────────────────────────────────────────
  if (preset.passRules) {
    const r = preset.passRules;
    if (r.minAttendance !== undefined && (r.minAttendance < 0 || r.minAttendance > 100)) {
      errors.push(`${prefix} passRules.minAttendance (${r.minAttendance}%) must be between 0 and 100.`);
    }
    if (r.minOverall !== undefined && (r.minOverall < 0 || r.minOverall > 100)) {
      errors.push(`${prefix} passRules.minOverall (${r.minOverall}%) must be between 0 and 100.`);
    }
    if (r.minInternal !== undefined && (r.minInternal < 0 || r.minInternal > 100)) {
      errors.push(`${prefix} passRules.minInternal (${r.minInternal}%) must be between 0 and 100.`);
    }
    if (r.minExternal !== undefined && (r.minExternal < 0 || r.minExternal > 100)) {
      errors.push(`${prefix} passRules.minExternal (${r.minExternal}%) must be between 0 and 100.`);
    }
    if (r.minSgpa !== undefined && (r.minSgpa < 0 || r.minSgpa > 10)) {
      errors.push(`${prefix} passRules.minSgpa (${r.minSgpa}) must be between 0 and 10.`);
    }
    if (r.minCgpa !== undefined && (r.minCgpa < 0 || r.minCgpa > 10)) {
      errors.push(`${prefix} passRules.minCgpa (${r.minCgpa}) must be between 0 and 10.`);
    }
    if (r.minGradePoint !== undefined) {
      if (r.minGradePoint < 0 || r.minGradePoint > 10) {
        errors.push(`${prefix} passRules.minGradePoint (${r.minGradePoint}) must be between 0 and 10.`);
      }
      if (scale && Array.isArray(scale) && scale.length > 0) {
        const passingGrades = scale.filter(g => g.isPass !== false && g.points > 0);
        const lowestPassingPoint = passingGrades.length > 0 ? Math.min(...passingGrades.map(g => g.points)) : undefined;
        if (lowestPassingPoint !== undefined && r.minGradePoint !== lowestPassingPoint) {
          errors.push(`${prefix} Pass rule mismatch: passRules.minGradePoint (${r.minGradePoint}) does not align with the lowest passing grade point in the grade scale (${lowestPassingPoint} pts).`);
        }
      }
    }
  }

  // ─── 6. RELATIVE GRADING SCHEME REQUIREMENTS ─────────────────────────────────
  if (preset.evaluationModel === "relative" || preset.evaluationModel === "hybrid") {
    if (!preset.relativeGrading) {
      errors.push(`${prefix} Relative/Hybrid evaluationModel requires a complete 'relativeGrading' configuration.`);
    } else {
      const rg = preset.relativeGrading;
      if (!rg.model || !rg.model.trim()) {
        errors.push(`${prefix} relativeGrading is missing the statistical 'model' type.`);
      }
      if (!rg.curveDescription || !rg.curveDescription.trim()) {
        errors.push(`${prefix} relativeGrading is missing the 'curveDescription'.`);
      }
    }
  }

  // ─── 7. ASSESSMENT SCHEME REQUIREMENTS ───────────────────────────────────────
  if (preset.assessmentScheme) {
    const as = preset.assessmentScheme;
    if (!as.components || !Array.isArray(as.components) || as.components.length === 0) {
      errors.push(`${prefix} assessmentScheme is missing components list.`);
    }
    if (!as.split || !as.split.trim()) {
      errors.push(`${prefix} assessmentScheme is missing weight split definition.`);
    }
  }

  // ─── 8. DEGREE CLASSIFICATION CHECKS ──────────────────────────────────────────
  if (preset.degreeClassification) {
    const dc = preset.degreeClassification;
    dc.forEach((bracket, idx) => {
      if (!bracket.label || !bracket.label.trim()) {
        errors.push(`${prefix} degreeClassification index ${idx} is missing a classification label.`);
      }
      if (bracket.minCGPA === undefined || isNaN(bracket.minCGPA) || bracket.minCGPA < 0) {
        errors.push(`${prefix} degreeClassification index ${idx} '${bracket.label || "unknown"}' has invalid minCGPA.`);
      }
    });

    const cgpas = dc.map(c => c.minCGPA);
    const uniqueCgpas = new Set(cgpas);
    if (uniqueCgpas.size !== cgpas.length) {
      errors.push(`${prefix} degreeClassification has duplicate/overlapping minCGPA thresholds.`);
    }

    for (let i = 0; i < dc.length - 1; i++) {
      if (dc[i].minCGPA >= dc[i + 1].minCGPA) {
        errors.push(`${prefix} degreeClassification must be strictly ordered by minCGPA ascending (found '${dc[i].label}' at ${dc[i].minCGPA} >= '${dc[i+1].label}' at ${dc[i+1].minCGPA}).`);
      }
    }
  }

  // ─── 9. TRUST METADATA CHECKS ────────────────────────────────────────────────
  if (!preset.trust) {
    errors.push(`${prefix} Missing 'trust' metadata configuration.`);
  } else {
    const t = preset.trust;
    if (!t.verificationLevel || !["official", "community", "experimental"].includes(t.verificationLevel)) {
      errors.push(`${prefix} Invalid trust.verificationLevel: must be 'official', 'community', or 'experimental'.`);
    }
    if (t.confidenceScore === undefined || isNaN(t.confidenceScore) || t.confidenceScore < 0 || t.confidenceScore > 100) {
      errors.push(`${prefix} Invalid trust.confidenceScore: must be a number between 0 and 100.`);
    }
    if (!t.lastVerifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(t.lastVerifiedAt)) {
      errors.push(`${prefix} Invalid trust.lastVerifiedAt: must be in ISO date format (YYYY-MM-DD).`);
    }
    if (!t.verifiedSources || !Array.isArray(t.verifiedSources) || t.verifiedSources.length === 0) {
      errors.push(`${prefix} trust.verifiedSources must be a non-empty array of strings.`);
    }

    if (t.verificationLevel === "official") {
      if (t.confidenceScore < 90) {
        errors.push(`${prefix} Trust conflict: official verification level requires confidenceScore >= 90 (found ${t.confidenceScore}%).`);
      }
      if (!t.verifiedSources || t.verifiedSources.length === 0) {
        errors.push(`${prefix} Trust conflict: official verification level requires at least one verified source.`);
      }
    }
    if (t.verificationLevel === "experimental") {
      if (t.confidenceScore > 85) {
        errors.push(`${prefix} Trust conflict: experimental verification level requires confidenceScore <= 85 (found ${t.confidenceScore}%).`);
      }
      if (preset.specialFeatures?.isVerified === true) {
        errors.push(`${prefix} Trust conflict: experimental preset cannot set specialFeatures.isVerified to true.`);
      }
    }
  }

  // ─── 10. NEP ALIGNMENT CONSISTENCY ────────────────────────────────────────────
  if (preset.nepAligned === true && preset.regulationYear !== undefined && preset.regulationYear >= 2020) {
    if (!preset.totalProgramCredits || preset.totalProgramCredits <= 0) {
      errors.push(`${prefix} NEP regulation consistency error: totalProgramCredits must be defined and positive.`);
    }
    const hasDefaultCredits = preset.defaultCreditsPerSem !== undefined || preset.specialFeatures?.defaultCreditsPerSem !== undefined;
    if (!hasDefaultCredits) {
      errors.push(`${prefix} NEP regulation consistency error: defaultCreditsPerSem or specialFeatures.defaultCreditsPerSem must be defined.`);
    }
    const metaStr = JSON.stringify(preset.metadata || {}).toLowerCase();
    const hasNEPDescription = metaStr.includes("nep") || metaStr.includes("multidisciplinary") || metaStr.includes("flexible") || metaStr.includes("cbcs");
    if (!hasNEPDescription) {
      errors.push(`${prefix} NEP regulation consistency error: metadata must contain details indicating choice-based/NEP/multidisciplinary structures.`);
    }
    const hasZeroCreditParams = preset.specialFeatures?.hasZeroCreditBlockers !== undefined;
    if (!hasZeroCreditParams) {
      errors.push(`${prefix} NEP regulation consistency error: specialFeatures must specify zero-credit / audit-course blockers or exclusions.`);
    }
    if (scale && Array.isArray(scale)) {
      const hasZeroPassing = scale.some(e => e.points === 0 && e.isPass === true);
      const hasZeroFailing = scale.some(e => e.points === 0 && e.isPass === false);
      if (!hasZeroPassing || !hasZeroFailing) {
        errors.push(`${prefix} NEP regulation consistency error: gradeScale must explicitly define passing audit courses (points: 0, isPass: true) and failing courses (points: 0, isPass: false).`);
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Iterates through a collection of presets and performs validation on each.
 * Returns a map of presets that failed validation along with their specific error logs.
 */
export function validateAllPresets(presets: UniversityPreset[]): { success: boolean; errors: Record<string, string[]> } {
  const resultErrors: Record<string, string[]> = {};
  let totalSuccess = true;

  presets.forEach((preset) => {
    const res = validatePreset(preset);
    if (!res.success) {
      totalSuccess = false;
      resultErrors[preset.id || "unknown"] = res.errors;
    }
  });

  return {
    success: totalSuccess,
    errors: resultErrors,
  };
}
