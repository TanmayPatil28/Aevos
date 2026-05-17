/**
 * core/types/events.ts
 *
 * Academic event system types for event-driven recalculation.
 *
 * When academic state changes occur (grade update, backlog clearance,
 * semester finalization), the system must propagate recalculations
 * through the entire dependency graph.
 *
 * Example: Mumbai University recalculates CGPI after backlog clearance.
 * The event bus ensures all dependent computations (placement readiness,
 * feature vectors, graduation audit) are updated deterministically.
 *
 * Design:
 * - Events are immutable records
 * - Handlers are idempotent (safe to replay)
 * - Processing order is deterministic
 * - Each event carries enough context for independent processing
 */

// ─── Event Types ────────────────────────────────────────────────────────────

export type AcademicEventType =
  | 'grade-updated'
  | 'backlog-cleared'
  | 'semester-finalized'
  | 'regulation-changed'
  | 'subject-added'
  | 'subject-removed'
  | 'credit-transferred'
  | 'attendance-updated'
  | 'internal-marks-updated'
  | 'graduation-dependency-completed'
  | 'feature-vector-refreshed';

// ─── Event Payload Contracts ────────────────────────────────────────────────

export interface GradeUpdatedPayload {
  readonly semesterId: string;
  readonly subjectId: string;
  readonly previousGradePoint: number | null;
  readonly newGradePoint: number;
  readonly previousGrade: string | null;
  readonly newGrade: string;
}

export interface BacklogClearedPayload {
  readonly semesterId: string;
  readonly subjectId: string;
  readonly subjectName: string;
  readonly newGradePoint: number;
  readonly newGrade: string;
  /** Whether CGPA needs full recalculation (university-specific) */
  readonly requiresFullRecalculation: boolean;
}

export interface SemesterFinalizedPayload {
  readonly semesterNumber: number;
  readonly sgpa: number;
  readonly totalCredits: number;
  readonly subjectCount: number;
  readonly backlogCount: number;
}

export interface RegulationChangedPayload {
  readonly previousRegulationId: string;
  readonly newRegulationId: string;
  readonly migrationApplied: boolean;
}

// ─── Event Payload Map ──────────────────────────────────────────────────────

export interface AcademicEventPayloadMap {
  'grade-updated': GradeUpdatedPayload;
  'backlog-cleared': BacklogClearedPayload;
  'semester-finalized': SemesterFinalizedPayload;
  'regulation-changed': RegulationChangedPayload;
  'subject-added': { readonly semesterId: string; readonly subjectId: string };
  'subject-removed': { readonly semesterId: string; readonly subjectId: string };
  'credit-transferred': {
    readonly subjectCode: string;
    readonly credits: number;
    readonly source: string;
  };
  'attendance-updated': { readonly subjectId: string; readonly newRate: number };
  'internal-marks-updated': {
    readonly subjectId: string;
    readonly component: string;
    readonly marks: number;
  };
  'graduation-dependency-completed': { readonly dependencyCode: string };
  'feature-vector-refreshed': { readonly snapshotId: string };
}

// ─── Academic Event ─────────────────────────────────────────────────────────

export interface AcademicEvent<T extends AcademicEventType = AcademicEventType> {
  /** Unique event identifier */
  readonly id: string;
  /** Event type discriminator */
  readonly type: T;
  /** User this event belongs to */
  readonly userId: string;
  /** Typed event payload */
  readonly payload: AcademicEventPayloadMap[T];
  /** When the event occurred */
  readonly timestamp: Date;
  /** Whether this event has been processed */
  processed: boolean;
  /** Processing metadata */
  readonly metadata?: {
    /** Which handlers processed this event */
    readonly processedBy?: readonly string[];
    /** Processing duration in milliseconds */
    readonly processingDurationMs?: number;
    /** Any errors during processing */
    readonly errors?: readonly string[];
  };
}

// ─── Event Handler Contract ─────────────────────────────────────────────────

export interface AcademicEventHandler<T extends AcademicEventType = AcademicEventType> {
  /** Human-readable handler name for logging/debugging */
  readonly name: string;
  /** Which event types this handler subscribes to */
  readonly subscribesTo: readonly T[];
  /**
   * Process an event. Must be idempotent.
   * @returns List of downstream events to emit (for cascading)
   */
  handle(event: AcademicEvent<T>): Promise<AcademicEvent[]>;
}
