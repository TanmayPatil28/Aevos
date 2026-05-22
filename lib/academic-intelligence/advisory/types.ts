export interface Recommendation {
  id: string;
  dedupeKey: string; // Unique key to filter out redundant advisories
  category: "ACADEMIC" | "ATTENDANCE" | "CAREER" | "RISK";
  priority: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  confidence: number; // 0 - 100 advisory confidence rating
  evidence?: string[]; // Mathematical and regulatory evidence traces
  actionableStep?: {
    label: string;
    path: string;
  };
}

import { USMStoreState } from "../../../stores/usmStore";

export interface IRecommendationRule {
  readonly id: string;
  evaluate(state: USMStoreState): Recommendation | null;
}
