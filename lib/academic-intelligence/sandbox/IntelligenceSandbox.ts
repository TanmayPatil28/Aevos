import { AcademicProfile } from "@/types/academicProfile";
import { IntelligenceContext, SimulationScenario } from "../types";

/**
 * Intelligence Sandbox
 * 
 * Enforces strict isolation for Academic Intelligence engines. 
 * Performs a deep clone of the authoritative academic profile and safely 
 * applies simulation overrides without mutating the underlying identity state.
 */
export class IntelligenceSandbox {
  private baseContext: IntelligenceContext;
  private projectedProfile: AcademicProfile;
  private activeScenario: SimulationScenario | null = null;

  constructor(context: IntelligenceContext) {
    this.baseContext = context;
    // Perform a deep clone of the canonical profile to guarantee simulation safety
    this.projectedProfile = JSON.parse(JSON.stringify(context.authoritativeProfile));
  }

  /**
   * Applies a hypothetical scenario layer on top of the sandbox.
   * This mutates the *internal clone*, never the source.
   */
  public applyScenario(scenario: SimulationScenario): void {
    this.activeScenario = scenario;

    // Apply Course Overrides
    Object.entries(scenario.overrides.courses).forEach(([courseId, updates]) => {
      const targetCourse = this.projectedProfile.courses.find(c => c.id === courseId || c.code === courseId);
      if (targetCourse) {
        if (updates.grade !== undefined) targetCourse.grade = updates.grade;
        if (updates.cieMarks !== undefined) targetCourse.cieMarks = updates.cieMarks;
        if (updates.seeMarks !== undefined) targetCourse.seeMarks = updates.seeMarks;
      }
    });

    // Apply Semester Overrides
    Object.entries(scenario.overrides.semesters).forEach(([semStr, updates]) => {
      const semIndex = parseInt(semStr, 10);
      const targetSem = this.projectedProfile.semesterHistory.find(s => s.semester === semIndex);
      
      if (targetSem && updates.sgpa !== undefined) {
        targetSem.sgpa = updates.sgpa;
      } else if (!targetSem && updates.sgpa !== undefined) {
        // Hypothesizing a future semester
        this.projectedProfile.semesterHistory.push({
          semester: semIndex,
          sgpa: updates.sgpa,
          credits: 22, // Assumption for future semesters (will be formalized by target engines)
          earnedCredits: 22,
        });
      }
    });

    this.recalculateStanding();
  }

  /**
   * Deterministically recalculates CGPA and credits for the projected profile.
   */
  private recalculateStanding(): void {
    let totalCredits = 0;
    let totalPoints = 0;
    let activeBacklogsCount = 0;

    // Evaluate SGPA overrides
    this.projectedProfile.semesterHistory.forEach(sem => {
      totalCredits += sem.credits;
      totalPoints += (sem.sgpa * sem.credits);
    });

    // Evaluate Course backlogs based on hypothetical grades
    this.projectedProfile.courses.forEach(c => {
      if (c.grade && ["F", "FF", "FAIL", "ABSENT", "AB", "NP"].includes(c.grade.toUpperCase())) {
        activeBacklogsCount++;
      }
    });

    const newCgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

    this.projectedProfile.academic.currentCgpa = newCgpa;
    this.projectedProfile.academic.activeBacklogsCount = activeBacklogsCount;
  }

  public getProjectedProfile(): AcademicProfile {
    return this.projectedProfile;
  }

  public getBaseContext(): IntelligenceContext {
    return this.baseContext;
  }
}
