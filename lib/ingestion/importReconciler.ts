import { AcademicImportPayload } from "./types";
import { CourseState, USMStoreState } from "@/stores/usmStore";

/**
 * Commits the validated academic import payload into the Zustand USM Store.
 * Reconciles preset, academic status, semester history, and current semester courses.
 */
export function reconcileImportPayload(
  payload: AcademicImportPayload,
  store: Pick<
    USMStoreState,
    "setPresetId" | "setAcademic" | "setSemesterHistory" | "setCourses" | "resetSimulation"
  >
): void {
  // 1. Set the active preset
  store.setPresetId(payload.presetId);

  // 2. Set academic summary metrics
  const completedSemesters = payload.semesterHistory.length;
  const earnedCredits = payload.semesterHistory.reduce((sum, sem) => sum + sem.earnedCredits, 0);

  store.setAcademic({
    currentCgpa: payload.currentCgpa,
    completedSemesters,
    earnedCredits,
    activeBacklogsCount: payload.activeBacklogsCount,
    targetCgpa: payload.targetCgpa,
  });

  // 3. Set semester history
  store.setSemesterHistory(
    payload.semesterHistory.map((sem) => ({
      semester: sem.semester,
      sgpa: sem.sgpa,
      credits: sem.credits,
      earnedCredits: sem.earnedCredits,
    }))
  );

  // 4. Set current semester courses
  const courses: CourseState[] = (payload.currentSemesterCourses || []).map((c, idx) => ({
    id: c.code || `course-${idx}`,
    code: c.code,
    name: c.name,
    credits: c.credits,
    grade: c.grade,
    cieMarks: c.cieMarks ?? 0,
    seeMarks: undefined,
    attendanceTotal: c.attendanceTotal ?? 0,
    attendanceBunked: c.attendanceBunked ?? 0,
  }));

  store.setCourses(courses);

  // 5. Reset active simulations to prevent outdated state mismatches
  store.resetSimulation();
}
