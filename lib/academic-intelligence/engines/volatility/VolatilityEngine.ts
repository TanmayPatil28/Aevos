export interface VolatilityInput {
  pastSgpas: number[];
}

export interface VolatilityResult {
  trend: "IMPROVING" | "OSCILLATING" | "DECLINING" | "PLATEAU" | "UNSTABLE_EXCELLENCE";
  volatilityScore: number; // 0-100 (Higher is more volatile)
  insights: string[];
}

export const VolatilityEngine = {
  /**
   * Calculates GPA Volatility Intelligence. Tracks semester-to-semester fluctuations.
   */
  calculate(input: VolatilityInput): VolatilityResult {
    const { pastSgpas } = input;
    const insights: string[] = [];

    if (!pastSgpas || pastSgpas.length < 2) {
      return {
        trend: "PLATEAU",
        volatilityScore: 0,
        insights: ["Not enough historical data to calculate volatility."],
      };
    }

    let totalDifference = 0;
    let upSwings = 0;
    let downSwings = 0;
    
    for (let i = 1; i < pastSgpas.length; i++) {
      const diff = pastSgpas[i] - pastSgpas[i - 1];
      totalDifference += Math.abs(diff);
      if (diff > 0.2) upSwings++;
      if (diff < -0.2) downSwings++;
    }

    const averageFluctuation = totalDifference / (pastSgpas.length - 1);
    const volatilityScore = Math.min(100, Math.round(averageFluctuation * 50));

    let trend: VolatilityResult["trend"] = "PLATEAU";

    if (upSwings > 0 && downSwings > 0 && volatilityScore > 40) {
      trend = "OSCILLATING";
      insights.push("Your GPA growth pattern is unstable and historically leads to burnout.");
    } else if (downSwings > upSwings && averageFluctuation > 0.3) {
      trend = "DECLINING";
      insights.push("You are entering a statistically dangerous decline cycle.");
    } else if (upSwings > downSwings && averageFluctuation > 0.3) {
      trend = "IMPROVING";
      insights.push("Strong recovery momentum detected across recent semesters.");
    } else if (pastSgpas[pastSgpas.length - 1] > 8.5 && volatilityScore > 30) {
      trend = "UNSTABLE_EXCELLENCE";
      insights.push("High performance is present but lacks consistency. Risk of sudden drop is high.");
    } else {
      insights.push("Performance is generally stable with minor fluctuations.");
    }

    return {
      trend,
      volatilityScore,
      insights,
    };
  },
};
