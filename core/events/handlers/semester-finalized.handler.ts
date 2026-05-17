/**
 * core/events/handlers/semester-finalized.handler.ts
 *
 * Handler for the 'semester-finalized' event.
 * Triggers analytics updates: feature vector refresh and graduation audit checks.
 */

import type { AcademicEvent, AcademicEventHandler } from '../../types';

export class SemesterFinalizedHandler implements AcademicEventHandler<'semester-finalized'> {
  readonly name = 'SemesterFinalizedHandler';
  readonly subscribesTo = ['semester-finalized'] as const;

  async handle(event: AcademicEvent<'semester-finalized'>): Promise<AcademicEvent[]> {
    const downstreamEvents: AcademicEvent[] = [];

    // 1. Trigger feature vector refresh
    downstreamEvents.push({
      id: `evt-feature-refresh-${event.id}`,
      type: 'feature-vector-refreshed',
      userId: event.userId,
      payload: {
        snapshotId: `snap-${Date.now()}`,
      },
      timestamp: new Date(),
      processed: false,
    });

    // 2. Check graduation dependencies if this is a final semester
    // In a real system we'd check if event.payload.semesterNumber == totalSemesters
    // For now we just return the refresh event.

    return downstreamEvents;
  }
}
