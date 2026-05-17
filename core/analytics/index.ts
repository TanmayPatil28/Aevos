/**
 * core/analytics/index.ts — Barrel export for the analytics module.
 */
export { SGPAForecaster } from './forecasting/sgpa-forecaster';
export type { ForecasterResult } from './forecasting/sgpa-forecaster';

export { DropoutRiskEngine } from './risk-engine/dropout-risk';
export type { RiskLevel, RiskAnalysisResult } from './risk-engine/dropout-risk';

export { TrajectoryAnalyzer } from './progression/trajectory-analyzer';
export type { TrajectoryAnalysis } from './progression/trajectory-analyzer';

export { WhatIfEngine } from './simulations/what-if-engine';
export type { WhatIfInput, WhatIfResult } from './simulations/what-if-engine';
