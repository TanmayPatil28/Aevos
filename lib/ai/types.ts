import { ParsedAcademicDocument } from "../ingestion/parser/types";

export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  simulateFailure?: "rateLimit" | "timeout" | "auth" | "none"; // Used for offline test suites
}

export interface AIResult {
  text: string;
  rawResponse: unknown;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  providerId: string;
}

export interface AIProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  complete(prompt: string, systemPrompt?: string, options?: AIModelOptions): Promise<AIResult>;
  extractAcademicData(rawText: string, presetId: string, options?: AIModelOptions): Promise<ParsedAcademicDocument>;
}

export interface OCRExtractionOptions {
  presetId?: string;
  timeoutMs?: number;
}

export interface OCRResult {
  text: string;
  confidence: number; // 0 - 100
  providerId: string;
}

export interface OCRProvider {
  id: string;
  name: string;
  isAvailable(): boolean;
  extractText(fileBuffer: Buffer, mimeType: string, options?: OCRExtractionOptions): Promise<OCRResult>;
}

export interface ProviderHealth {
  providerId: string;
  isAvailable: boolean;
  lastFailureTimestamp?: number;
  rollingFailureCount: number;
}

export interface TelemetryMetric {
  providerId: string;
  action: "complete" | "extract" | "ocr";
  latencyMs: number;
  retriesTriggered: number;
  fallbackTriggered: boolean;
  validationPassed?: boolean;
  confidenceAverage?: number;
  timestamp: number;
}

export interface TelemetryTracker {
  track(metric: TelemetryMetric): void;
  getMetrics(): TelemetryMetric[];
  clear(): void;
}
