import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { selectActiveCourses } from "../../../../stores/selectors/academic";
import { pluggableRegulationEngine } from "../../regulations/regulationEngine";

export class CIECriticalPassRule implements IRecommendationRule {
  readonly id = "CIECriticalPassRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const activeCourses = selectActiveCourses(state);
    const reg = pluggableRegulationEngine.resolveRegulation(state.presetId);

    // Dynamic CIE pass threshold calculation (percentage, default is 40% of max CIE, which is usually 40 marks -> 16 marks limit)
    const ciePassingMin = reg.internalAssessment.ciePassingMin || 40;
    const maxCie = 40; // standard maximum CIE marks
    const minCieMarks = (ciePassingMin / 100) * maxCie; // 16 marks

    const failingCourses = activeCourses.filter(c => {
      // Only check courses where CIE is populated/entered and below the passing limit
      return c.cieMarks !== undefined && c.cieMarks !== null && c.cieMarks < minCieMarks;
    });

    if (failingCourses.length > 0) {
      const courseDetails = failingCourses.map(c => `${c.name} (${c.cieMarks}/${maxCie})`).join(", ");
      const evidence = failingCourses.map(c => 
        `Course ${c.code} (${c.name}) CIE marks are ${c.cieMarks}/${maxCie} (Minimum required: ${minCieMarks})`
      );
      evidence.push(`Under ${reg.regulationName} regulations, falling below internal passing thresholds blocks SEE eligibility`);

      return {
        id: "cie_critical_failure",
        dedupeKey: "cie_passing_threshold_violation",
        category: "RISK",
        priority: "CRITICAL",
        title: "Critical Internal Evaluation (CIE) Failure",
        description: `Your internal assessment marks in key courses (${courseDetails}) fall below the statutory passing limit of ${minCieMarks} marks. Under university rules, this can void semester-end exam eligibility, leading to course detention.`,
        confidence: 98,
        evidence,
        actionableStep: {
          label: "Adjust Marks Simulation",
          path: "/"
        }
      };
    }

    return null;
  }
}
