import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { pluggableRegulationEngine } from "../../regulations/regulationEngine";

export class ArrearRecoveryRule implements IRecommendationRule {
  readonly id = "ArrearRecoveryRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const backlogsCount = state.academic.activeBacklogsCount;

    if (backlogsCount > 0) {
      const reg = pluggableRegulationEngine.resolveRegulation(state.presetId);
      const isSupplementary = reg.backlogPolicy.supplementaryExams;
      const isSummer = reg.backlogPolicy.summerTermAvailable;

      const evidence = [
        `Active unresolved backlogs count: ${backlogsCount}`,
        `Institution backlog policy allows retakes: ${isSupplementary ? "Yes (Supplementary Exams)" : "No (Regular cycles only)"}`,
        `Summer Term registration availability: ${isSummer ? "Available" : "Not available in standard calendar"}`
      ];

      let description = `You have ${backlogsCount} active backlog${backlogsCount > 1 ? "s" : ""}. Clearing these arrears is highly critical to ensure regular annual progression and prevent future placement disqualification.`;
      
      if (isSupplementary) {
        description += " We recommend registering for immediate supplementary exams to clear these credit blocks.";
      } else {
        description += " You will need to re-register for these courses in subsequent regular semesters.";
      }

      return {
        id: "arrear_recovery_plan",
        dedupeKey: "arrear_reconciliation_required",
        category: "RISK",
        priority: "WARNING",
        title: "Active Arrears Clearance Needed",
        description,
        confidence: 90,
        evidence,
        actionableStep: {
          label: "View Career Compliance",
          path: "/placement"
        }
      };
    }

    return null;
  }
}
