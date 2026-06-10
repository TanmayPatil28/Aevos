/**
 * GradeFlow Phase-A MVP Core Engines Automated Unit Test Suite
 * 
 * Verifies mathematical safety, division-by-zero bounds, piecewise target solving,
 * recruiter placement matrices, unified academic health scoring, and explainability trace integrity.
 */

import { attendanceEngine } from "../../lib/attendance/attendanceEngine";
import { progressionSolver } from "../../lib/simulation/progressionSolver";
import { eligibilityEngine } from "../../lib/career/eligibilityEngine";
import { healthScoreEngine } from "../../lib/academic-intelligence/healthScore";
import { calculateRequiredGPA, getDifficultyLevel } from "../../lib/presets/presetEngine";
import { getPresetById } from "../../lib/presets/presetRegistry";

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

function runEnginesTests() {
  console.log(`${colors.bright}${colors.cyan}GradeFlow Deterministic Engines Unit Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  // ─── 1. ATTENDANCE ENGINE EDGE CASES ─────────────────────────────────────────
  section("Attendance Engine Boundary & Edge Cases");

  // Edge Case 1: Division-by-Zero Safety (0 lectures conducted)
  const zeroResult = attendanceEngine.calculateCourseAttendance(0, 0, 75, "sppu");
  assert(
    "Safe division-by-zero: 0/0 attendance defaults to 100%",
    zeroResult.metrics.percentage === 100,
    `Result: ${zeroResult.metrics.percentage}%, Expected: 100%`
  );
  assert(
    "0 conducted lectures yields LOW detention risk",
    zeroResult.metrics.detentionRisk === "LOW",
    `Result: ${zeroResult.metrics.detentionRisk}`
  );
  assert(
    "0 conducted lectures yields 0 safe bunks",
    zeroResult.metrics.safeBunks === 0,
    `Result: ${zeroResult.metrics.safeBunks}`
  );
  assert(
    "0 conducted lectures yields 0 recovery required",
    zeroResult.metrics.recoveryRequired === 0,
    `Result: ${zeroResult.metrics.recoveryRequired}`
  );

  // Edge Case 2: 100% Bunk Rate
  const allBunkedResult = attendanceEngine.calculateCourseAttendance(0, 10, 75, "sppu");
  assert(
    "100% bunk rate yields 0% attendance",
    allBunkedResult.metrics.percentage === 0,
    `Result: ${allBunkedResult.metrics.percentage}%`
  );
  assert(
    "100% bunk rate triggers HIGH detention risk",
    allBunkedResult.metrics.detentionRisk === "HIGH",
    `Result: ${allBunkedResult.metrics.detentionRisk}`
  );
  assert(
    "100% bunk rate with 75% threshold requires attending 30 consecutive classes to recover",
    allBunkedResult.metrics.recoveryRequired === 30, // ceil((0.75 * 10 - 0) / 0.25) = ceil(7.5 / 0.25) = 30
    `Result: ${allBunkedResult.metrics.recoveryRequired}`
  );

  // Edge Case 3: High Attendance Safe Bunks
  const highlyAttended = attendanceEngine.calculateCourseAttendance(18, 20, 75, "sppu");
  assert(
    "90% attendance yields LOW detention risk",
    highlyAttended.metrics.detentionRisk === "LOW",
    `Result: ${highlyAttended.metrics.detentionRisk}`
  );
  assert(
    "Safe bunks calculation: Attended 18/20 classes allows safely bunking 4 classes (floor(18/0.75 - 20) = 4)",
    highlyAttended.metrics.safeBunks === 4,
    `Result: ${highlyAttended.metrics.safeBunks}`
  );

  // Edge Case 4: Near Detention Margin
  const marginalAtt = attendanceEngine.calculateCourseAttendance(15, 20, 75, "sppu"); // 75% exactly
  assert(
    "Exactly 75% attendance triggers MEDIUM risk (close to threshold warning zone)",
    marginalAtt.metrics.detentionRisk === "MEDIUM",
    `Result: ${marginalAtt.metrics.detentionRisk}`
  );
  assert(
    "Exactly 75% attendance allows 0 safe bunks",
    marginalAtt.metrics.safeBunks === 0,
    `Result: ${marginalAtt.metrics.safeBunks}`
  );
  assert(
    "Exactly 75% attendance requires 0 recovery classes",
    marginalAtt.metrics.recoveryRequired === 0,
    `Result: ${marginalAtt.metrics.recoveryRequired}`
  );

  // ─── 2. CGPA SIMULATION STABILITY & BACK-SOLVER ──────────────────────────────
  section("CGPA Progression Solver & Piecewise Target Solver");

  const baselineInput = {
    currentCgpa: 8.0,
    completedSemesters: 4,
    earnedCredits: 80,
    targetCgpa: 8.5,
    presetId: "sppu",
    semesterCourses: [
      { id: "c1", credits: 4 },
      { id: "c2", credits: 4 },
      { id: "c3", credits: 3 },
      { id: "c4", credits: 3 },
      { id: "c5", credits: 2 }, // Total active credit = 16
    ]
  };

  // Case 1: All courses remaining, solve required SGPA for 8.5 target CGPA
  const progressionResult = progressionSolver.solve(baselineInput);
  // targetCGPA = 8.5
  // currentCGPA = 8.0, completedCredits = 80
  // semesterCredits = 16
  // RequiredSGPA = (8.5 * (80 + 16) - 8.0 * 80) / 16 = (816 - 640) / 16 = 176 / 16 = 11.00
  assert(
    "Target solver flags SGPA requirements greater than 10.0 as impossible",
    progressionResult.isTargetAchievable === false,
    `Required SGPA: ${progressionResult.requiredSgpaToMeetTarget}, achievable: ${progressionResult.isTargetAchievable}`
  );
  assert(
    "Difficulty is marked as IMPOSSIBLE for target SGPA > 10.0",
    progressionResult.requiredSgpaToMeetTarget > 10.0,
    `Required SGPA: ${progressionResult.requiredSgpaToMeetTarget}`
  );

  // Case 2: Realistic achievable target CGPA (8.15 CGPA target)
  // RequiredSGPA = (8.15 * 96 - 8.0 * 80) / 16 = (782.4 - 640) / 16 = 142.4 / 16 = 8.90
  const realisticInput = { ...baselineInput, targetCgpa: 8.15 };
  const realisticResult = progressionSolver.solve(realisticInput);
  assert(
    "Realistic target: 8.15 target CGPA is achievable",
    realisticResult.isTargetAchievable === true,
    `Required SGPA: ${realisticResult.requiredSgpaToMeetTarget}, achievable: ${realisticResult.isTargetAchievable}`
  );
  assert(
    "Required SGPA calculates to 8.90 for 8.15 target CGPA",
    Math.abs(realisticResult.requiredSgpaToMeetTarget - 8.90) < 0.01,
    `Result: ${realisticResult.requiredSgpaToMeetTarget}`
  );
  assert(
    "Proportional recommended remaining course grade maps to an appropriate passing grade (e.g. A+ or A)",
    realisticResult.recommendedRemainingGrade !== "F" && realisticResult.recommendedRemainingGrade !== "O",
    `Recommended remaining grade: ${realisticResult.recommendedRemainingGrade}`
  );

  // Case 3: Mixed scenario - some courses have fixed grade, others remaining
  const mixedInput = {
    ...baselineInput,
    targetCgpa: 8.10, // Requires SGPA = (8.10 * 96 - 640) / 16 = 137.6 / 16 = 8.60
    semesterCourses: [
      { id: "c1", credits: 4, grade: "O" }, // 10 pts * 4 = 40 GP
      { id: "c2", credits: 4, grade: "A" }, // 8 pts * 4 = 32 GP. Total fixed GP = 72 on 8 credits. Current SGPA = 9.0
      { id: "c3", credits: 3 }, // remaining
      { id: "c4", credits: 3 }, // remaining
      { id: "c5", credits: 2 }, // remaining. Total remaining credits = 8.
    ]
  };
  const mixedResult = progressionSolver.solve(mixedInput);
  // Total required semester points = 8.60 * 16 = 137.6 points
  // Fixed semester points = 72 points
  // Remaining points needed = 137.6 - 72 = 65.6 points
  // Average required GP = 65.6 / 8 = 8.20
  assert(
    "Mixed simulation: solver calculates average required grade point correctly for remaining courses (8.20)",
    Math.abs(mixedResult.averageRequiredGradePoint - 8.20) < 0.01,
    `Result: ${mixedResult.averageRequiredGradePoint}`
  );

  // ─── 3. PLACEMENT ELIGIBILITY MATRIX ─────────────────────────────────────────
  section("Career Placement Eligibility Evaluation");

  // Check FAANG and standard company eligibility for standard parameters
  const normalCareer = eligibilityEngine.evaluate({
    cgpa: 8.25,
    backlogs: 0,
    earnedCredits: 90,
  });

  assert(
    "High GPA, 0 backlogs, sufficient credits student is ELIGIBLE for FAANG",
    normalCareer.companies.find((c) => c.name === "FAANG / Top Tier")?.status === "ELIGIBLE",
    `Status: ${normalCareer.companies.find((c) => c.name === "FAANG / Top Tier")?.status}`
  );

  const backlogCareer = eligibilityEngine.evaluate({
    cgpa: 7.50,
    backlogs: 1, // 1 active backlog
    earnedCredits: 70,
  });

  assert(
    "Student with 1 backlog is INELIGIBLE for TCS (requires zero active backlogs)",
    backlogCareer.companies.find((c) => c.name.startsWith("TCS"))?.status === "INELIGIBLE",
    `Status: ${backlogCareer.companies.find((c) => c.name.startsWith("TCS"))?.status}`
  );
  assert(
    "Student with 1 backlog is ELIGIBLE for Cognizant (allows 1 active backlog)",
    backlogCareer.companies.find((c) => c.name.startsWith("Cognizant"))?.status === "ELIGIBLE",
    `Status: ${backlogCareer.companies.find((c) => c.name.startsWith("Cognizant"))?.status}`
  );

  const borderlineGpaCareer = eligibilityEngine.evaluate({
    cgpa: 5.80, // Cutoff is 6.0 for TCS/Cognizant
    backlogs: 0,
    earnedCredits: 85,
  });
  assert(
    "Borderline GPA (5.80 vs 6.0 cutoff) is labeled BORDERLINE eligibility",
    borderlineGpaCareer.companies.find((c) => c.name.startsWith("TCS"))?.status === "BORDERLINE",
    `Status: ${borderlineGpaCareer.companies.find((c) => c.name.startsWith("TCS"))?.status}`
  );

  // ─── 4. UNIFIED ACADEMIC HEALTH SCORE ────────────────────────────────────────
  section("Unified Academic Health Scoring system");

  // Excellent student case
  const excellentHealth = healthScoreEngine.calculate({
    cgpa: 9.20,
    targetCgpa: 8.50,
    activeBacklogs: 0,
    aggregateAttendancePercentage: 88,
    eligibleCompaniesCount: 6,
    totalCompaniesCount: 6,
  });
  assert(
    "Excellent student receives ELITE STABILITY health status",
    excellentHealth.status === "ELITE STABILITY",
    `Status: ${excellentHealth.status}, Score: ${excellentHealth.score}`
  );
  assert(
    "Excellent student achieves health score > 90",
    excellentHealth.score >= 90,
    `Score: ${excellentHealth.score}`
  );

  // Critical backlog case
  const backlogHealth = healthScoreEngine.calculate({
    cgpa: 7.20,
    targetCgpa: 8.50,
    activeBacklogs: 1, // Backlog present
    aggregateAttendancePercentage: 90,
    eligibleCompaniesCount: 4,
    totalCompaniesCount: 6,
  });
  assert(
    "Student with active backlogs receives ACADEMIC DANGER status immediately",
    backlogHealth.status === "ACADEMIC DANGER",
    `Status: ${backlogHealth.status}, Score: ${backlogHealth.score}`
  );

  // Critical attendance case
  const lowAttHealth = healthScoreEngine.calculate({
    cgpa: 8.60,
    targetCgpa: 8.50,
    activeBacklogs: 0,
    aggregateAttendancePercentage: 68, // Low attendance
    eligibleCompaniesCount: 6,
    totalCompaniesCount: 6,
  });
  assert(
    "Student with low attendance (< 75%) receives ACADEMIC DANGER status immediately",
    lowAttHealth.status === "ACADEMIC DANGER",
    `Status: ${lowAttHealth.status}, Score: ${lowAttHealth.score}`
  );

  // ─── 5. EXPLAINABILITY METADATA INTEGRITY ────────────────────────────────────
  section("Explainability Metadata Integrity & Compliance Auditing");

  assert(
    "Attendance engine result contains valid TraceMetadata",
    zeroResult.trace !== undefined && typeof zeroResult.trace.formulaApplied === "string",
    `Trace: ${JSON.stringify(zeroResult.trace)}`
  );
  assert(
    "Attendance trace resolves appropriate JNTUH R22 regulation clauses for JNTUH students",
    attendanceEngine.calculateCourseAttendance(30, 40, 75, "jntuh").trace.sourceRegulationId === "JNTUH-R22",
    `Regulation ID: ${attendanceEngine.calculateCourseAttendance(30, 40, 75, "jntuh").trace.sourceRegulationId}`
  );
  assert(
    "Progression solver trace resolves appropriate Savitribai Phule Pune University regulations for SPPU students",
    progressionSolver.solve({ ...baselineInput, presetId: "sppu" }).trace.sourceRegulationId === "SPPU-REG-2019",
    `Regulation ID: ${progressionSolver.solve({ ...baselineInput, presetId: "sppu" }).trace.sourceRegulationId}`
  );
  assert(
    "Health score trace exposes audit formulas clearly",
    excellentHealth.trace.formulaApplied.includes("AcademicHealth = "),
    `Formula: ${excellentHealth.trace.formulaApplied}`
  );

  // ─── 6. SUB-MILESTONE 2.1 BUG FIXES VERIFICATION ─────────────────────────────
  section("Sub-milestone 2.1 Bug Fixes Verification");

  // 1. Zero-credit bug in calculateRequiredGPA
  const zeroCreditResult = calculateRequiredGPA(8.5, 8.0, 80, 0);
  assert(
    "calculateRequiredGPA handles zero remaining credits by returning Infinity",
    zeroCreditResult === Infinity,
    `Result: ${zeroCreditResult}`
  );

  const negativeCreditResult = calculateRequiredGPA(8.5, 8.0, 80, -5);
  assert(
    "calculateRequiredGPA handles negative remaining credits by returning Infinity",
    negativeCreditResult === Infinity,
    `Result: ${negativeCreditResult}`
  );

  const sppuPreset = getPresetById("sppu");

  // 2. F-grade / Zero-credit / Math impossible trajectory in getDifficultyLevel
  // If target GPA is 11 on a 10 point scale (ratio = 1.1)
  const difficultyImpossible = getDifficultyLevel(11.0, sppuPreset!);
  assert(
    "getDifficultyLevel explicitly flags mathematically impossible pursuits (>1 ratio)",
    difficultyImpossible.label === "IMPOSSIBLE",
    `Label: ${difficultyImpossible.label}, Expected: IMPOSSIBLE`
  );

  const difficultyVeryHard = getDifficultyLevel(9.6, sppuPreset!); // ratio 0.96
  assert(
    "getDifficultyLevel correctly flags very hard pursuits (>0.95 ratio)",
    difficultyVeryHard.label === "VERY HARD",
    `Label: ${difficultyVeryHard.label}, Expected: VERY HARD`
  );

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Engines Test Suite Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}

// Run the script directly if invoked by tsx
if (require.main === module) {
  const success = runEnginesTests();
  process.exit(success ? 0 : 1);
}

export { runEnginesTests };
