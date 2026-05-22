/**
 * GradeFlow Student OS — Master Unit Test Runner
 * 
 * Aggregates and runs all unit tests for the State Machine, derived selectors,
 * calculation engines, persistence layers, and explainability systems.
 */

// ─── Setup Global Browser Mock First to prevent hoisting issues ──────────────
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

// Use require instead of ES import to execute setups before store hydration
const { runEnginesTests } = require("../tests/simulation/engines.test");
const { runStoreTests } = require("../tests/stores/usmStore.test");

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

async function executeAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`🚀 GradeFlow Phase-A MVP Master Unit Verification Suite`);
  console.log(`================================================================${colors.reset}`);

  let enginesSuccess = false;
  let storeSuccess = false;

  try {
    enginesSuccess = runEnginesTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing calculation engines tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    storeSuccess = runStoreTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing Zustand store & selectors tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`📊 MASTER TEST RESULTS SUMMARY`);
  console.log(`================================================================${colors.reset}`);
  
  if (enginesSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Deterministic Calculation Engines`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Deterministic Calculation Engines`);
  }

  if (storeSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Zustand USM Store & selectors Persistence`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Zustand USM Store & selectors Persistence`);
  }

  console.log(`----------------------------------------------------------------`);

  if (enginesSuccess && storeSuccess) {
    console.log(`\n🎉 ${colors.bright}${colors.green}ALL PHASE-A MVP UNIT TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 ${colors.bright}${colors.red}SOME UNIT TESTS FAILED. PLEASE AUDIT RECENT MODIFICATIONS.${colors.reset}\n`);
    process.exit(1);
  }
}

executeAllTests();

export {};
