/**
 * core/ml/pipelines/prediction-pipeline.ts
 *
 * Prediction orchestration pipeline.
 * Coordinates feature extraction, normalization, model selection, and inference.
 */

import type { StudentFeatureVector, PredictionInput, PredictionOutput } from '../../types';
import { FeatureVectorBuilder } from '../feature-engineering/vector-builder';
import { ModelRegistry } from '../models/model-registry';

export class PredictionPipeline {
  /**
   * Executes the end-to-end prediction pipeline.
   */
  static async run(
    features: StudentFeatureVector,
    targetSemester: number,
    universityId?: string,
    branchId?: string
  ): Promise<PredictionOutput> {
    // 1. Optional: Feature Normalization (if required by external models)
    // const normalized = FeatureVectorBuilder.normalize(features);

    // 2. Select the best available model
    const model = await ModelRegistry.getBestAvailableModel();

    // 3. Construct input
    const input: PredictionInput = {
      features,
      targetSemester,
      historicalSgpas: features.historicalSgpas,
      universityId,
      branchId,
    };

    // 4. Run Inference
    const output = await model.predict(input);

    return output;
  }
}
