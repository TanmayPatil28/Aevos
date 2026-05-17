/**
 * Z-Score Relative Grading Engine
 * Primary engine for MIT Manipal and advanced research institutes
 */

import { ClassStatistics, MeanSDEngine } from './mean-sd-engine';

export class ZScoreEngine {
  /**
   * Calculates grade based on Z-Score
   * Z = (X - Mean) / StdDev
   */
  static calculateGrade(marks: number, stats: ClassStatistics): string {
    if (stats.stdDev === 0) return 'C'; // Fallback to average

    const zScore = (marks - stats.mean) / stats.stdDev;

    if (zScore >= 1.5) return 'O';
    if (zScore >= 1.0) return 'A+';
    if (zScore >= 0.5) return 'A';
    if (zScore >= 0) return 'B';
    if (zScore >= -0.5) return 'C';
    if (zScore >= -1.0) return 'D';
    if (zScore >= -1.5) return 'E';

    return 'F';
  }
}
