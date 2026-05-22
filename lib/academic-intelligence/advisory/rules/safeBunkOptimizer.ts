import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { selectAttendanceRisk } from "../../../../stores/selectors/attendance";
import { pluggableRegulationEngine } from "../../regulations/regulationEngine";

export class SafeBunkOptimizerRule implements IRecommendationRule {
  readonly id = "SafeBunkOptimizerRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const attendance = selectAttendanceRisk(state);

    // Highly secure attendance and overall risk is low
    if (attendance.overallRisk === "LOW" && attendance.aggregatePercentage >= 85) {
      const reg = pluggableRegulationEngine.resolveRegulation(state.presetId);
      const minAtt = reg.attendanceRules.minAttendancePercent;

      const margin = attendance.aggregatePercentage - minAtt;
      
      const evidence = [
        `Aggregate attendance is highly secure at ${attendance.aggregatePercentage.toFixed(1)}%`,
        `Minimum attendance required by ${reg.regulationName} regulations is ${minAtt}%`,
        `Safety buffer margin is ${margin.toFixed(1)}% above the detention threshold`
      ];

      return {
        id: "safe_bunk_optimizer",
        dedupeKey: "safe_bunks_relaxation_advisor",
        category: "ATTENDANCE",
        priority: "INFO",
        title: "Optimize Class Bunk Buffer",
        description: "Your attendance standing is exceptionally secure. You have accumulated a healthy buffer that permits strategic rest days or dedicated self-study slots without triggering any regulation warning gates.",
        confidence: 85,
        evidence,
        actionableStep: {
          label: "Simulate Bunk Options",
          path: "/attendance"
        }
      };
    }

    return null;
  }
}
