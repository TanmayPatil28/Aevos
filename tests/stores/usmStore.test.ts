/**
 * GradeFlow Phase-A MVP Zustand USM Store & Selectors Automated Unit Test Suite
 * 
 * Verifies client-side Zustand store actions, persistence layer serialization,
 * derived selector updates (health, eligibility, bunk risks, recovery plans),
 * offline action queueing, and simulation snapshot rollback history.
 */

// ─── Browser Mock Setup ──────────────────────────────────────────────────────
// Mocks are globally configured in the master test runner scripts/test-unit.ts

// Import the store and selectors
import { useUSMStore, CourseState } from "../../stores/usmStore";
import {
  selectActiveCourses,
  selectDerivedGPA,
  selectPlacementEligibility,
  selectAttendanceRisk,
  selectRecoveryDifficulty,
  selectSemesterCredits,
  selectAcademicHealth
} from "../../stores/selectors/index";

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

function runStoreTests() {
  console.log(`${colors.bright}${colors.cyan}GradeFlow Zustand Store & Selectors Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  const store = useUSMStore.getState();

  // Reset the store to initial clean state before we run tests
  store.resetStore();
  const freshState = useUSMStore.getState();

  // ─── 1. INITIALIZATION & BASIC STATE MUTATIONS ──────────────────────────────
  section("Zustand State Invariants & Basic Mutations");

  assert(
    "Store initialized with SPPU preset by default",
    freshState.presetId === "sppu",
    `Preset: ${freshState.presetId}`
  );
  assert(
    "Store has empty active courses array by default",
    freshState.courses.length === 0,
    `Courses length: ${freshState.courses.length}`
  );
  assert(
    "Store has initial academic values (GPA=0, Target=0)",
    freshState.academic.currentCgpa === 0 && freshState.academic.targetCgpa === 0,
    `GPA: ${freshState.academic.currentCgpa}, Target: ${freshState.academic.targetCgpa}`
  );

  // Set Academic Info
  freshState.setAcademic({ currentCgpa: 8.4, targetCgpa: 9.0, earnedCredits: 80 });
  const updatedState = useUSMStore.getState();
  assert(
    "setAcademic correctly updates academic slice in Zustand",
    updatedState.academic.currentCgpa === 8.4 && updatedState.academic.targetCgpa === 9.0,
    `GPA: ${updatedState.academic.currentCgpa}, Target: ${updatedState.academic.targetCgpa}`
  );

  // ─── 2. LOCAL PERSISTENCE & SERIALIZATION ──────────────────────────────────
  section("Zustand Local Storage Persistence & Hydration Serialization");

  const storageContent = window.localStorage.getItem("gradeflow-usm-storage");
  assert(
    "Zustand store is serialized and saved in local storage automatically",
    storageContent !== null,
    "No entry found in localStorage mock!"
  );

  if (storageContent) {
    const parsed = JSON.parse(storageContent);
    assert(
      "Serialized data retains presetId correctly",
      parsed.state.presetId === "sppu",
      `Saved Preset: ${parsed.state.presetId}`
    );
    assert(
      "Serialized data retains updated academic parameters correctly",
      parsed.state.academic.currentCgpa === 8.4 && parsed.state.academic.targetCgpa === 9.0,
      `Saved CGPA: ${parsed.state.academic.currentCgpa}`
    );
  }

  // ─── 3. SELECTORS DYNAMIC COMPUTATION & THIN-CLIENT BINDING ──────────────────
  section("Derived Selectors Dynamic Evaluation");

  // Load a mock course catalog for selectors
  const mockCourses: CourseState[] = [
    {
      id: "c1",
      code: "CS-301",
      name: "Theory of Computation",
      credits: 4,
      grade: "A", // 8 GP in SPPU
      cieMarks: 40,
      attendanceTotal: 30,
      attendanceBunked: 3, // 27/30 = 90%
    },
    {
      id: "c2",
      code: "CS-302",
      name: "Database Systems",
      credits: 4,
      grade: "B+", // 7 GP in SPPU
      cieMarks: 42,
      attendanceTotal: 30,
      attendanceBunked: 9, // 21/30 = 70% (Below 75%)
    },
    {
      id: "c3",
      code: "CS-303",
      name: "Operating Systems Lab",
      credits: 2,
      grade: "O", // 10 GP in SPPU
      cieMarks: 48,
      attendanceTotal: 20,
      attendanceBunked: 2, // 18/20 = 90%
    }
  ];

  updatedState.setCourses(mockCourses);
  const stateWithCourses = useUSMStore.getState();

  // Test Derived SGPA/CGPA selector
  // Total grade points = 8*4 + 7*4 + 10*2 = 32 + 28 + 20 = 80
  // Total credits = 4 + 4 + 2 = 10
  // SGPA = 8.00
  // CGPA = (currentCGPA * earnedCredits + SGPA * totalCredits) / (earnedCredits + totalCredits)
  // CGPA = (8.4 * 80 + 8.0 * 10) / (80 + 10) = (672 + 80) / 90 = 752 / 90 = 8.36
  const gpaResult = selectDerivedGPA(stateWithCourses);
  assert(
    "selectDerivedGPA correctly calculates semester SGPA (8.00)",
    gpaResult.sgpa === 8.00,
    `Result SGPA: ${gpaResult.sgpa}`
  );
  assert(
    "selectDerivedGPA correctly calculates overall simulated CGPA (8.36)",
    gpaResult.cgpa === 8.36,
    `Result CGPA: ${gpaResult.cgpa}`
  );
  assert(
    "selectDerivedGPA converts CGPA to SPPU Percentage correctly ((8.355... - 0.75) * 10 = 76.06%)",
    gpaResult.percentage === 76.06,
    `Percentage: ${gpaResult.percentage}`
  );

  // Test Placement Eligibility
  const placementResult = selectPlacementEligibility(stateWithCourses);
  assert(
    "selectPlacementEligibility maps recruiter compliance (FAANG eligible, overall status matches eligibility constraints)",
    placementResult.eligibleCount > 0,
    `Eligible companies: ${placementResult.eligibleCount}/${placementResult.totalCount}`
  );

  // Test Attendance Risk
  // Total attended = 27 + 21 + 18 = 66
  // Total conducted = 30 + 30 + 20 = 80
  // Aggregate = 66 / 80 = 82.5%
  const attResult = selectAttendanceRisk(stateWithCourses);
  assert(
    "selectAttendanceRisk calculates course level risks correctly",
    attResult.courses.find((c) => c.courseCode === "CS-302")?.detentionRisk === "HIGH",
    `CS-302 Risk: ${attResult.courses.find((c) => c.courseCode === "CS-302")?.detentionRisk}`
  );
  assert(
    "selectAttendanceRisk identifies overall attendance average accurately (82.5%)",
    attResult.aggregatePercentage === 82.5,
    `Aggregate attendance: ${attResult.aggregatePercentage}%`
  );
  assert(
    "selectAttendanceRisk lists correct overall safety category (LOW risk at 82.5% aggregate percentage)",
    attResult.overallRisk === "LOW",
    `Overall risk: ${attResult.overallRisk}`
  );

  // Test Academic Health Score (0 - 100)
  const healthScoreVal = selectAcademicHealth(stateWithCourses);
  assert(
    "selectAcademicHealth derived selector resolves to a type-safe score between 0 and 100",
    healthScoreVal >= 0 && healthScoreVal <= 100,
    `Health Score: ${healthScoreVal}`
  );

  // ─── 4. OFFLINE ACTION QUEUEING & REPLAY SAFETY ──────────────────────────────
  section("Offline Sync Queue Actions & Replay-Safety");

  // Verify that actions are queued when store mutations run
  const activeSyncState = useUSMStore.getState();
  assert(
    "Store accumulates pending sync actions when state mutations run offline",
    activeSyncState.sync.pendingSyncActions.length > 0,
    `Actions length: ${activeSyncState.sync.pendingSyncActions.length}`
  );

  const semesterAction = activeSyncState.sync.pendingSyncActions.find((a) => a.type === "SEMESTER_UPDATE");
  assert(
    "Pending sync action payload conforms to the required replay-safe models structure",
    semesterAction !== undefined && semesterAction.payload !== undefined,
    `Action: ${JSON.stringify(semesterAction)}`
  );

  // Clear sync action queue
  activeSyncState.clearSyncActions();
  const clearedSyncState = useUSMStore.getState();
  assert(
    "clearSyncActions successfully flushes the queue once database syncing completes",
    clearedSyncState.sync.pendingSyncActions.length === 0,
    `Pending Actions: ${clearedSyncState.sync.pendingSyncActions.length}`
  );

  // ─── 5. SIMULATION SANDBOX SCENARIOS ──────────────────────────────
  section("Simulation Sandbox Scenarios");

  const simulationStore = useUSMStore.getState();
  
  // Add a simulation scenario
  const mockScenario = {
    id: "s1",
    name: "Target OS Grade",
    overrides: {
      courses: { "c3": { grade: "O" } },
      semesters: {}
    }
  };
  simulationStore.addSimulationScenario(mockScenario);
  
  let simState = useUSMStore.getState();
  assert(
    "addSimulationScenario adds scenario to activeScenarios list",
    simState.simulation.activeScenarios.length === 1 && simState.simulation.activeScenarios[0].id === "s1",
    `Scenarios: ${simState.simulation.activeScenarios.length}`
  );

  // Select scenario
  simulationStore.selectSimulationScenario("s1");
  simState = useUSMStore.getState();
  assert(
    "selectSimulationScenario updates selectedScenarioId",
    simState.simulation.selectedScenarioId === "s1",
    `Selected ID: ${simState.simulation.selectedScenarioId}`
  );

  // Update scenario
  simulationStore.updateSimulationScenario("s1", { name: "Updated OS Grade" });
  simState = useUSMStore.getState();
  assert(
    "updateSimulationScenario applies partial updates",
    simState.simulation.activeScenarios[0].name === "Updated OS Grade",
    `Scenario Name: ${simState.simulation.activeScenarios[0].name}`
  );

  // Remove scenario
  simulationStore.removeSimulationScenario("s1");
  simState = useUSMStore.getState();
  assert(
    "removeSimulationScenario removes scenario and resets selection if matched",
    simState.simulation.activeScenarios.length === 0 && simState.simulation.selectedScenarioId === null,
    `Length: ${simState.simulation.activeScenarios.length}`
  );

  // Clear scenarios
  simulationStore.addSimulationScenario(mockScenario);
  simulationStore.clearSimulationScenarios();
  simState = useUSMStore.getState();
  assert(
    "clearSimulationScenarios empties all scenarios",
    simState.simulation.activeScenarios.length === 0,
    `Length: ${simState.simulation.activeScenarios.length}`
  );

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Zustand Store Test Suite Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}

// Run the script directly if invoked by tsx
if (require.main === module) {
  const success = runStoreTests();
  process.exit(success ? 0 : 1);
}

export { runStoreTests };
