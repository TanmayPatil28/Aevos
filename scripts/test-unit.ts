/**
 * GradeFlow Student OS — Master Unit Test Runner
 * 
 * Aggregates and runs all unit tests for the State Machine, derived selectors,
 * calculation engines, persistence layers, explainability systems, and AI infrastructure.
 */

import "dotenv/config";

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

const { runEnginesTests } = require("../tests/simulation/engines.test");
const { runStoreTests } = require("../tests/stores/usmStore.test");
const { runStrategyTests } = require("../tests/strategy/strategy.test");
const { runForecastTests } = require("../tests/forecasting/forecast.test");
const { runIngestionTests } = require("../tests/ingestion/ingestion.test");
const { runSmartImportTests } = require("../tests/ingestion/smartImport.test");
const { runCareerTests } = require("../tests/career/placement.test");
const { runAttendanceTests } = require("../tests/attendance/bunk.test");
const { runDecisionEngineTests } = require("../tests/advisory/decisionEngine.test");
const { runAIInfrastructureTests } = require("../tests/ai/infrastructure.test");
const { runStartRecoveryValidationTests } = require("../tests/api/startRecoveryValidation.test");
const { runRateLimitTests } = require("../tests/api/rateLimit.test");
const { runDynamicIslandTests } = require("../tests/ui/dynamicIsland.test");

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
  console.log(`🚀 GradeFlow Phase-B Master Unit Verification Suite`);
  console.log(`================================================================${colors.reset}`);

  let enginesSuccess = false;
  let storeSuccess = false;
  let strategySuccess = false;
  let forecastSuccess = false;
  let ingestionSuccess = false;
  let smartIngestionSuccess = false;
  let careerSuccess = false;
  let attendanceSuccess = false;
  let advisorySuccess = false;
  let aiSuccess = false;
  let dynamicIslandSuccess = false;

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

  try {
    strategySuccess = runStrategyTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing strategy generator tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    forecastSuccess = runForecastTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing forecasting engine tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    ingestionSuccess = runIngestionTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing JSON ingestion tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    smartIngestionSuccess = runSmartImportTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing Smart Academic Ingestion tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    careerSuccess = runCareerTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing career placement tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    attendanceSuccess = runAttendanceTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing attendance bunk tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    advisorySuccess = runDecisionEngineTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing advisory decision engine tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    aiSuccess = await runAIInfrastructureTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing AI infrastructure tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  let validationSuccess = false;
  try {
    validationSuccess = runStartRecoveryValidationTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing start-recovery validation tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  let rateLimitSuccess = false;
  try {
    rateLimitSuccess = runRateLimitTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing rate limiter tests:${colors.reset}`);
    console.error(err.stack || err);
  }

  try {
    dynamicIslandSuccess = runDynamicIslandTests();
  } catch (err: any) {
    console.error(`\n${colors.red}💥 CRITICAL ERROR executing Dynamic Island tests:${colors.reset}`);
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

  if (strategySuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Strategy Generator Engine`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Strategy Generator Engine`);
  }

  if (forecastSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Dynamic Forecasting Engine`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Dynamic Forecasting Engine`);
  }

  if (ingestionSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} JSON Ingestion System`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} JSON Ingestion System`);
  }

  if (smartIngestionSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Smart Academic Import Ingestion Engine`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Smart Academic Import Ingestion Engine`);
  }

  if (careerSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Career Placement Advisor Engine`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Career Placement Advisor Engine`);
  }

  if (attendanceSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Attendance Bunk Simulator Engine`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Attendance Bunk Simulator Engine`);
  }

  if (advisorySuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Unified Decision & Recommendation Engine (UDRE)`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Unified Decision & Recommendation Engine (UDRE)`);
  }

  if (aiSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} AI Resilient Ingestion Infrastructure`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} AI Resilient Ingestion Infrastructure`);
  }

  if (validationSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Backlog Recovery Payload Zod Validation`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Backlog Recovery Payload Zod Validation`);
  }

  if (rateLimitSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} In-Memory Rate Limiter Helper`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} In-Memory Rate Limiter Helper`);
  }

  if (dynamicIslandSuccess) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Dynamic Island Clone Refinements & Physics`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Dynamic Island Clone Refinements & Physics`);
  }

  console.log(`----------------------------------------------------------------`);

  if (enginesSuccess && storeSuccess && strategySuccess && forecastSuccess && ingestionSuccess && smartIngestionSuccess && careerSuccess && attendanceSuccess && advisorySuccess && aiSuccess && validationSuccess && rateLimitSuccess && dynamicIslandSuccess) {
    console.log(`\n🎉 ${colors.bright}${colors.green}ALL MASTER UNIT TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 ${colors.bright}${colors.red}SOME UNIT TESTS FAILED. PLEASE AUDIT RECENT MODIFICATIONS.${colors.reset}\n`);
    process.exit(1);
  }
}

executeAllTests();

export {};
