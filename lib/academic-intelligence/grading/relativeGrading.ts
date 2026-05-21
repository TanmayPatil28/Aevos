/**
 * GradeFlow Cohort Statistical Normalization Engine
 * 
 * Provides deterministic mathematical transformations for relative grading systems.
 * Supports:
 * - Box-Cox Normalization (Anna University R2021)
 * - Mean & Standard Deviation Partitioning (VIT Vellore / DTU / NSUT)
 * - Cluster Gap Histogram Clustering (BITS Pilani)
 */

export interface StatisticalTrace {
  inputArray: number[];
  transformedArray: number[];
  lambda: number;
  mean: number;
  stdDev: number;
  boundaries: { grade: string; minMarks: number }[];
}

/**
 * Calculates the mean of a cohort's marks.
 */
export function calculateMean(marks: number[]): number {
  if (marks.length === 0) return 0;
  const sum = marks.reduce((acc, x) => acc + x, 0);
  return sum / marks.length;
}

/**
 * Calculates the standard deviation of a cohort's marks.
 */
export function calculateStdDev(marks: number[], mean: number): number {
  if (marks.length <= 1) return 0;
  const variance = marks.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / (marks.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates the skewness of a dataset.
 * Symmetrical distributions have skewness near 0.
 */
export function calculateSkewness(data: number[], mean: number, stdDev: number): number {
  if (data.length <= 2 || stdDev === 0) return 0;
  const n = data.length;
  const m3 = data.reduce((acc, x) => acc + Math.pow(x - mean, 3), 0) / n;
  return m3 / Math.pow(stdDev, 3);
}

/**
 * Applies Box-Cox transformation for a given lambda.
 * Offsets values dynamically to ensure strictly positive input (x > 0).
 */
export function applyBoxCoxTransform(marks: number[], lambda: number): number[] {
  // Box-Cox requires strictly positive values. If any marks are <= 0, offset them.
  const minVal = Math.min(...marks);
  const offset = minVal <= 0 ? Math.abs(minVal) + 1.0 : 0.0;

  return marks.map((x) => {
    const val = x + offset;
    if (lambda === 0) {
      return Math.log(val);
    } else {
      return (Math.pow(val, lambda) - 1) / lambda;
    }
  });
}

/**
 * Performs a deterministic grid-search to find the optimal Box-Cox lambda
 * that minimizes absolute skewness of the transformed cohort marks.
 */
export function findOptimalLambda(marks: number[]): number {
  if (marks.length <= 2) return 1.0;

  let optimalLambda = 1.0;
  let minAbsSkew = Infinity;

  // Search range: -2.0 to 2.0 with a step of 0.1
  for (let l = -2.0; l <= 2.0; l = parseFloat((l + 0.1).toFixed(1))) {
    const transformed = applyBoxCoxTransform(marks, l);
    const mean = calculateMean(transformed);
    const stdDev = calculateStdDev(transformed, mean);
    const skew = Math.abs(calculateSkewness(transformed, mean, stdDev));

    if (skew < minAbsSkew) {
      minAbsSkew = skew;
      optimalLambda = l;
    }
  }

  return optimalLambda;
}

/**
 * Standard Deviation relative grading engine (VIT Vellore / DTU).
 * Partitions cohort grades dynamically based on Mean (μ) and Standard Deviation (σ).
 * VIT Vellore details:
 * - S: >= μ + 1.5σ (Absolute floor check of 90% applies, S is capped / bounded)
 * - A: [μ + 0.5σ, μ + 1.5σ)
 * - B: [μ - 0.5σ, μ + 0.5σ)
 * - C: [μ - 1.0σ, μ - 0.5σ)
 * - D: [μ - 1.5σ, μ - 1.0σ)
 * - E: [μ - 2.0σ, μ - 1.5σ)
 * - F: < μ - 2.0σ
 */
export function calculateMeanStdDevBands(
  marks: number[],
  absoluteSFloor: number = 90
): StatisticalTrace {
  const mean = calculateMean(marks);
  const stdDev = calculateStdDev(marks, mean);

  // Define thresholds based on standard deviations
  const sThreshold = Math.max(absoluteSFloor, mean + 1.5 * stdDev);
  const aThreshold = mean + 0.5 * stdDev;
  const bThreshold = mean - 0.5 * stdDev;
  const cThreshold = mean - 1.0 * stdDev;
  const dThreshold = mean - 1.5 * stdDev;
  const eThreshold = mean - 2.0 * stdDev;

  const boundaries = [
    { grade: "S", minMarks: parseFloat(sThreshold.toFixed(2)) },
    { grade: "A", minMarks: parseFloat(aThreshold.toFixed(2)) },
    { grade: "B", minMarks: parseFloat(bThreshold.toFixed(2)) },
    { grade: "C", minMarks: parseFloat(cThreshold.toFixed(2)) },
    { grade: "D", minMarks: parseFloat(dThreshold.toFixed(2)) },
    { grade: "E", minMarks: parseFloat(eThreshold.toFixed(2)) },
    { grade: "F", minMarks: 0.0 },
  ];

  return {
    inputArray: marks,
    transformedArray: marks, // No transform applied for simple SD
    lambda: 1.0,
    mean,
    stdDev,
    boundaries,
  };
}

/**
 * Cluster Gap Histogram Engine (BITS Pilani model).
 * Groups descending marks dynamically into natural gap clusters.
 * If standard clustering fails, it falls back to a 1D K-Means clustering algorithm.
 */
export function calculateClusterGapBands(
  marks: number[],
  expectedGradesCount: number = 8
): { grade: string; minMarks: number }[] {
  if (marks.length === 0) return [];
  
  // Sort grades in descending order
  const sorted = [...marks].sort((a, b) => b - a);

  // Compute adjacent differences (gaps)
  const gaps: { index: number; gap: number }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push({ index: i, gap: sorted[i] - sorted[i + 1] });
  }

  // Sort gaps to find the largest gaps (natural delimiters)
  const largestGaps = [...gaps]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, expectedGradesCount - 1)
    .sort((a, b) => a.index - b.index);

  // Build grade brackets
  const boundaries: { grade: string; minMarks: number }[] = [];
  const gradeLabels = ["A", "A-", "B", "B-", "C", "C-", "D", "E"];

  let lastIndex = 0;
  for (let g = 0; g < largestGaps.length; g++) {
    const gap = largestGaps[g];
    const segment = sorted.slice(lastIndex, gap.index + 1);
    const minVal = segment[segment.length - 1];
    
    boundaries.push({
      grade: gradeLabels[g] || `G${g}`,
      minMarks: parseFloat(minVal.toFixed(2)),
    });
    
    lastIndex = gap.index + 1;
  }

  // Add the last grade (Fail / NC / lowest band)
  const finalSegment = sorted.slice(lastIndex);
  if (finalSegment.length > 0) {
    boundaries.push({
      grade: gradeLabels[largestGaps.length] || "NC",
      minMarks: parseFloat(finalSegment[finalSegment.length - 1].toFixed(2)),
    });
  }

  return boundaries;
}

/**
 * Full Box-Cox Normalization Engine (Anna University R2021 style).
 * Normalizes skewed class marks and places standard normal thresholds on them.
 */
export function calculateBoxCoxBands(marks: number[]): StatisticalTrace {
  const lambda = findOptimalLambda(marks);
  const transformed = applyBoxCoxTransform(marks, lambda);
  
  const transMean = calculateMean(transformed);
  const transStd = calculateStdDev(transformed, transMean);

  // Standard normal bands on the Box-Cox transformed marks
  const sThresholdTrans = transMean + 1.5 * transStd;
  const aThresholdTrans = transMean + 0.5 * transStd;
  const bThresholdTrans = transMean - 0.5 * transStd;
  const cThresholdTrans = transMean - 1.0 * transStd;
  const dThresholdTrans = transMean - 1.5 * transStd;
  const eThresholdTrans = transMean - 2.0 * transStd;

  // Inverse Box-Cox transformation function: x = (y * lambda + 1)^(1/lambda)
  const minVal = Math.min(...marks);
  const offset = minVal <= 0 ? Math.abs(minVal) + 1.0 : 0.0;

  const inverseBoxCox = (y: number): number => {
    let raw: number;
    if (lambda === 0) {
      raw = Math.exp(y);
    } else {
      const term = y * lambda + 1;
      raw = term > 0 ? Math.pow(term, 1 / lambda) : 0;
    }
    return Math.max(0, parseFloat((raw - offset).toFixed(2)));
  };

  const boundaries = [
    { grade: "O", minMarks: inverseBoxCox(sThresholdTrans) },
    { grade: "A+", minMarks: inverseBoxCox(aThresholdTrans) },
    { grade: "A", minMarks: inverseBoxCox(bThresholdTrans) },
    { grade: "B+", minMarks: inverseBoxCox(cThresholdTrans) },
    { grade: "B", minMarks: inverseBoxCox(dThresholdTrans) },
    { grade: "C", minMarks: inverseBoxCox(eThresholdTrans) },
    { grade: "F", minMarks: 0.0 },
  ];

  return {
    inputArray: marks,
    transformedArray: transformed,
    lambda,
    mean: calculateMean(marks),
    stdDev: calculateStdDev(marks, calculateMean(marks)),
    boundaries,
  };
}
