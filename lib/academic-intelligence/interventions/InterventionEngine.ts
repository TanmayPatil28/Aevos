import { IntelligenceContext } from "../types";
import { AcademicIntervention, AcademicHealthScore, WorkspaceContextType, PriorityTier } from "./types";
import { runDetentionRiskEngine, DetentionRiskOutcome } from "../engines/risk/DetentionRiskEngine";
import { runLongitudinalAnalyzer, LongitudinalOutcome } from "../engines/modeling/LongitudinalAnalyzer";

export class InterventionEngine {
  /**
   * Generates all interventions based on the current academic context.
   */
  static generateInterventions(context: IntelligenceContext): AcademicIntervention[] {
    const interventions: AcademicIntervention[] = [];
    
    // 1. Run Detention Risk Engine
    if (context.authoritativeProfile.courses.some(c => c.credits > 0)) {
      const riskResult = runDetentionRiskEngine(context);
      
      const riskIntervention = this.mapDetentionRisk(riskResult.outcome, riskResult.explanation);
      if (riskIntervention) {
        interventions.push(riskIntervention);
      }
    }

    // 2. Run Longitudinal Analyzer
    if (context.authoritativeProfile.semesterHistory.length > 0) {
      const longResult = runLongitudinalAnalyzer(context);
      
      const trendIntervention = this.mapLongitudinalTrend(longResult.outcome, longResult.explanation);
      if (trendIntervention) {
        interventions.push(trendIntervention);
      }
    }

    // Sort by priority and urgency
    return this.sortInterventions(interventions);
  }

  /**
   * Maps Detention Risk outcome to an Intervention
   */
  private static mapDetentionRisk(outcome: DetentionRiskOutcome, explanation: any): AcademicIntervention | null {
    if (outcome.riskLevel === "LOW") {
      return null;
    }

    let priorityTier: PriorityTier = "MEDIUM";
    let urgencyScore = 50;
    
    if (outcome.riskLevel === "CRITICAL") {
      priorityTier = "CRITICAL";
      urgencyScore = 95;
    } else if (outcome.riskLevel === "HIGH") {
      priorityTier = "HIGH";
      urgencyScore = 80;
    }

    const backlogBuffer = outcome.maxAllowedBacklogs - outcome.activeBacklogs;

    return {
      id: `risk-detention-${Date.now()}`,
      type: "RISK",
      priorityTier,
      status: "ACTIVE",
      title: `${outcome.riskLevel} Detention Risk`,
      description: `You have ${outcome.activeBacklogs} active backlogs. Institutional ATKT limit is ${outcome.maxAllowedBacklogs}. You are ${backlogBuffer} backlogs away from detention.`,
      urgencyScore,
      impactScore: 90, // Detention has massive impact
      actionTrigger: "/strategy/backlog-recovery",
      explanation,
      createdAt: Date.now()
    };
  }

  /**
   * Maps Longitudinal Trend outcome to an Intervention
   */
  private static mapLongitudinalTrend(outcome: LongitudinalOutcome, explanation: any): AcademicIntervention | null {
    if (outcome.trendDirection === "DOWNWARD" && outcome.consecutiveDrops >= 2) {
      return {
        id: `trend-downward-${Date.now()}`,
        type: "STRATEGY_ALERT",
        priorityTier: "HIGH",
        status: "ACTIVE",
        title: "Academic Momentum Dropping",
        description: `Your SGPA has dropped for ${outcome.consecutiveDrops} consecutive semesters. Velocity is ${outcome.velocity}.`,
        urgencyScore: 70,
        impactScore: 60,
        actionTrigger: "/strategy/optimization",
        explanation,
        createdAt: Date.now()
      };
    }

    if (outcome.trendDirection === "UPWARD" && outcome.velocity > 0) {
      return {
        id: `trend-upward-${Date.now()}`,
        type: "MILESTONE",
        priorityTier: "LOW",
        status: "ACTIVE",
        title: "Strong Upward Momentum!",
        description: `Your SGPA is improving with a velocity of +${outcome.velocity} per semester! Keep it up.`,
        urgencyScore: 10,
        impactScore: 40,
        explanation,
        createdAt: Date.now()
      };
    }

    return null;
  }

  /**
   * Derives Workspace Contexts based on active interventions
   */
  static computeWorkspaceContexts(interventions: AcademicIntervention[]): WorkspaceContextType[] {
    const contexts = new Set<WorkspaceContextType>();
    
    interventions.forEach(inv => {
      if (inv.priorityTier === "CRITICAL" || inv.actionTrigger === "/strategy/backlog-recovery") {
        contexts.add("RECOVERY");
      }
      if (inv.type === "OPPORTUNITY" || inv.actionTrigger === "/strategy/optimization") {
        contexts.add("OPTIMIZATION");
      }
    });

    if (contexts.size === 0) {
      contexts.add("ACTIVE_SEMESTER");
    }

    return Array.from(contexts);
  }

  /**
   * Computes a deterministic health score
   */
  static computeHealthScore(interventions: AcademicIntervention[], context: IntelligenceContext): AcademicHealthScore {
    // Basic deterministic heuristic for MVP
    let risk = 0;
    
    const criticalRisk = interventions.find(i => i.priorityTier === "CRITICAL");
    const highRisk = interventions.find(i => i.priorityTier === "HIGH");
    
    if (criticalRisk) risk = 90;
    else if (highRisk) risk = 60;
    else risk = 10;

    let momentum = 50;
    const upward = interventions.find(i => i.title.includes("Upward"));
    const downward = interventions.find(i => i.title.includes("Dropping"));
    
    if (upward) momentum = 80;
    if (downward) momentum = 20;

    let recovery = 100 - risk; // Inverse to risk
    let stability = momentum;

    let overall = (100 - risk) * 0.5 + momentum * 0.3 + stability * 0.2;

    return {
      overall: Math.round(overall),
      risk: Math.round(risk),
      momentum: Math.round(momentum),
      stability: Math.round(stability),
      recovery: Math.round(recovery)
    };
  }

  private static sortInterventions(interventions: AcademicIntervention[]): AcademicIntervention[] {
    const tierWeight: Record<PriorityTier, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    return interventions.sort((a, b) => {
      if (tierWeight[a.priorityTier] !== tierWeight[b.priorityTier]) {
        return tierWeight[b.priorityTier] - tierWeight[a.priorityTier];
      }
      return b.urgencyScore - a.urgencyScore;
    });
  }
}
