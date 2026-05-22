/**
 * Phase 3 Exit Criteria Tests: Forecasting Engine (Scenario Factory & Projector)
 */

import { trajectoryProjector } from "../../lib/forecasting/trajectoryProjector";
import { scenarioFactory } from "../../lib/forecasting/scenarioFactory";
import { ForecastEngineInput } from "../../lib/forecasting/types";

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

export function runForecastTests(): boolean {
  console.log(`\n${colors.bright}${colors.cyan}GradeFlow Forecasting Engine Unit Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  const arjunInput: ForecastEngineInput = {
    currentCgpa: 9.2,
    completedSemesters: 4,
    earnedCredits: 80,
    targetCgpa: 9.5,
    totalProgramSemesters: 8,
    creditsPerSemester: 20,
    currentSgpa: 9.2,
    volatility: 0.15
  };

  // ─── 1. ARJUN PROJECTION COUNT ───────────────────────────────────────────────
  section("Arjun Projection Length");
  const maintainProjections = trajectoryProjector.project(arjunInput, arjunInput.currentSgpa, 10.0);
  assert(
    "Arjun (4 semesters done, 8 total) — Maintain scenario produces 4 projections",
    maintainProjections.length === 4,
    `Projections length: ${maintainProjections.length}, Expected: 4`
  );
  if (maintainProjections.length === 4) {
    assert("Semester numbers are sequential (5, 6, 7, 8)", 
      maintainProjections[0].semester === 5 &&
      maintainProjections[1].semester === 6 &&
      maintainProjections[2].semester === 7 &&
      maintainProjections[3].semester === 8,
      `Semester numbers: ${maintainProjections.map(p => p.semester).join(", ")}`
    );
  }

  // ─── 2. SCENARIO HIERARCHY / COMPARISON ──────────────────────────────────────
  section("Scenario Comparison (Improve > Maintain > Decline)");
  const scenarios = scenarioFactory.generateAll(arjunInput, "sppu");
  const maintainScenario = scenarios.find(s => s.id === "maintain");
  const improveScenario = scenarios.find(s => s.id === "improve");
  const declineScenario = scenarios.find(s => s.id === "decline");

  assert("Maintain scenario found", !!maintainScenario);
  assert("Improve scenario found", !!improveScenario);
  assert("Decline scenario found", !!declineScenario);

  if (maintainScenario && improveScenario && declineScenario) {
    assert(
      "Improve scenario final CGPA > Maintain scenario final CGPA",
      improveScenario.finalCgpa > maintainScenario.finalCgpa,
      `Improve: ${improveScenario.finalCgpa}, Maintain: ${maintainScenario.finalCgpa}`
    );

    assert(
      "Decline scenario final CGPA < Maintain scenario final CGPA",
      declineScenario.finalCgpa < maintainScenario.finalCgpa,
      `Decline: ${declineScenario.finalCgpa}, Maintain: ${maintainScenario.finalCgpa}`
    );
  }

  // ─── 3. CONFIDENCE BAND SYMMETRY ─────────────────────────────────────────────
  section("Confidence Band Symmetry & Volatility Edge Cases");
  
  // Choose projection where bands are not capped/floored
  const proj = maintainProjections[0]; // Sem 5
  // projectedCgpa = (9.2 * 80 + 9.2 * 20) / 100 = 9.2
  // upper = 9.2 + 0.15 * 0.3 = 9.245 -> 9.25
  // lower = 9.2 - 0.15 * 0.3 = 9.155 -> 9.16
  // upperDiff = 9.25 - 9.20 = 0.05
  // lowerDiff = 9.20 - 9.16 = 0.04 (due to rounding)
  const upperDiff = proj.upper - proj.projectedCgpa;
  const lowerDiff = proj.projectedCgpa - proj.lower;
  
  assert(
    "Confidence bands are symmetric around projected CGPA (within rounding delta <= 0.01)",
    Math.abs(upperDiff - lowerDiff) <= 0.01,
    `proj.projectedCgpa: ${proj.projectedCgpa}, upper: ${proj.upper}, lower: ${proj.lower}, upperDiff: ${upperDiff}, lowerDiff: ${lowerDiff}`
  );

  // Volatility = 0
  const zeroVolInput = { ...arjunInput, volatility: 0 };
  const zeroVolProjections = trajectoryProjector.project(zeroVolInput, zeroVolInput.currentSgpa, 10.0);
  assert(
    "When volatility = 0, upper === lower === projectedCgpa",
    zeroVolProjections.every(p => p.upper === p.projectedCgpa && p.lower === p.projectedCgpa),
    `Projections with volatility 0: ${JSON.stringify(zeroVolProjections)}`
  );

  // ─── 4. CEILING SAFETY ────────────────────────────────────────────────────────
  section("SPPU 10.0 GPA Ceiling Safety");
  const perfectInput = {
    ...arjunInput,
    currentCgpa: 10.0,
    currentSgpa: 10.0,
    earnedCredits: 80,
    volatility: 0.5
  };
  // Try projecting with assumed SGPA > 10.0 or just improve scenario which has assumedSgpa = 10.0
  const perfectScenarios = scenarioFactory.generateAll(perfectInput, "sppu");
  const perfectImprove = perfectScenarios.find(s => s.id === "improve");
  assert(
    "projectedCgpa never exceeds maxGradePoint (10.0 for Indian scale)",
    perfectScenarios.every(s => s.projections.every(p => p.projectedCgpa <= 10.0)),
    `Projections: ${JSON.stringify(perfectScenarios.map(s => s.projections.map(p => p.projectedCgpa)))}`
  );
  if (perfectImprove) {
    assert(
      "Improve scenario projectedCgpa at 10.0 is capped at 10.0",
      perfectImprove.projections.every(p => p.projectedCgpa === 10.0),
      `Improve projections: ${JSON.stringify(perfectImprove.projections)}`
    );
    assert(
      "Upper confidence band is capped at 10.0",
      perfectImprove.projections.every(p => p.upper <= 10.0),
      `Improve upper bands: ${JSON.stringify(perfectImprove.projections.map(p => p.upper))}`
    );
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Forecasting Engine Suite Results: ${passedTests}/${totalTests} Passed.`);
  console.log(`${"═".repeat(60)}`);

  return passedTests === totalTests;
}
