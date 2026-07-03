/**
 * Phase 3 Verification: Cramér-Lundberg Ruin Theory + SAFTE Integration
 * 
 * This test script independently verifies:
 * 1. The Python solver accepts sleepDebt/baselineFatigue SAFTE fields.
 * 2. Higher sleep debt produces higher ruin risk (mathematical causality).
 * 3. The solver returns a fully structured response with newRuinRisk.
 */

const BASE_URL = 'http://127.0.0.1:8001';

interface SolverResponse {
  classesToSkip: string[];
  classesToAttend: string[];
  freedHours: number;
  newRuinRisk: number;
  reasoning: string;
}

const MOCK_SCHEDULE = [
  { id: 'cls-1', courseCode: 'CS301', title: 'Computer Algorithms', type: 'lecture', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', isMandatory: false, penaltyWeight: 1.0 },
  { id: 'cls-2', courseCode: 'CS302', title: 'Database Systems', type: 'lecture', dayOfWeek: 'Monday', startTime: '10:00', endTime: '11:00', isMandatory: false, penaltyWeight: 0.8 },
  { id: 'cls-3', courseCode: 'CS303', title: 'Operating Systems', type: 'lab', dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '16:00', isMandatory: true, penaltyWeight: 2.0 },
];

async function waitForServer(maxRetries = 10): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/openapi.json`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function solveWith(sleepDebt: number, baselineFatigue: number): Promise<SolverResponse> {
  const res = await fetch(`${BASE_URL}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedule: MOCK_SCHEDULE,
      availableSafeBunks: 3,
      currentRuinRisk: 12.5,
      constraints: [{ type: 'block_time', targetDays: ['Monday'] }],
      sleepDebt,
      baselineFatigue,
      totalClasses: 40,
      classesConducted: 20,
      classesAttended: 17,
      targetAttendance: 0.75,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Solver returned HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  console.log('═══════════════════════════════════════════════');
  console.log('  Phase 3 Verification: Cramér-Lundberg + SAFTE');
  console.log('═══════════════════════════════════════════════\n');

  // --- Test 1: Server Health ---
  console.log('▶ Test 1: Python Solver Health Check');
  const serverUp = await waitForServer(5);
  assert(serverUp, 'Python solver is running on port 8001');
  if (!serverUp) {
    console.error('\n💀 Server is not running. Cannot continue tests.');
    process.exit(1);
  }

  // --- Test 2: Baseline Request (zero fatigue) ---
  console.log('\n▶ Test 2: Baseline Request (sleepDebt=0, fatigue=0)');
  const baseline = await solveWith(0, 0);
  assert(typeof baseline.newRuinRisk === 'number', `newRuinRisk is a number (got: ${baseline.newRuinRisk})`);
  assert(baseline.newRuinRisk >= 0 && baseline.newRuinRisk <= 100, `newRuinRisk in range [0, 100] (got: ${baseline.newRuinRisk})`);
  assert(Array.isArray(baseline.classesToSkip), 'classesToSkip is an array');
  assert(Array.isArray(baseline.classesToAttend), 'classesToAttend is an array');
  assert(typeof baseline.reasoning === 'string' && baseline.reasoning.length > 0, 'reasoning is a non-empty string');

  // --- Test 3: High Sleep Debt -> Higher Ruin Risk ---
  console.log('\n▶ Test 3: SAFTE Causality (sleepDebt=8 -> higher risk)');
  const fatigued = await solveWith(8, 0.5);
  assert(typeof fatigued.newRuinRisk === 'number', `newRuinRisk is a number (got: ${fatigued.newRuinRisk})`);
  // With high sleep debt, the Poisson lambda increases, so ruin risk should be >= baseline
  assert(
    fatigued.newRuinRisk >= baseline.newRuinRisk,
    `High sleep debt risk (${fatigued.newRuinRisk}%) >= baseline risk (${baseline.newRuinRisk}%)`
  );

  // --- Test 4: Extreme Fatigue -> Near-Certain Ruin ---
  console.log('\n▶ Test 4: Extreme Fatigue (sleepDebt=20, fatigue=0.9)');
  const extreme = await solveWith(20, 0.9);
  assert(
    extreme.newRuinRisk > baseline.newRuinRisk,
    `Extreme fatigue risk (${extreme.newRuinRisk}%) > baseline risk (${baseline.newRuinRisk}%)`
  );

  // --- Test 5: Mandatory Class Protection ---
  console.log('\n▶ Test 5: Mandatory Class Protection');
  assert(
    baseline.classesToAttend.includes('cls-3'),
    'Lab class (cls-3, mandatory) is always in classesToAttend'
  );
  assert(
    !baseline.classesToSkip.includes('cls-3'),
    'Lab class (cls-3, mandatory) is never in classesToSkip'
  );

  // --- Test 6: Schema Introspection ---
  console.log('\n▶ Test 6: Prisma Schema Introspection');
  const fs = await import('fs');
  const schemaPath = 'prisma/schema.prisma';
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8').replace(/\/\/.*$/gm, '');
  
  const hasModel = schemaContent.includes('model UserPhysicsProfile');
  assert(hasModel, 'UserPhysicsProfile model exists in schema.prisma');

  const hasCircadian = schemaContent.includes('circadianRhythm');
  assert(hasCircadian, 'circadianRhythm field exists');

  const hasSleepDebt = schemaContent.includes('sleepDebt');
  assert(hasSleepDebt, 'sleepDebt field exists');

  const hasFatigue = schemaContent.includes('baselineFatigue');
  assert(hasFatigue, 'baselineFatigue field exists');

  // --- Summary ---
  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('  🏆 PHASE 3 VERIFICATION: ALL TESTS PASSED');
  } else {
    console.log('  💀 PHASE 3 VERIFICATION: FAILURES DETECTED');
  }
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
