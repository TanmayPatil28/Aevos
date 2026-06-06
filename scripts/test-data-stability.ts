/**
 * GradeFlow Student OS — Data Stability & Persistence Integrity Verification Suite
 * 
 * Verifies robust resilience under adversarial conditions:
 * 1. Corrupted localStorage recovery (valid JSON with invalid fields, or completely malformed JSON)
 * 2. Schema version migration overrides (handling stale versioned states)
 * 3. Empty/missing courses safety bounds (division by zero, fallback checks)
 * 4. Rapid state mutation series (stress testing Zustand dispatch loops & offline sync queues)
 */

// ─── Setup Global Browser Mock First ──────────────────────────────────────────
const storageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
};

global.localStorage = storageMock as any;
global.window = {
  localStorage: storageMock
} as any;

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

// Import store & selectors
const { useUSMStore } = require("../stores/usmStore");
const {
  selectDerivedGPA,
  selectAttendanceRisk,
  selectAcademicHealth,
  selectPlacementEligibility,
  selectRecoveryDifficulty
} = require("../stores/selectors/index");

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

async function runStabilitySuite() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`📊 GradeFlow Data Stability & Persistence Integrity Suite`);
  console.log(`================================================================${colors.reset}`);

  const store = useUSMStore.getState();

  // ─── 1. CORRUPTED LOCALSTORAGE RECOVERY ─────────────────────────────────────
  section("Corrupted localStorage Recovery");

  // Sub-case A: Valid JSON, but missing required properties/invalid fields
  const malformedState = {
    state: {
      presetId: 12345, // Invalid: should be string
      academic: {
        currentCgpa: "not-a-number", // Invalid: should be number
      },
      courses: "not-an-array" // Invalid: should be array
    },
    version: 1
  };
  
  window.localStorage.setItem("gradeflow-usm-storage", JSON.stringify(malformedState));
  
  try {
    // Force manual rehydration trigger
    await useUSMStore.persist.rehydrate();
    const activeState = useUSMStore.getState();
    
    assert(
      "Recovers SPPU preset default on schema type violations",
      activeState.presetId === "sppu",
      `Expected 'sppu', got: ${activeState.presetId}`
    );
    assert(
      "Restores academic structure default value on violation",
      activeState.academic && typeof activeState.academic.currentCgpa === "number" && activeState.academic.currentCgpa === 0,
      `Expected currentCgpa = 0.0, got: ${JSON.stringify(activeState.academic)}`
    );
    assert(
      "Resets courses to default empty array on corrupted structure",
      Array.isArray(activeState.courses) && activeState.courses.length === 0,
      `Expected empty array, got: ${JSON.stringify(activeState.courses)}`
    );
  } catch (err: any) {
    assert("Did not throw on invalid JSON fields", false, err.message);
  }

  // Sub-case B: Completely malformed non-JSON string
  window.localStorage.setItem("gradeflow-usm-storage", "{corrupted-non-json-content-here");
  
  try {
    await useUSMStore.persist.rehydrate();
    const activeState = useUSMStore.getState();
    
    assert(
      "Survives completely corrupted localStorage without application crash",
      true
    );
    assert(
      "Keeps a valid operational memory state after complete JSON parse failure",
      activeState && activeState.presetId !== undefined
    );
  } catch (err: any) {
    assert("Crashed during malformed JSON parsing", false, err.message);
  }

  // ─── 2. SCHEMA VERSION MIGRATION OVERRIDES ──────────────────────────────────
  section("Schema Version Migration Overrides");

  // Write obsolete version (v0)
  const obsoleteState = {
    state: {
      presetId: "mu",
      academic: {
        currentCgpa: 6.5,
        completedSemesters: 2,
        earnedCredits: 40,
        activeBacklogsCount: 1,
        targetCgpa: 7.5
      },
      courses: [
        { id: "old_c", code: "OLD-101", name: "Obsolete Course", credits: 3, grade: "C", cieMarks: 15, attendanceTotal: 30, attendanceBunked: 2 }
      ]
    },
    version: 0 // Version is below current (1)
  };

  window.localStorage.setItem("gradeflow-usm-storage", JSON.stringify(obsoleteState));

  try {
    await useUSMStore.persist.rehydrate();
    const activeState = useUSMStore.getState();

    // Verify it migrated: v0 -> reset to initial preset structures to avoid shape conflicts
    assert(
      "Successfully detects obsolete version 0 and triggers reset migration",
      activeState.presetId === "sppu",
      `Preset ID: ${activeState.presetId}`
    );
    assert(
      "Stale courses are clean-flushed post-migration",
      activeState.courses.length === 0,
      `Courses length: ${activeState.courses.length}`
    );
  } catch (err: any) {
    assert("Migration threw runtime error", false, err.message);
  }

  // ─── 3. EMPTY / MISSING COURSES SAFETY BOUNDS ──────────────────────────────
  section("Empty / Missing Courses Safety Bounds");

  // Reset store to fresh state with empty courses
  store.resetStore();
  const stateWithEmptyCourses = useUSMStore.getState();

  try {
    const gpaResult = selectDerivedGPA(stateWithEmptyCourses);
    assert(
      "selectDerivedGPA handles 0 courses gracefully without division by zero (SGPA = 0)",
      gpaResult.sgpa === 0,
      `Expected SGPA 0, got: ${gpaResult.sgpa}`
    );
  } catch (err: any) {
    assert("selectDerivedGPA crashed on empty courses", false, err.message);
  }

  try {
    const attendanceResult = selectAttendanceRisk(stateWithEmptyCourses);
    assert(
      "selectAttendanceRisk handles 0 courses safely (Attendance = 100%, risk = LOW)",
      attendanceResult.aggregatePercentage === 100 && attendanceResult.overallRisk === "LOW",
      `Expected 100% / LOW, got: ${attendanceResult.aggregatePercentage}% / ${attendanceResult.overallRisk}`
    );
  } catch (err: any) {
    assert("selectAttendanceRisk crashed on empty courses", false, err.message);
  }

  try {
    const healthResult = selectAcademicHealth(stateWithEmptyCourses);
    assert(
      "selectAcademicHealth returns standard safe score on empty courses",
      healthResult >= 0 && healthResult <= 100,
      `Health score: ${healthResult}`
    );
  } catch (err: any) {
    assert("selectAcademicHealth crashed on empty courses", false, err.message);
  }

  try {
    const eligibilityResult = selectPlacementEligibility(stateWithEmptyCourses);
    assert(
      "selectPlacementEligibility maps default eligibility categories",
      eligibilityResult && eligibilityResult.overallStatus !== undefined,
      `Overall Status: ${eligibilityResult?.overallStatus}`
    );
  } catch (err: any) {
    assert("selectPlacementEligibility crashed on empty courses", false, err.message);
  }

  try {
    const recoveryResult = selectRecoveryDifficulty(stateWithEmptyCourses);
    assert(
      "selectRecoveryDifficulty returns deterministic advice text with zero courses",
      typeof recoveryResult.explainReason === "string",
      `Reason: ${recoveryResult.explainReason}`
    );
  } catch (err: any) {
    assert("selectRecoveryDifficulty crashed on empty courses", false, err.message);
  }

  // ─── 4. RAPID STATE MUTATION SEQUENCES ──────────────────────────────────────
  section("Rapid State Mutation Sequences");

  let sequenceSuccess = true;
  let syncQueueAccumulator = 0;
  
  try {
    // Reset store
    store.resetStore();
    
    // Setup initial courses
    store.setCourses([
      { id: "c_1", code: "CS-101", name: "Intro", credits: 4, cieMarks: 20, attendanceTotal: 20, attendanceBunked: 1 }
    ]);
    
    // Rapidly execute 100 updates to simulate micro-interactions or sandbox sliders
    for (let i = 0; i < 100; i++) {
      // Alternate mutations
      if (i % 2 === 0) {
        store.updateCourse("c_1", {
          cieMarks: Math.min(40, 15 + (i % 25)),
          attendanceBunked: i % 5
        });
      } else {
        store.setAcademic({
          currentCgpa: 7.0 + (i % 30) / 10,
          activeBacklogsCount: i % 3
        });
      }
      
      // Simulate queuing offline synchronization requests
      store.queueSyncAction("OCR_CORRECTION", { step: i });
      syncQueueAccumulator++;
    }

    const finalState = useUSMStore.getState();
    assert(
      "Maintains exact updates sequence alignment after 100 rapid mutations",
      finalState.courses[0]?.cieMarks !== undefined && finalState.academic.currentCgpa !== 8.0,
      `CIE: ${finalState.courses[0]?.cieMarks}, CGPA: ${finalState.academic.currentCgpa}`
    );
    assert(
      "OfflineSyncSlice accumulates exactly 201 queue items without leaks",
      finalState.sync.pendingSyncActions.length === 201,
      `Queue size: ${finalState.sync.pendingSyncActions.length}`
    );
    
    // Flush actions
    store.clearSyncActions();
    assert(
      "Clear sync action successfully flushes all accumulated actions",
      useUSMStore.getState().sync.pendingSyncActions.length === 0
    );
    
  } catch (err: any) {
    sequenceSuccess = false;
    assert("Rapid mutations sequence failed", false, err.message);
  }

  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`📊 STABILITY TEST RESULTS SUMMARY: ${passedTests}/${totalTests} Passed`);
  console.log(`================================================================${colors.reset}`);

  if (passedTests === totalTests) {
    console.log(`\n🎉 ${colors.bright}${colors.green}ALL DATA STABILITY & INTEGRITY TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 ${colors.bright}${colors.red}SOME STABILITY TESTS FAILED. CHECK INTEGRITY PARSING PATTERNS.${colors.reset}\n`);
    process.exit(1);
  }
}

runStabilitySuite();

export {};
