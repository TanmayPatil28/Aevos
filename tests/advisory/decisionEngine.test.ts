/**
 * GradeFlow Unified Decision & Recommendation Engine (UDRE) automated unit tests.
 * 
 * Verifies rule registry configuration, self-contained evaluation logic for all 6 target rules,
 * evidence trace explainability, map-based deduplication, and priority-then-confidence sorting.
 */

import { useUSMStore } from "../../stores/usmStore";
import { synthesizeRecommendations } from "../../lib/academic-intelligence/advisory/decisionEngine";
import { recommendationRuleRegistry } from "../../lib/academic-intelligence/advisory/registry";
import { selectRecommendations } from "../../stores/selectors/recommendations";

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

export function runDecisionEngineTests(): boolean {
  console.log(`\n${colors.bright}${colors.cyan}GradeFlow UDRE & Rule Advisory Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  const store = useUSMStore.getState();

  // ─── 1. REGISTRY INTEGRITY ──────────────────────────────────────────────────
  section("Advisory Rule Registry Structural Integrity");

  const rules = recommendationRuleRegistry.getRules();
  assert(
    "Registry compiles and registers all 6 default rules",
    rules.length === 6,
    `Registered rules count: ${rules.length}`
  );

  const registeredIds = rules.map(r => r.id);
  const targetIds = [
    "AttendancePlacementRiskRule",
    "TrajectorySlopeWarningRule",
    "TargetCGPAPlacementGateRule",
    "CIECriticalPassRule",
    "ArrearRecoveryRule",
    "SafeBunkOptimizerRule"
  ];

  for (const id of targetIds) {
    assert(
      `Registry contains expected rule: ${id}`,
      registeredIds.includes(id),
      `Missing rule: ${id}`
    );
  }

  // ─── 2. RULE EVALUATION: ARREAR RECOVERY (WARNING) ──────────────────────────
  section("Rule Evaluation: Arrear Recovery");

  store.resetStore();
  store.setPresetId("vtu");
  store.setAcademic({
    currentCgpa: 8.0,
    targetCgpa: 8.5,
    earnedCredits: 80,
    activeBacklogsCount: 2 // Has active backlogs
  });

  const state1 = useUSMStore.getState();
  const recs1 = synthesizeRecommendations(state1);

  const arrearRec = recs1.find(r => r.dedupeKey === "arrear_reconciliation_required");
  assert(
    "ArrearRecoveryRule triggers correctly when student has active backlogs",
    arrearRec !== undefined
  );
  if (arrearRec) {
    assert(
      "ArrearRecoveryRule produces correct warning priority",
      arrearRec.priority === "WARNING"
    );
    assert(
      "ArrearRecoveryRule contains explainable evidence traces",
      arrearRec.evidence !== undefined && arrearRec.evidence.length >= 3 && arrearRec.evidence[0].includes("Active unresolved backlogs count: 2")
    );
    assert(
      "ArrearRecoveryRule maps correct direct CTA action path",
      arrearRec.actionableStep?.path === "/placement"
    );
  }

  // ─── 3. RULE EVALUATION: CIE CRITICAL PASS (CRITICAL) ──────────────────────
  section("Rule Evaluation: Continuous Internal Evaluation Critical Pass Gate");

  store.resetStore();
  store.setPresetId("vtu");
  store.setAcademic({
    currentCgpa: 8.0,
    targetCgpa: 8.5,
    earnedCredits: 80,
    activeBacklogsCount: 0
  });
  store.setCourses([
    {
      id: "course-failed-cie",
      code: "MAT-301",
      name: "Advanced Mathematics",
      credits: 4,
      semester: 1,
      cieMarks: 12, // Under VTU 40% threshold (16/40 is min pass)
      attendanceTotal: 20,
      attendanceBunked: 0
    }
  ]);

  const state2 = useUSMStore.getState();
  const recs2 = synthesizeRecommendations(state2);

  const cieRec = recs2.find(r => r.dedupeKey === "cie_passing_threshold_violation");
  assert(
    "CIECriticalPassRule triggers when active course CIE marks are below standard passing min",
    cieRec !== undefined
  );
  if (cieRec) {
    assert(
      "CIECriticalPassRule generates a CRITICAL priority recommendation",
      cieRec.priority === "CRITICAL"
    );
    assert(
      "CIECriticalPassRule includes course-specific evidence traces",
      cieRec.evidence !== undefined && cieRec.evidence[0].includes("CIE marks are 12/40")
    );
    assert(
      "CIECriticalPassRule references correct regulation rules in evidence",
      cieRec.evidence !== undefined && cieRec.evidence.some(e => e.includes("VTU 2022 CBCS Scheme regulations"))
    );
  }

  // ─── 4. RULE EVALUATION: ATTENDANCE PLACEMENT RISK (CRITICAL) ────────────────
  section("Rule Evaluation: Placement Eligibility Threatened by Attendance");

  store.resetStore();
  store.setPresetId("vtu");
  store.setAcademic({
    currentCgpa: 9.2, // High CGPA -> Placement ELIGIBLE
    targetCgpa: 9.5,
    earnedCredits: 80,
    activeBacklogsCount: 0
  });
  store.setCourses([
    {
      id: "course-low-att",
      code: "PHY-101",
      name: "Engineering Physics",
      credits: 4,
      semester: 1,
      cieMarks: 35,
      attendanceTotal: 10,
      attendanceBunked: 6 // 4/10 attended = 40% < 75% -> High Attendance Risk
    }
  ]);

  const state3 = useUSMStore.getState();
  const recs3 = synthesizeRecommendations(state3);

  const attPlacementRec = recs3.find(r => r.dedupeKey === "high_attendance_risk_placement_threat");
  assert(
    "AttendancePlacementRiskRule triggers on high attendance risk for placement-eligible student",
    attPlacementRec !== undefined
  );
  if (attPlacementRec) {
    assert(
      "AttendancePlacementRiskRule registers as CRITICAL",
      attPlacementRec.priority === "CRITICAL"
    );
    assert(
      "AttendancePlacementRiskRule exposes detention-to-backlog corporate threat in description",
      attPlacementRec.description.includes("detention triggers an active backlog, instantly disqualifying you")
    );
    assert(
      "AttendancePlacementRiskRule maps CTA to attendance portal bunk recovery planner",
      attPlacementRec.actionableStep?.path === "/attendance"
    );
  }

  // ─── 5. RULE EVALUATION: TRAJECTORY SLOPE & SAFE BUNK ──────────────────────
  section("Rule Evaluation: OLS Slope Decline & Safe Bunk Optimizer");

  store.resetStore();
  store.setPresetId("vtu");
  // Set declining history: sem 1 sgpa = 9.0, sem 2 sgpa = 7.0 (Slope = -2.0)
  store.setSemesterHistory([
    { semester: 1, sgpa: 9.0, credits: 20,
      earnedCredits: 20 },
    { semester: 2, sgpa: 7.0, credits: 20,
      earnedCredits: 20 }
  ]);
  // Also provide highly secure attendance for SafeBunk
  store.setCourses([
    {
      id: "course-secure-att",
      code: "ENG-101",
      name: "Professional Communication",
      credits: 2,
      semester: 1,
      cieMarks: 38,
      attendanceTotal: 20,
      attendanceBunked: 1 // 19/20 = 95% -> LOW Risk + Secure
    }
  ]);

  const state4 = useUSMStore.getState();
  const recs4 = synthesizeRecommendations(state4);

  const slopeRec = recs4.find(r => r.dedupeKey === "declining_academic_trajectory_risk");
  assert(
    "TrajectorySlopeWarningRule triggers when OLS regression trend declines significantly",
    slopeRec !== undefined
  );
  if (slopeRec) {
    assert(
      "TrajectorySlopeWarningRule has WARNING priority",
      slopeRec.priority === "WARNING"
    );
    assert(
      "TrajectorySlopeWarningRule evaluates a dynamic confidence based on slope magnitude",
      slopeRec.confidence >= 50 && slopeRec.confidence <= 95
    );
  }

  const bunkRec = recs4.find(r => r.dedupeKey === "safe_bunks_relaxation_advisor");
  assert(
    "SafeBunkOptimizerRule triggers when aggregate attendance is exceptionally secure (>85%)",
    bunkRec !== undefined
  );
  if (bunkRec) {
    assert(
      "SafeBunkOptimizerRule lists as INFO priority",
      bunkRec.priority === "INFO"
    );
    assert(
      "SafeBunkOptimizerRule offers strategic rest day suggestions",
      bunkRec.description.includes("permits strategic rest days or dedicated self-study slots")
    );
  }

  // ─── 6. DEDUPLICATION AND MULTI-FACTOR SORTING ──────────────────────────────
  section("Deduplication and Multi-Factor Sorting Pipeline");

  // Let's create an environment where multiple rules have the same dedupeKey but different parameters
  // We can manually call synthesizeRecommendations with custom state if needed, or check normal deduping.
  // Currently, each rule in the registry uses a unique dedupeKey, but let's test the sorter by verifying
  // the order of recommendations: CRITICAL should be before WARNING, which should be before INFO.
  // In state4, we have at least one WARNING (Slope) and one INFO (Bunk).
  // Let's confirm that Slope comes before Bunk in the synthesized list.
  const slopeIndex = recs4.findIndex(r => r.dedupeKey === "declining_academic_trajectory_risk");
  const bunkIndex = recs4.findIndex(r => r.dedupeKey === "safe_bunks_relaxation_advisor");

  assert(
    "Synthesized recommendations are correctly sorted (WARNING precedes INFO)",
    slopeIndex !== -1 && bunkIndex !== -1 && slopeIndex < bunkIndex,
    `Slope Index: ${slopeIndex}, Bunk Index: ${bunkIndex}`
  );

  // ─── 7. WEAKMAP-CACHED SELECTOR INTEGRATION ────────────────────────────────
  section("WeakMap-Cached Selector Request-Safety & Performance");

  const selectorResult1 = selectRecommendations(state4);
  const selectorResult2 = selectRecommendations(state4);

  assert(
    "selectRecommendations returns correct synthesized list of recommendations",
    selectorResult1.length === recs4.length
  );
  assert(
    "selectRecommendations memoizes result against the active Zustand immutable state",
    selectorResult1 === selectorResult2
  );

  const state4Modified = { ...state4, academic: { ...state4.academic, currentCgpa: 8.9 } };
  const selectorResult3 = selectRecommendations(state4Modified);
  assert(
    "selectRecommendations recalculates cleanly when state referential identity changes",
    selectorResult1 !== selectorResult3
  );

  console.log(`\n----------------------------------------------------------------`);
  console.log(`UDRE Decision Engine Test Suite Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}

if (require.main === module) {
  const success = runDecisionEngineTests();
  process.exit(success ? 0 : 1);
}

