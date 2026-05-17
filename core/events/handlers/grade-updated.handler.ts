/**
 * core/events/handlers/grade-updated.handler.ts
 *
 * Handler for the 'grade-updated' event.
 * Triggers re-computation of the semester's SGPA.
 */

import type { AcademicEvent, AcademicEventHandler } from '../../types';

export class GradeUpdatedHandler implements AcademicEventHandler<'grade-updated'> {
  readonly name = 'GradeUpdatedHandler';
  readonly subscribesTo = ['grade-updated'] as const;

  async handle(event: AcademicEvent<'grade-updated'>): Promise<AcademicEvent[]> {
    const { semesterId } = event.payload;

    // In a real system, we would:
    // 1. Fetch all subjects for this semesterId from the DB
    // 2. Re-run the grading engine to compute new SGPA
    // 3. Save new SGPA to DB

    // Emit downstream event
    // If the SGPA changed, we might emit 'semester-finalized' or 'semester-sgpa-updated'
    // For now, we simulate returning a downstream event.

    // Simulate recomputation
    const simulatedNewSgpa = 8.5; // Stub

    const downstreamEvent: AcademicEvent<'semester-finalized'> = {
      id: `evt-sem-fin-${semesterId}-${Date.now()}`,
      type: 'semester-finalized',
      userId: event.userId,
      payload: {
        semesterNumber: 1, // Stub
        sgpa: simulatedNewSgpa,
        totalCredits: 20, // Stub
        subjectCount: 5, // Stub
        backlogCount: 0, // Stub
      },
      timestamp: new Date(),
      processed: false,
    };

    return [downstreamEvent];
  }
}
