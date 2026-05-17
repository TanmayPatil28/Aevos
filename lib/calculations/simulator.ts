import { SubjectState, SemesterState } from '../stores/academic-store';
import { getGradingSystem } from './grading-systems';

export interface SimulationResult {
  currentCgpa: number;
  simulatedCgpa: number;
  difference: number;
  velocity: number; // Rate of change across semesters
  backlogImpact: number; // Penalty due to backlogs
}

export class AcademicSimulator {
  private semesters: SemesterState[];
  private gradingSystemId: string;

  constructor(semesters: SemesterState[], gradingSystemId: string = 'sppu-2019') {
    this.semesters = semesters;
    this.gradingSystemId = gradingSystemId;
  }

  public calculateCgpa(customSemesters?: SemesterState[]): number {
    const sems = customSemesters || this.semesters;
    const system = getGradingSystem(this.gradingSystemId);

    let totalGradePoints = 0;
    let totalCredits = 0;

    sems.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        // Exclude backlogs from basic calculation if needed,
        // but typically a backlog has gradePoint = 0 until cleared.
        if (sub.gradePoint !== null && sub.credits > 0) {
          totalGradePoints += sub.gradePoint * sub.credits;
          totalCredits += sub.credits;
        }
      });
    });

    if (totalCredits === 0) return 0;
    return Number((totalGradePoints / totalCredits).toFixed(2));
  }

  public simulateSubjectChange(
    semesterId: string,
    subjectId: string,
    newGradePoint: number
  ): SimulationResult {
    const currentCgpa = this.calculateCgpa();

    // Create a deep copy for simulation
    const simulatedSemesters = JSON.parse(JSON.stringify(this.semesters)) as SemesterState[];

    const semIndex = simulatedSemesters.findIndex((s) => s.id === semesterId);
    if (semIndex !== -1) {
      const subIndex = simulatedSemesters[semIndex].subjects.findIndex((s) => s.id === subjectId);
      if (subIndex !== -1) {
        simulatedSemesters[semIndex].subjects[subIndex].gradePoint = newGradePoint;
        simulatedSemesters[semIndex].subjects[subIndex].isBacklog = newGradePoint === 0;
      }
    }

    const simulatedCgpa = this.calculateCgpa(simulatedSemesters);
    const difference = Number((simulatedCgpa - currentCgpa).toFixed(2));

    return {
      currentCgpa,
      simulatedCgpa,
      difference,
      velocity: this.calculateVelocity(simulatedSemesters),
      backlogImpact: this.calculateBacklogImpact(simulatedSemesters),
    };
  }

  public calculateVelocity(sems?: SemesterState[]): number {
    const targetSems = sems || this.semesters;
    const completedSems = [...targetSems]
      .filter((s) => s.isCompleted)
      .sort((a, b) => a.semesterNumber - b.semesterNumber);

    if (completedSems.length < 2) return 0;

    // Average difference between consecutive semesters
    let totalDiff = 0;
    for (let i = 1; i < completedSems.length; i++) {
      const prevSgpa = completedSems[i - 1].sgpa || 0;
      const currSgpa = completedSems[i].sgpa || 0;
      totalDiff += currSgpa - prevSgpa;
    }

    return Number((totalDiff / (completedSems.length - 1)).toFixed(2));
  }

  // Alias for velocity for better naming in widgets
  public calculateGpaVelocity(sems?: SemesterState[]): { velocity: number } {
    return { velocity: this.calculateVelocity(sems) };
  }

  public calculateConsistencyScore(): number {
    const completedSems = this.semesters.filter((s) => s.isCompleted);
    if (completedSems.length < 2) return 100; // Perfect consistency with one data point

    const sgpas = completedSems.map((s) => s.sgpa || 0);
    const mean = sgpas.reduce((a, b) => a + b, 0) / sgpas.length;
    const variance = sgpas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sgpas.length;
    const stdDev = Math.sqrt(variance);

    // Score from 0 to 100, where 0 stdDev is 100
    // A stdDev of 1.0 (very high) would lead to a lower score
    const score = Math.max(0, 100 - stdDev * 50);
    return Math.round(score);
  }

  public calculateBacklogImpact(sems?: SemesterState[]): number {
    const targetSems = sems || this.semesters;

    // CGPA without backlogs (assuming they were passed with a minimum passing grade, e.g., 4)
    const semsWithoutBacklogs = JSON.parse(JSON.stringify(targetSems)) as SemesterState[];

    semsWithoutBacklogs.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        if (sub.isBacklog || sub.gradePoint === 0) {
          sub.gradePoint = 4; // Minimum passing grade point assumption
          sub.isBacklog = false;
        }
      });
    });

    const currentCgpa = this.calculateCgpa(targetSems);
    const noBacklogCgpa = this.calculateCgpa(semsWithoutBacklogs);

    return Number((noBacklogCgpa - currentCgpa).toFixed(2));
  }
}
