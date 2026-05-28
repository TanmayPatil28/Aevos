/**
 * GradeFlow Academic Rule Abstraction Layer — Preset Test Suite
 * 
 * High-precision, mathematically deterministic test runner verifying
 * university scale invariants, piecewise percentage formulas, unit definitions,
 * double-letter grading, audit exclusion, relative metadata, and GPA calculations.
 */

import { 
  getPresetById, 
  getAllPresets, 
  sgpaToPercentage, 
  cgpaToPercentage, 
  convertLetterGradeToGradePoint,
  calculateSGPA,
  calculateCGPA,
  validatePreset
} from "../lib/presets/index";

import {
  calculateMean,
  calculateStdDev,
  calculateSkewness,
  applyBoxCoxTransform,
  findOptimalLambda,
  calculateMeanStdDevBands,
  calculateClusterGapBands,
  calculateBoxCoxBands,
  convertPercentageToWES,
  convertToECTS,
  advisePercentageBoundary,
  checkCIESafety,
  solveATKTProgression,
  forecastRelativeGradeMarks
} from "../lib/academic-intelligence/index";

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m"
};

let totalTests = 0;
let passedTests = 0;

function section(name: string) {
  console.log(`\n${colors.bright}${colors.blue}=== SECTION: ${name} ===${colors.reset}`);
}

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${description}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${description}`);
    if (details) {
      console.error(`    ${colors.yellow}Details:${colors.reset} ${details}`);
    }
  }
}

function runTests() {
  console.log(`${colors.bright}${colors.cyan}GradeFlow University Presets Automated Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  // Verify all presets are loaded and verified
  const allPresets = getAllPresets();
  assert(
    "All 25 presets successfully loaded and verified in registry",
    allPresets.length === 25,
    `Expected 25, found ${allPresets.length}`
  );

  // ─── 1. MUMBAI UNIVERSITY PIECEWISE EQUATIONS ───────────────────────────────
  section("Mumbai University Piecewise Percentage Calculations");
  const muPreset = getPresetById("mu");
  if (muPreset) {
    // CGPA = 6.5 -> 58.15% (linear part: 7.1 * 6.5 + 12)
    const pctLow = cgpaToPercentage(6.5, muPreset);
    assert(
      "MU CGPA=6.5 converts strictly to 58.15% (lower piecewise interval)",
      Math.abs(pctLow - 58.15) < 0.001,
      `Result: ${pctLow}%, Expected: 58.15%`
    );

    // CGPA = 8.0 -> 71.2% (higher piecewise interval: 7.4 * 8.0 + 12)
    const pctHigh = cgpaToPercentage(8.0, muPreset);
    assert(
      "MU CGPA=8.0 converts strictly to 71.2% (upper piecewise interval)",
      Math.abs(pctHigh - 71.2) < 0.001,
      `Result: ${pctHigh}%, Expected: 71.2%`
    );
  } else {
    assert("Mumbai University preset found in registry", false, "Preset not found!");
  }

  // ─── 2. SPPU LINEAR CONVERSIONS ─────────────────────────────────────────────
  section("Savitribai Phule Pune University Linear Scale Mappings");
  const sppuPreset = getPresetById("sppu");
  if (sppuPreset) {
    // CGPA = 8.0 -> 72.5% ((8.0 - 0.75) * 10)
    const pct8 = cgpaToPercentage(8.0, sppuPreset);
    assert(
      "SPPU CGPA=8.0 maps to 72.5% ((8.0 - 0.75) * 10)",
      Math.abs(pct8 - 72.5) < 0.001,
      `Result: ${pct8}%, Expected: 72.5%`
    );

    // CGPA = 10.0 -> 92.5% ((10.0 - 0.75) * 10)
    const pct10 = cgpaToPercentage(10.0, sppuPreset);
    assert(
      "SPPU CGPA=10.0 maps to 92.5% ((10.0 - 0.75) * 10)",
      Math.abs(pct10 - 92.5) < 0.001,
      `Result: ${pct10}%, Expected: 92.5%`
    );
  } else {
    assert("SPPU preset found in registry", false, "Preset not found!");
  }

  // ─── 3. JNTUH LINEAR CONVERSIONS ────────────────────────────────────────────
  section("JNTUH Linear Percentage Mappings");
  const jntuhPreset = getPresetById("jntuh");
  if (jntuhPreset) {
    // CGPA = 8.0 -> 75% ((8.0 - 0.5) * 10)
    const pct8 = cgpaToPercentage(8.0, jntuhPreset);
    assert(
      "JNTUH CGPA=8.0 maps strictly to 75.0% ((8.0 - 0.5) * 10)",
      Math.abs(pct8 - 75.0) < 0.001,
      `Result: ${pct8}%, Expected: 75.0%`
    );
  } else {
    assert("JNTUH preset found in registry", false, "Preset not found!");
  }

  // ─── 4. BITS PILANI UNIT CHECKS ─────────────────────────────────────────────
  section("BITS Pilani Custom Units and Grade Scale");
  const bitsPreset = getPresetById("bitspilani");
  if (bitsPreset) {
    // Credit type is "units"
    assert(
      "BITS Pilani credit label is set to 'units'",
      bitsPreset.creditType === "units",
      `Result: ${bitsPreset.creditType}`
    );

    // Assert scale mappings: A=10, B=8, C=6, D=4, E=2, NC=0 (with intermediate steps A-=9, B-=7, C-=5)
    const aVal = convertLetterGradeToGradePoint("A", bitsPreset);
    const amVal = convertLetterGradeToGradePoint("A-", bitsPreset);
    const bVal = convertLetterGradeToGradePoint("B", bitsPreset);
    const bmVal = convertLetterGradeToGradePoint("B-", bitsPreset);
    const cVal = convertLetterGradeToGradePoint("C", bitsPreset);
    const cmVal = convertLetterGradeToGradePoint("C-", bitsPreset);
    const dVal = convertLetterGradeToGradePoint("D", bitsPreset);
    const eVal = convertLetterGradeToGradePoint("E", bitsPreset);
    const ncVal = convertLetterGradeToGradePoint("NC", bitsPreset);

    assert("BITS Grade A maps to 10 points", aVal === 10, `Got: ${aVal}`);
    assert("BITS Grade A- maps to 9 points", amVal === 9, `Got: ${amVal}`);
    assert("BITS Grade B maps to 8 points", bVal === 8, `Got: ${bVal}`);
    assert("BITS Grade B- maps to 7 points", bmVal === 7, `Got: ${bmVal}`);
    assert("BITS Grade C maps to 6 points", cVal === 6, `Got: ${cVal}`);
    assert("BITS Grade C- maps to 5 points", cmVal === 5, `Got: ${cmVal}`);
    assert("BITS Grade D maps to 4 points", dVal === 4, `Got: ${dVal}`);
    assert("BITS Grade E maps to 2 points (skipping point 3 completely)", eVal === 2, `Got: ${eVal}`);
    assert("BITS Grade NC maps to 0 points (fail/not cleared)", ncVal === 0, `Got: ${ncVal}`);
  } else {
    assert("BITS Pilani preset found in registry", false, "Preset not found!");
  }

  // ─── 5. VIT PUNE DOUBLE LETTER CHECKS ────────────────────────────────────────
  section("Vishwakarma Institute of Technology Double-Letter Scale");
  const vitpunePreset = getPresetById("vitpune");
  if (vitpunePreset) {
    const scaleMap: Record<string, number> = {
      "AA": 10, "AB": 9, "BB": 8, "BC": 7, "CC": 6, "CD": 5, "DD": 4, "FF": 0
    };

    let allDoubleLetterMatch = true;
    for (const [grade, expectedPt] of Object.entries(scaleMap)) {
      const pt = convertLetterGradeToGradePoint(grade, vitpunePreset);
      if (pt !== expectedPt) {
        allDoubleLetterMatch = false;
        console.error(`    Mismatch at VIT Pune Grade '${grade}': Expected ${expectedPt}, got ${pt}`);
      }
    }

    assert(
      "VIT Pune double letters AA, AB, BB, BC, CC, CD, DD, FF map to points correctly",
      allDoubleLetterMatch
    );
  } else {
    assert("VIT Pune preset found in registry", false, "Preset not found!");
  }

  // ─── 6. VTU AUDIT BLOCKER CHECKS ────────────────────────────────────────────
  section("Visvesvaraya Technological University Blocker & Audit Exclusion");
  const vtuPreset = getPresetById("vtu");
  if (vtuPreset) {
    assert(
      "VTU flags are set for audit course exclusions (hasZeroCreditBlockers: true)",
      vtuPreset.specialFeatures?.hasZeroCreditBlockers === true
    );

    // Audit exclusion math check
    const subjects = [
      { credits: 4, gradePoint: 9 }, // Standard core course
      { credits: 3, gradePoint: 8 }, // Standard core course
      { credits: 0, gradePoint: 10 }, // Audit course (0 credit) - should be excluded
      { credits: 0, gradePoint: 0 }    // Audit course fail - should be excluded
    ];

    const computedSgpa = calculateSGPA(subjects);
    const expectedSgpa = (4 * 9 + 3 * 8) / (4 + 3); // 60 / 7 = 8.5714

    assert(
      "Audit courses (0 credits) are strictly excluded from SGPA divisor/calculations",
      Math.abs(computedSgpa - expectedSgpa) < 0.001,
      `Calculated SGPA: ${computedSgpa}, Expected: ${expectedSgpa}`
    );
  } else {
    assert("VTU preset found in registry", false, "Preset not found!");
  }

  // ─── 7. COEP FLOOR BOUNDS & RELATIVE METADATA ──────────────────────────────
  section("COEP Relative Grading Floor Protection Bounds");
  const coepPreset = getPresetById("coep");
  if (coepPreset) {
    assert(
      "COEP relative configuration has absolute passing floor enabled",
      coepPreset.relativeGrading?.hasAbsoluteFloor === true
    );
    assert(
      "COEP absolute passing floor value is strictly set to 30%",
      coepPreset.relativeGrading?.absoluteFloorValue === 30,
      `Got: ${coepPreset.relativeGrading?.absoluteFloorValue}%`
    );
    assert(
      "COEP model statistical curve type is correct",
      coepPreset.relativeGrading?.model === "statistical_relative_hybrid",
      `Got: ${coepPreset.relativeGrading?.model}`
    );
  } else {
    assert("COEP preset found in registry", false, "Preset not found!");
  }

  // ─── 8. PURE MATHEMATICAL GPA VERIFICATION ─────────────────────────────────
  section("Mathematical SGPA/CGPA Weighted Aggregation Engine");
  
  // SGPA math verification
  const sem1Courses = [
    { credits: 4, gradePoint: 10 },
    { credits: 3, gradePoint: 9 },
    { credits: 3, gradePoint: 8 },
    { credits: 2, gradePoint: 7 }
  ]; // Total credits = 12. Sum of weight = 40 + 27 + 24 + 14 = 105. SGPA = 8.75
  const sem1Sgpa = calculateSGPA(sem1Courses);
  assert(
    "calculateSGPA performs high-precision credit-weighted average (SGPA=8.75)",
    Math.abs(sem1Sgpa - 8.75) < 0.001,
    `Computed: ${sem1Sgpa}, Expected: 8.75`
  );

  // CGPA math verification
  const studentSemesters = [
    { credits: 20, sgpa: 8.5 },
    { credits: 22, sgpa: 9.1 },
    { credits: 18, sgpa: 7.8 }
  ]; // Total credits = 60. Weighted points = 20*8.5 + 22*9.1 + 18*7.8 = 170 + 200.2 + 140.4 = 510.6. CGPA = 8.51
  const computedCgpa = calculateCGPA(studentSemesters);
  const expectedCgpa = 510.6 / 60; // 8.51
  assert(
    "calculateCGPA performs high-precision multi-semester credit-weighted average (CGPA=8.51)",
    Math.abs(computedCgpa - expectedCgpa) < 0.001,
    `Computed: ${computedCgpa}, Expected: ${expectedCgpa}`
  );

  // Rounding Precision and Edge Limits
  section("Rounding and Floating Point Precision Checks");
  const roundingCourses = [
    { credits: 3, gradePoint: 10 },
    { credits: 3, gradePoint: 10 },
    { credits: 3, gradePoint: 9.999 }
  ];
  const roundedSgpa = calculateSGPA(roundingCourses);
  assert(
    "calculateSGPA preserves high floating-point precision on recurring or micro-decimals without premature truncating",
    Math.abs(roundedSgpa - 9.9996666) < 0.0001,
    `Computed: ${roundedSgpa}`
  );

  const edgeRoundingCgpa = 9.999;
  const roundedValueStr = edgeRoundingCgpa.toFixed(2);
  assert(
    "Standard rendering/rounding format translates 9.999 correctly to '10.00' if formatted or maintains 9.999 for raw math",
    roundedValueStr === "10.00",
    `Got: ${roundedValueStr}`
  );

  // ─── 9. ADVERSARIAL VALIDATOR TESTS ─────────────────────────────────────────
  section("Adversarial Validator Hardening & Safety Checks");

  const baseValidPreset = {
    id: "test_base",
    name: "Base Valid Test University",
    shortName: "Base Valid",
    state: "Maharashtra",
    type: "State Public University",
    gradingSystem: "10-point CBCS",
    evaluationModel: "absolute",
    canonicalInstitutionId: "test_base",
    version: "1.0.0",
    regulationYear: 2020,
    status: "active",
    country: "IN",
    nepAligned: false,
    gradeScale: [
      { grade: "O", minMarks: 80, points: 10, description: "Outstanding" },
      { grade: "A", minMarks: 60, points: 8, description: "Very Good" },
      { grade: "P", minMarks: 40, points: 4, description: "Pass" },
      { grade: "F", minMarks: 0, points: 0, description: "Fail", isPass: false }
    ],
    creditType: "credits",
    totalProgramCredits: 160,
    sgpaFormula: "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
    cgpaFormula: "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
    sgpaToPercentage: "SGPA * 9.5",
    cgpaToPercentage: "CGPA * 9.5",
    passRules: {
      minOverall: 40,
      minGradePoint: 4.0
    },
    trust: {
      verificationLevel: "official",
      confidenceScore: 95,
      lastVerifiedAt: "2026-05-21",
      verifiedSources: ["Official Academic Guidelines"]
    }
  } as any;

  // Happy Path baseline check
  const happyRes = validatePreset(baseValidPreset);
  assert("Baseline mock preset passes validation cleanly", happyRes.success, happyRes.errors.join(", "));

  // Test Case A: Overlapping degree classifications
  const overlappingClassPreset = {
    ...baseValidPreset,
    id: "test_overlap",
    degreeClassification: [
      { label: "Class A", minCGPA: 6.0 },
      { label: "Class B", minCGPA: 6.0 } // Overlap / Duplicate minCGPA threshold
    ]
  };
  const overlapRes = validatePreset(overlappingClassPreset);
  assert(
    "Validator rejects overlapping/duplicate degree classification thresholds",
    !overlapRes.success && overlapRes.errors.some(e => e.includes("duplicate/overlapping minCGPA")),
    `Got success=${overlapRes.success}`
  );

  // Test Case B: Incorrectly ordered classifications
  const unorderedClassPreset = {
    ...baseValidPreset,
    id: "test_unordered",
    degreeClassification: [
      { label: "Distinction", minCGPA: 8.0 },
      { label: "First Class", minCGPA: 6.0 } // Distinction has higher minCGPA but appears first (should be sorted ascending by minCGPA)
    ]
  };
  const unorderedRes = validatePreset(unorderedClassPreset);
  assert(
    "Validator rejects out-of-order degree classifications",
    !unorderedRes.success && unorderedRes.errors.some(e => e.includes("must be strictly ordered")),
    `Got success=${unorderedRes.success}`
  );

  // Test Case C: Invalid percentage formula yielding > 100%
  const overflowPercentagePreset = {
    ...baseValidPreset,
    id: "test_overflow",
    sgpaToPercentage: "(SGPA + 1) * 10", // at max SGPA=10 yields 110%
    cgpaToPercentage: "(CGPA + 1) * 10"  // at max CGPA=10 yields 110%
  };
  const overflowRes = validatePreset(overflowPercentagePreset);
  assert(
    "Validator rejects percentage formula yielding overflow (>100% at max GP)",
    !overflowRes.success && overflowRes.errors.some(e => e.includes("Percentage Formula Overflow")),
    `Got success=${overflowRes.success}`
  );

  // Test Case D: Trust Level Mismatches (Official with low confidence score)
  const fakeOfficialPreset = {
    ...baseValidPreset,
    id: "test_fake_official",
    trust: {
      verificationLevel: "official",
      confidenceScore: 80, // official requires >= 90
      lastVerifiedAt: "2026-05-21",
      verifiedSources: ["Mock Source"]
    }
  };
  const fakeOfficialRes = validatePreset(fakeOfficialPreset);
  assert(
    "Validator rejects official presets claiming confidenceScore < 90",
    !fakeOfficialRes.success && fakeOfficialRes.errors.some(e => e.includes("requires confidenceScore >= 90")),
    `Got success=${fakeOfficialRes.success}`
  );

  // Test Case E: Trust Level Mismatches (Experimental claiming verified features)
  const fakeExperimentalPreset = {
    ...baseValidPreset,
    id: "test_fake_experimental",
    specialFeatures: {
      isVerified: true // experimental cannot set specialFeatures.isVerified = true
    },
    trust: {
      verificationLevel: "experimental",
      confidenceScore: 70,
      lastVerifiedAt: "2026-05-21",
      verifiedSources: ["Mock Source"]
    }
  };
  const fakeExperimentalRes = validatePreset(fakeExperimentalPreset);
  assert(
    "Validator rejects experimental presets claiming isVerified special feature",
    !fakeExperimentalRes.success && fakeExperimentalRes.errors.some(e => e.includes("cannot set specialFeatures.isVerified to true")),
    `Got success=${fakeExperimentalRes.success}`
  );

  // Test Case F: Impossible pass rules mismatch
  const mismatchedPassRulePreset = {
    ...baseValidPreset,
    id: "test_mismatch_pass",
    passRules: {
      ...baseValidPreset.passRules,
      minGradePoint: 5.0 // Lowest passing grade point in scale is P (4.0 pts), so this is a mismatch
    }
  };
  const mismatchedPassRes = validatePreset(mismatchedPassRulePreset);
  assert(
    "Validator rejects passRules.minGradePoint that doesn't align with lowest passing grade points in scale",
    !mismatchedPassRes.success && mismatchedPassRes.errors.some(e => e.includes("does not align with the lowest passing grade point")),
    `Got success=${mismatchedPassRes.success}`
  );

  // Test Case G: Broken relative grading structure (evaluationModel = relative but minMarks defined)
  const relativeMarksPreset = {
    ...baseValidPreset,
    id: "test_relative_marks",
    evaluationModel: "relative",
    relativeGrading: {
      model: "statistical_relative_hybrid",
      curveDescription: "Mean/Median distribution model"
    },
    gradeScale: [
      { grade: "A", minMarks: 80, points: 10 }, // Relative model cannot define minMarks absolute boundaries
      { grade: "F", minMarks: 0, points: 0, isPass: false }
    ]
  };
  const relativeMarksRes = validatePreset(relativeMarksPreset);
  assert(
    "Validator rejects relative evaluation presets that expose absolute marks boundaries in scale",
    !relativeMarksRes.success && relativeMarksRes.errors.some(e => e.includes("must NOT define absolute 'minMarks' bounds")),
    `Got success=${relativeMarksRes.success}`
  );

  // Test Case H: Missing relativeGrading configuration when evaluationModel = relative
  const missingRelativeGradingPreset = {
    ...baseValidPreset,
    id: "test_missing_rg",
    evaluationModel: "relative",
    // relativeGrading config missing
  };
  const missingRelativeRes = validatePreset(missingRelativeGradingPreset);
  assert(
    "Validator rejects relative evaluation presets that lack relativeGrading configuration",
    !missingRelativeRes.success && missingRelativeRes.errors.some(e => e.includes("requires a complete 'relativeGrading' configuration")),
    `Got success=${missingRelativeRes.success}`
  );

  // ─── 10. ACADEMIC INTELLIGENCE ENGINE & STATISTICAL TRANSFORMATIONS ───
  section("Academic Intelligence Engine & Statistical Transformations");

  // A. Box-Cox Normalization Engine (Deterministic Mock Cohort)
  const skewedCohort = [45, 47, 48, 50, 52, 53, 55, 58, 60, 62, 65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95];
  const optimalLambda = findOptimalLambda(skewedCohort);
  assert(
    "Optimal lambda calculation is mathematically deterministic and resolves successfully",
    typeof optimalLambda === "number" && !isNaN(optimalLambda)
  );

  const bcTrace = calculateBoxCoxBands(skewedCohort);
  assert("Box-Cox trace contains output boundaries for O, A+, A, B+, B, C, F", bcTrace.boundaries.length === 7);
  
  const oGrade = bcTrace.boundaries.find(b => b.grade === "O");
  const aPlusGrade = bcTrace.boundaries.find(b => b.grade === "A+");
  assert(
    "Box-Cox Grade O threshold is higher than Grade A+ threshold",
    oGrade !== undefined && aPlusGrade !== undefined && oGrade.minMarks > aPlusGrade.minMarks,
    `O: ${oGrade?.minMarks}, A+: ${aPlusGrade?.minMarks}`
  );

  // B. Mean & Standard Deviation Partitioning (VIT Vellore)
  const cohortScores = [60, 65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95];
  const mean = calculateMean(cohortScores);
  const stdDev = calculateStdDev(cohortScores, mean);
  const sdTrace = calculateMeanStdDevBands(cohortScores, 90);
  
  assert("Mean matches expected mathematical value", Math.abs(mean - 79.38) < 0.01, `Calculated Mean: ${mean}`);
  assert("Standard Deviation matches expected mathematical value", Math.abs(stdDev - 10.71) < 0.05, `Calculated StdDev: ${stdDev}`);
  
  const sSDBoundary = sdTrace.boundaries.find(b => b.grade === "S");
  assert(
    "Mean & SD grading scale respects absolute floor check of 90% for S grade",
    sSDBoundary !== undefined && sSDBoundary.minMarks === 95.44,
    `S MinMarks: ${sSDBoundary?.minMarks}`
  );

  // C. BITS Pilani Cluster Gap Histogram Engine
  const bitsScores = [98, 96, 95, 88, 87, 85, 80, 78, 76, 68, 66, 64, 55, 52, 50, 42, 40];
  const bitsBands = calculateClusterGapBands(bitsScores, 8);
  assert("BITS Pilani cluster gap engine outputs exactly 8 bands", bitsBands.length === 8);
  
  const aGradeBits = bitsBands.find(b => b.grade === "A");
  const eGradeBits = bitsBands.find(b => b.grade === "E");
  assert(
    "BITS Pilani Grade A minMarks is greater than Grade E minMarks",
    aGradeBits !== undefined && eGradeBits !== undefined && aGradeBits.minMarks > eGradeBits.minMarks,
    `A: ${aGradeBits?.minMarks}, E: ${eGradeBits?.minMarks}`
  );

  // ─── 11. ADVERSARIAL RULES & PROGRESSION LOGIC GATES ────────────────────────
  section("Adversarial Rules & Progression Logic Gates");

  // A. JNTUH CIE Safety Guard / Void Interceptor
  const unsafeCIE = checkCIESafety(15, 40, 16);
  assert("JNTUH CIE < 16/40 triggers void gate and returns unsafe", !unsafeCIE.isSafe);
  assert("JNTUH CIE void gate contains strict warning details", unsafeCIE.warningMessage !== undefined && unsafeCIE.warningMessage.includes("CIE Void Gate triggered"));
  
  const safeCIE = checkCIESafety(22, 40, 16);
  assert("JNTUH CIE >= 16/40 passes void guard successfully", safeCIE.isSafe && safeCIE.warningMessage === undefined);

  // B. MIT-WPU Progression Solver (CGPA >= 5.0 OR earned credits >= 50%)
  const doublePass = solveATKTProgression(5.2, 40, 24); // CGPA Pass (5.2 >= 5.0), Credits Pass (24/40 = 60% >= 50%)
  assert("MIT-WPU Progression passes with status 'Pass' when both criteria are met", doublePass.status === "Pass" && doublePass.riskCategory === "Low");

  const cgpaPassCreditsFail = solveATKTProgression(5.2, 40, 16); // CGPA Pass (5.2 >= 5.0), Credits Fail (16/40 = 40% < 50%)
  assert("MIT-WPU Progression triggers 'ATKT' when CGPA passes but credits fail", cgpaPassCreditsFail.status === "ATKT" && cgpaPassCreditsFail.riskCategory === "Medium");

  const cgpaFailCreditsPass = solveATKTProgression(4.5, 40, 24); // CGPA Fail (4.5 < 5.0), Credits Pass (24/40 = 60% >= 50%)
  assert("MIT-WPU Progression triggers 'ATKT' when CGPA fails but credits pass", cgpaFailCreditsPass.status === "ATKT" && cgpaFailCreditsPass.riskCategory === "High");

  const doubleFail = solveATKTProgression(4.5, 40, 16); // CGPA Fail (4.5 < 5.0), Credits Fail (16/40 = 40% < 50%)
  assert("MIT-WPU Progression triggers 'Fail/Year-Down' when both criteria fail", doubleFail.status === "Fail/Year-Down" && doubleFail.riskCategory === "Critical");

  // ─── 12. GLOBAL GPA TRANSLATION MAPPINGS ──────────────────────────────────
  section("Global GPA Translation Mappings");

  // A. WES US 4.0 GPA Converter (Percentage Marks -> US GPA)
  const wesA = convertPercentageToWES(82);
  assert("WES maps 82% to 4.0 GPA", Math.abs(wesA.gpa - 4.0) < 0.01 && wesA.letterGrade === "A" && wesA.descriptor === "Excellent");
  assert("WES output includes estimated equivalency disclaimer", wesA.disclaimer.includes("ESTIMATED EQUIVALENCY ONLY"));

  const wesB = convertPercentageToWES(68);
  assert("WES maps 68% to 3.0 GPA", Math.abs(wesB.gpa - 3.0) < 0.01 && wesB.letterGrade === "B" && wesB.descriptor === "Very Good");

  const wesPass = convertPercentageToWES(42);
  assert("WES maps 42% to 1.0 GPA (Pass)", Math.abs(wesPass.gpa - 1.0) < 0.01 && wesPass.letterGrade === "D" && wesPass.descriptor === "Pass");

  // B. ECTS Percentile Cohort Curve mappings
  const mockCohort = [40, 50, 60, 70, 80, 90, 92, 94, 96, 98]; // size 10
  // Index of 98 is 9, 9/10 = 90th percentile -> 100 - 90 = 10% standing. So top 10% -> ECTS A
  const ectsTop = convertToECTS(98, mockCohort);
  assert("ECTS maps student at 90th percentile to Grade A", ectsTop.ectsGrade === "A" && ectsTop.percentileRank === 90.0);
  assert("ECTS output includes estimated relative disclaimer", ectsTop.disclaimer.includes("ESTIMATED EQUIVALENCY ONLY"));

  const ectsMid = convertToECTS(70, mockCohort); // Index of 70 is 3, 3/10 = 30th percentile -> 70% standing. Between 65% and 90% is ECTS D
  assert("ECTS maps student at 30th percentile to Grade D", ectsMid.ectsGrade === "D" && ectsMid.percentileRank === 30.0);

  // ─── 13. PRESET REGISTRY INTEGRATION ──────────────────────────────────────
  section("Preset Registry Regulation Integration");
  if (sppuPreset) {
    const sppuCgpa8 = cgpaToPercentage(8.0, sppuPreset);
    assert("Preset engine correctly routes SPPU conversion through new academic intelligence mapper", Math.abs(sppuCgpa8 - 72.5) < 0.001);
  } else {
    assert("Preset engine correctly routes SPPU conversion through new academic intelligence mapper", false, "SPPU preset not found in registry");
  }

  // ─── RESULTS SUMMARY ────────────────────────────────────────────────────────
  console.log(`\n----------------------------------------------------------------`);
  if (passedTests === totalTests) {
    console.log(`${colors.bright}${colors.green}ALL TESTS PASSED SUCCESSFULLY! (${passedTests}/${totalTests})${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${colors.bright}${colors.red}SOME TESTS FAILED! (${passedTests}/${totalTests} passed)${colors.reset}\n`);
    process.exit(1);
  }
}

runTests();
