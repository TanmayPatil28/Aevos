/**
 * Phase 1 Exit Criteria Tests: Context Engine Selectors
 * 
 * Tests selectVolatility, selectTrajectorySlope, and selectCompositeRisk
 * against the 3 demo personas (Arjun, Priya, Rahul) and edge cases.
 */

import { USMStoreState } from "../../stores/usmStore";
import {
  selectVolatility,
  selectTrajectorySlope,
  selectCompositeRisk,
} from "../../stores/selectors";
import { demoPersonas } from "../../lib/demo/demo-personas";

// ─── Helper: Build a minimal USMStoreState from a DemoPersona ────────────────
function buildStateFromPersona(personaId: string): USMStoreState {
  const persona = demoPersonas[personaId];
  if (!persona) throw new Error(`Persona ${personaId} not found`);

  return {
    presetId: persona.presetId,
    academic: persona.academic,
    courses: persona.courses,
    semesterHistory: persona.semesterHistory,
    simulation: {
      isSimulating: false,
      activeSnapshotId: undefined,
      history: [],
      simulatedCourses: {},
      simulatedAttendance: {},
    },
    career: persona.career,
    sync: { pendingSyncActions: [] },
    // Stub actions (not used by selectors)
    setPresetId: () => {},
    setAcademic: () => {},
    setCourses: () => {},
    updateCourse: () => {},
    startSimulation: () => {},
    stopSimulation: () => {},
    updateSimulatedCourse: () => {},
    updateSimulatedAttendance: () => {},
    saveSimulationSnapshot: () => "",
    loadSimulationSnapshot: () => {},
    deleteSimulationSnapshot: () => {},
    resetSimulation: () => {},
    setSemesterHistory: () => {},
    addSemesterEntry: () => {},
    setCareer: () => {},
    queueSyncAction: () => {},
    clearSyncActions: () => {},
    resetStore: () => {},
  } as USMStoreState;
}

// ─── Test Runner ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertApproxEqual(actual: number, expected: number, tolerance: number, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} — expected ~${expected}, got ${actual}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. selectVolatility Tests
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n📊 selectVolatility Tests");

test("Returns 0 for empty semesterHistory", () => {
  const state = buildStateFromPersona("arjun");
  state.semesterHistory = [];
  const vol = selectVolatility(state);
  assert(vol === 0, `Expected 0, got ${vol}`);
});

test("Returns 0 for single-semester history", () => {
  const state = buildStateFromPersona("arjun");
  state.semesterHistory = [{ semester: 1, sgpa: 8.0, credits: 20, earnedCredits: 20 }];
  const vol = selectVolatility(state);
  assert(vol === 0, `Expected 0, got ${vol}`);
});

test("Arjun (improving 7.5→9.2) has low volatility", () => {
  const state = buildStateFromPersona("arjun");
  const vol = selectVolatility(state);
  // SGPA: [7.5, 8.2, 8.8, 9.2] — steady rise, low std dev
  assert(vol > 0, `Expected volatility > 0, got ${vol}`);
  assert(vol < 1.0, `Expected volatility < 1.0, got ${vol}`);
});

test("Rahul (declining 7.0→5.5) has measurable volatility", () => {
  const state = buildStateFromPersona("rahul");
  const vol = selectVolatility(state);
  assert(vol > 0, `Expected volatility > 0, got ${vol}`);
});

test("Priya (recovery 6.0→5.8→7.2→7.5) has higher volatility than Arjun", () => {
  const arjunState = buildStateFromPersona("arjun");
  const priyaState = buildStateFromPersona("priya");
  const arjunVol = selectVolatility(arjunState);
  const priyaVol = selectVolatility(priyaState);
  assert(priyaVol > arjunVol, `Expected Priya vol (${priyaVol}) > Arjun vol (${arjunVol})`);
});

// Verify actual std dev math for Arjun
test("Arjun volatility matches manual std dev calculation", () => {
  const state = buildStateFromPersona("arjun");
  const vol = selectVolatility(state);
  // Manual: mean = (7.5+8.2+8.8+9.2)/4 = 8.425
  // variance = ((7.5-8.425)^2 + (8.2-8.425)^2 + (8.8-8.425)^2 + (9.2-8.425)^2) / 3
  //          = (0.855625 + 0.050625 + 0.140625 + 0.600625) / 3
  //          = 1.6475 / 3 = 0.549167
  // stddev = sqrt(0.549167) = 0.741
  assertApproxEqual(vol, 0.741, 0.01, "Arjun volatility");
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. selectTrajectorySlope Tests
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n📈 selectTrajectorySlope Tests");

test("Returns 0 for empty semesterHistory", () => {
  const state = buildStateFromPersona("arjun");
  state.semesterHistory = [];
  const slope = selectTrajectorySlope(state);
  assert(slope === 0, `Expected 0, got ${slope}`);
});

test("Returns 0 for single-semester history", () => {
  const state = buildStateFromPersona("arjun");
  state.semesterHistory = [{ semester: 1, sgpa: 8.0, credits: 20, earnedCredits: 20 }];
  const slope = selectTrajectorySlope(state);
  assert(slope === 0, `Expected 0, got ${slope}`);
});

test("Arjun (improving) has POSITIVE slope", () => {
  const state = buildStateFromPersona("arjun");
  const slope = selectTrajectorySlope(state);
  assert(slope > 0, `Expected positive slope for improving student, got ${slope}`);
});

test("Rahul (declining) has NEGATIVE slope", () => {
  const state = buildStateFromPersona("rahul");
  const slope = selectTrajectorySlope(state);
  assert(slope < 0, `Expected negative slope for declining student, got ${slope}`);
});

test("Priya (recovery) has POSITIVE slope overall", () => {
  const state = buildStateFromPersona("priya");
  const slope = selectTrajectorySlope(state);
  // 6.0→5.8→7.2→7.5: overall trend is upward despite dip in sem 2
  assert(slope > 0, `Expected positive slope for recovery student, got ${slope}`);
});

test("Both Arjun and Priya have positive slopes (both improving)", () => {
  const arjunState = buildStateFromPersona("arjun");
  const priyaState = buildStateFromPersona("priya");
  const arjunSlope = selectTrajectorySlope(arjunState);
  const priyaSlope = selectTrajectorySlope(priyaState);
  assert(arjunSlope > 0, `Expected Arjun slope positive, got ${arjunSlope}`);
  assert(priyaSlope > 0, `Expected Priya slope positive, got ${priyaSlope}`);
  // Arjun is steadier (lower volatility) even if slopes are similar
  const arjunVol = selectVolatility(arjunState);
  const priyaVol = selectVolatility(priyaState);
  assert(arjunVol < priyaVol, `Expected Arjun vol (${arjunVol}) < Priya vol (${priyaVol}) — steadier`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. selectCompositeRisk Tests
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n🛡️  selectCompositeRisk Tests");

test("Arjun (0 backlogs) has backlogRisk LOW", () => {
  const state = buildStateFromPersona("arjun");
  const risk = selectCompositeRisk(state);
  assert(risk.backlogRisk === "LOW", `Expected LOW, got ${risk.backlogRisk}`);
});

test("Priya (1 backlog) has backlogRisk MEDIUM", () => {
  const state = buildStateFromPersona("priya");
  const risk = selectCompositeRisk(state);
  assert(risk.backlogRisk === "MEDIUM", `Expected MEDIUM, got ${risk.backlogRisk}`);
});

test("Rahul (2 backlogs) has backlogRisk HIGH", () => {
  const state = buildStateFromPersona("rahul");
  const risk = selectCompositeRisk(state);
  assert(risk.backlogRisk === "HIGH", `Expected HIGH, got ${risk.backlogRisk}`);
});

test("Arjun composite risk has cgpaVolatility > 0", () => {
  const state = buildStateFromPersona("arjun");
  const risk = selectCompositeRisk(state);
  assert(risk.cgpaVolatility > 0, `Expected cgpaVolatility > 0, got ${risk.cgpaVolatility}`);
});

test("All RiskState fields are present in composite risk", () => {
  const state = buildStateFromPersona("arjun");
  const risk = selectCompositeRisk(state);
  assert("attendanceRisk" in risk, "Missing attendanceRisk");
  assert("backlogRisk" in risk, "Missing backlogRisk");
  assert("detentionRisk" in risk, "Missing detentionRisk");
  assert("placementRisk" in risk, "Missing placementRisk");
  assert("cgpaVolatility" in risk, "Missing cgpaVolatility");
});

test("Composite risk returns valid enum values", () => {
  const validRisk = ["LOW", "MEDIUM", "HIGH"];
  for (const personaId of ["arjun", "priya", "rahul"]) {
    const state = buildStateFromPersona(personaId);
    const risk = selectCompositeRisk(state);
    assert(validRisk.includes(risk.attendanceRisk), `Invalid attendanceRisk: ${risk.attendanceRisk}`);
    assert(validRisk.includes(risk.backlogRisk), `Invalid backlogRisk: ${risk.backlogRisk}`);
    assert(validRisk.includes(risk.detentionRisk), `Invalid detentionRisk: ${risk.detentionRisk}`);
    assert(validRisk.includes(risk.placementRisk), `Invalid placementRisk: ${risk.placementRisk}`);
    assert(typeof risk.cgpaVolatility === "number", `cgpaVolatility should be number`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Store Migration Test
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n🔄 Store Migration Tests");

test("semesterHistory defaults to empty array in DemoPersona type", () => {
  for (const personaId of ["arjun", "priya", "rahul"]) {
    const persona = demoPersonas[personaId];
    assert(Array.isArray(persona.semesterHistory), `${personaId}.semesterHistory should be array`);
    assert(persona.semesterHistory.length > 0, `${personaId}.semesterHistory should have entries`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════════════
console.log(`\n${"═".repeat(60)}`);
console.log(`Phase 1 Exit Criteria: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(60)}`);

if (failed > 0) {
  process.exit(1);
}
