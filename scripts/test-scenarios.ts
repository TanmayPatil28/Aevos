/**
 * GradeFlow Student OS — Scenario Test Suite
 * 
 * Executes all student workflow persona-scenario combinations to verify
 * calculations are deterministic, correct, and comply with institutional regulations.
 */

import { demoPersonas } from "../lib/demo/demo-personas";
import { demoScenarios } from "../lib/demo/demo-scenarios";

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
  console.log(`\n${colors.bright}${colors.blue}=== SCENARIO GROUP: ${name} ===${colors.reset}`);
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

async function runScenarioTests() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`🚀 GradeFlow Student Flow Scenario Verification Suite`);
  console.log(`================================================================${colors.reset}`);

  // ─── 1. BUNK LIMIT SCENARIOS ────────────────────────────────────────────────
  section("Bunk Limit Calculation");

  const arjunBunk = demoScenarios.runBunkLimitScenario(demoPersonas.arjun, "CS-401");
  assert(
    "Arjun: CS-401 Bunk limit is correctly computed as 9 classes",
    arjunBunk.safeBunks === 9,
    `Calculated bunks: ${arjunBunk.safeBunks}`
  );
  assert(
    "Arjun: CS-401 risk status is LOW",
    arjunBunk.detentionRisk === "LOW",
    `Risk: ${arjunBunk.detentionRisk}`
  );

  const priyaBunk = demoScenarios.runBunkLimitScenario(demoPersonas.priya, "CS-402");
  assert(
    "Priya: CS-402 (System Programming) has below-threshold attendance",
    priyaBunk.attendancePercentage === 72.5,
    `Percentage: ${priyaBunk.attendancePercentage}%`
  );
  assert(
    "Priya: CS-402 requires 4 recovery classes to cross 75%",
    priyaBunk.recoveryRequired === 4,
    `Recovery required: ${priyaBunk.recoveryRequired}`
  );
  assert(
    "Priya: CS-402 detention risk is HIGH",
    priyaBunk.detentionRisk === "HIGH",
    `Risk: ${priyaBunk.detentionRisk}`
  );

  // ─── 2. CGPA RECOVERY PROGRESSION SCENARIOS ─────────────────────────────────
  section("CGPA Recovery & SGPA Back-solving");

  const priyaRecovery = demoScenarios.runCgpaRecoveryScenario(demoPersonas.priya, 7.0);
  assert(
    "Priya: Target CGPA 7.0 is achievable in 1 semester",
    priyaRecovery.isAchievable === true,
    `Achievable: ${priyaRecovery.isAchievable}`
  );
  assert(
    "Priya: Target CGPA 7.0 requires a moderate SGPA of 7.98",
    Math.abs(priyaRecovery.requiredSgpa - 7.98) < 0.05,
    `Required SGPA: ${priyaRecovery.requiredSgpa}`
  );
  assert(
    "Priya: Target SGPA maps to a recommended grade of A",
    priyaRecovery.recommendedGrade === "A",
    `Recommended grade: ${priyaRecovery.recommendedGrade}`
  );

  const rahulRecovery = demoScenarios.runCgpaRecoveryScenario(demoPersonas.rahul, 6.5);
  assert(
    "Rahul: Target CGPA 6.5 is achievable in 1 semester",
    rahulRecovery.isAchievable === true,
    `Achievable: ${rahulRecovery.isAchievable}`
  );
  assert(
    "Rahul: Target CGPA 6.5 requires SGPA of 9.75",
    Math.abs(rahulRecovery.requiredSgpa - 9.75) < 0.05,
    `Required SGPA: ${rahulRecovery.requiredSgpa}`
  );

  const impossibleRecovery = demoScenarios.runCgpaRecoveryScenario(demoPersonas.priya, 9.8);
  assert(
    "Priya: Target CGPA 9.8 is mathematically impossible",
    impossibleRecovery.isAchievable === false,
    `Achievable: ${impossibleRecovery.isAchievable}`
  );
  assert(
    "Priya: Impossible target SGPA is flagged (requires SGPA > 10)",
    impossibleRecovery.requiredSgpa > 10.0,
    `Required SGPA: ${impossibleRecovery.requiredSgpa}`
  );

  // ─── 3. PLACEMENT ELIGIBILITY SCENARIOS ─────────────────────────────────────
  section("Placement Eligibility Recruiter Cutoffs");

  const arjunPlacements = demoScenarios.runPlacementEligibilityScenario(demoPersonas.arjun);
  assert(
    "Arjun: High CGPA, 0 backlogs is ELIGIBLE overall",
    arjunPlacements.overallStatus === "ELIGIBLE",
    `Overall: ${arjunPlacements.overallStatus}`
  );
  assert(
    "Arjun: Meets criteria for all 6/6 default recruiters",
    arjunPlacements.eligibleCount === 6,
    `Eligible count: ${arjunPlacements.eligibleCount}`
  );

  const priyaPlacements = demoScenarios.runPlacementEligibilityScenario(demoPersonas.priya);
  assert(
    "Priya: 1 active backlog makes her INELIGIBLE overall (fails strict zero-backlog companies)",
    priyaPlacements.overallStatus === "INELIGIBLE",
    `Overall: ${priyaPlacements.overallStatus}`
  );
  assert(
    "Priya: Still eligible for Cognizant and Wipro (allow 1 backlog)",
    priyaPlacements.companies.find(c => c.name.startsWith("Cognizant"))?.status === "ELIGIBLE" &&
    priyaPlacements.companies.find(c => c.name.startsWith("Wipro"))?.status === "ELIGIBLE",
    `Cognizant: ${priyaPlacements.companies.find(c => c.name.startsWith("Cognizant"))?.status}, Wipro: ${priyaPlacements.companies.find(c => c.name.startsWith("Wipro"))?.status}`
  );

  // ─── 4. FAILED SUBJECT SIMULATION ───────────────────────────────────────────
  section("Failed Subject Risk & Health Cascade");

  const arjunFail = demoScenarios.runFailedSubjectScenario(demoPersonas.arjun, "CS-401");
  assert(
    "Arjun fails CS-401: CGPA drops to 8.84",
    arjunFail.newCgpa === 8.84,
    `New CGPA: ${arjunFail.newCgpa}`
  );
  assert(
    "Arjun fails CS-401: Active backlogs count is 1",
    arjunFail.activeBacklogsCount === 1,
    `Active backlogs: ${arjunFail.activeBacklogsCount}`
  );
  assert(
    "Arjun fails CS-401: Placement eligibility changes from ELIGIBLE to INELIGIBLE",
    arjunFail.placementStatusBefore === "ELIGIBLE" && arjunFail.placementStatusAfter === "INELIGIBLE",
    `Placement before: ${arjunFail.placementStatusBefore}, after: ${arjunFail.placementStatusAfter}`
  );
  assert(
    "Arjun fails CS-401: Health score drops significantly (original: 99)",
    arjunFail.newHealthScore <= 80,
    `New health score: ${arjunFail.newHealthScore}`
  );

  // ─── 5. ATTENDANCE DROP SIMULATION ──────────────────────────────────────────
  section("Attendance Drop & Detention Risk Warning");

  const priyaDrop = demoScenarios.runAttendanceDropScenario(demoPersonas.priya, 10);
  assert(
    "Priya drops 10 lectures: Aggregate attendance drops below 75%",
    priyaDrop.newPercentage === 71.3,
    `New aggregate percentage: ${priyaDrop.newPercentage}%`
  );
  assert(
    "Priya drops 10 lectures: Attendance risk increases to HIGH",
    priyaDrop.newRisk === "HIGH",
    `New risk: ${priyaDrop.newRisk}`
  );

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Scenario Verification Suite: ${passedTests}/${totalTests} Passed.`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎉 ${colors.bright}${colors.green}ALL STUDENT FLOW SCENARIO TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 ${colors.bright}${colors.red}SOME SCENARIO TESTS FAILED. PLEASE AUDIT RECENT MODIFICATIONS.${colors.reset}\n`);
    process.exit(1);
  }
}

runScenarioTests();
