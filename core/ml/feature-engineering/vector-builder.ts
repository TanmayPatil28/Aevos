/**
 * core/ml/feature-engineering/vector-builder.ts
 *
 * Feature vector builder for ML infrastructure.
 * Translates raw student academic data into normalized feature vectors
 * for ingestion by prediction models.
 */

import type { StudentFeatureVector, FeatureNormalizationConfig } from '../../types';
import { DEFAULT_NORMALIZATION } from '../../types';

export class FeatureVectorBuilder {
  /**
   * Normalizes a raw feature vector using the provided configuration.
   */
  static normalize(
    vector: StudentFeatureVector,
    config: readonly FeatureNormalizationConfig[] = DEFAULT_NORMALIZATION
  ): Record<string, number> {
    const normalized: Record<string, number> = {};

    for (const rule of config) {
      const rawValue = vector[rule.field];
      if (typeof rawValue !== 'number') {
        normalized[rule.field] = 0; // Fallback for undefined/invalid
        continue;
      }

      if (rule.strategy === 'min-max') {
        // Clamp and normalize to 0.0 - 1.0
        const clamped = Math.max(rule.min, Math.min(rule.max, rawValue));
        const range = rule.max - rule.min;
        normalized[rule.field] = range > 0 ? (clamped - rule.min) / range : 0;
      } else if (rule.strategy === 'z-score') {
        // For z-score, we'd typically need population mean/stddev.
        // We'll leave it unnormalized here or assume it's pre-computed.
        normalized[rule.field] = rawValue;
      } else {
        // Default fallback
        normalized[rule.field] = rawValue;
      }
    }

    return normalized;
  }
}
