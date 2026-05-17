/**
 * core/events/index.ts — Barrel export for the events module.
 */
export { AcademicEventBus, eventBus } from './event-bus';
export { GradeUpdatedHandler } from './handlers/grade-updated.handler';
export { BacklogClearedHandler } from './handlers/backlog-cleared.handler';
export { SemesterFinalizedHandler } from './handlers/semester-finalized.handler';
