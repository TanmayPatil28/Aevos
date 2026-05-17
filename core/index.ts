/**
 * core/index.ts
 *
 * Top-level barrel export for the GradeFlow Academic Intelligence Infrastructure.
 *
 * Import hierarchy:
 *   import { SemesterPreset, AcademicEvent } from '@/core/types';
 *   import { AssessmentEngine } from '@/core/assessment';   // Phase 2
 *   import { AcademicEventBus } from '@/core/events';       // Phase 3
 *   import { SGPAForecaster } from '@/core/analytics';      // Phase 3
 *   import { SubjectCodeParser } from '@/core/parsing';     // Phase 4
 *   import { BaselinePredictor } from '@/core/ml';          // Phase 5
 *
 * Each sub-module is added incrementally as phases are completed.
 * Existing lib/* imports remain untouched.
 */

// Phase 1: Type Foundation
export * from './types';

// Phase 2: Assessment Engine + Rules Engine + Regulation Versioning
export { AssessmentEngine } from './assessment';
export { GraceMarksEngine, ATKTEngine, BacklogResolver, RegulationEngine } from './rules';

// Phase 3: Event-Driven Recalculation + Analytics + Forecasting
export {
  AcademicEventBus,
  eventBus,
  GradeUpdatedHandler,
  BacklogClearedHandler,
  SemesterFinalizedHandler,
} from './events';
export { SGPAForecaster, DropoutRiskEngine, TrajectoryAnalyzer, WhatIfEngine } from './analytics';
export type { RiskAnalysisResult, RiskLevel } from './analytics/risk-engine/dropout-risk';
export type { TrajectoryAnalysis } from './analytics/progression/trajectory-analyzer';
export type { WhatIfInput, WhatIfResult } from './analytics/simulations/what-if-engine';

// Phase 4: Parsing Infrastructure + ERP Interoperability
export {
  DefaultPDFParserAdapter,
  OCRManager,
  MockOCRProvider,
  SubjectCodeParser,
  CreditParser,
  MarksheetParser,
  COMMON_CODE_PATTERNS,
} from './parsing';

export { ERPRegistry, SyncEngine, SamarthAdapter } from './erp';

export type { ExtensionBridge, ExtensionMessage, ConsentPayload } from './extension';

// Phase 5: ML Infrastructure + NEP Support + Schema Migration
export { FeatureVectorBuilder, BaselinePredictor, ModelRegistry, PredictionPipeline } from './ml';

export { NEPEngine } from './graduation';
