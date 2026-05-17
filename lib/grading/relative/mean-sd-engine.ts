/**
 * Mean-Standard Deviation Relative Grading Engine
 * Used by VIT Vellore, NSUT, and other premium institutes
 */

export interface ClassStatistics {
  mean: number;
  stdDev: number;
  count: number;
  max: number;
  min: number;
}

export class MeanSDEngine {
  /**
   * Calculates grade based on marks and class statistics
   * bandMultiplier: the width of the grade band (e.g., 0.5 or 1.0)
   */
  static calculateGrade(
    marks: number,
    stats: ClassStatistics,
    bands: { grade: string; offset: number }[]
  ): string {
    if (stats.count === 0) return 'F';

    // Sort bands by offset descending (highest grades first)
    const sortedBands = [...bands].sort((a, b) => b.offset - a.offset);

    for (const band of sortedBands) {
      const threshold = stats.mean + band.offset * stats.stdDev;
      if (marks >= threshold) return band.grade;
    }

    return 'F';
  }

  /**
   * Clamped Curve Logic (NSUT style)
   */
  static calculateClampedGrade(marks: number, stats: ClassStatistics): string {
    const OL = Math.min(95, stats.mean + 1.5 * stats.stdDev);
    const DL = Math.max(30, stats.mean - 1.5 * stats.stdDev);
    const bandWidth = (OL - DL) / 6;

    if (marks >= OL) return 'A+';
    if (marks >= OL - bandWidth) return 'A';
    if (marks >= OL - 2 * bandWidth) return 'B+';
    if (marks >= OL - 3 * bandWidth) return 'B';
    if (marks >= OL - 4 * bandWidth) return 'C+';
    if (marks >= OL - 5 * bandWidth) return 'C';
    if (marks >= DL) return 'P';

    return 'F';
  }

  static getStats(marks: number[]): ClassStatistics {
    const count = marks.length;
    if (count === 0) return { mean: 0, stdDev: 0, count: 0, max: 0, min: 0 };

    const sum = marks.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const variance = marks.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      count,
      max: Math.max(...marks),
      min: Math.min(...marks),
    };
  }
}
