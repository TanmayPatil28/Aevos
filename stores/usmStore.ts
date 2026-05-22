import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface AcademicState {
  currentCgpa: number;
  completedSemesters: number;
  earnedCredits: number;
  activeBacklogsCount: number;
  targetCgpa: number;
}

export interface CourseState {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade?: string;
  cieMarks: number;
  seeMarks?: number;
  attendanceTotal: number;
  attendanceBunked: number;
}

export interface SimulationSnapshot {
  id: string;
  name: string;
  timestamp: number;
  simulatedCourses: Record<string, { grade?: string; cieMarks?: number; seeMarks?: number }>;
  simulatedAttendance: Record<string, { bunkedOffset: number }>;
}

export interface SimulationState {
  isSimulating: boolean;
  activeSnapshotId?: string;
  history: SimulationSnapshot[];
  simulatedCourses: Record<string, { grade?: string; cieMarks?: number; seeMarks?: number }>;
  simulatedAttendance: Record<string, { bunkedOffset: number }>;
}

export interface RiskState {
  attendanceRisk: "LOW" | "MEDIUM" | "HIGH";
  backlogRisk: "LOW" | "MEDIUM" | "HIGH";
  detentionRisk: "LOW" | "MEDIUM" | "HIGH";
  placementRisk: "LOW" | "MEDIUM" | "HIGH";
  cgpaVolatility: number;
}

export interface SyncAction {
  id: string;
  type: "ATTENDANCE_EDIT" | "OCR_CORRECTION" | "SEMESTER_UPDATE" | "SIMULATION_SAVE";
  payload: any;
  timestamp: number;
}

export interface OfflineSyncState {
  pendingSyncActions: SyncAction[];
}

export interface CareerState {
  targetCompanies: string[];
  wesGpaEquivalent: number;
  ectsStandingBand: string;
}

export interface USMStoreState {
  // Identity & Preset
  presetId: string; // e.g. "sppu", "vtu", "jntuh"
  
  // Core Slices
  academic: AcademicState;
  courses: CourseState[];
  simulation: SimulationState;
  risk: RiskState;
  career: CareerState;
  sync: OfflineSyncState;

  // Actions
  setPresetId: (presetId: string) => void;
  setAcademic: (academic: Partial<AcademicState>) => void;
  setCourses: (courses: CourseState[]) => void;
  updateCourse: (courseId: string, updates: Partial<CourseState>) => void;
  
  // Simulation Actions
  startSimulation: () => void;
  stopSimulation: () => void;
  updateSimulatedCourse: (courseId: string, updates: { grade?: string; cieMarks?: number; seeMarks?: number }) => void;
  updateSimulatedAttendance: (courseId: string, bunkedOffset: number) => void;
  saveSimulationSnapshot: (name: string) => string;
  loadSimulationSnapshot: (snapshotId: string) => void;
  deleteSimulationSnapshot: (snapshotId: string) => void;
  resetSimulation: () => void;

  // Risk Actions
  setRisk: (risk: Partial<RiskState>) => void;

  // Career Actions
  setCareer: (career: Partial<CareerState>) => void;

  // Sync Actions
  queueSyncAction: (type: SyncAction["type"], payload: any) => void;
  clearSyncActions: () => void;
  
  // Hydration helper
  resetStore: () => void;
}

const initialAcademic: AcademicState = {
  currentCgpa: 8.0,
  completedSemesters: 4,
  earnedCredits: 80,
  activeBacklogsCount: 0,
  targetCgpa: 8.5,
};

const initialSimulation: SimulationState = {
  isSimulating: false,
  activeSnapshotId: undefined,
  history: [],
  simulatedCourses: {},
  simulatedAttendance: {},
};

const initialRisk: RiskState = {
  attendanceRisk: "LOW",
  backlogRisk: "LOW",
  detentionRisk: "LOW",
  placementRisk: "LOW",
  cgpaVolatility: 0,
};

const initialCareer: CareerState = {
  targetCompanies: ["tcs", "cognizant"],
  wesGpaEquivalent: 3.5,
  ectsStandingBand: "B",
};

const initialSync: OfflineSyncState = {
  pendingSyncActions: [],
};

// ─── Store Creation ──────────────────────────────────────────────────────────

export const useUSMStore = create<USMStoreState>()(
  persist(
    (set, get) => ({
      presetId: "sppu",
      academic: initialAcademic,
      courses: [],
      simulation: initialSimulation,
      risk: initialRisk,
      career: initialCareer,
      sync: initialSync,

      setPresetId: (presetId) => {
        set({ presetId });
        get().queueSyncAction("SEMESTER_UPDATE", { presetId });
      },

      setAcademic: (academicUpdates) => {
        set((state) => ({
          academic: { ...state.academic, ...academicUpdates },
        }));
        get().queueSyncAction("SEMESTER_UPDATE", { academic: academicUpdates });
      },

      setCourses: (courses) => {
        set({ courses });
        get().queueSyncAction("SEMESTER_UPDATE", { courses });
      },

      updateCourse: (courseId, updates) => {
        set((state) => {
          const updatedCourses = state.courses.map((c) =>
            c.id === courseId ? { ...c, ...updates } : c
          );
          return { courses: updatedCourses };
        });

        get().queueSyncAction("ATTENDANCE_EDIT", { courseId, updates });
      },

      startSimulation: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            isSimulating: true,
          },
        }));
      },

      stopSimulation: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            isSimulating: false,
          },
        }));
      },

      updateSimulatedCourse: (courseId, updates) => {
        set((state) => {
          const currentSim = state.simulation.simulatedCourses[courseId] || {};
          return {
            simulation: {
              ...state.simulation,
              simulatedCourses: {
                ...state.simulation.simulatedCourses,
                [courseId]: { ...currentSim, ...updates },
              },
            },
          };
        });
      },

      updateSimulatedAttendance: (courseId, bunkedOffset) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            simulatedAttendance: {
              ...state.simulation.simulatedAttendance,
              [courseId]: { bunkedOffset },
            },
          },
        }));
      },

      saveSimulationSnapshot: (name) => {
        const id = `snap_${Date.now()}`;
        const snapshot: SimulationSnapshot = {
          id,
          name,
          timestamp: Date.now(),
          simulatedCourses: get().simulation.simulatedCourses,
          simulatedAttendance: get().simulation.simulatedAttendance,
        };

        set((state) => ({
          simulation: {
            ...state.simulation,
            activeSnapshotId: id,
            history: [snapshot, ...state.simulation.history],
          },
        }));

        get().queueSyncAction("SIMULATION_SAVE", { snapshot });
        return id;
      },

      loadSimulationSnapshot: (snapshotId) => {
        const snapshot = get().simulation.history.find((s) => s.id === snapshotId);
        if (snapshot) {
          set((state) => ({
            simulation: {
              ...state.simulation,
              activeSnapshotId: snapshotId,
              simulatedCourses: snapshot.simulatedCourses,
              simulatedAttendance: snapshot.simulatedAttendance,
              isSimulating: true,
            },
          }));
        }
      },

      deleteSimulationSnapshot: (snapshotId) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeSnapshotId:
              state.simulation.activeSnapshotId === snapshotId
                ? undefined
                : state.simulation.activeSnapshotId,
            history: state.simulation.history.filter((s) => s.id !== snapshotId),
          },
        }));
      },

      resetSimulation: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeSnapshotId: undefined,
            simulatedCourses: {},
            simulatedAttendance: {},
            isSimulating: false,
          },
        }));
      },

      setRisk: (riskUpdates) => {
        set((state) => ({
          risk: { ...state.risk, ...riskUpdates },
        }));
      },

      setCareer: (careerUpdates) => {
        set((state) => ({
          career: { ...state.career, ...careerUpdates },
        }));
      },

      queueSyncAction: (type, payload) => {
        const action: SyncAction = {
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          payload,
          timestamp: Date.now(),
        };
        set((state) => ({
          sync: {
            pendingSyncActions: [...state.sync.pendingSyncActions, action],
          },
        }));
      },

      clearSyncActions: () => {
        set({ sync: { pendingSyncActions: [] } });
      },

      resetStore: () => {
        set({
          presetId: "sppu",
          academic: initialAcademic,
          courses: [],
          simulation: initialSimulation,
          risk: initialRisk,
          career: initialCareer,
          sync: initialSync,
        });
      },
    }),
    {
      name: "gradeflow-usm-storage",
      storage: createJSONStorage(() => typeof window !== "undefined" ? localStorage : undefined as any),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version < 1) {
          return {
            presetId: "sppu",
            academic: initialAcademic,
            courses: [],
            simulation: initialSimulation,
            risk: initialRisk,
            career: initialCareer,
            sync: initialSync,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: (state) => {
        return (hydratedState, error) => {
          if (error || !hydratedState) {
            return;
          }
          const isValid =
            hydratedState.presetId &&
            typeof hydratedState.presetId === "string" &&
            hydratedState.academic &&
            typeof hydratedState.academic.currentCgpa === "number" &&
            Array.isArray(hydratedState.courses);

          if (!isValid) {
            hydratedState.presetId = "sppu";
            hydratedState.academic = { ...initialAcademic };
            hydratedState.courses = [];
            hydratedState.simulation = { ...initialSimulation };
            hydratedState.risk = { ...initialRisk };
            hydratedState.career = { ...initialCareer };
            hydratedState.sync = { ...initialSync };
          }
        };
      },
    }
  )
);
