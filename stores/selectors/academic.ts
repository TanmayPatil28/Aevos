import { USMStoreState, CourseState } from "../usmStore";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { createSelector } from "./memo";
import { pluggableRegulationEngine } from "../../lib/academic-intelligence/regulations/regulationEngine";

export interface DerivedSemesterCredits {
  totalActiveCredits: number;
  earnedCredits: number;
  simulatedEarnedCredits: number;
  failedCredits: number;
}

/**
 * Computes active courses, taking simulated edits into account if simulation is running.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectActiveCourses = createSelector((state: USMStoreState): CourseState[] => {
  const { courses, simulation } = state;
  if (!simulation.isSimulating) {
    return courses;
  }
  return courses.map((course) => {
    const simCourse = simulation.simulatedCourses[course.id] || {};
    const simAtt = simulation.simulatedAttendance[course.id] || {};

    const updatedBunked = Math.max(
      0,
      course.attendanceBunked + (simAtt.bunkedOffset || 0)
    );

    let grade = course.grade;
    if (simCourse.grade !== undefined) {
      grade = simCourse.grade;
    }

    return {
      ...course,
      cieMarks: simCourse.cieMarks !== undefined ? simCourse.cieMarks : course.cieMarks,
      seeMarks: simCourse.seeMarks !== undefined ? simCourse.seeMarks : course.seeMarks,
      grade,
      attendanceBunked: updatedBunked,
    };
  });
});

/**
 * Calculates current or simulated semester SGPA and active CGPA.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectDerivedGPA = createSelector((state: USMStoreState): {
  sgpa: number;
  cgpa: number;
  percentage: number;
} => {
  const activeCourses = selectActiveCourses(state);
  const preset = getPresetById(state.presetId);
  
  if (!preset) {
    return { sgpa: 0, cgpa: 0, percentage: 0 };
  }

  // Filter out audit courses (0 credits)
  const creditCourses = activeCourses.filter((c) => c.credits > 0);
  
  let totalGradePoints = 0;
  let totalCredits = 0;

  for (const course of creditCourses) {
    if (course.grade) {
      const scaleEntry = preset.gradeScale.find((g) => g.grade === course.grade);
      if (scaleEntry) {
        totalGradePoints += scaleEntry.points * course.credits;
        totalCredits += course.credits;
      }
    }
  }

  const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  
  // Calculate simulated/derived CGPA
  const currentCgpa = state.academic.currentCgpa;
  const earnedCredits = state.academic.earnedCredits;

  let derivedCgpa = currentCgpa;
  if (totalCredits > 0) {
    // Weighted formula: (CGPA * completedCredits + SGPA * semesterCredits) / (completedCredits + semesterCredits)
    derivedCgpa =
      (currentCgpa * earnedCredits + sgpa * totalCredits) / (earnedCredits + totalCredits);
  }

  // Convert CGPA to percentage using the pluggable regulation engine
  let percentage = pluggableRegulationEngine.convertToPercentage(derivedCgpa, "cgpa", state.presetId);
  percentage = Math.max(0, Math.min(100, percentage));

  return {
    sgpa: parseFloat(sgpa.toFixed(2)),
    cgpa: parseFloat(derivedCgpa.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2)),
  };
});

/**
 * Calculates semester credit counts (active, failed, earned, and simulated).
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectSemesterCredits = createSelector((state: USMStoreState): DerivedSemesterCredits => {
  const activeCourses = selectActiveCourses(state);
  const totalActiveCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const earnedCredits = state.academic.earnedCredits;

  const preset = getPresetById(state.presetId);
  const simEarned = activeCourses.reduce((sum, c) => {
    if (c.grade && preset) {
      const scale = preset.gradeScale.find((g) => g.grade === c.grade);
      if (scale && scale.isPass !== false) {
        return sum + c.credits;
      }
    }
    return sum;
  }, 0);

  const failedCredits = activeCourses.reduce((sum, c) => {
    if (c.grade && preset) {
      const scale = preset.gradeScale.find((g) => g.grade === c.grade);
      if (scale && scale.isPass === false) {
        return sum + c.credits;
      }
    }
    return sum;
  }, 0);

  return {
    totalActiveCredits,
    earnedCredits,
    simulatedEarnedCredits: earnedCredits + simEarned,
    failedCredits,
  };
});
