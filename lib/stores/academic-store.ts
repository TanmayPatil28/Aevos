import { create } from 'zustand';

export interface SubjectState {
  id: string;
  name: string;
  credits: number;
  gradePoint: number | null;
  percentage: number | null;
  grade: string | null;
  isBacklog: boolean;
  subjectType: string; // 'theory', 'practical', 'elective'
}

export interface SemesterState {
  id: string;
  semesterNumber: number; // Fixed name to align with UI
  name: string | null;
  sgpa: number | null;
  totalCredits: number;
  isCompleted: boolean;
  subjects: SubjectState[];
}

export interface PlacementData {
  readiness: unknown[]; // PlacementReadiness[]
  sectorReadiness: unknown[]; // CategoryReadiness[]
  overallScore: number;
  status: 'eligible' | 'near-threshold' | 'at-risk' | 'ineligible';
  trajectoryConfidence: 'high' | 'medium' | 'low';
  nextTarget?: {
    companyId: string;
    companyName: string;
    cgpaGap: number;
  } | null;
}

export interface AcademicState {
  // Profile
  profile: {
    universityId: string | null;
    branch: string | null;
    pattern: string | null;
    currentSemester: number;
    totalSemesters: number;
    targetCgpa: number | null;
    onboardingDone: boolean;
  } | null;

  // Data
  semesters: SemesterState[];
  currentCgpa: number | null;
  placement: PlacementData | null;
  isLoading: boolean;

  // Actions
  setProfile: (profile: Partial<AcademicState['profile']>) => void;
  setSemesters: (semesters: SemesterState[]) => void;
  populateFromPreset: (semesterNumber: number) => Promise<void>;
  addSemester: (semester: SemesterState) => void;
  updateSemester: (id: string, updates: Partial<SemesterState>) => void;
  addSubject: (semesterId: string, subject: SubjectState) => void;
  updateSubject: (semesterId: string, subjectId: string, updates: Partial<SubjectState>) => void;
  deleteSubject: (semesterId: string, subjectId: string) => void;
  calculateCgpa: () => void;
  syncFromDatabase: () => Promise<void>;
  fetchPlacementData: () => Promise<void>;
}

export const useAcademicStore = create<AcademicState>((set, get) => ({
  profile: null,
  semesters: [],
  currentCgpa: null,
  placement: null,
  isLoading: false,

  setProfile: (profileUpdates) =>
    set((state) => ({
      profile: state.profile
        ? ({ ...state.profile, ...profileUpdates } as AcademicState['profile'])
        : (profileUpdates as AcademicState['profile']),
    })),

  setSemesters: (semesters) => set({ semesters }),

  populateFromPreset: async (semesterNumber) => {
    const { profile } = get();
    if (!profile?.universityId || !profile?.branch) return;

    set({ isLoading: true });
    try {
      const { presetLoader } = await import('../presets/loader');
      const preset = await presetLoader.loadPreset({
        universityId: profile.universityId,
        pattern: profile.pattern || '2024', // Fallback
        branchId: profile.branch,
        semester: semesterNumber,
      });

      if (preset && preset.branches[0]?.subjects) {
        const newSubjects = preset.branches[0].subjects.map((s) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: s.subjectName,
          credits: s.credits,
          gradePoint: null,
          percentage: null,
          grade: null,
          isBacklog: false,
          subjectType: s.type,
        }));

        const semesterId = `sem-${semesterNumber}`;
        const existingSem = get().semesters.find((s) => s.semesterNumber === semesterNumber);

        if (existingSem) {
          get().updateSemester(existingSem.id, { subjects: newSubjects });
        } else {
          get().addSemester({
            id: semesterId,
            semesterNumber,
            name: `Semester ${semesterNumber}`,
            sgpa: null,
            totalCredits: newSubjects.reduce((acc, s) => acc + s.credits, 0),
            isCompleted: false,
            subjects: newSubjects,
          });
        }
      }
    } catch (e) {
      console.error('Failed to populate from preset:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addSemester: (semester) =>
    set((state) => ({
      semesters: [...state.semesters, semester],
    })),

  updateSemester: (id, updates) =>
    set((state) => ({
      semesters: state.semesters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  addSubject: (semesterId, subject) =>
    set((state) => ({
      semesters: state.semesters.map((s) =>
        s.id === semesterId ? { ...s, subjects: [...s.subjects, subject] } : s
      ),
    })),

  updateSubject: (semesterId, subjectId, updates) =>
    set((state) => ({
      semesters: state.semesters.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              subjects: s.subjects.map((sub) =>
                sub.id === subjectId ? { ...sub, ...updates } : sub
              ),
            }
          : s
      ),
    })),

  deleteSubject: (semesterId, subjectId) =>
    set((state) => ({
      semesters: state.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, subjects: s.subjects.filter((sub) => sub.id !== subjectId) }
          : s
      ),
    })),

  calculateCgpa: () =>
    set((state) => {
      let totalGradePoints = 0;
      let totalCredits = 0;

      state.semesters.forEach((sem) => {
        sem.subjects.forEach((sub) => {
          if (sub.gradePoint !== null && sub.credits > 0) {
            totalGradePoints += sub.gradePoint * sub.credits;
            totalCredits += sub.credits;
          }
        });
      });

      const currentCgpa =
        totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : null;
      return { currentCgpa };
    }),

  syncFromDatabase: async () => {
    set({ isLoading: true });
    try {
      const [profileRes, semestersRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/semesters'),
      ]);

      if (profileRes.ok && semestersRes.ok) {
        const { profile } = await profileRes.json();
        const semesters = await semestersRes.json();
        set({ profile, semesters });
        get().calculateCgpa();
        await get().fetchPlacementData();
      }
    } catch (error) {
      console.error('Failed to sync store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlacementData: async () => {
    try {
      const res = await fetch('/api/placement');
      if (res.ok) {
        const data = await res.json();
        set({
          placement: {
            readiness: data.companyReadiness,
            sectorReadiness: data.sectorReadiness,
            overallScore: data.overallScore,
            status: data.status,
            trajectoryConfidence: data.trajectoryConfidence,
            nextTarget: data.nextTarget,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch placement data:', error);
    }
  },
}));
