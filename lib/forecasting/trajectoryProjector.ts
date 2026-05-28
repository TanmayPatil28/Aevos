import { ForecastEngineInput, SemesterProjection } from "./types";

export const trajectoryProjector = {
  /**
   * Projects future semester-by-semester CGPA trajectories based on an assumed SGPA per semester.
   */
  project(
    input: ForecastEngineInput,
    assumedSgpa: number,
    maxGradePoint: number = 10.0
  ): SemesterProjection[] {
    const {
      currentCgpa,
      completedSemesters,
      earnedCredits,
      totalProgramSemesters,
      creditsPerSemester,
      volatility
    } = input;

    const projections: SemesterProjection[] = [];
    let prevCgpa = currentCgpa;
    let prevCredits = earnedCredits;

    const startSemester = completedSemesters + 1;

    for (let sem = startSemester; sem <= totalProgramSemesters; sem++) {
      const cumulativeCredits = prevCredits + creditsPerSemester;
      
      // Calculate projected CGPA
      let projectedCgpa = (prevCgpa * prevCredits + assumedSgpa * creditsPerSemester) / cumulativeCredits;
      
      // Cap at maxGradePoint
      projectedCgpa = Math.min(projectedCgpa, maxGradePoint);
      
      // Confidence bands: upper = projectedCgpa + volatility * 0.3, lower = projectedCgpa - volatility * 0.3
      const rawUpper = projectedCgpa + volatility * 0.3;
      const rawLower = projectedCgpa - volatility * 0.3;
      
      const upper = Math.max(0, Math.min(maxGradePoint, parseFloat(rawUpper.toFixed(2))));
      const lower = Math.max(0, Math.min(maxGradePoint, parseFloat(rawLower.toFixed(2))));

      projections.push({
        semester: sem,
        projectedSgpa: parseFloat(assumedSgpa.toFixed(2)),
        projectedCgpa: parseFloat(projectedCgpa.toFixed(2)),
        cumulativeCredits,
        upper,
        lower
      });

      // Update for next iteration
      prevCgpa = projectedCgpa;
      prevCredits = cumulativeCredits;
    }

    return projections;
  }
};
