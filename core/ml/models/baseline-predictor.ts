/**
 * core/ml/models/baseline-predictor.ts
 *
 * Baseline statistical predictor implementing the PredictionModel contract.
 * Serves as the fallback or primary predictor when advanced ML models are unavailable.
 */

import type { PredictionModel, PredictionInput, PredictionOutput } from '../../types';
import { SGPAForecaster } from '../../analytics/forecasting/sgpa-forecaster';
import { DropoutRiskEngine } from '../../analytics/risk-engine/dropout-risk';

export class BaselinePredictor implements PredictionModel {
  readonly type = 'statistical';
  readonly version = '1.0.0';
  readonly name = 'GradeFlow Baseline Statistical Predictor';

  async isAvailable(): Promise<boolean> {
    return true; // Always available since it's local TS
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const startTime = performance.now();

    // 1. Forecast SGPA
    const sgpaForecast = SGPAForecaster.predictNext(input.features);

    // 2. Assess Risk
    const riskAnalysis = DropoutRiskEngine.analyze(input.features);

    // 3. Estimate new CGPA
    const currentTotalPoints = input.features.currentCgpa * input.features.creditsCompleted;
    const simulatedPoints = sgpaForecast.predictedSgpa * 20; // Assuming 20 credits next sem
    const newTotalCredits = input.features.creditsCompleted + 20;
    const predictedCgpa =
      newTotalCredits > 0 ? (currentTotalPoints + simulatedPoints) / newTotalCredits : 0;

    const latencyMs = performance.now() - startTime;

    return {
      predictedSgpa: sgpaForecast.predictedSgpa,
      confidence: sgpaForecast.confidence,
      riskLevel: riskAnalysis.level,
      predictedCgpa: Number(predictedCgpa.toFixed(2)),
      recommendations: this.generateRecommendations(
        riskAnalysis.level,
        sgpaForecast.trendDirection
      ),
      explanation: {
        modelType: this.type,
        modelVersion: this.version,
        featureImportance: [
          { feature: 'historicalSgpas', importance: 0.6, direction: 'positive' },
          { feature: 'backlogCount', importance: 0.4, direction: 'negative' },
        ],
        latencyMs,
        fromCache: false,
      },
    };
  }

  private generateRecommendations(risk: string, trend: string): string[] {
    const recs: string[] = [];
    if (risk === 'high' || risk === 'critical') {
      recs.push('Urgent: Schedule a meeting with your academic advisor.');
      recs.push('Focus exclusively on clearing active backlogs before taking new electives.');
    } else if (trend === 'declining') {
      recs.push('Your performance is trending downwards. Consider reducing extracurricular load.');
    } else if (trend === 'improving') {
      recs.push('Great job on the upward trend! Maintain current study habits.');
    }
    return recs;
  }
}
