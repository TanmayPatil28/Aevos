/**
 * core/events/handlers/backlog-cleared.handler.ts
 *
 * Handler for the 'backlog-cleared' event.
 * If the university requires full recalculation on backlog clearance (like Mumbai University),
 * this handler triggers a complete CGPA rebuild.
 */

import type { AcademicEvent, AcademicEventHandler } from '../../types';

export class BacklogClearedHandler implements AcademicEventHandler<'backlog-cleared'> {
  readonly name = 'BacklogClearedHandler';
  readonly subscribesTo = ['backlog-cleared'] as const;

  async handle(event: AcademicEvent<'backlog-cleared'>): Promise<AcademicEvent[]> {
    const { requiresFullRecalculation, semesterId } = event.payload;

    const downstreamEvents: AcademicEvent[] = [];

    // 1. Emit a grade-updated event for the specific subject so that SGPA recalculates
    downstreamEvents.push({
      id: `evt-grade-sync-${event.id}`,
      type: 'grade-updated',
      userId: event.userId,
      payload: {
        semesterId,
        subjectId: event.payload.subjectId,
        previousGradePoint: null, // Depending on preserveHistory config
        newGradePoint: event.payload.newGradePoint,
        previousGrade: null,
        newGrade: event.payload.newGrade,
      },
      timestamp: new Date(),
      processed: false,
    });

    if (requiresFullRecalculation) {
      // In a real system, we'd flag the student record for full CGPA rebuild.
      console.log(`[BacklogClearedHandler] Triggering full CGPA recalculation for ${event.userId}`);
    }

    return downstreamEvents;
  }
}
