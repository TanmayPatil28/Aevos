import { create } from 'zustand';

interface TimerState {
  activeTimerTaskId: string | null;
  activeTimerTaskName: string;
  timerRemaining: number;
  isTimerRunning: boolean;
  setActiveTimerTask: (id: string | null, name: string) => void;
  setTimerRemaining: (time: number | ((prev: number) => number)) => void;
  setIsTimerRunning: (isRunning: boolean | ((prev: boolean) => boolean)) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  activeTimerTaskId: null,
  activeTimerTaskName: "",
  timerRemaining: 25 * 60,
  isTimerRunning: false,
  setActiveTimerTask: (id, name) => set({ activeTimerTaskId: id, activeTimerTaskName: name, timerRemaining: 25 * 60, isTimerRunning: true }),
  setTimerRemaining: (time) => set((state) => ({ timerRemaining: typeof time === 'function' ? time(state.timerRemaining) : time })),
  setIsTimerRunning: (isRunning) => set((state) => ({ isTimerRunning: typeof isRunning === 'function' ? isRunning(state.isTimerRunning) : isRunning })),
}));
