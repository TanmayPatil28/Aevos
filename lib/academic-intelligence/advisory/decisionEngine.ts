import { USMStoreState } from "../../../stores/usmStore";
import { Recommendation } from "./types";
import { recommendationRuleRegistry } from "./registry";

// Import rules to trigger static enrollment
import { AttendancePlacementRiskRule } from "./rules/attendancePlacementRisk";
import { TrajectorySlopeWarningRule } from "./rules/trajectorySlopeWarning";
import { TargetCGPAPlacementGateRule } from "./rules/targetCgpaPlacementGate";
import { CIECriticalPassRule } from "./rules/cieCriticalPass";
import { ArrearRecoveryRule } from "./rules/arrearRecovery";
import { SafeBunkOptimizerRule } from "./rules/safeBunkOptimizer";

// Enroll default rules into the registry
recommendationRuleRegistry.register(new AttendancePlacementRiskRule());
recommendationRuleRegistry.register(new TrajectorySlopeWarningRule());
recommendationRuleRegistry.register(new TargetCGPAPlacementGateRule());
recommendationRuleRegistry.register(new CIECriticalPassRule());
recommendationRuleRegistry.register(new ArrearRecoveryRule());
recommendationRuleRegistry.register(new SafeBunkOptimizerRule());

/**
 * Synthesizes all actionable recommendations dynamically from live store telemetry.
 * Implements a strict, request-isolated deduplication and multi-factor sorting pipeline:
 * rules ➔ recommendation pool ➔ dedupe ➔ severity/confidence sort.
 */
export function synthesizeRecommendations(state: USMStoreState): Recommendation[] {
  const rules = recommendationRuleRegistry.getRules();
  const pool: Recommendation[] = [];

  // 1. Evaluate all rules
  for (const rule of rules) {
    try {
      const recommendation = rule.evaluate(state);
      if (recommendation) {
        pool.push(recommendation);
      }
    } catch (error) {
      console.error(`Error executing recommendation rule ${rule.id}:`, error);
    }
  }

  // 2. Deduplicate based on dedupeKey
  // If keys collide, we keep the one with higher severity (CRITICAL > WARNING > INFO), 
  // then higher confidence, then first in pool.
  const priorityWeight = {
    CRITICAL: 3,
    WARNING: 2,
    INFO: 1
  };

  const dedupedMap = new Map<string, Recommendation>();
  for (const rec of pool) {
    const existing = dedupedMap.get(rec.dedupeKey);
    if (!existing) {
      dedupedMap.set(rec.dedupeKey, rec);
    } else {
      const existingWeight = priorityWeight[existing.priority];
      const newWeight = priorityWeight[rec.priority];

      if (newWeight > existingWeight) {
        dedupedMap.set(rec.dedupeKey, rec);
      } else if (newWeight === existingWeight && rec.confidence > existing.confidence) {
        dedupedMap.set(rec.dedupeKey, rec);
      }
    }
  }

  const dedupedList = Array.from(dedupedMap.values());

  // 3. Sort by priority tier, then confidence descending
  dedupedList.sort((a, b) => {
    const weightA = priorityWeight[a.priority];
    const weightB = priorityWeight[b.priority];

    if (weightA !== weightB) {
      return weightB - weightA; // Higher weight (priority) comes first
    }
    return b.confidence - a.confidence; // Higher confidence rating comes first
  });

  return dedupedList;
}
