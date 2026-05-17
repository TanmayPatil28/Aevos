/**
 * core/types/feature-vector.ts
 *
 * Student feature vector types for predictive analytics and ML inference.
 *
 * This is the normalized input contract for:
 * - SGPA forecasting
 * - Dropout risk prediction
 * - Placement readiness scoring
 * - Personalized academic recommendations
 *
 * All features are designed to be computable from existing GradeFlow data
 * without requiring external data sources.
 */

// ─── Student Feature Vector ─────────────────────────────────────────────────

export interface StudentFeatureVector {
  /** Current cumulative GPA */
  readonly currentCgpa: number;
  /** Attendance rate as a fraction (0.0 - 1.0) */
  readonly attendanceRate: number;
  /** Number of active (uncleared) backlogs */
  readonly backlogCount: number;
  /** Consistency score: measure of SGPA stability across semesters (0-100) */
  readonly consistencyScore: number;
  /** LMS engagement score (if available, 0.0 - 1.0) */
  readonly lmsEngagement?: number;
  /** Internal marks trend across recent semesters */
  readonly internalMarksTrend?: readonly number[];
  /** Rate of SGPA change between consecutive semesters */
  readonly semesterVelocity?: number;
  /** Total credits completed */
  readonly creditsCompleted: number;
  /** Total credits remaining */
  readonly creditsRemaining: number;
  /** Number of semesters completed */
  readonly semestersCompleted: number;
  /** Historical SGPA values per semester */
  readonly historicalSgpas: readonly number[];
}

// ─── Feature Snapshot ───────────────────────────────────────────────────────

/**
 * A timestamped snapshot of a student's feature vector.
 * Used for:
 * - Historical trend analysis
 * - Model training data generation
 * - Audit trail of predictions
 */
export interface FeatureSnapshot {
  /** Unique snapshot identifier */
  readonly id: string;
  /** User ID this snapshot belongs to */
  readonly userId: string;
  /** The computed feature vector */
  readonly features: StudentFeatureVector;
  /** Timestamp of when this snapshot was computed */
  readonly computedAt: Date;
  /** What triggered this snapshot (e.g., "semester-finalized", "manual-refresh") */
  readonly trigger: string;
}

// ─── Feature Normalization Config ───────────────────────────────────────────

/**
 * Configuration for normalizing raw features into model-ready inputs.
 * Each feature has a defined range and scaling strategy.
 */
export interface FeatureNormalizationConfig {
  readonly field: keyof StudentFeatureVector;
  readonly min: number;
  readonly max: number;
  readonly strategy: 'min-max' | 'z-score' | 'log-scale';
}

/**
 * Default normalization config for standard 10-point scale universities.
 */
export const DEFAULT_NORMALIZATION: readonly FeatureNormalizationConfig[] = [
  { field: 'currentCgpa', min: 0, max: 10, strategy: 'min-max' },
  { field: 'attendanceRate', min: 0, max: 1, strategy: 'min-max' },
  { field: 'backlogCount', min: 0, max: 20, strategy: 'min-max' },
  { field: 'consistencyScore', min: 0, max: 100, strategy: 'min-max' },
  { field: 'semesterVelocity', min: -3, max: 3, strategy: 'min-max' },
] as const;
