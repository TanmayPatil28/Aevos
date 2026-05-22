// ─── Re-exports Layer for Backward Compatibility ────────────────────────────

// Academic Selectors
export {
  selectActiveCourses,
  selectDerivedGPA,
  selectSemesterCredits,
} from "./academic";
export type { DerivedSemesterCredits } from "./academic";

// Attendance Selectors
export {
  selectAttendanceRisk,
  selectRecoveryDifficulty,
} from "./attendance";
export type {
  DerivedAttendanceCourseRisk,
  DerivedAttendanceStatus,
  DerivedRecoveryPlan,
} from "./attendance";

// Placement Selectors
export {
  selectPlacementEligibility,
  COMPANYS_DATA,
} from "./placement";
export type {
  PlacementCompany,
  DerivedPlacementStatus,
} from "./placement";

// Forecasting Selectors
export {
  selectVolatility,
  selectTrajectorySlope,
} from "./forecasting";

// Risk & Health Selectors
export {
  selectAcademicHealth,
  selectCompositeRisk,
} from "./risk";
export type { TraceMetadata } from "./risk";

// Recommendations Selectors
export {
  selectRecommendations,
} from "./recommendations";

// Memoization Utility
export { createSelector } from "./memo";
