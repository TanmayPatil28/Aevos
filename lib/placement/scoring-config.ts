/**
 * Placement Readiness Scoring Configuration
 *
 * Factor weights for computing the overall readiness score.
 * Must remain deterministic and explainable.
 */
export const PLACEMENT_SCORING_CONFIG = {
  cgpaWeight: 0.55, // 55% weight to current CGPA vs target
  consistencyWeight: 0.2, // 20% weight to semester-on-semester stability
  trendWeight: 0.15, // 15% weight to recent performance trajectory
  backlogPenaltyWeight: 0.1, // 10% weight to backlog-free status

  // Scoring Thresholds
  thresholds: {
    eligible: 80,
    nearThreshold: 50,
    atRisk: 30,
  },

  // Penalty Constants
  penalties: {
    activeBacklog: 15, // -15 points per active backlog from the backlog component score
  },
} as const;
