import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { selectTrajectorySlope, selectVolatility } from "../../../../stores/selectors/forecasting";

export class TrajectorySlopeWarningRule implements IRecommendationRule {
  readonly id = "TrajectorySlopeWarningRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const slope = selectTrajectorySlope(state);
    const volatility = selectVolatility(state);

    // Declining trend if slope is significantly negative
    if (slope < -0.1) {
      // Calculate dynamic confidence based on slope magnitude and volatility (higher volatility lowers confidence slightly)
      const slopeMagnitude = Math.abs(slope);
      const rawConfidence = 70 + (slopeMagnitude * 50) - (volatility * 10);
      const confidence = Math.max(50, Math.min(95, Math.round(rawConfidence)));

      const evidence = [
        `Semester-over-semester GPA trajectory slope is ${slope.toFixed(2)} grade points`,
        `Academic grade point volatility (Standard Deviation) is ${volatility.toFixed(2)} GP`,
        "Ordinary Least Squares (OLS) regression models forecast continuing downward pressure on your cumulative standing"
      ];

      return {
        id: "trajectory_slope_decline",
        dedupeKey: "declining_academic_trajectory_risk",
        category: "ACADEMIC",
        priority: "WARNING",
        title: "Declining Academic Performance Trend",
        description: "Your GPA trajectory exhibits a downward trend. OLS regression indicates that your semester performance is declining. We recommend activating target strategy allocation models to arrest this decline.",
        confidence,
        evidence,
        actionableStep: {
          label: "Allocate Strategy Targets",
          path: "/strategy"
        }
      };
    }

    return null;
  }
}
