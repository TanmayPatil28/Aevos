/**
 * core/ml/models/model-registry.ts
 *
 * Pluggable registry for ML models.
 * Allows graceful degradation: if an advanced Python-backed model is unavailable,
 * it falls back to the TypeScript statistical baseline model.
 */

import type { PredictionModel, ModelRegistryEntry } from '../../types';
import { BaselinePredictor } from './baseline-predictor';

export class ModelRegistry {
  private static models: ModelRegistryEntry[] = [
    {
      id: 'baseline',
      model: new BaselinePredictor(),
      priority: 0,
      enabled: true,
    },
  ];

  static register(entry: ModelRegistryEntry): void {
    const existingIndex = this.models.findIndex((m) => m.id === entry.id);
    if (existingIndex >= 0) {
      this.models[existingIndex] = entry;
    } else {
      this.models.push(entry);
    }
    // Keep sorted by priority descending
    this.models.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Retrieves the highest priority model that is currently available.
   */
  static async getBestAvailableModel(): Promise<PredictionModel> {
    for (const entry of this.models) {
      if (entry.enabled && (await entry.model.isAvailable())) {
        return entry.model;
      }
    }
    throw new Error('No prediction models are currently available.');
  }

  static getAllRegistered(): readonly ModelRegistryEntry[] {
    return this.models;
  }
}
