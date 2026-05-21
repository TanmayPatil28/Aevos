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
  calculateCGPA
} from "../lib/presets/index";

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
    "All 23 presets successfully loaded and verified in registry",
    allPresets.length === 23,
    `Expected 23, found ${allPresets.length}`
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
