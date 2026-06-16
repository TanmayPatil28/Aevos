import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AcademicIdentityState } from "../types/academicProfile";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface StudentDetails {
  fullName: string;
  institution: string;
  branch: string;
  field: string;
  division: string;
  prnNumber: string;
  currentYear: string;
  isOnboarded: boolean;
}

export interface AcademicState {
  currentCgpa: number;
  completedSemesters: number;
  earnedCredits: number;
  activeBacklogsCount: number;
  targetCgpa: number;
  programme?: string;
  branch?: string;
  batchYear?: number;
  semesterStartDate?: string;
  semesterEndDate?: string;
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
  recoverySemester?: number; // Target semester to clear the backlog
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

export interface CareerProject {
  name: string;
  techStack: string[];
  impact: string;
  isAIGenerated?: boolean;
}

export interface CareerState {
  targetCompanies: string[];
  wesGpaEquivalent: number;
  ectsStandingBand: string;
  // New Intelligence Fields
  branch: string;
  skills: string[];
  targetRole: string;
  targetPackage: string;
  projects: CareerProject[];
}

export interface WorkspaceState {
  selectedSubjectId: string | null;
  activePanel: "NONE" | "PREDICTOR" | "STRATEGY" | "BACKLOG" | "INTERVENTIONS";
  globalTargetCgpa: number | null;
  mode: "DEFAULT" | "SANDBOX" | "RECOVERY" | "OPTIMIZATION" | "FOCUS";
  preferredDensity: "COMFORTABLE" | "COMPACT";
  sandboxCgpa: number | null;
  sandboxBacklogs: number | null;
}

export interface FocusState {
  focusMode: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  endTime: number | null;
  isFocusActive: boolean;
  focusStreak: number;
}

export interface SemesterHistoryEntry {
  semester: number;
  isBacklogClearance?: boolean;
  sgpa: number;
  credits: number;
  earnedCredits: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AcademicEvent {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  type: "EXAM" | "HOLIDAY" | "EVENT" | "FEST" | "OTHER" | "DEADLINE";
  subtasks?: SubTask[];
}

export interface BacklogState {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  originalSemester: number;
  originalGrade: string;
  status: "PENDING" | "REGISTERED" | "EXAM_SCHEDULED" | "CLEARED" | "VOIDED";
  attemptsCount: number;
  nextExamDate?: string | null;
  recoveryPathway?: string | null;
  recoveryPlan?: {
    studyPlan: string;
    dailyHours: number;
    recoveryProbability: number;
    resources: string[];
    aiPlanGenerationFailed?: boolean;
  } | null;
}

export interface USMStoreState {
  // Identity & Preset
  presetId: string; // e.g. "sppu", "vtu", "jntuh"
  activeInstitution: "jspm_university_wagholi" | "rscoe_autonomous_tathawade" | "sppu_affiliated" | "unknown";
  identity: AcademicIdentityState;
  studentDetails: StudentDetails | null;
  
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
  focus: FocusState;
  backlogs: BacklogState[];

  // Actions
  setPresetId: (presetId: string) => void;
  setActiveInstitution: (institution: USMStoreState["activeInstitution"]) => void;
  setStudentDetails: (details: StudentDetails) => void;
  setAcademic: (academic: Partial<AcademicState>) => void;
  setCourses: (courses: CourseState[]) => void;
  updateCourse: (courseId: string, updates: Partial<CourseState>) => void;
  updateCourseRecoverySemester: (courseId: string, semester: number | null) => void;
  setTimetable: (timetable: Partial<TimetableState>) => void;
  setAcademicCalendar: (events: AcademicEvent[]) => void;
  updateEventSubtasks: (eventId: string, subtasks: SubTask[]) => void;
  addAttendanceHistoryEvent: (event: Omit<AttendanceHistoryEvent, "id" | "timestamp">) => void;
  undoAttendanceHistoryEvent: (eventId: string) => void;
  addHoliday: (dateStr: string) => void;
  removeHoliday: (dateStr: string) => void;
  setBacklogs: (backlogs: BacklogState[]) => void;
  updateBacklog: (id: string, updates: Partial<BacklogState>) => void;
  
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
  syncParsedResume: (parsedData: any) => void;

  // Sync Actions
  queueSyncAction: (type: SyncAction["type"], payload: any) => void;
  clearSyncActions: () => void;
  removeSyncActions: (actionIds: string[]) => void;
  
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
  setSandboxMetrics: (cgpa: number | null, backlogs: number | null) => void;

  // Focus Actions
  startFocus: (durationSeconds: number) => void;
  stopFocus: () => void;
  setFocusMode: (mode: FocusState["focusMode"]) => void;
  incrementFocusStreak: () => void;
  resetFocus: () => void;
}

const today = new Date();
const start = new Date(today);
start.setDate(today.getDate() - 30);
const end = new Date(today);
end.setDate(today.getDate() + 60);

const initialAcademic: AcademicState = {
  currentCgpa: 0,
  completedSemesters: 0,
  earnedCredits: 0,
  activeBacklogsCount: 0,
  targetCgpa: 0,
  semesterStartDate: start.toISOString().split("T")[0],
  semesterEndDate: end.toISOString().split("T")[0],
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
  targetPackage: "Service (3-6LPA)",
  projects: []
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
  sandboxCgpa: null,
  sandboxBacklogs: null,
};

const initialTimetable: TimetableState = {
  monday: [
    { id: "t1", courseId: "c1", type: "LECTURE", startTime: "09:00", endTime: "10:00", room: "A-101" },
    { id: "t2", courseId: "c2", type: "LAB", startTime: "10:00", endTime: "12:00", room: "Lab-1" }
  ],
  tuesday: [
    { id: "t3", courseId: "c3", type: "LECTURE", startTime: "11:00", endTime: "12:00", room: "A-102" }
  ],
  wednesday: [
    { id: "t4", courseId: "c1", type: "LECTURE", startTime: "09:00", endTime: "10:00", room: "A-101" }
  ],
  thursday: [
    { id: "t5", courseId: "c2", type: "LECTURE", startTime: "10:00", endTime: "11:00", room: "A-103" }
  ],
  friday: [
    { id: "t6", courseId: "c3", type: "LAB", startTime: "14:00", endTime: "16:00", room: "Lab-2" },
    { id: "t7", courseId: "c1", type: "LECTURE", startTime: "16:00", endTime: "17:00", room: "A-101" }
  ],
  saturday: [],
  sunday: [],
};

const initialFocus: FocusState = {
  focusMode: "WORK",
  endTime: null,
  isFocusActive: false,
  focusStreak: 0,
};

// ─── Store Creation ──────────────────────────────────────────────────────────

export const useUSMStore = create<USMStoreState>()(
  persist(
    (set, get) => ({
      presetId: "sppu",
      activeInstitution: "unknown",
      studentDetails: null,
      identity: initialIdentity,
      academic: { ...initialAcademic, completedSemesters: 5, activeBacklogsCount: 2 },
      courses: [
        { id: "c1", code: "CS201", name: "Data Structures", semester: 3, credits: 4, grade: "F", cieMarks: 15, seeMarks: 20, attendanceTotal: 40, attendanceBunked: 10 },
        { id: "c2", code: "CS202", name: "Operating Systems", semester: 4, credits: 4, grade: "FF", cieMarks: 12, seeMarks: 15, attendanceTotal: 40, attendanceBunked: 12 },
        { id: "c3", code: "CS301", name: "Computer Networks", semester: 5, credits: 4, grade: "A", cieMarks: 25, seeMarks: 50, attendanceTotal: 40, attendanceBunked: 5 },
      ],
      semesterHistory: [
        { semester: 1, sgpa: 8.5, credits: 20, earnedCredits: 20 },
        { semester: 2, sgpa: 8.2, credits: 20, earnedCredits: 20 },
        { semester: 3, sgpa: 6.5, credits: 22, earnedCredits: 18 },
        { semester: 4, sgpa: 6.8, credits: 22, earnedCredits: 18 },
        { semester: 5, sgpa: 7.5, credits: 20, earnedCredits: 20 },
      ],
      simulation: initialSimulation,
      career: initialCareer,
      sync: initialSync,
      workspaceUi: initialWorkspaceUi,
      timetable: initialTimetable,
      attendanceHistory: [],
      holidays: [],
      academicCalendar: [],
      focus: initialFocus,
      backlogs: [],
      
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

      setSandboxMetrics: (cgpa, backlogs) => {
        set((state) => ({
          workspaceUi: { 
            ...state.workspaceUi, 
            sandboxCgpa: cgpa,
            sandboxBacklogs: backlogs 
          }
        }));
      },

      setPresetId: (presetId) => {
        set({ presetId });
        get().queueSyncAction("SEMESTER_UPDATE", { presetId });
      },

      setActiveInstitution: (activeInstitution) => {
        set({ activeInstitution });
      },

      setStudentDetails: (studentDetails) => {
        set({ studentDetails });
      },

      setAcademic: (academicUpdates) => {
        set((state) => ({
          academic: { ...state.academic, ...academicUpdates },
        }));
        get().evaluateInterventions();
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
        get().evaluateInterventions();
        get().queueSyncAction("SEMESTER_UPDATE", { courses });
      },

      updateCourse: (courseId, updates) => {
        set((state) => {
          const updatedCourses = state.courses.map((c) =>
            c.id === courseId ? { ...c, ...updates } : c
          );
          
          const activeBacklogsCount = updatedCourses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())).length;
          
          return { 
            courses: updatedCourses,
            academic: {
              ...state.academic,
              activeBacklogsCount
            }
          };
        });

        get().evaluateInterventions();
        get().queueSyncAction("ATTENDANCE_EDIT", { courseId, updates });
      },

      updateCourseRecoverySemester: (courseId, semester) => {
        set((state) => {
          const updatedCourses = state.courses.map((c) =>
            c.id === courseId ? { ...c, recoverySemester: semester === null ? undefined : semester } : c
          );
          return { courses: updatedCourses };
        });
      },

      setTimetable: (updates) => {
        set((state) => ({
          timetable: { ...state.timetable, ...updates }
        }));
      },

      setBacklogs: (backlogs) => {
        set({ backlogs });
      },

      updateBacklog: (id, updates) => {
        set((state) => ({
          backlogs: state.backlogs.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
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

      updateEventSubtasks: (eventId, subtasks) => {
        set((state) => ({
          academicCalendar: state.academicCalendar.map(evt => 
            evt.id === eventId ? { ...evt, subtasks } : evt
          )
        }));
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

      // ─── Focus Actions ───
      startFocus: (durationSeconds) => {
        set((state) => ({
          focus: {
            ...state.focus,
            endTime: Date.now() + durationSeconds * 1000,
            isFocusActive: true,
          }
        }));
      },
      stopFocus: () => {
        set((state) => ({
          focus: {
            ...state.focus,
            isFocusActive: false,
          }
        }));
      },
      setFocusMode: (mode) => {
        set((state) => ({
          focus: {
            ...state.focus,
            focusMode: mode,
            isFocusActive: false, // Reset active state when mode changes
            endTime: null
          }
        }));
      },
      incrementFocusStreak: () => {
        set((state) => ({
          focus: {
            ...state.focus,
            focusStreak: state.focus.focusStreak + 1,
          }
        }));
      },
      resetFocus: () => {
        set((state) => ({
          focus: {
            ...state.focus,
            isFocusActive: false,
            endTime: null,
            focusStreak: 0,
            focusMode: "WORK",
          }
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

      syncParsedResume: (parsedData) => {
        set((state) => {
          const newSkills = parsedData.skills || [];
          const existingSkills = state.career.skills || [];
          // Merge without duplicates
          const mergedSkills = Array.from(new Set([...existingSkills, ...newSkills]));
          
          return {
            career: {
              ...state.career,
              skills: mergedSkills,
              // Optionally store parsed projects or experience here later
            }
          };
        });
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

      removeSyncActions: (actionIds) => {
        set((state) => ({
          sync: {
            pendingSyncActions: state.sync.pendingSyncActions.filter(
              (a) => !actionIds.includes(a.id)
            ),
          },
        }));
      },

      resetStore: () => {
        set({
          presetId: "sppu",
          activeInstitution: "unknown",
          studentDetails: null,
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
          backlogs: [],
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
          
          // Filter out undefined properties from incoming academic data
          const incomingAcademic = profile.academic 
            ? Object.fromEntries(Object.entries(profile.academic).filter(([_, v]) => v !== undefined))
            : {};

          if (profile.courses && profile.courses.length > 0) {
            const isBacklogMerge = profile.semesterHistory?.some((sh: any) => sh.isBacklogClearance);
            
            if (isBacklogMerge) {
              mergedCourses = [...state.courses];
              profile.courses.forEach((incomingCourse: any) => {
                const existingIndex = mergedCourses.findIndex(c => c.code === incomingCourse.code);
                if (existingIndex >= 0) {
                  mergedCourses[existingIndex] = { 
                    ...mergedCourses[existingIndex], 
                    ...incomingCourse,
                    semester: mergedCourses[existingIndex].semester
                  };
                } else {
                  mergedCourses.push(incomingCourse);
                }
              });
            } else {
              mergedCourses = [...state.courses];
              profile.courses.forEach((incomingCourse: any) => {
                const existingIndex = mergedCourses.findIndex((c: any) => 
                  c.id === incomingCourse.id || (c.code && incomingCourse.code && c.code === incomingCourse.code && c.semester === incomingCourse.semester)
                );
                if (existingIndex >= 0) {
                  mergedCourses[existingIndex] = {
                    ...mergedCourses[existingIndex],
                    ...incomingCourse,
                    attendanceTotal: Math.max(mergedCourses[existingIndex].attendanceTotal || 0, incomingCourse.attendanceTotal || 0),
                    attendanceBunked: Math.max(mergedCourses[existingIndex].attendanceBunked || 0, incomingCourse.attendanceBunked || 0)
                  };
                } else {
                  mergedCourses.push(incomingCourse);
                }
              });
            }
          }

          if (profile.semesterHistory && profile.semesterHistory.length > 0) {
            const incomingSemesters = new Set(profile.semesterHistory.map((s: any) => s.semester));
            const isBacklogMerge = profile.semesterHistory.some((sh: any) => sh.isBacklogClearance);
            
            let retainedHistory = state.semesterHistory;
            if (!isBacklogMerge) {
              retainedHistory = state.semesterHistory.filter(s => !incomingSemesters.has(s.semester));
            }
            
            // For backlog clearances, we don't necessarily add a new semester to history unless it doesn't exist
            if (!isBacklogMerge) {
              mergedHistory = [...retainedHistory, ...profile.semesterHistory].sort((a, b) => a.semester - b.semester);
            }
            
            // Update academic metrics based on merged history
            const completedSemesters = mergedHistory.length;
            const earnedCredits = mergedHistory.reduce((acc, sem) => acc + sem.earnedCredits, 0);
            const totalCredits = mergedHistory.reduce((acc, sem) => acc + sem.credits, 0);
            const totalPoints = mergedHistory.reduce((acc, sem) => acc + (sem.sgpa * sem.credits), 0);
            const currentCgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
            const activeBacklogsCount = mergedCourses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())).length;

            newAcademic = {
              ...state.academic,
              ...incomingAcademic,
              completedSemesters,
              earnedCredits,
              currentCgpa,
              activeBacklogsCount
            };
          } else if (profile.courses && profile.courses.length > 0) {
              const activeBacklogsCount = mergedCourses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())).length;
              newAcademic = {
                ...state.academic,
                ...incomingAcademic,
                activeBacklogsCount
              };
          } else if (profile.academic) {
              newAcademic = { ...state.academic, ...incomingAcademic };
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
                ...(profile.studentIdentity?.name && profile.studentIdentity.name !== "Unknown Student" ? { name: profile.studentIdentity.name } : {}),
                ...(profile.studentIdentity?.registrationId ? { registrationId: profile.studentIdentity.registrationId } : {})
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
            academicCalendar: profile.academicCalendar || state.academicCalendar || [],
            backlogs: profile.backlogs || []
          };
        });
        get().evaluateInterventions();
        get().queueSyncAction("SEMESTER_UPDATE", { 
          courses: get().courses,
          semesterHistory: get().semesterHistory 
        });
      },
    }),
    {
      name: "gradeflow-usm-storage",
      storage: createJSONStorage(() => typeof window !== "undefined" ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }),
      version: 4,
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
            backlogs: [],
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
        if (version < 4) {
          persistedState.backlogs = [];
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
            hydratedState.backlogs = [];
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
          if (!hydratedState.backlogs || !Array.isArray(hydratedState.backlogs)) {
            hydratedState.backlogs = [];
          }
          
          // Re-evaluate interventions to ensure they are synchronized with the hydrated state
          setTimeout(() => {
            if (typeof hydratedState.evaluateInterventions === 'function') {
              hydratedState.evaluateInterventions();
            }
          }, 0);
        };
      },
    }
  )
);
