import { USMStoreState } from "../usmStore";
import { createSelector } from "./memo";

/**
 * CGPA Volatility Selector.
 * Computes standard deviation of SGPA values from semesterHistory.
 * Higher values indicate unstable academic performance across semesters.
 * Returns 0 if insufficient history (< 2 semesters).
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectVolatility = createSelector((state: USMStoreState): number => {
  const history = state.semesterHistory;
  if (!history || history.length < 2) return 0;

  const sgpaValues = history.map((h) => h.sgpa);
  const mean = sgpaValues.reduce((sum, v) => sum + v, 0) / sgpaValues.length;
  const variance =
    sgpaValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    (sgpaValues.length - 1);

  return parseFloat(Math.sqrt(variance).toFixed(3));
});

/**
 * Trajectory Slope Selector.
 * Computes linear regression slope over the semester SGPA history.
 * Positive slope = improving trend, negative slope = declining trend.
 * Uses ordinary least squares regression: slope = Σ((xi - x̄)(yi - ȳ)) / Σ((xi - x̄)²)
 * Returns 0 if insufficient history (< 2 semesters).
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectTrajectorySlope = createSelector((state: USMStoreState): number => {
  const history = state.semesterHistory;
  if (!history || history.length < 2) return 0;

  const n = history.length;
  const xValues = history.map((h) => h.semester);
  const yValues = history.map((h) => h.sgpa);

  const xMean = xValues.reduce((s, v) => s + v, 0) / n;
  const yMean = yValues.reduce((s, v) => s + v, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    const dy = yValues[i] - yMean;
    numerator += dx * dy;
    denominator += dx * dx;
  }

  if (denominator === 0) return 0;

  return parseFloat((numerator / denominator).toFixed(3));
});
