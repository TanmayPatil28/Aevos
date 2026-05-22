import { IRecommendationRule } from "./types";

class RecommendationRuleRegistry {
  private rules: IRecommendationRule[] = [];

  /**
   * Registers a single recommendation rule.
   */
  register(rule: IRecommendationRule): void {
    if (this.rules.some(r => r.id === rule.id)) {
      return; // Rule already registered
    }
    this.rules.push(rule);
  }

  /**
   * Returns all currently registered recommendation rules.
   */
  getRules(): IRecommendationRule[] {
    return [...this.rules];
  }

  /**
   * Clears all registered rules (mainly useful for fresh test runs).
   */
  clear(): void {
    this.rules = [];
  }
}

export const recommendationRuleRegistry = new RecommendationRuleRegistry();
