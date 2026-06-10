import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OSCourse {
  id: string;
  termId: string;
  code: string;
  name?: string;
  credits: number;
  grade: string;
  gradePoints: number;
  isSimulated?: boolean;
}

export interface OSTerm {
  id: string;
  name: string;
  order: number;
  status: "COMPLETED" | "ACTIVE" | "PLANNED";
}

interface DomainState {
  terms: OSTerm[];
  courses: OSCourse[];

  // Actions
  addTerm: (term: OSTerm) => void;
  updateTerm: (id: string, data: Partial<OSTerm>) => void;
  deleteTerm: (id: string) => void;

  addCourse: (course: OSCourse) => void;
  updateCourse: (id: string, data: Partial<OSCourse>) => void;
  deleteCourse: (id: string) => void;
  
  // Batch updates for ledger
  setTermCourses: (termId: string, courses: OSCourse[]) => void;
  syncWithServer: () => Promise<void>;
}

export const useDomainStore = create<DomainState>()(
  persist(
    (set) => ({
      terms: [
        { id: "term_1", name: "Semester 1", order: 1, status: "ACTIVE" }
      ],
      courses: [
        { id: "course_1", termId: "term_1", code: "", credits: 0, grade: "", gradePoints: 0 }
      ],

      addTerm: (term) => set((state) => {
        const next = { terms: [...state.terms, term] };
        useDomainStore.getState().syncWithServer();
        return next;
      }),
      updateTerm: (id, data) => set((state) => {
        const next = { terms: state.terms.map(t => t.id === id ? { ...t, ...data } : t) };
        useDomainStore.getState().syncWithServer();
        return next;
      }),
      deleteTerm: (id) => set((state) => {
        const next = {
          terms: state.terms.filter(t => t.id !== id),
          courses: state.courses.filter(c => c.termId !== id)
        };
        useDomainStore.getState().syncWithServer();
        return next;
      }),

      addCourse: (course) => set((state) => {
        const next = { courses: [...state.courses, course] };
        useDomainStore.getState().syncWithServer();
        return next;
      }),
      updateCourse: (id, data) => set((state) => {
        const next = { courses: state.courses.map(c => c.id === id ? { ...c, ...data } : c) };
        useDomainStore.getState().syncWithServer();
        return next;
      }),
      deleteCourse: (id) => set((state) => {
        const next = { courses: state.courses.filter(c => c.id !== id) };
        useDomainStore.getState().syncWithServer();
        return next;
      }),

      setTermCourses: (termId, newCourses) => set((state) => {
        const otherCourses = state.courses.filter(c => c.termId !== termId);
        const next = { courses: [...otherCourses, ...newCourses] };
        useDomainStore.getState().syncWithServer();
        return next;
      }),

      syncWithServer: async () => {
        try {
          const state = useDomainStore.getState();
          const mappedCourses = state.courses.map(c => ({
            code: c.code || `TMP-${c.id.substring(0, 5)}`,
            name: c.name || `Course ${c.code}`,
            credits: c.credits,
            grade: c.grade,
            semester: state.terms.find(t => t.id === c.termId)?.order?.toString() || "1"
          }));
          const mappedSemesters = state.terms.map(t => ({
            semester: t.order.toString(),
            credits: state.courses.filter(c => c.termId === t.id).reduce((sum, c) => sum + c.credits, 0),
            sgpa: 0 // Simplification: we don't have local sgpa calculation here easily
          }));

          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actions: [
                {
                  type: "SEMESTER_UPDATE",
                  payload: {
                    courses: mappedCourses,
                    semesterHistory: mappedSemesters
                  }
                }
              ]
            })
          });
        } catch (e) {
          console.error("Failed to sync domain store to server", e);
        }
      }
    }),
    {
      name: 'os-domain-store',
      version: 1,
    }
  )
);
