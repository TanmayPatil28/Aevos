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
  metadata?: Record<string, any>;
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

export interface AcademicStreak {
  count: number;
  type: 'study' | 'attendance' | 'assignment';
  label: string;
}

export type IslandState = 'idle' | 'minimal' | 'expanded' | 'split';

// --- STORE INTERFACE ---

interface DynamicIslandState {
  // Core
  activities: LiveActivity[];
  activeAlert: IslandAlert | null;
  expandedId: string | null;

  // Exam Countdown (dedicated LEFT pill)
  examCountdown: ExamCountdown | null;
  isExamPillExpanded: boolean;

  // Academic Streak (hover-reveal)
  streak: AcademicStreak | null;

  // Ambient override lock
  isManualOverride: boolean;

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

  // Streak
  setStreak: (streak: AcademicStreak | null) => void;

  // Override
  setManualOverride: (override: boolean) => void;
}

// --- STORE ---

export const useDynamicIslandStore = create<DynamicIslandState>((set) => ({
  activities: [],
  activeAlert: null,
  expandedId: null,
  examCountdown: null,
  isExamPillExpanded: false,
  streak: null,
  isManualOverride: false,

  addActivity: (activity) =>
    set((state) => {
      const filtered = state.activities.filter((a) => a.id !== activity.id);
      const newActivities = [...filtered, activity];
      // Sort: user activities (non-contextual) always first
      newActivities.sort((a, b) => {
        if (a.isContextual === b.isContextual) return 0;
        return a.isContextual ? 1 : -1;
      });
      return { activities: newActivities };
    }),

  removeActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      expandedId: state.expandedId === id ? null : state.expandedId,
    })),

  updateActivity: (id, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  promoteActivity: (id) =>
    set((state) => {
      const target = state.activities.find((a) => a.id === id);
      if (!target) return state;
      const others = state.activities.filter((a) => a.id !== id);
      return {
        activities: [{ ...target, isContextual: false }, ...others],
      };
    }),

  showAlert: (alert) => {
    set({ activeAlert: alert });
    if (alert.duration !== 0) {
      setTimeout(() => {
        set((state) =>
          state.activeAlert?.id === alert.id ? { activeAlert: null } : state
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

  setStreak: (streak) => set({ streak }),

  setManualOverride: (override) => set({ isManualOverride: override }),
}));
