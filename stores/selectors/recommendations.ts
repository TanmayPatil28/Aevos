import { USMStoreState } from "../usmStore";
import { createSelector } from "./memo";
import { synthesizeRecommendations, Recommendation } from "../../lib/academic-intelligence";

/**
 * Recommendations Selector.
 * Dynamically evaluates and resolves the prioritized, deduped recommendation pool.
 * Memoized using WeakMap to ensure absolute SSR request safety and garbage collection isolation.
 */
export const selectRecommendations = createSelector((state: USMStoreState): Recommendation[] => {
  return synthesizeRecommendations(state);
});
