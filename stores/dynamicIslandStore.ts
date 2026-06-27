import { create } from 'zustand';

// --- TYPES ---

export type ActivityType =
  | 'timer'
  | 'academic_status'
  | 'music'
  | 'forecast'
  | 'schedule'
  | 'exam_countdown'
  | 'progress'
  | 'time_context'
  | 'bunk_calculator';

export interface LiveActivity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  progress?: number; // 0-100
  timeRemaining?: number; // seconds
  isActive: boolean;
  isContextual?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: number;
}

export interface IslandAlertAction {
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface IslandAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number; // ms before auto-dismiss
  actions?: IslandAlertAction[];
  instanceId?: string;
}

export interface ExamCountdown {
  id: string;
  subject: string;
  examDate: Date;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  urgency: 'low' | 'medium' | 'high' | 'critical'; // green, yellow, orange, red
}

export type IslandState = 'idle' | 'minimal' | 'expanded' | 'split' | 'top-half' | 'fluid-drop';

// --- STORE INTERFACE ---

interface DynamicIslandState {
  // Core
  activities: LiveActivity[];
  activeAlert: IslandAlert | null;
  expandedId: string | null;

  // Exam Countdown (dedicated LEFT pill)
  examCountdown: ExamCountdown | null;
  isExamPillExpanded: boolean;

  // Ambient override lock
  isManualOverride: boolean;

  // JARVIS/AI Processing state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  
  // iOS 27 Siri AI State
  isAIActive: boolean;
  aiState: 'idle' | 'listening' | 'processing' | 'speaking';
  setIsAIActive: (active: boolean) => void;
  setAIState: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void;

  // --- ACTIONS ---

  // Activities
  addActivity: (activity: LiveActivity) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, updates: Partial<LiveActivity>) => void;
  promoteActivity: (id: string) => void;

  // Alerts
  showAlert: (alert: IslandAlert) => void;
  dismissAlert: () => void;

  // Expansion
  setExpandedId: (id: string | null) => void;

  // Exam Countdown
  setExamCountdown: (exam: ExamCountdown) => void;
  clearExamCountdown: () => void;
  setExamPillExpanded: (expanded: boolean) => void;

  // Override
  setManualOverride: (override: boolean) => void;
}

// --- STORE ---

// --- PRIORITY QUEUE FOR ACTIVITIES ---
const ACTIVITY_PRIORITY: Record<ActivityType, number> = {
  bunk_calculator: 100, // Highest Priority (Critical Alerts)
  exam_countdown: 90,
  forecast: 85,
  schedule: 80,
  timer: 70,
  progress: 60,
  music: 50,
  academic_status: 40,
  time_context: 30,
};

let activityCounter = 0;

// Sort function: Highest priority first. User-triggered (non-contextual) always beats contextual.
const sortActivities = (activities: LiveActivity[]) => {
  return [...activities].sort((a, b) => {
    // 1. Manual user activities override automatic contextual ones
    const isContA = !!a.isContextual;
    const isContB = !!b.isContextual;
    if (isContA !== isContB) {
      return isContA ? 1 : -1;
    }
    // 2. Sort by type priority
    const priorityA = ACTIVITY_PRIORITY[a.type] || 0;
    const priorityB = ACTIVITY_PRIORITY[b.type] || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    // 3. Fallback: newer is higher priority
    const timeA = a.createdAt !== undefined ? a.createdAt : 0;
    const timeB = b.createdAt !== undefined ? b.createdAt : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return 0;
  });
};

export const useDynamicIslandStore = create<DynamicIslandState>((set) => ({
  activities: [],
  activeAlert: null,
  expandedId: null,
  examCountdown: null,
  isExamPillExpanded: false,
  isManualOverride: false,
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  isAIActive: false,
  aiState: 'idle',
  setIsAIActive: (active) => set({ isAIActive: active }),
  setAIState: (state) => set({ aiState: state }),

  addActivity: (activity) =>
    set((state) => {
      const filtered = state.activities.filter((a) => a.id !== activity.id);
      const newActivity = {
        ...activity,
        createdAt: activity.createdAt !== undefined ? activity.createdAt : activityCounter++,
      };
      return { activities: sortActivities([...filtered, newActivity]) };
    }),

  removeActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      expandedId: state.expandedId === id ? null : state.expandedId,
    })),

  updateActivity: (id, updates) =>
    set((state) => {
      const updated = state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      return { activities: sortActivities(updated) };
    }),

  promoteActivity: (id) =>
    set((state) => {
      const updated = state.activities.map((a) =>
        a.id === id ? { ...a, isContextual: false } : a
      );
      return { activities: sortActivities(updated) };
    }),

  showAlert: (alert) => {
    const alertInstanceId = Math.random().toString(36).substring(7);
    set({ activeAlert: { ...alert, instanceId: alertInstanceId } });
    if (alert.duration !== 0) {
      setTimeout(() => {
        set((state) =>
          state.activeAlert?.instanceId === alertInstanceId ? { activeAlert: null } : state
        );
      }, alert.duration || 3000);
    }
  },

  dismissAlert: () => set({ activeAlert: null }),

  setExpandedId: (id) =>
    set({
      expandedId: id,
      isManualOverride: id !== null,
    }),

  setExamCountdown: (exam) => set({ examCountdown: exam }),
  clearExamCountdown: () =>
    set({ examCountdown: null, isExamPillExpanded: false }),
  setExamPillExpanded: (expanded) => set({ isExamPillExpanded: expanded }),

  setManualOverride: (override) => set({ isManualOverride: override }),
}));
