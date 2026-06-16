import { USMStoreState, CourseState } from "../usmStore";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { createSelector } from "./memo";
import { pluggableRegulationEngine } from "../../lib/academic-intelligence/regulations/regulationEngine";
import { JSPM_CONFIGS } from "../../lib/presets/institutions/jspm";

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
  if (!state.identity?.hasAuthoritativeData) {
    return [];
  }

  const { courses, simulation } = state;
  const activeScenario = simulation?.activeScenarios?.find(s => s.id === simulation?.selectedScenarioId);
  
  // Find the highest semester index to determine the "active" semester
  const maxSemester = courses.reduce((max, c) => Math.max(max, c.semester || 1), 1);
  const currentSemesterCourses = courses.filter(c => (c.semester || 1) === maxSemester);
  
  if (!activeScenario) {
    return currentSemesterCourses;
  }
  
  return currentSemesterCourses.map((course) => {
    const courseOverride = activeScenario.overrides.courses[course.id] || activeScenario.overrides.courses[course.code] || {};

    let grade = course.grade;
    if (courseOverride.grade !== undefined) {
      grade = courseOverride.grade;
    }

    return {
      ...course,
      cieMarks: courseOverride.cieMarks !== undefined ? courseOverride.cieMarks : course.cieMarks,
      seeMarks: courseOverride.seeMarks !== undefined ? courseOverride.seeMarks : course.seeMarks,
      grade,
    };
  });
});

/**
 * Returns courses for a specific semester, factoring in simulation overrides if any.
 */
export const selectCoursesBySemester = (state: USMStoreState, semesterIndex: number): CourseState[] => {
  if (!state.identity?.hasAuthoritativeData) return [];

  const { courses, simulation } = state;
  const activeScenario = simulation?.activeScenarios?.find(s => s.id === simulation?.selectedScenarioId);
  
  const semesterCourses = courses.filter(c => (c.semester || 1) === semesterIndex);

  if (!activeScenario) {
    return semesterCourses;
  }

  return semesterCourses.map((course) => {
    const courseOverride = activeScenario.overrides.courses[course.id] || activeScenario.overrides.courses[course.code] || {};
    let grade = course.grade;
    if (courseOverride.grade !== undefined) grade = courseOverride.grade;

    return {
      ...course,
      cieMarks: courseOverride.cieMarks !== undefined ? courseOverride.cieMarks : course.cieMarks,
      seeMarks: courseOverride.seeMarks !== undefined ? courseOverride.seeMarks : course.seeMarks,
      grade,
    };
  });
};

/**
 * Calculates current or simulated semester SGPA and active CGPA.
 * Memoized using WeakMap to ensure request isolation and SSR safety.
 */
export const selectDerivedGPA = createSelector((state: USMStoreState): {
  sgpa: number;
  cgpa: number;
  percentage: number;
} => {
  if (!state.identity?.hasAuthoritativeData) {
    return { sgpa: 0, cgpa: 0, percentage: 0 };
  }

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

  // Convert CGPA to percentage using the Institution Configuration or fallback to regulation engine
  let percentage = 0;
  const activeInstitution = state.activeInstitution as keyof typeof JSPM_CONFIGS;
  if (activeInstitution && activeInstitution !== "unknown" && JSPM_CONFIGS[activeInstitution]) {
    percentage = JSPM_CONFIGS[activeInstitution].percentageConversion.calculate(derivedCgpa);
  } else {
    percentage = pluggableRegulationEngine.convertToPercentage(derivedCgpa, "cgpa", state.presetId);
  }
  
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
  if (!state.identity?.hasAuthoritativeData) {
    return { totalActiveCredits: 0, earnedCredits: 0, simulatedEarnedCredits: 0, failedCredits: 0 };
  }

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

/**
 * Global Active Context Resolution
 * Provides a unified snapshot of the current semantic academic state.
 */
export const resolveActiveAcademicContext = createSelector((state: USMStoreState) => {
  const activeCourses = selectActiveCourses(state);
  const { sgpa, cgpa, percentage } = selectDerivedGPA(state);
  const { totalActiveCredits, earnedCredits, simulatedEarnedCredits, failedCredits } = selectSemesterCredits(state);
  
  const isSimulationActive = !!(state.simulation?.activeScenarios?.find(s => s.id === state.simulation?.selectedScenarioId));
  
  return {
    identity: state.identity,
    presetId: state.presetId,
    academic: state.academic,
    semesterHistory: state.semesterHistory,
    activeCourses,
    metrics: {
      sgpa,
      cgpa,
      percentage,
      totalActiveCredits,
      earnedCredits,
      simulatedEarnedCredits,
      failedCredits,
    },
    workspaceMode: isSimulationActive ? 'SIMULATION' : 'AUTHORITATIVE',
    workspaceContexts: state.workspaceContexts,
    healthScore: state.healthScore,
  };
});
