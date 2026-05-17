/**
 * core/types/ml.ts
 *
 * Machine learning infrastructure types.
 *
 * This layer is provider-agnostic:
 * - Supports local statistical predictors (Phase 1)
 * - Supports external model serving via HTTP (FastAPI/Python, future)
 * - Supports pluggable model registry for Random Forest, XGBoost, LSTM, Transformer
 *
 * NO ML dependencies are introduced. This is INFRASTRUCTURE ONLY.
 * The actual models will be plugged in via the ModelRegistry.
 */

import type { StudentFeatureVector } from './feature-vector';

// ─── Model Types ────────────────────────────────────────────────────────────

export type ModelType =
  | 'statistical' // Built-in: linear regression, moving average
  | 'random-forest' // External: sklearn/XGBoost
  | 'xgboost' // External: XGBoost
  | 'lstm' // External: PyTorch/TF
  | 'transformer' // External: future
  | 'ensemble'; // Combination of multiple models

// ─── Prediction Input/Output ────────────────────────────────────────────────

export interface PredictionInput {
  /** The student's current feature vector */
  readonly features: StudentFeatureVector;
  /** Target semester to predict for */
  readonly targetSemester: number;
  /** Historical SGPA values (ordered by semester) */
  readonly historicalSgpas: readonly number[];
  /** University ID for regulation-aware prediction */
  readonly universityId?: string;
  /** Branch ID for curriculum-aware prediction */
  readonly branchId?: string;
}

export interface PredictionOutput {
  /** Predicted SGPA for the target semester */
  readonly predictedSgpa: number;
  /** Confidence interval (0.0 - 1.0) */
  readonly confidence: number;
  /** Risk classification */
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Predicted CGPA after the target semester */
  readonly predictedCgpa?: number;
  /** Actionable recommendations */
  readonly recommendations: readonly string[];
  /** Explainability metadata */
  readonly explanation: PredictionExplanation;
}

// ─── Explainability ─────────────────────────────────────────────────────────

export interface PredictionExplanation {
  /** Which model produced this prediction */
  readonly modelType: ModelType;
  /** Model version identifier */
  readonly modelVersion: string;
  /** Top contributing features (SHAP-like) */
  readonly featureImportance: readonly {
    readonly feature: string;
    readonly importance: number;
    readonly direction: 'positive' | 'negative';
  }[];
  /** Prediction latency in milliseconds */
  readonly latencyMs: number;
  /** Whether the prediction is from cache */
  readonly fromCache: boolean;
}

// ─── Model Interface ────────────────────────────────────────────────────────

/**
 * Abstract prediction model contract.
 * Implementations can be local (TypeScript) or remote (HTTP to Python service).
 */
export interface PredictionModel {
  /** Model type identifier */
  readonly type: ModelType;
  /** Model version string */
  readonly version: string;
  /** Human-readable model name */
  readonly name: string;
  /** Whether this model is currently available for inference */
  isAvailable(): Promise<boolean>;
  /** Run prediction */
  predict(input: PredictionInput): Promise<PredictionOutput>;
}

// ─── Model Registry Types ───────────────────────────────────────────────────

export interface ModelRegistryEntry {
  /** Model identifier */
  readonly id: string;
  /** The model instance */
  readonly model: PredictionModel;
  /** Priority for model selection (higher = preferred) */
  readonly priority: number;
  /** Whether this model is enabled */
  readonly enabled: boolean;
}

// ─── Inference Client Types ─────────────────────────────────────────────────

export interface InferenceClientConfig {
  /** Base URL of the ML serving endpoint */
  readonly baseUrl: string;
  /** Request timeout in milliseconds */
  readonly timeoutMs: number;
  /** API key (if required) */
  readonly apiKey?: string;
  /** Whether to use response caching */
  readonly enableCache: boolean;
  /** Cache TTL in seconds */
  readonly cacheTtlSeconds?: number;
}
