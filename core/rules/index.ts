/**
 * core/rules/index.ts — Barrel export for the rules engine.
 */
export { GraceMarksEngine, GRACE_CONFIGS } from './grading/grace-marks-engine';
export type { GraceMarksInput, GraceMarksResult } from './grading/grace-marks-engine';

export { ATKTEngine, ATKT_CONFIGS } from './progression/atkt-engine';

export { BacklogResolver, BACKLOG_CONFIGS } from './backlog/backlog-resolver';
export type {
  BacklogSubject,
  BacklogResolutionConfig,
  BacklogResolutionResult,
} from './backlog/backlog-resolver';

export { RegulationEngine } from './regulation-engine';
