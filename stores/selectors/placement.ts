import { USMStoreState } from "../usmStore";
import { selectDerivedGPA } from "./academic";
import { createSelector } from "./memo";

export interface PlacementCompany {
  name: string;
  cgpaCutoff: number;
  maxBacklogs: number;
  requiredCredits: number;
  eligible: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  reason: string;
}

export interface DerivedPlacementStatus {
  overallStatus: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  companies: PlacementCompany[];
  eligibleCount: number;
  totalCount: number;
}

// ─── Standard Company Placement Cutoffs Benchmark ───────────────────────────
export const COMPANYS_DATA = [
  { name: "TCS", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Infosys", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Cognizant", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60 },
  { name: "Accenture", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60 },
  { name: "Wipro", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60 },
  { name: "FAANG / Top Tier", cgpaCutoff: 8.0, maxBacklogs: 0, requiredCredits: 80 },
];

/**
 * Placement Eligibility Selector.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectPlacementEligibility = createSelector((state: USMStoreState): DerivedPlacementStatus => {
  const { cgpa } = selectDerivedGPA(state);
  const backlogs = state.academic.activeBacklogsCount;
  const totalCredits = state.academic.earnedCredits;

  const companies: PlacementCompany[] = COMPANYS_DATA.map((company) => {
    let eligible: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE" = "ELIGIBLE";
    const reasons: string[] = [];

    if (cgpa < company.cgpaCutoff) {
      if (company.cgpaCutoff - cgpa <= 0.25) {
        eligible = "BORDERLINE";
        reasons.push(`CGPA is ${cgpa} (Cutoff: ${company.cgpaCutoff})`);
      } else {
        eligible = "INELIGIBLE";
        reasons.push(`CGPA is below cutoff by ${(company.cgpaCutoff - cgpa).toFixed(2)}`);
      }
    }

    if (backlogs > company.maxBacklogs) {
      eligible = "INELIGIBLE";
      reasons.push(`Active backlogs: ${backlogs} (Max allowed: ${company.maxBacklogs})`);
    }

    if (totalCredits < company.requiredCredits) {
      if (company.requiredCredits - totalCredits <= 6) {
        if (eligible !== "INELIGIBLE") eligible = "BORDERLINE";
        reasons.push(`Earned credits: ${totalCredits} (Required: ${company.requiredCredits})`);
      } else {
        eligible = "INELIGIBLE";
        reasons.push(`Insufficient credits: ${totalCredits}/${company.requiredCredits}`);
      }
    }

    return {
      name: company.name,
      cgpaCutoff: company.cgpaCutoff,
      maxBacklogs: company.maxBacklogs,
      requiredCredits: company.requiredCredits,
      eligible,
      reason: reasons.length > 0 ? reasons.join(", ") : "Meets all baseline requirements",
    };
  });

  const eligibleCount = companies.filter((c) => c.eligible === "ELIGIBLE").length;
  const isAnyIneligible = companies.some((c) => c.eligible === "INELIGIBLE");
  const isAnyBorderline = companies.some((c) => c.eligible === "BORDERLINE");

  const overallStatus = isAnyIneligible
    ? "INELIGIBLE"
    : isAnyBorderline
    ? "BORDERLINE"
    : "ELIGIBLE";

  return {
    overallStatus,
    companies,
    eligibleCount,
    totalCount: companies.length,
  };
});
