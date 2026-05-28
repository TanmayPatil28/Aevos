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

      addTerm: (term) => set((state) => ({ terms: [...state.terms, term] })),
      updateTerm: (id, data) => set((state) => ({
        terms: state.terms.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTerm: (id) => set((state) => ({
        terms: state.terms.filter(t => t.id !== id),
        courses: state.courses.filter(c => c.termId !== id) // Cascade delete
      })),

      addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
      updateCourse: (id, data) => set((state) => ({
        courses: state.courses.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),

      setTermCourses: (termId, newCourses) => set((state) => {
        const otherCourses = state.courses.filter(c => c.termId !== termId);
        return { courses: [...otherCourses, ...newCourses] };
      })
    }),
    {
      name: 'os-domain-store',
      version: 1,
    }
  )
);
