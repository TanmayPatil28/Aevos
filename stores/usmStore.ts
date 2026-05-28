import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AcademicIdentityState } from "../types/academicProfile";

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
  semester: number;
  credits: number;
  grade?: string;
  cieMarks: number;
  seeMarks?: number;
  attendanceTotal: number;
  attendanceBunked: number;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  type: "LECTURE" | "PRACTICAL" | "LAB" | "TUTORIAL";
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  room?: string;     // e.g. "B-218", "MAC Lab"
  batch?: string;    // e.g. "H1", "H2", "H3", "ALL"
  faculty?: string;  // e.g. "Dr. Prashant Metri"
}

export interface TimetableState {
  monday: TimetableEntry[];
  tuesday: TimetableEntry[];
  wednesday: TimetableEntry[];
  thursday: TimetableEntry[];
  friday: TimetableEntry[];
  saturday: TimetableEntry[];
  sunday: TimetableEntry[];
}

export interface AttendanceHistoryEvent {
  id: string;
  dateStr: string; // e.g. "2026-05-28"
  timestamp: number;
  courseId: string;
  action: "ATTENDED" | "BUNKED";
}

import { SimulationScenario } from "../lib/academic-intelligence/types";

export interface SimulationState {
  activeScenarios: SimulationScenario[];
  selectedScenarioId: string | null;
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

import { AcademicIntervention, AcademicHealthScore, WorkspaceContextType } from "../lib/academic-intelligence/interventions/types";
import { AcademicEventBus } from "../lib/events/AcademicEventBus";
import { InterventionEngine } from "../lib/academic-intelligence/interventions/InterventionEngine";

export interface CareerState {
  targetCompanies: string[];
  wesGpaEquivalent: number;
  ectsStandingBand: string;
  // New Intelligence Fields
  branch: string;
  skills: string[];
  targetRole: string;
  targetPackage: string;
}

export interface WorkspaceState {
  selectedSubjectId: string | null;
  activePanel: "NONE" | "PREDICTOR" | "STRATEGY" | "BACKLOG" | "INTERVENTIONS";
  globalTargetCgpa: number | null;
  mode: "DEFAULT" | "SANDBOX" | "RECOVERY" | "OPTIMIZATION" | "FOCUS";
  preferredDensity: "COMFORTABLE" | "COMPACT";
}

export interface SemesterHistoryEntry {
  semester: number;
  sgpa: number;
  credits: number;
  earnedCredits: number;
}

export interface AcademicEvent {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  type: "EXAM" | "HOLIDAY" | "EVENT" | "FEST" | "OTHER";
}

export interface USMStoreState {
  // Identity & Preset
  presetId: string; // e.g. "sppu", "vtu", "jntuh"
  identity: AcademicIdentityState;
  
  // Core Slices
  academic: AcademicState;
  courses: CourseState[];
  semesterHistory: SemesterHistoryEntry[];
  simulation: SimulationState;
  career: CareerState;
  sync: OfflineSyncState;
  workspaceUi: WorkspaceState;
  timetable: TimetableState;
  attendanceHistory: AttendanceHistoryEvent[];
  holidays: string[]; // YYYY-MM-DD strings
  academicCalendar: AcademicEvent[];

  // Actions
  setPresetId: (presetId: string) => void;
  setAcademic: (academic: Partial<AcademicState>) => void;
  setCourses: (courses: CourseState[]) => void;
  updateCourse: (courseId: string, updates: Partial<CourseState>) => void;
  setTimetable: (timetable: Partial<TimetableState>) => void;
  setAcademicCalendar: (events: AcademicEvent[]) => void;
  addAttendanceHistoryEvent: (event: Omit<AttendanceHistoryEvent, "id" | "timestamp">) => void;
  undoAttendanceHistoryEvent: (eventId: string) => void;
  addHoliday: (dateStr: string) => void;
  removeHoliday: (dateStr: string) => void;
  
  // Simulation Actions
  addSimulationScenario: (scenario: SimulationScenario) => void;
  removeSimulationScenario: (scenarioId: string) => void;
  selectSimulationScenario: (scenarioId: string | null) => void;
  updateSimulationScenario: (scenarioId: string, updates: Partial<SimulationScenario>) => void;
  clearSimulationScenarios: () => void;

  // Semester History Actions
  setSemesterHistory: (history: SemesterHistoryEntry[]) => void;
  addSemesterEntry: (entry: SemesterHistoryEntry) => void;

  // Career Actions
  setCareer: (career: Partial<CareerState>) => void;
  setTargetCompanies: (companies: string[]) => void;

  // Sync Actions
  queueSyncAction: (type: SyncAction["type"], payload: any) => void;
  clearSyncActions: () => void;
  
  // Hydration helper
  resetStore: () => void;
  setIdentity: (identity: Partial<AcademicIdentityState>) => void;
  hydrateFromSnapshot: (snapshot: any) => void;

  // Interventions & Workspace
  interventions: AcademicIntervention[];
  workspaceContexts: WorkspaceContextType[];
  healthScore: AcademicHealthScore | null;
  evaluateInterventions: () => void;
  
  // Workspace UI Actions
  setWorkspaceUi: (updates: Partial<WorkspaceState>) => void;
  openPanel: (panel: WorkspaceState["activePanel"], subjectId?: string) => void;
  closePanel: () => void;
  setWorkspaceMode: (mode: WorkspaceState["mode"]) => void;
  setWorkspaceDensity: (density: WorkspaceState["preferredDensity"]) => void;
}

const initialAcademic: AcademicState = {
  currentCgpa: 0,
  completedSemesters: 0,
  earnedCredits: 0,
  activeBacklogsCount: 0,
  targetCgpa: 0,
};

const initialIdentity: AcademicIdentityState = {
  status: "empty",
  sourceType: null,
  lastUpdatedAt: null,
  isVerified: false,
  hasAuthoritativeData: false,
};

const initialSimulation: SimulationState = {
  activeScenarios: [],
  selectedScenarioId: null,
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
  branch: "Computer Science",
  skills: [],
  targetRole: "Frontend Developer",
  targetPackage: "Service (3-6LPA)"
};

const initialSync: OfflineSyncState = {
  pendingSyncActions: [],
};

const initialWorkspaceUi: WorkspaceState = {
  selectedSubjectId: null,
  activePanel: "NONE",
  globalTargetCgpa: null,
  mode: "DEFAULT",
  preferredDensity: "COMFORTABLE",
};

const initialTimetable: TimetableState = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

// ─── Store Creation ──────────────────────────────────────────────────────────

export const useUSMStore = create<USMStoreState>()(
  persist(
    (set, get) => ({
      presetId: "sppu",
      identity: initialIdentity,
      academic: initialAcademic,
      courses: [],
      semesterHistory: [],
      simulation: initialSimulation,
      career: initialCareer,
      sync: initialSync,
      workspaceUi: initialWorkspaceUi,
      timetable: initialTimetable,
      attendanceHistory: [],
      holidays: [],
      academicCalendar: [],
      
      interventions: [],
      workspaceContexts: ["DEFAULT"],
      healthScore: null,

      evaluateInterventions: () => {
        const state = get();
        if (!state.identity?.hasAuthoritativeData) return;
        
        const context = {
          authoritativeProfile: {
            studentIdentity: {},
            institution: "SPPU",
            presetId: state.presetId,
            regulation: "2019",
            academic: state.academic,
            courses: state.courses,
            semesterHistory: state.semesterHistory
          },
          trustMetadata: state.identity.trustMetadata
        };
        
        const newInterventions = InterventionEngine.generateInterventions(context);
        const newContexts = InterventionEngine.computeWorkspaceContexts(newInterventions);
        const newHealth = InterventionEngine.computeHealthScore(newInterventions, context);
        
        set({
          interventions: newInterventions,
          workspaceContexts: newContexts,
          healthScore: newHealth
        });
      },
      
      setWorkspaceUi: (updates) => {
        set((state) => ({
          workspaceUi: { ...state.workspaceUi, ...updates }
        }));
      },
      
      openPanel: (panel, subjectId) => {
        set((state) => ({
          workspaceUi: { 
            ...state.workspaceUi, 
            activePanel: panel,
            ...(subjectId !== undefined && { selectedSubjectId: subjectId })
          }
        }));
      },
      
      closePanel: () => {
        set((state) => ({
          workspaceUi: {
            ...state.workspaceUi,
            activePanel: "NONE",
            selectedSubjectId: null
          }
        }));
      },

      setWorkspaceMode: (mode) => {
        set((state) => ({
          workspaceUi: { ...state.workspaceUi, mode }
        }));
      },

      setWorkspaceDensity: (density) => {
        set((state) => ({
          workspaceUi: { ...state.workspaceUi, preferredDensity: density }
        }));
      },

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
        set((state) => ({
          courses,
          identity: {
            ...state.identity,
            status: courses.length > 0 ? "imported" : "empty",
            hasAuthoritativeData: courses.length > 0,
            lastUpdatedAt: new Date().toISOString(),
          }
        }));
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

      setTimetable: (updates) => {
        set((state) => ({
          timetable: { ...state.timetable, ...updates }
        }));
      },

      setAcademicCalendar: (events) => {
        set((state) => {
          // Auto-sync HOLIDAY and VACATION events to holidays array
          const newHolidays = new Set(state.holidays);
          
          events.forEach(evt => {
            if (evt.type === "HOLIDAY" || evt.name.toLowerCase().includes("vacation") || evt.name.toLowerCase().includes("break")) {
              if (evt.startDate) newHolidays.add(evt.startDate);
              
              // If there's an end date, fill all dates in between
              if (evt.startDate && evt.endDate) {
                let current = new Date(evt.startDate);
                const end = new Date(evt.endDate);
                while (current <= end) {
                  newHolidays.add(current.toISOString().split('T')[0]);
                  current.setDate(current.getDate() + 1);
                }
              }
            }
          });

          return {
            academicCalendar: events,
            holidays: Array.from(newHolidays)
          };
        });
      },

      addAttendanceHistoryEvent: (event) => {
        set((state) => ({
          attendanceHistory: [{
            ...event,
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
          }, ...state.attendanceHistory]
        }));
      },

      undoAttendanceHistoryEvent: (eventId) => {
        set((state) => {
          const event = state.attendanceHistory.find(e => e.id === eventId);
          if (!event) return state;

          // Revert course totals
          const updatedCourses = state.courses.map(c => {
            if (c.id === event.courseId) {
              return {
                ...c,
                attendanceTotal: Math.max(0, c.attendanceTotal - 1),
                attendanceBunked: Math.max(0, c.attendanceBunked - (event.action === "BUNKED" ? 1 : 0))
              };
            }
            return c;
          });

          return {
            courses: updatedCourses,
            attendanceHistory: state.attendanceHistory.filter(e => e.id !== eventId)
          };
        });
      },

      addHoliday: (dateStr) => {
        set((state) => ({
          holidays: Array.from(new Set([...state.holidays, dateStr]))
        }));
      },

      removeHoliday: (dateStr) => {
        set((state) => ({
          holidays: state.holidays.filter(h => h !== dateStr)
        }));
      },

      addSimulationScenario: (scenario) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeScenarios: [...state.simulation.activeScenarios, scenario],
            selectedScenarioId: scenario.id,
          },
        }));
        get().evaluateInterventions();
        AcademicEventBus.publish("SIMULATION_APPLIED", scenario);
      },

      removeSimulationScenario: (scenarioId) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeScenarios: state.simulation.activeScenarios.filter((s) => s.id !== scenarioId),
            selectedScenarioId: state.simulation.selectedScenarioId === scenarioId ? null : state.simulation.selectedScenarioId,
          },
        }));
        get().evaluateInterventions();
        AcademicEventBus.publish("SIMULATION_REMOVED", scenarioId);
      },

      selectSimulationScenario: (scenarioId) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            selectedScenarioId: scenarioId,
          },
        }));
        get().evaluateInterventions();
      },

      updateSimulationScenario: (scenarioId, updates) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeScenarios: state.simulation.activeScenarios.map((s) =>
              s.id === scenarioId ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      clearSimulationScenarios: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            activeScenarios: [],
            selectedScenarioId: null,
          },
        }));
      },


      setSemesterHistory: (history) => {
        set({ semesterHistory: history });
      },

      addSemesterEntry: (entry) => {
        set((state) => ({
          semesterHistory: [...state.semesterHistory, entry],
        }));
      },

      setCareer: (careerUpdates) => {
        set((state) => ({
          career: { ...state.career, ...careerUpdates },
        }));
      },

      setTargetCompanies: (companies) => {
        set((state) => ({
          career: { ...state.career, targetCompanies: companies },
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
          identity: initialIdentity,
          academic: initialAcademic,
          courses: [],
          semesterHistory: [],
          simulation: initialSimulation,
          career: initialCareer,
          sync: initialSync,
          workspaceUi: initialWorkspaceUi,
          timetable: initialTimetable,
          attendanceHistory: [],
          holidays: [],
          academicCalendar: [],
        });
      },

      setIdentity: (identityUpdates) => {
        set((state) => ({
          identity: { ...state.identity, ...identityUpdates },
        }));
      },

      hydrateFromSnapshot: (snapshot) => {
        if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] usmStore.hydrateFromSnapshot called. Snapshot source:", snapshot.sourceType);
        const profile = snapshot.academicProfile;
        if (!profile) {
          if (process.env.NODE_ENV === "development") console.warn("[QA Instrumentation] hydrateFromSnapshot aborted: no academicProfile in snapshot.");
          return;
        }

        set((state) => {
          if (process.env.NODE_ENV === "development") console.log(`[QA Instrumentation] usmStore computing merge. Current courses: ${state.courses.length}, Incoming: ${profile.courses?.length || 0}`);
          let mergedCourses = state.courses;
          let mergedHistory = state.semesterHistory;
          let newAcademic = state.academic;

          if (profile.courses && profile.courses.length > 0) {
            const incomingSemesters = new Set(profile.courses.map((c: any) => c.semester || 1));
            const retainedCourses = state.courses.filter(c => !incomingSemesters.has(c.semester || 1));
            mergedCourses = [...retainedCourses, ...profile.courses];
          }

          if (profile.semesterHistory && profile.semesterHistory.length > 0) {
            const incomingSemesters = new Set(profile.semesterHistory.map((s: any) => s.semester));
            const retainedHistory = state.semesterHistory.filter(s => !incomingSemesters.has(s.semester));
            mergedHistory = [...retainedHistory, ...profile.semesterHistory].sort((a, b) => a.semester - b.semester);
            
            // Update academic metrics based on merged history
            const completedSemesters = mergedHistory.length;
            const earnedCredits = mergedHistory.reduce((acc, sem) => acc + sem.earnedCredits, 0);
            const totalCredits = mergedHistory.reduce((acc, sem) => acc + sem.credits, 0);
            const totalPoints = mergedHistory.reduce((acc, sem) => acc + (sem.sgpa * sem.credits), 0);
            const currentCgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
            const activeBacklogsCount = mergedCourses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())).length;

            newAcademic = {
              ...state.academic,
              completedSemesters,
              earnedCredits,
              currentCgpa,
              activeBacklogsCount
            };
          } else if (profile.courses && profile.courses.length > 0) {
              newAcademic = profile.academic;
          }

          return {
            presetId: profile.presetId || state.presetId || "sppu",
            academic: newAcademic,
            courses: mergedCourses,
            semesterHistory: mergedHistory,
            identity: {
              ...state.identity,
              status: "hydrated",
              sourceType: snapshot.sourceType as any,
              lastUpdatedAt: snapshot.createdAt,
              isVerified: snapshot.verificationStatus === "verified",
              hasAuthoritativeData: true,
              studentIdentity: {
                ...state.identity.studentIdentity,
                ...profile.studentIdentity
              },
              institution: profile.institution || state.identity.institution,
              regulation: profile.regulation || state.identity.regulation,
              trustMetadata: {
                confidenceScore: snapshot.confidenceScore,
                parserType: snapshot.parserVersion,
                verified: snapshot.verificationStatus === "verified",
                sourceInstitution: snapshot.sourceInstitution,
                importedAt: snapshot.createdAt,
              }
            },
            timetable: profile.timetable || state.timetable || initialTimetable,
            attendanceHistory: profile.attendanceHistory || state.attendanceHistory || [],
            holidays: profile.holidays || state.holidays || [],
            academicCalendar: profile.academicCalendar || state.academicCalendar || []
          };
        });
      },
    }),
    {
      name: "gradeflow-usm-storage",
      storage: createJSONStorage(() => typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 1) {
          return {
            presetId: "sppu",
            identity: initialIdentity,
            academic: initialAcademic,
            courses: [],
            semesterHistory: [],
            simulation: initialSimulation,
            career: initialCareer,
            sync: initialSync,
            workspaceUi: initialWorkspaceUi,
            timetable: initialTimetable,
            attendanceHistory: [],
            holidays: [],
            academicCalendar: [],
          };
        }
        if (version < 2) {
          // v1 → v2: add semesterHistory slice
          persistedState.semesterHistory = [];
        }
        if (version < 3) {
          // v2 -> v3: add identity slice
          persistedState.identity = initialIdentity;
        }
        return persistedState;
      },
      onRehydrateStorage: (state) => {
        if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] Zustand onRehydrateStorage starting restore from localStorage.");
        return (hydratedState, error) => {
          if (error || !hydratedState) {
            if (process.env.NODE_ENV === "development") console.error("[QA Instrumentation] Zustand onRehydrateStorage error or no state:", error);
            return;
          }
          if (process.env.NODE_ENV === "development") console.log(`[QA Instrumentation] Zustand onRehydrateStorage successful. Loaded ${hydratedState.semesterHistory?.length || 0} semesters.`);
          const isValid =
            hydratedState.presetId &&
            typeof hydratedState.presetId === "string" &&
            hydratedState.academic &&
            typeof hydratedState.academic.currentCgpa === "number" &&
            Array.isArray(hydratedState.courses);

          if (!isValid) {
            hydratedState.presetId = "sppu";
            hydratedState.identity = { ...initialIdentity };
            hydratedState.academic = { ...initialAcademic };
            hydratedState.courses = [];
            hydratedState.semesterHistory = [];
            hydratedState.simulation = { ...initialSimulation };
            hydratedState.career = { ...initialCareer };
            hydratedState.sync = { ...initialSync };
            hydratedState.workspaceUi = { ...initialWorkspaceUi };
            hydratedState.timetable = { ...initialTimetable };
            hydratedState.attendanceHistory = [];
            hydratedState.holidays = [];
            hydratedState.academicCalendar = [];
          }
          // Ensure new fields exist for v1/v2 hydrations
          if (!Array.isArray(hydratedState.semesterHistory)) {
            hydratedState.semesterHistory = [];
          }
          if (!hydratedState.identity) {
            hydratedState.identity = { ...initialIdentity };
          }
          if (!hydratedState.timetable) {
            hydratedState.timetable = { ...initialTimetable };
          }
          if (!Array.isArray(hydratedState.attendanceHistory)) {
            hydratedState.attendanceHistory = [];
          }
          if (!Array.isArray(hydratedState.holidays)) {
            hydratedState.holidays = [];
          }
          if (!Array.isArray(hydratedState.academicCalendar)) {
            hydratedState.academicCalendar = [];
          }
        };
      },
    }
  )
);
