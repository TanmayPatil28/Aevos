import { AIProvider, OCRProvider, ProviderHealth, TelemetryMetric, TelemetryTracker } from "./types";
import { GeminiAIProvider } from "./providers/gemini";
import { GroqAIProvider } from "./providers/groq";
import { OpenAIProvider } from "./providers/openai";
import { MockAIProvider, MockOCRProvider } from "./providers/mock";


export class SimpleTelemetryTracker implements TelemetryTracker {
  private metrics: TelemetryMetric[] = [];

  track(metric: TelemetryMetric): void {
    this.metrics.push(metric);
  }

  getMetrics(): TelemetryMetric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export const globalTelemetry = new SimpleTelemetryTracker();

export class AIRuntimeRegistry {
  private static aiProviders = new Map<string, AIProvider>();
  private static ocrProviders = new Map<string, OCRProvider>();
  
  // Health states
  private static healthStates = new Map<string, ProviderHealth>();
  private static QUARANTINE_THRESHOLD = 3;
  private static QUARANTINE_COOLDOWN_MS = 60000; // 1 minute auto-recovery cooldown

  private static defaultAIProviderId = "mock";
  private static defaultOCRProviderId = "mock-ocr";

  static registerAIProvider(provider: AIProvider) {
    this.aiProviders.set(provider.id, provider);
    if (!this.healthStates.has(provider.id)) {
      this.healthStates.set(provider.id, {
        providerId: provider.id,
        isAvailable: true,
        rollingFailureCount: 0
      });
    }
  }

  static registerOCRProvider(provider: OCRProvider) {
    this.ocrProviders.set(provider.id, provider);
    if (!this.healthStates.has(provider.id)) {
      this.healthStates.set(provider.id, {
        providerId: provider.id,
        isAvailable: true,
        rollingFailureCount: 0
      });
    }
  }

  static reportFailure(providerId: string) {
    const health = this.healthStates.get(providerId);
    if (health) {
      health.rollingFailureCount += 1;
      health.lastFailureTimestamp = Date.now();
      if (health.rollingFailureCount >= this.QUARANTINE_THRESHOLD) {
        health.isAvailable = false;
        console.warn(`AI Provider [${providerId}] quarantined due to ${health.rollingFailureCount} consecutive failures.`);
      }
    }
  }

  static reportSuccess(providerId: string) {
    const health = this.healthStates.get(providerId);
    if (health) {
      health.rollingFailureCount = 0;
      health.isAvailable = true;
      health.lastFailureTimestamp = undefined;
    }
  }

  static getProviderHealth(providerId: string): ProviderHealth | undefined {
    // Check if quarantined provider cooldown has expired, allowing auto-recovery
    const health = this.healthStates.get(providerId);
    if (health && !health.isAvailable && health.lastFailureTimestamp) {
      const elapsed = Date.now() - health.lastFailureTimestamp;
      if (elapsed >= this.QUARANTINE_COOLDOWN_MS) {
        health.isAvailable = true;
        health.rollingFailureCount = 0;
        health.lastFailureTimestamp = undefined;
        console.info(`AI Provider [${providerId}] auto-recovered from quarantine.`);
      }
    }
    return health;
  }

  static getAIProvider(id?: string): AIProvider {
    const targetId = id || this.defaultAIProviderId;
    const provider = this.aiProviders.get(targetId);

    // Verify raw availability and health quarantine
    const health = this.getProviderHealth(targetId);
    const isHealthy = health ? health.isAvailable : true;

    if (provider && provider.isAvailable() && isHealthy) {
      return provider;
    }

    // Fallback: search another healthy & available provider
    const available = Array.from(this.aiProviders.values()).find(p => {
      const h = this.getProviderHealth(p.id);
      const healthy = h ? h.isAvailable : true;
      return p.isAvailable() && healthy;
    });

    if (available) {
      console.warn(`Target provider [${targetId}] unavailable. Dynamically fell back to [${available.id}].`);
      return available;
    }

    throw new Error("No operational or healthy AI provider available in runtime.");
  }

  static getOCRProvider(id?: string): OCRProvider {
    const targetId = id || this.defaultOCRProviderId;
    const provider = this.ocrProviders.get(targetId);

    const health = this.getProviderHealth(targetId);
    const isHealthy = health ? health.isAvailable : true;

    if (provider && provider.isAvailable() && isHealthy) {
      return provider;
    }

    const available = Array.from(this.ocrProviders.values()).find(p => {
      const h = this.getProviderHealth(p.id);
      const healthy = h ? h.isAvailable : true;
      return p.isAvailable() && healthy;
    });

    if (available) {
      return available;
    }

    throw new Error("No operational or healthy OCR provider available in runtime.");
  }

  static setDefaultAIProvider(id: string) {
    this.defaultAIProviderId = id;
  }

  static setDefaultOCRProvider(id: string) {
    this.defaultOCRProviderId = id;
  }

  static clearRegistries() {
    this.aiProviders.clear();
    this.ocrProviders.clear();
    this.healthStates.clear();
    this.defaultAIProviderId = "mock";
    this.defaultOCRProviderId = "mock-ocr";
  }
}

// Self-register default providers in runtime
AIRuntimeRegistry.registerAIProvider(new GeminiAIProvider());
AIRuntimeRegistry.registerAIProvider(new GroqAIProvider());
AIRuntimeRegistry.registerAIProvider(new OpenAIProvider());
AIRuntimeRegistry.registerAIProvider(new MockAIProvider());
AIRuntimeRegistry.registerOCRProvider(new MockOCRProvider());

