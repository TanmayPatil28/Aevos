/**
 * core/events/event-bus.ts
 *
 * Synchronous in-memory event bus for the Academic Intelligence Infrastructure.
 *
 * This bus handles cascading recalculations when academic state changes.
 * Design:
 * - Handlers are registered per event type.
 * - Processing is synchronous (Phase 3 spec) but returns Promises for future BullMQ compatibility.
 * - Events can emit downstream events (cascading).
 * - Implements cycle detection to prevent infinite recalculation loops.
 */

import type { AcademicEvent, AcademicEventType, AcademicEventHandler } from '../types';

export class AcademicEventBus {
  private readonly handlers: Map<AcademicEventType, AcademicEventHandler[]> = new Map();
  private readonly maxDepth: number;

  constructor(maxDepth = 5) {
    this.maxDepth = maxDepth;
  }

  /**
   * Registers a handler for specific event types.
   */
  register(handler: AcademicEventHandler): void {
    for (const eventType of handler.subscribesTo) {
      const existing = this.handlers.get(eventType) ?? [];
      existing.push(handler);
      this.handlers.set(eventType, existing);
    }
  }

  /**
   * Dispatches an event and processes any cascading downstream events.
   *
   * @param event The root event to dispatch
   * @returns Array of all events processed in the cascade
   */
  async dispatch(event: AcademicEvent): Promise<AcademicEvent[]> {
    const processedEvents: AcademicEvent[] = [];
    const queue: { event: AcademicEvent; depth: number }[] = [{ event, depth: 0 }];

    while (queue.length > 0) {
      const { event: currentEvent, depth } = queue.shift()!;

      if (depth > this.maxDepth) {
        console.warn(
          `[EventBus] Max depth (${this.maxDepth}) reached. Halting cascade for event ${currentEvent.id}.`
        );
        continue;
      }

      // Mark as processed
      currentEvent.processed = true;
      processedEvents.push(currentEvent);

      const typeHandlers = this.handlers.get(currentEvent.type) ?? [];
      const processedBy: string[] = [];

      for (const handler of typeHandlers) {
        try {
          const startTime = performance.now();
          const downstreamEvents = await handler.handle(currentEvent);
          const duration = performance.now() - startTime;

          processedBy.push(handler.name);

          // Enqueue downstream events
          for (const downstream of downstreamEvents) {
            queue.push({ event: downstream, depth: depth + 1 });
          }
        } catch (error) {
          console.error(
            `[EventBus] Handler ${handler.name} failed on event ${currentEvent.id}:`,
            error
          );
          // In a real system, we'd dead-letter this or retry.
        }
      }

      // Update metadata (mutating the processed event object for tracing)
      (currentEvent as any).metadata = {
        ...currentEvent.metadata,
        processedBy,
      };
    }

    return processedEvents;
  }
}

// Global singleton instance for Phase 3
export const eventBus = new AcademicEventBus();
