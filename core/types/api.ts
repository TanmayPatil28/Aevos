/**
 * core/types/api.ts
 *
 * Standardized API response shapes for the Academic Intelligence Layer.
 * Enforces explainability, determinism, and typed outputs across all routes.
 */

export interface ExplainabilityMetadata {
  readonly factors: readonly string[];
  readonly warnings?: readonly string[];
  readonly recommendations?: readonly string[];
}

export interface ApiResponseMetadata {
  readonly generatedAt: string;
  readonly university?: string;
  readonly regulationPattern?: string;
  readonly confidence?: number;
}

export interface IntelligenceApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly metadata?: ApiResponseMetadata;
  readonly explainability?: ExplainabilityMetadata;
  readonly error?: string;
}
