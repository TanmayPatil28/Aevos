/**
 * core/analytics/forecasting/sgpa-forecaster.ts
 *
 * Deterministic statistical SGPA forecasting engine.
 *
 * Uses historical SGPA variance and exponentially weighted moving averages
 * to predict future SGPA. This serves as the Phase 1/2 prediction layer
 * before full ML models are rolled out.
 */

import type { StudentFeatureVector } from '../../types';

export interface ForecasterResult {
  readonly predictedSgpa: number;
  readonly confidence: number; // 0.0 to 1.0
  readonly variance: number;
  readonly trendDirection: 'improving' | 'declining' | 'stable';
}

export class SGPAForecaster {
  /**
   * Predicts the next semester's SGPA using an EWMA (Exponentially Weighted Moving Average)
   * combined with a volatility penalty.
   *
   * @param features - The student's current feature vector
   * @param smoothingFactor - Alpha for EWMA (default 0.4: favors recent performance but retains history)
   */
  static predictNext(features: StudentFeatureVector, smoothingFactor = 0.4): ForecasterResult {
    const history = features.historicalSgpas;

    if (history.length === 0) {
      return {
        predictedSgpa: 0,
        confidence: 0,
        variance: 0,
        trendDirection: 'stable',
      };
    }

    if (history.length === 1) {
      return {
        predictedSgpa: history[0],
        confidence: 0.3, // Low confidence with 1 data point
        variance: 0,
        trendDirection: 'stable',
      };
    }

    // 1. Calculate EWMA
    let ewma = history[0];
    for (let i = 1; i < history.length; i++) {
      ewma = smoothingFactor * history[i] + (1 - smoothingFactor) * ewma;
    }

    // 2. Calculate Variance / Volatility
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const squaredDiffs = history.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / history.length;

    // 3. Calculate Trend Velocity (recent 2 semesters)
    const recentVelocity = history[history.length - 1] - history[history.length - 2];
    let trendDirection: 'improving' | 'declining' | 'stable';
    if (recentVelocity >= 0.2) trendDirection = 'improving';
    else if (recentVelocity <= -0.2) trendDirection = 'declining';
    else trendDirection = 'stable';

    // 4. Adjust EWMA based on backlogs (penalty)
    let prediction = ewma;
    if (features.backlogCount > 0) {
      prediction -= features.backlogCount * 0.1; // Small penalty per backlog
    }

    // Clamp between 0 and 10
    prediction = Math.max(0, Math.min(10, prediction));

    // 5. Calculate Confidence
    // Confidence increases with more data points and decreases with high variance
    let confidence = 0.5 + Math.min(history.length, 8) * 0.05; // Base confidence on history length
    confidence -= variance * 0.1; // Penalize for volatility
    confidence = Math.max(0.1, Math.min(0.95, confidence));

    return {
      predictedSgpa: Number(prediction.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      variance: Number(variance.toFixed(3)),
      trendDirection,
    };
  }
}
