import { IRecommendationRule, Recommendation } from "../types";
import { USMStoreState } from "../../../../stores/usmStore";
import { selectPlacementEligibility } from "../../../../stores/selectors/placement";
import { selectDerivedGPA, selectSemesterCredits } from "../../../../stores/selectors/academic";

export class TargetCGPAPlacementGateRule implements IRecommendationRule {
  readonly id = "TargetCGPAPlacementGateRule";

  evaluate(state: USMStoreState): Recommendation | null {
    const placement = selectPlacementEligibility(state);
    const { cgpa: currentCgpa } = selectDerivedGPA(state);
    const { totalActiveCredits } = selectSemesterCredits(state);

    const borderlineCompanies = placement.companies.filter(c => c.eligible === "BORDERLINE");

    if (borderlineCompanies.length > 0) {
      // Find the borderline company with the highest cutoff to target
      const targetCompany = borderlineCompanies.reduce((prev, curr) => 
        curr.cgpaCutoff > prev.cgpaCutoff ? curr : prev
      , borderlineCompanies[0]);

      const targetCgpa = targetCompany.cgpaCutoff;
      const earnedCredits = state.academic.earnedCredits;
      
      // Default semester credits to 20 if none registered in active courses to prevent NaN/division-by-zero
      const semCredits = totalActiveCredits > 0 ? totalActiveCredits : 20;

      const totalCredits = earnedCredits + semCredits;
      const requiredPoints = (targetCgpa * totalCredits) - (currentCgpa * earnedCredits);
      const neededSgpa = requiredPoints / semCredits;

      if (neededSgpa > 0 && neededSgpa <= 10.0) {
        const confidence = Math.round(90 - (neededSgpa - currentCgpa) * 10);
        const safeConfidence = Math.max(40, Math.min(98, confidence));

        const evidence = [
          `Current cumulative standing is ${currentCgpa.toFixed(2)} CGPA`,
          `Corporate cutoff for ${targetCompany.name} is ${targetCgpa.toFixed(2)} CGPA`,
          `Completed credits: ${earnedCredits}; Registered semester load: ${semCredits} credits`,
          `Target SGPA required to cross this cutoff gate is exactly ${neededSgpa.toFixed(2)}`
        ];

        return {
          id: `target_placement_gate_${targetCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          dedupeKey: "placement_borderline_cgpa_gate_target",
          category: "CAREER",
          priority: "INFO",
          title: `Unlock Placement Gate for ${targetCompany.name}`,
          description: `You are within striking distance of the ${targetCompany.name} eligibility cutoff (${targetCgpa.toFixed(2)} CGPA). Securing an SGPA of ${neededSgpa.toFixed(2)} in your upcoming ${semCredits}-credit semester will successfully unlock this recruiter gateway.`,
          confidence: safeConfidence,
          evidence,
          actionableStep: {
            label: "Review Target Strategies",
            path: "/strategy"
          }
        };
      }
    }

    return null;
  }
}
