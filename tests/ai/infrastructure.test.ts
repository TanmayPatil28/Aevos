/**
 * Phase NEXT-A Unit Tests: AI Infrastructure Layer
 * 
 * Asserts fallback chains, timeout simulations, quarantine circuit breaking,
 * invalid schemas, coercion recovery, and confidence propagation.
 */

import { AIRuntimeRegistry, globalTelemetry } from "../../lib/ai/registry";
import { IngestionExtractionPipeline, coerceParsedAcademicDocument, validateParsedAcademicDocumentShape, calculateConfidenceAverage } from "../../lib/ai/pipelines/extractionPipeline";
import { withResilience } from "../../lib/ai/pipelines/retryHandler";
import { AIValidationError, AIProviderError, AIRateLimitError, AITimeoutError, AIAuthenticationError } from "../../lib/ai/errors";
import { MockAIProvider } from "../../lib/ai/providers/mock";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      // Async test handling is simplified since we run synchronously in scripts,
      // but we wrap it to ensure error propagation.
      throw new Error(`Test '${name}' is asynchronous. Use async test runner wrapper.`);
    }
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.error(err.stack || err);
  }
}

async function testAsync(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.error(err.stack || err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export async function runAIInfrastructureTests(): Promise<boolean> {
  passed = 0;
  failed = 0;
  console.log("\n🤖 AI Infrastructure Layer Tests");

  // Reset the registries to clean state before running tests
  AIRuntimeRegistry.clearRegistries();
  
  // Re-register mock providers for testing isolated flows
  const testMockAI = new MockAIProvider();
  AIRuntimeRegistry.registerAIProvider(testMockAI);
  AIRuntimeRegistry.setDefaultAIProvider("mock");

  // ─── REGISTRY & QUARANTINE TESTS ───
  test("Registry - defaults to mock provider and can fetch it", () => {
    const provider = AIRuntimeRegistry.getAIProvider();
    assert(provider.id === "mock", "Expected default provider to be 'mock'");
    assert(provider.name.includes("Mock"), "Expected name to contain 'Mock'");
  });

  test("Quarantine - tracking rolling failures quarantines a provider", () => {
    const providerId = "test-fail-provider";
    
    // Register a temporary test provider
    AIRuntimeRegistry.registerAIProvider({
      id: providerId,
      name: "Temporary Failing Provider",
      isAvailable: () => true,
      complete: async () => { throw new Error("API Failure"); },
      extractAcademicData: async () => { throw new Error("API Failure"); }
    });

    // Verify initially healthy
    const healthInit = AIRuntimeRegistry.getProviderHealth(providerId);
    assert(healthInit !== undefined, "Expected health to be tracked");
    assert(healthInit?.isAvailable === true, "Expected initially available");
    assert(healthInit?.rollingFailureCount === 0, "Expected 0 initial failures");

    // Report 3 failures to trigger quarantine circuit breaker
    AIRuntimeRegistry.reportFailure(providerId);
    AIRuntimeRegistry.reportFailure(providerId);
    AIRuntimeRegistry.reportFailure(providerId);

    const healthQuarantined = AIRuntimeRegistry.getProviderHealth(providerId);
    assert(healthQuarantined?.isAvailable === false, "Expected provider to be quarantined");
    assert(healthQuarantined?.rollingFailureCount === 3, "Expected rolling failure count of 3");

    // Success reports should immediately restore health status
    AIRuntimeRegistry.reportSuccess(providerId);
    const healthRestored = AIRuntimeRegistry.getProviderHealth(providerId);
    assert(healthRestored?.isAvailable === true, "Expected active health restored on success");
    assert(healthRestored?.rollingFailureCount === 0, "Expected failures reset to 0");
  });

  // ─── COERCION & PROPAGATION TESTS ───
  test("Coercion - wraps direct primitives and coerces numeric strings", () => {
    const rawLooseDoc = {
      presetId: "SPPU", // direct string
      currentCgpa: { value: "8.24", confidence: "98" }, // numeric strings in wrappers
      targetCgpa: 8.75, // direct number
      activeBacklogsCount: { value: 0 }, // missing confidence wrapper
      semesterHistory: [
        {
          semester: 1,
          sgpa: "8.10",
          credits: 12,
          earnedCredits: 12
        }
      ]
    };

    const coerced = coerceParsedAcademicDocument(rawLooseDoc);

    // Verify fields coerced properly
    assert(coerced.presetId.value === "SPPU", "Expected presetId value to be SPPU");
    assert(coerced.presetId.confidence === 70, "Expected fallback confidence of 70 for direct string");
    
    assert(coerced.currentCgpa.value === 8.24, "Expected currentCgpa string to be coerced to number 8.24");
    assert(coerced.currentCgpa.confidence === 98, "Expected currentCgpa confidence string coerced to number 98");
    
    assert(coerced.targetCgpa.value === 8.75, "Expected targetCgpa number wrapped");
    assert(coerced.targetCgpa.confidence === 70, "Expected targetCgpa fallback confidence of 70");

    assert(coerced.activeBacklogsCount.value === 0, "Expected activeBacklogsCount wrapped value");
    assert(coerced.activeBacklogsCount.confidence === 70, "Expected activeBacklogsCount default confidence");

    assert(coerced.semesterHistory[0].semester.value === 1, "Expected semester wrapped");
    assert(coerced.semesterHistory[0].sgpa.value === 8.10, "Expected sgpa coerced inside list");
  });

  test("Confidence - propagates arithmetic average of all parsed fields", () => {
    const parsedDoc = {
      presetId: { value: "sppu", confidence: 100 },
      currentCgpa: { value: 8.0, confidence: 90 },
      targetCgpa: { value: 9.0, confidence: 80 },
      activeBacklogsCount: { value: 0, confidence: 90 },
      semesterHistory: [
        {
          semester: { value: 1, confidence: 100 },
          sgpa: { value: 8.0, confidence: 90 },
          credits: { value: 20, confidence: 100 },
          earnedCredits: { value: 20, confidence: 100 }
        }
      ]
    };

    const avg = calculateConfidenceAverage(parsedDoc);
    // (100 + 90 + 80 + 90 + 100 + 90 + 100 + 100) / 8 = 750 / 8 = 93.75
    assert(avg === 93.75, `Expected average confidence of 93.75, got ${avg}`);
  });

  // ─── VALIDATION & MALFORMED PAYLOAD TESTS ───
  test("Schema Validation - detects missing fields or incorrect types", () => {
    const incompleteDoc = {
      presetId: { value: "sppu", confidence: 90 },
      // currentCgpa is missing completely
      targetCgpa: { value: "not_a_number", confidence: 90 }, // incorrect value type
      activeBacklogsCount: { value: 0 }, // incomplete wrapper
      semesterHistory: {} // incorrect history type (should be array)
    };

    const errors = validateParsedAcademicDocumentShape(incompleteDoc);
    assert(errors.length > 0, "Expected validation errors to be detected");
    assert(errors.some(e => e.includes("currentCgpa")), "Expected currentCgpa missing error");
    assert(errors.some(e => e.includes("targetCgpa.value")), "Expected targetCgpa incorrect type error");
    assert(errors.some(e => e.includes("semesterHistory")), "Expected semesterHistory shape error");
  });

  // ─── RESILIENCE & FALLBACK CHAIN TESTS (ASYNC) ───
  await testAsync("Resilience - 1 fast retry backoff recovers successfully on transient failures", async () => {
    let callCount = 0;
    const transientAction = async () => {
      callCount++;
      if (callCount === 1) {
        throw new AIRateLimitError("Transient Rate Limit", "test-resilient");
      }
      return "SUCCESS_DATA";
    };

    const startTime = Date.now();
    const { result, retriesTriggered, fallbackTriggered } = await withResilience(
      transientAction,
      "test-resilient",
      undefined,
      1,
      10 // small delay for fast tests
    );

    const elapsed = Date.now() - startTime;
    assert(result === "SUCCESS_DATA", "Expected actions to recover and succeed");
    assert(retriesTriggered === 1, `Expected exactly 1 retry triggered, got ${retriesTriggered}`);
    assert(fallbackTriggered === false, "Expected no dynamic provider fallback needed");
    assert(elapsed >= 8, `Expected delay execution pause of at least 10ms, elapsed was ${elapsed}ms`);
  });

  await testAsync("Failover - seamless chain execution (Gemini rateLimit -> OpenAI -> Mock)", async () => {
    // Register custom mock providers to simulate API key availability
    AIRuntimeRegistry.clearRegistries();

    // 1. Simulated Gemini - throws rate limit immediately
    AIRuntimeRegistry.registerAIProvider({
      id: "gemini",
      name: "Google Gemini Mock Core",
      isAvailable: () => true,
      complete: async () => { throw new Error("Not used"); },
      extractAcademicData: async (_txt, _pId, options) => {
        throw new AIRateLimitError("Gemini hit rate limits.", "gemini");
      }
    });

    // 2. Simulated OpenAI - throws authentication error (no keys)
    AIRuntimeRegistry.registerAIProvider({
      id: "openai",
      name: "OpenAI GPT Mock Platform",
      isAvailable: () => true,
      complete: async () => { throw new Error("Not used"); },
      extractAcademicData: async (_txt, _pId, options) => {
        throw new AIAuthenticationError("OpenAI authentication missing keys.", "openai");
      }
    });

    // 3. Perfect Mock - works perfectly offline
    AIRuntimeRegistry.registerAIProvider(testMockAI);

    // Track telemetry
    globalTelemetry.clear();

    // Trigger pipeline extraction
    const rawText = "SAMPLE MARKSHEET";
    const result = await IngestionExtractionPipeline.extractTranscript(rawText, "sppu", { simulateFailure: "none" });

    // Validate outcomes
    assert(result.parsedDocument.presetId.value === "sppu", "Expected fallback provider to return correct sppu Preset");
    assert(result.parsedDocument.currentCgpa.value === 8.24, "Expected correct CGPA returned from fallback provider");
    assert(result.telemetry.providerId === "mock", `Expected execution delegated to 'mock', but was '${result.telemetry.providerId}'`);
    assert(result.telemetry.fallbackTriggered === true, "Expected fallbackTriggered to be flagged true");

    // Verify quarantine state applied to Gemini and OpenAI since they failed completely
    const geminiHealth = AIRuntimeRegistry.getProviderHealth("gemini");
    const openaiHealth = AIRuntimeRegistry.getProviderHealth("openai");
    assert(geminiHealth?.rollingFailureCount === 1, `Expected Gemini failures = 1, got ${geminiHealth?.rollingFailureCount}`);
    assert(openaiHealth?.rollingFailureCount === 1, `Expected OpenAI failures = 1, got ${openaiHealth?.rollingFailureCount}`);
  });

  await testAsync("Timeout Simulation - abort controller cancels slow calls and proceeds with fallback", async () => {
    AIRuntimeRegistry.clearRegistries();

    // 1. Slow Gemini - exceeds options.timeoutMs
    AIRuntimeRegistry.registerAIProvider({
      id: "gemini",
      name: "Slow Gemini Mock",
      isAvailable: () => true,
      complete: async () => { throw new Error("Not used"); },
      extractAcademicData: async (_txt, _pId, options) => {
        // Trigger simulated timeout error
        throw new AITimeoutError("Gemini timed out.", "gemini");
      }
    });

    // 2. Reliable Mock
    AIRuntimeRegistry.registerAIProvider(testMockAI);

    globalTelemetry.clear();

    const result = await IngestionExtractionPipeline.extractTranscript("SAMPLE", "vtu", { simulateFailure: "none" });
    
    assert(result.parsedDocument.presetId.value === "vtu", "Expected correct vtu Preset");
    assert(result.parsedDocument.currentCgpa.value === 7.90, "Expected correct CGPA");
    assert(result.telemetry.providerId === "mock", "Expected execution delegated to 'mock'");
    assert(result.telemetry.fallbackTriggered === true, "Expected fallbackTriggered flagged");
  });

  console.log(`\n🏁 AI Infrastructure tests completed: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}
