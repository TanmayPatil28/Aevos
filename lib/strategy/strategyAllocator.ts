import { getPresetById } from "../presets/presetRegistry";
import { progressionSolver } from "../simulation/progressionSolver";
import { healthScoreEngine } from "../academic-intelligence/healthScore";
import { 
  StrategyEngineInput, 
  StrategyMode, 
  StrategyResult, 
  CourseGradeTarget 
} from "./types";
import { GradeScaleEntry } from "../presets/types/universityPreset";

function mapToNearestGrade(gp: number, gradeScale: GradeScaleEntry[]): GradeScaleEntry {
  const passingGrades = gradeScale.filter(g => g.isPass !== false);
  if (passingGrades.length === 0) {
    return gradeScale[gradeScale.length - 1] || { grade: "F", points: 0, isPass: false };
  }

  let nearest = passingGrades[0];
  let minDiff = Math.abs(nearest.points - gp);

  for (const g of passingGrades) {
    const diff = Math.abs(g.points - gp);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = g;
    }
  }
  return nearest;
}

function distributePoints(
  courses: Array<{ id: string; credits: number }>,
  initialGps: number[],
  totalPointsNeeded: number,
  minGP: number,
  maxGP: number
): number[] {
  const gp = [...initialGps];
  
  // Clamp initial
  for (let i = 0; i < gp.length; i++) {
    gp[i] = Math.max(minGP, Math.min(maxGP, gp[i]));
  }

  // Run adjustment loop (up to 50 iterations, usually converges in 1-2)
  for (let iter = 0; iter < 50; iter++) {
    const currentSum = courses.reduce((sum, c, idx) => sum + gp[idx] * c.credits, 0);
    const diff = totalPointsNeeded - currentSum;
    if (Math.abs(diff) < 0.01) break;

    // Find courses that can be adjusted
    const candidates = courses.map((c, idx) => {
      return {
        idx,
        credits: c.credits,
        slack: diff > 0 ? (maxGP - gp[idx]) : (gp[idx] - minGP)
      };
    }).filter(c => c.slack > 0.001);

    if (candidates.length === 0) break;

    // Distribute diff proportionally to slack * credits
    const totalSlack = candidates.reduce((sum, c) => sum + c.slack * c.credits, 0);
    if (totalSlack <= 0) break;

    const factor = Math.min(1, Math.abs(diff) / totalSlack);
    const sign = diff > 0 ? 1 : -1;

    for (const c of candidates) {
      gp[c.idx] += sign * factor * c.slack;
    }
  }

  // Final clamping to be safe
  return gp.map(v => Math.max(minGP, Math.min(maxGP, parseFloat(v.toFixed(2)))));
}

export const strategyAllocator = {
  /**
   * Generates a single strategy result for a given mode.
   */
  generate(input: StrategyEngineInput, mode: StrategyMode): StrategyResult {
    const { currentCgpa, earnedCredits, targetCgpa, presetId, courses } = input;
    
    const preset = getPresetById(presetId);
    const gradeScale = preset?.gradeScale || [];
    const maxGradePoint = Math.max(...gradeScale.map(g => g.points), 10);
    
    // Find passing grades
    const passingScale = [...gradeScale]
      .filter(g => g.isPass !== false)
      .sort((a, b) => b.points - a.points);
    const minPassingGradePoint = passingScale.length > 0 
      ? passingScale[passingScale.length - 1].points 
      : 4;

    // Determine target CGPA based on mode
    let adjustedTargetCgpa = targetCgpa;
    let label = "Balanced Path";
    let description = "Aims directly at your target CGPA, distributing effort evenly across all subjects.";

    if (mode === 'SAFE') {
      adjustedTargetCgpa = Math.max(currentCgpa, currentCgpa + 0.1);
      label = "Safe Path";
      description = "Focuses on maintaining your current CGPA by targeting realistic grades in easier subjects.";
    } else if (mode === 'AGGRESSIVE') {
      adjustedTargetCgpa = Math.min(targetCgpa + 0.5, maxGradePoint);
      label = "Push Path";
      description = "Aims to overshoot your target CGPA to build an academic buffer, prioritizing high-credit courses.";
    }

    // Cap adjusted target at maxGradePoint
    adjustedTargetCgpa = Math.min(adjustedTargetCgpa, maxGradePoint);

    // Solve for required SGPA using progressionSolver
    const solverInput = {
      currentCgpa,
      completedSemesters: 0,
      earnedCredits,
      targetCgpa: adjustedTargetCgpa,
      presetId,
      semesterCourses: courses.map(c => ({
        id: c.id,
        credits: c.credits,
        grade: c.grade,
      })),
    };
    const solverResult = progressionSolver.solve(solverInput);
    const requiredSgpa = solverResult.requiredSgpaToMeetTarget;

    // Identify active credit courses
    const activeCourses = courses.filter(c => c.credits > 0);
    const totalCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
    const fixedCourses = activeCourses.filter(c => c.grade !== undefined && c.grade !== '');
    const remainingCourses = activeCourses.filter(c => c.grade === undefined || c.grade === '');
    const remainingCredits = remainingCourses.reduce((sum, c) => sum + c.credits, 0);

    // Calculate fixed course grade points
    let fixedGradePoints = 0;
    for (const c of fixedCourses) {
      const scaleEntry = gradeScale.find(g => g.grade === c.grade);
      if (scaleEntry) {
        fixedGradePoints += scaleEntry.points * c.credits;
      }
    }

    // Determine points needed for remaining courses
    const totalPointsNeededForSem = requiredSgpa * totalCredits;
    const pointsRemainingNeeded = Math.max(0, totalPointsNeededForSem - fixedGradePoints);

    // Calculate difficulty weight (0-1) for each remaining course
    // Detected max CIE marks in current courses, fallback to 40
    const maxCieInInput = Math.max(...courses.map(c => c.cieMarks || 0), 0);
    const maxCieMarks = maxCieInInput > 40 ? (maxCieInInput > 50 ? 100 : 50) : 40;

    const difficultyWeights = remainingCourses.map(c => {
      const cieRatio = Math.max(0, Math.min(1, c.cieMarks / maxCieMarks));
      const attendancePct = c.attendanceTotal > 0 
        ? Math.max(0, Math.min(100, ((c.attendanceTotal - c.attendanceBunked) / c.attendanceTotal) * 100))
        : 100;
      const easeScore = 0.6 * cieRatio + 0.4 * (attendancePct / 100);
      return parseFloat((1 - easeScore).toFixed(2));
    });

    // Allocate continuous target points for remaining courses
    let gp: number[] = [];
    if (remainingCourses.length > 0) {
      const gp_base = remainingCredits > 0 ? pointsRemainingNeeded / remainingCredits : 0;
      
      let initialGps: number[] = [];
      if (mode === 'SAFE') {
        // Allocate more to easy courses (lower difficultyWeight = higher ease)
        const eases = difficultyWeights.map(w => 1 - w);
        const totalEase = eases.reduce((sum, e) => sum + e, 0);
        const meanEase = totalEase / eases.length || 1;
        
        initialGps = remainingCourses.map((_, idx) => {
          const ease = eases[idx];
          // bias of up to 2.5 grade points
          return gp_base + 2.5 * (ease - meanEase);
        });
      } else if (mode === 'AGGRESSIVE') {
        // Push hard on high-credit courses
        const credits = remainingCourses.map(c => c.credits);
        const totalCreditsVal = credits.reduce((sum, cr) => sum + cr, 0);
        const meanCredits = totalCreditsVal / credits.length || 1;
        
        initialGps = remainingCourses.map(c => {
          // bias of up to 2.5 grade points
          return gp_base + 2.5 * (c.credits - meanCredits);
        });
      } else {
        // Balanced: even distribution
        initialGps = Array(remainingCourses.length).fill(gp_base);
      }

      gp = distributePoints(
        remainingCourses,
        initialGps,
        pointsRemainingNeeded,
        minPassingGradePoint,
        maxGradePoint
      );
    }

    // Map targets to discrete grades and compute actual projected SGPA
    const courseTargets: CourseGradeTarget[] = courses.map(c => {
      const isFixed = c.grade !== undefined && c.grade !== '';
      
      const cieRatio = Math.max(0, Math.min(1, c.cieMarks / maxCieMarks));
      const attendancePct = c.attendanceTotal > 0 
        ? Math.max(0, Math.min(100, ((c.attendanceTotal - c.attendanceBunked) / c.attendanceTotal) * 100))
        : 100;
      const easeScore = 0.6 * cieRatio + 0.4 * (attendancePct / 100);
      const difficultyWeight = parseFloat((1 - easeScore).toFixed(2));

      if (isFixed) {
        const scaleEntry = gradeScale.find(g => g.grade === c.grade);
        const targetGradePoint = scaleEntry ? scaleEntry.points : 0;
        return {
          courseId: c.id,
          courseCode: c.code,
          courseName: c.name,
          credits: c.credits,
          currentGrade: c.grade,
          targetGrade: c.grade!,
          targetGradePoint,
          isFixed: true,
          difficultyWeight
        };
      } else {
        const idx = remainingCourses.findIndex(rc => rc.id === c.id);
        const nearestGradeEntry = mapToNearestGrade(gp[idx], gradeScale);
        return {
          courseId: c.id,
          courseCode: c.code,
          courseName: c.name,
          credits: c.credits,
          targetGrade: nearestGradeEntry.grade,
          targetGradePoint: nearestGradeEntry.points,
          isFixed: false,
          difficultyWeight
        };
      }
    });

    // Compute exact actual projected SGPA and CGPA based on discrete mapped grades
    const projectedSemesterPoints = courseTargets.reduce((sum, t) => sum + t.targetGradePoint * t.credits, 0);
    const projectedSgpa = totalCredits > 0 
      ? parseFloat((projectedSemesterPoints / totalCredits).toFixed(2)) 
      : 0;

    const projectedCgpa = parseFloat((
      (currentCgpa * earnedCredits + projectedSgpa * totalCredits) / 
      (earnedCredits + totalCredits)
    ).toFixed(2));

    // Feasibility Score calculation
    let feasibilityScore = 100;
    const isAchievable = requiredSgpa <= maxGradePoint;

    if (!isAchievable) {
      feasibilityScore = 0;
    } else {
      const remainingTargets = courseTargets.filter(t => !t.isFixed);
      let difficultyPenalty = 0;
      if (remainingTargets.length > 0) {
        let weightedPenalty = 0;
        let totalRemCredits = 0;
        for (const t of remainingTargets) {
          weightedPenalty += t.targetGradePoint * t.difficultyWeight * t.credits;
          totalRemCredits += t.credits;
        }
        difficultyPenalty = (weightedPenalty / totalRemCredits) / maxGradePoint; // 0 to 1
      }
      
      const sgpaDiff = Math.max(0, requiredSgpa - currentCgpa);
      const sgpaDiffRatio = sgpaDiff / maxGradePoint; // 0 to 1
      
      feasibilityScore = 100 - (difficultyPenalty * 40) - (sgpaDiffRatio * 60);
      feasibilityScore = Math.max(0, Math.min(100, Math.round(feasibilityScore)));
    }

    // Health Score Delta calculation
    // Estimate attendance pct
    const totalAttended = courses.reduce((sum, c) => sum + Math.max(0, c.attendanceTotal - c.attendanceBunked), 0);
    const totalConducted = courses.reduce((sum, c) => sum + c.attendanceTotal, 0);
    const aggregateAttendancePercentage = totalConducted > 0 
      ? (totalAttended / totalConducted) * 100 
      : 100;

    const currentHealth = healthScoreEngine.calculate({
      cgpa: currentCgpa,
      targetCgpa,
      activeBacklogs: 0,
      aggregateAttendancePercentage,
      eligibleCompaniesCount: 10,
      totalCompaniesCount: 10
    });

    const projectedHealth = healthScoreEngine.calculate({
      cgpa: projectedCgpa,
      targetCgpa,
      activeBacklogs: 0,
      aggregateAttendancePercentage,
      eligibleCompaniesCount: 10,
      totalCompaniesCount: 10
    });

    const healthScoreDelta = projectedHealth.score - currentHealth.score;

    return {
      mode,
      label,
      description,
      projectedSgpa,
      projectedCgpa,
      isAchievable,
      courseTargets,
      healthScoreDelta,
      feasibilityScore
    };
  },

  /**
   * Generates all three strategies (SAFE, BALANCED, AGGRESSIVE) at once.
   */
  generateAll(input: StrategyEngineInput): StrategyResult[] {
    return [
      this.generate(input, 'SAFE'),
      this.generate(input, 'BALANCED'),
      this.generate(input, 'AGGRESSIVE')
    ];
  }
};
