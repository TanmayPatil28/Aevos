export type AcademicEventType = 
  | "SNAPSHOT_HYDRATED"
  | "SIMULATION_APPLIED"
  | "SIMULATION_REMOVED"
  | "BACKLOG_RESOLVED"
  | "TARGET_CREATED"
  | "ACTIVE_TERM_UPDATED"
  | "ATTENDANCE_THRESHOLD_CHANGED";

export interface AcademicEvent {
  type: AcademicEventType;
  payload?: any;
  timestamp: number;
}

export type AcademicEventListener = (event: AcademicEvent) => void;

class EventBus {
  private listeners: Map<AcademicEventType, Set<AcademicEventListener>> = new Map();

  subscribe(type: AcademicEventType, listener: AcademicEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  publish(type: AcademicEventType, payload?: any) {
    const event: AcademicEvent = {
      type,
      payload,
      timestamp: Date.now()
    };

    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (e) {
          console.error(`Error in AcademicEventBus listener for ${type}:`, e);
        }
      });
    }
  }
}

// Global singleton instance
export const AcademicEventBus = new EventBus();
