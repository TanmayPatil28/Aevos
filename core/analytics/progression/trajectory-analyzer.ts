/**
 * core/analytics/progression/trajectory-analyzer.ts
 *
 * Academic trajectory analysis.
 * Identifies patterns in a student's historical SGPA to provide insights.
 */

export interface TrajectoryAnalysis {
  readonly pattern:
    | 'steady-growth'
    | 'volatile'
    | 'steady-decline'
    | 'plateau'
    | 'inconsistent'
    | 'insufficient-data';
  readonly consistencyScore: number; // 0 to 100
  readonly insights: readonly string[];
}

export class TrajectoryAnalyzer {
  static analyze(history: readonly number[]): TrajectoryAnalysis {
    if (history.length < 3) {
      return {
        pattern: 'insufficient-data',
        consistencyScore: 0,
        insights: ['Not enough history to determine a trajectory pattern.'],
      };
    }

    const velocities: number[] = [];
    for (let i = 1; i < history.length; i++) {
      velocities.push(history[i] - history[i - 1]);
    }

    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const squaredDiffs = history.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / history.length;

    // Consistency Score (inverse of variance mapped to 0-100)
    let consistencyScore = 100 - variance * 40; // 2.5 variance = 0 score
    consistencyScore = Math.max(0, Math.min(100, consistencyScore));

    const insights: string[] = [];
    let pattern: TrajectoryAnalysis['pattern'] = 'inconsistent';

    const positiveVelocities = velocities.filter((v) => v > 0).length;
    const negativeVelocities = velocities.filter((v) => v < 0).length;

    if (variance < 0.1 && velocities.every((v) => Math.abs(v) < 0.2)) {
      pattern = 'plateau';
      insights.push('Highly consistent performance with minimal variation.');
    } else if (variance > 1.5) {
      pattern = 'volatile';
      insights.push('High volatility in academic performance across semesters.');
    } else if (
      positiveVelocities >= velocities.length - 1 &&
      history[history.length - 1] > history[0]
    ) {
      pattern = 'steady-growth';
      insights.push('Consistent upward trend in SGPA.');
    } else if (
      negativeVelocities >= velocities.length - 1 &&
      history[history.length - 1] < history[0]
    ) {
      pattern = 'steady-decline';
      insights.push('Consistent downward trend in SGPA. Needs attention.');
    }

    return {
      pattern,
      consistencyScore: Number(consistencyScore.toFixed(1)),
      insights,
    };
  }
}
