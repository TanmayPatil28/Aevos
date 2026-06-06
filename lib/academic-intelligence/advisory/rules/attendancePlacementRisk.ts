import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { selectAttendanceRisk } from "../../../../stores/selectors/attendance";
import { selectPlacementEligibility } from "../../../../stores/selectors/placement";
import { pluggableRegulationEngine } from "../../regulations/regulationEngine";

export class AttendancePlacementRiskRule implements IRecommendationRule {
  readonly id = "AttendancePlacementRiskRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const attendance = selectAttendanceRisk(state);
    const placement = selectPlacementEligibility(state);

    const isPlacementEligible = placement.overallStatus === "ELIGIBLE" || placement.overallStatus === "BORDERLINE";
    const isAttendanceHighRisk = attendance.overallRisk === "HIGH" || attendance.overallRisk === "EMERGENCY";

    if (isPlacementEligible && isAttendanceHighRisk) {
      const reg = pluggableRegulationEngine.resolveRegulation(state.presetId);
      const minAtt = reg.attendanceRules.minAttendancePercent;

      const evidence = [
        `Aggregate semester attendance is currently at ${attendance.aggregatePercentage.toFixed(1)}%`,
        `Institutional regulation (${reg.regulationName}) mandates a minimum of ${minAtt}% attendance`,
        `Active placement matrix is compliant (${placement.eligibleCount}/${placement.totalCount} firms), but detention creates an active backlog that causes immediate corporate disqualification`
      ];

      return {
        id: "att_placement_risk",
        dedupeKey: "high_attendance_risk_placement_threat",
        category: "CAREER",
        priority: "CRITICAL",
        title: "Placement Eligibility Threatened by Attendance Risk",
        description: "You currently meet placement eligibility cutouts, but your high attendance risk is a critical bottleneck. Course detention triggers an active backlog, instantly disqualifying you from campus placement drives.",
        confidence: 95,
        evidence,
        actionableStep: {
          label: "Solve Bunk Recovery Plan",
          path: "/attendance"
        }
      };
    }

    return null;
  }
}
