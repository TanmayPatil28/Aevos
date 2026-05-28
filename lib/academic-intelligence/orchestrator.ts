import { IntelligenceContext, IntelligenceResult, SimulationScenario } from "./types";
import { IntelligenceSandbox } from "./sandbox/IntelligenceSandbox";
import { runTargetCgpaEngine, TargetCgpaParams, TargetCgpaOutcome } from "./engines/strategy/TargetCgpaEngine";
import { runDetentionRiskEngine, DetentionRiskOutcome } from "./engines/risk/DetentionRiskEngine";
import { runLongitudinalAnalyzer, LongitudinalOutcome } from "./engines/modeling/LongitudinalAnalyzer";

/**
 * Intelligence Orchestrator
 * 
 * The single entry point for the UI layer to interface with the Intelligence Engines.
 * Enforces the strict rule that UI components cannot contain academic logic or mutate state directly.
 */
export class IntelligenceOrchestrator {
  private baseContext: IntelligenceContext;

  constructor(context: IntelligenceContext) {
    this.baseContext = context;
  }

  /**
   * Executes the Target CGPA Strategy Engine against a Sandbox overlay.
   */
  public getTargetCgpaStrategy(
    params: TargetCgpaParams, 
    scenario?: SimulationScenario
  ): IntelligenceResult<TargetCgpaOutcome> {
    const activeContext = this.applyScenarioToContext(scenario);
    return runTargetCgpaEngine(activeContext, params);
  }

  /**
   * Executes the Detention Risk Engine against a Sandbox overlay.
   */
  public getDetentionRisk(
    scenario?: SimulationScenario
  ): IntelligenceResult<DetentionRiskOutcome> {
    const activeContext = this.applyScenarioToContext(scenario);
    return runDetentionRiskEngine(activeContext);
  }

  /**
   * Executes the Longitudinal Analyzer against a Sandbox overlay.
   */
  public getLongitudinalAnalysis(
    scenario?: SimulationScenario
  ): IntelligenceResult<LongitudinalOutcome> {
    const activeContext = this.applyScenarioToContext(scenario);
    return runLongitudinalAnalyzer(activeContext);
  }

  /**
   * Private helper to cleanly apply a scenario using the Sandbox and return an isolated IntelligenceContext.
   */
  private applyScenarioToContext(scenario?: SimulationScenario): IntelligenceContext {
    if (!scenario) return this.baseContext;

    const sandbox = new IntelligenceSandbox(this.baseContext);
    sandbox.applyScenario(scenario);

    return {
      ...this.baseContext,
      authoritativeProfile: sandbox.getProjectedProfile(), // Isolated deep clone
    };
  }
}
