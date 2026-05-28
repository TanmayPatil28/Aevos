export interface RecoveryInput {
  pastSgpas: number[];
  creditLoads: number[]; // credit load per past semester
}

export interface RecoveryResult {
  recoveryStrengthScore: number; // 0-100
  label: "Strong Recovery Potential" | "Fragile Recovery Pattern" | "Burnout-Prone Performance" | "Untested";
  insights: string[];
}

export const RecoveryEngine = {
  /**
   * Computes "Recovery Strength" based on bounce-back history and high-credit stability.
   */
  calculate(input: RecoveryInput): RecoveryResult {
    const { pastSgpas, creditLoads } = input;
    const insights: string[] = [];

    if (!pastSgpas || pastSgpas.length < 3) {
      return {
        recoveryStrengthScore: 50,
        label: "Untested",
        insights: ["Not enough historical data to measure recovery strength."],
      };
    }

    let bounceBackCount = 0;
    let collapseCount = 0;
    let highCreditStability = 0;

    for (let i = 1; i < pastSgpas.length; i++) {
      const prev = pastSgpas[i - 1];
      const curr = pastSgpas[i];
      const diff = curr - prev;

      // Bounce back detection
      if (prev < 7.0 && curr >= 7.5) {
        bounceBackCount++;
      }
      
      // Collapse detection
      if (prev >= 8.0 && curr < 7.0) {
        collapseCount++;
      }

      // High credit stability
      if (creditLoads[i] >= 22) {
        if (curr >= 8.0) {
          highCreditStability++;
        } else if (curr < 7.0) {
          highCreditStability--;
        }
      }
    }

    let score = 50; // base score
    score += bounceBackCount * 15;
    score -= collapseCount * 20;
    score += highCreditStability * 10;
    score = Math.max(0, Math.min(100, score));

    let label: RecoveryResult["label"] = "Untested";
    if (score >= 70) {
      label = "Strong Recovery Potential";
      insights.push("You consistently bounce back quickly after bad semesters.");
      if (highCreditStability > 0) {
        insights.push("You show excellent stability under high credit loads.");
      }
    } else if (score <= 40) {
      label = "Burnout-Prone Performance";
      insights.push("Historical data shows difficulty recovering after a low SGPA.");
      if (highCreditStability < 0) {
        insights.push("Your performance tends to drop in semesters with more than 22 credits.");
      }
    } else {
      label = "Fragile Recovery Pattern";
      insights.push("Your recovery speed is average, but vulnerable to high workload.");
    }

    return {
      recoveryStrengthScore: score,
      label,
      insights,
    };
  },
};
