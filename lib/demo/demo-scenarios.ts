import { DemoPersona } from "./demo-personas";
import { attendanceEngine } from "../attendance/attendanceEngine";
import { progressionSolver } from "../simulation/progressionSolver";
import { eligibilityEngine } from "../career/eligibilityEngine";
import { healthScoreEngine } from "../academic-intelligence/healthScore";

export interface BunkLimitScenarioResult {
  courseCode: string;
  courseName: string;
  attendancePercentage: number;
  detentionRisk: "LOW" | "MEDIUM" | "HIGH";
  safeBunks: number;
  recoveryRequired: number;
  trace: unknown;
  explanation: string;
}

export interface CgpaRecoveryScenarioResult {
  currentCgpa: number;
  targetCgpa: number;
  isAchievable: boolean;
  requiredSgpa: number;
  recommendedGrade: string;
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME" | "IMPOSSIBLE";
  explanation: string;
  trace: unknown;
}

export interface PlacementEligibilityScenarioResult {
  overallStatus: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  eligibleCount: number;
  ineligibleCount: number;
  companies: Array<{
    name: string;
    status: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
    explanation: string;
  }>;
  explanation: string;
  trace: unknown;
}

export interface FailedSubjectScenarioResult {
  originalCgpa: number;
  newCgpa: number;
  originalHealthScore: number;
  newHealthScore: number;
  activeBacklogsCount: number;
  placementStatusBefore: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  placementStatusAfter: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE";
  explanation: string;
}

export interface AttendanceDropScenarioResult {
  originalPercentage: number;
  newPercentage: number;
  originalRisk: "LOW" | "MEDIUM" | "HIGH";
  newRisk: "LOW" | "MEDIUM" | "HIGH";
  originalHealthScore: number;
  newHealthScore: number;
  explanation: string;
}

export const demoScenarios = {
  // Scenario 1: How many lectures can I bunk?
  runBunkLimitScenario(persona: DemoPersona, courseCode: string): BunkLimitScenarioResult {
    const course = persona.courses.find(c => c.code === courseCode);
    if (!course) {
      throw new Error(`Course with code ${courseCode} not found for persona ${persona.name}`);
    }

    const minAtt = 75; // Default threshold
    const result = attendanceEngine.calculateCourseAttendance(
      Math.max(0, course.attendanceTotal - course.attendanceBunked),
      course.attendanceTotal,
      minAtt,
      persona.presetId
    );

    let explanation = "";
    if (result.metrics.percentage >= minAtt) {
      explanation = `You have ${result.metrics.percentage}% attendance in ${course.name}. Under ${result.trace.sourceClause}, you can safely bunk ${result.metrics.safeBunks} more classes before dropping below the ${minAtt}% threshold.`;
    } else {
      explanation = `Critical attendance alert! You have ${result.metrics.percentage}% in ${course.name}. Under ${result.trace.sourceClause}, you cannot bunk anymore and must attend ${result.metrics.recoveryRequired} consecutive lectures to recover to ${minAtt}%.`;
    }

    return {
      courseCode: course.code,
      courseName: course.name,
      attendancePercentage: result.metrics.percentage,
      detentionRisk: result.metrics.detentionRisk,
      safeBunks: result.metrics.safeBunks,
      recoveryRequired: result.metrics.recoveryRequired,
      trace: result.trace,
      explanation,
    };
  },

  // Scenario 2: Can I recover from X CGPA to Y CGPA?
  runCgpaRecoveryScenario(persona: DemoPersona, targetCgpa: number): CgpaRecoveryScenarioResult {
    const solveInput = {
      currentCgpa: persona.academic.currentCgpa,
      completedSemesters: persona.academic.completedSemesters,
      earnedCredits: persona.academic.earnedCredits,
      targetCgpa: targetCgpa,
      presetId: persona.presetId,
      semesterCourses: persona.courses.map(c => ({
        id: c.id,
        credits: c.credits,
        grade: c.grade,
      })),
    };

    const result = progressionSolver.solve(solveInput);
    
    // Map requiredSgpa to difficulty
    let difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME" | "IMPOSSIBLE" = "EASY";
    if (!result.isTargetAchievable) {
      difficulty = "IMPOSSIBLE";
    } else if (result.requiredSgpaToMeetTarget > 9.0) {
      difficulty = "EXTREME";
    } else if (result.requiredSgpaToMeetTarget > 8.0) {
      difficulty = "CHALLENGING";
    } else if (result.requiredSgpaToMeetTarget > 7.0) {
      difficulty = "MODERATE";
    }

    let explanation = "";
    if (result.isTargetAchievable) {
      explanation = `To recover from CGPA ${persona.academic.currentCgpa} to target CGPA ${targetCgpa}, you need an SGPA of ${result.requiredSgpaToMeetTarget.toFixed(2)} in the current semester. This requires achieving an average grade of '${result.recommendedRemainingGrade}' across remaining credits. Difficulty level: ${difficulty}.`;
    } else {
      explanation = `Target CGPA of ${targetCgpa} is mathematically impossible to achieve in a single semester from a baseline of ${persona.academic.currentCgpa}. The required SGPA is ${result.requiredSgpaToMeetTarget.toFixed(2)}, which exceeds the maximum possible SGPA of 10.0.`;
    }

    return {
      currentCgpa: persona.academic.currentCgpa,
      targetCgpa,
      isAchievable: result.isTargetAchievable,
      requiredSgpa: result.requiredSgpaToMeetTarget,
      recommendedGrade: result.recommendedRemainingGrade,
      difficulty,
      explanation,
      trace: result.trace,
    };
  },

  // Scenario 3: Am I eligible for placements?
  runPlacementEligibilityScenario(persona: DemoPersona): PlacementEligibilityScenarioResult {
    const result = eligibilityEngine.evaluate({
      cgpa: persona.academic.currentCgpa,
      backlogs: persona.academic.activeBacklogsCount,
      earnedCredits: persona.academic.earnedCredits,
    });

    const explanation = `Placement audit: Arjun has access to ${result.eligibleCompaniesCount} out of ${result.companies.length} recruiting partners. Overall placement status: ${result.overallStatus}.`;

    return {
      overallStatus: result.overallStatus,
      eligibleCount: result.eligibleCompaniesCount,
      ineligibleCount: result.ineligibleCompaniesCount,
      companies: result.companies.map(c => ({
        name: c.name,
        status: c.status,
        explanation: c.explanation,
      })),
      explanation,
      trace: result.trace,
    };
  },

  // Scenario 4: What happens if I fail this subject?
  runFailedSubjectScenario(persona: DemoPersona, courseCode: string): FailedSubjectScenarioResult {
    const course = persona.courses.find(c => c.code === courseCode);
    if (!course) {
      throw new Error(`Course with code ${courseCode} not found for persona ${persona.name}`);
    }

    // 1. Calculate original status
    const origEligibility = eligibilityEngine.evaluate({
      cgpa: persona.academic.currentCgpa,
      backlogs: persona.academic.activeBacklogsCount,
      earnedCredits: persona.academic.earnedCredits,
    });

    const aggregateAtt = attendanceEngine.calculateAggregateAttendance(
      persona.courses.map(c => ({
        attended: Math.max(0, c.attendanceTotal - c.attendanceBunked),
        conducted: c.attendanceTotal,
      })),
      75,
      persona.presetId
    );

    const origHealth = healthScoreEngine.calculate({
      cgpa: persona.academic.currentCgpa,
      targetCgpa: persona.academic.targetCgpa,
      activeBacklogs: persona.academic.activeBacklogsCount,
      aggregateAttendancePercentage: aggregateAtt.metrics.aggregatePercentage,
      eligibleCompaniesCount: origEligibility.eligibleCompaniesCount,
      totalCompaniesCount: origEligibility.companies.length,
    });

    // 2. Simulate failing the subject (GP = 0)
    // We replace the course grade with 'F' and recalculate
    const simulatedCourses = persona.courses.map(c => {
      if (c.code === courseCode) {
        return { ...c, grade: "F" };
      }
      // If course grade isn't set, default to standard B+ (points = 7) for simulation realism
      return { ...c, grade: c.grade || "B+" };
    });

    // Recalculate SGPA & CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    for (const c of simulatedCourses) {
      const points = c.grade === "O" ? 10 : c.grade === "A+" ? 9 : c.grade === "A" ? 8 : c.grade === "B+" ? 7 : c.grade === "B" ? 6 : c.grade === "C" ? 5 : c.grade === "D" ? 4 : 0;
      totalGradePoints += points * c.credits;
      totalCredits += c.credits;
    }
    const simulatedSgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    // Weighted simulated CGPA
    const newCgpa = (persona.academic.currentCgpa * persona.academic.earnedCredits + simulatedSgpa * totalCredits) / (persona.academic.earnedCredits + totalCredits);
    const roundedNewCgpa = parseFloat(newCgpa.toFixed(2));

    const newBacklogs = persona.academic.activeBacklogsCount + 1;

    // Recalculate eligibility with new CGPA and backlogs
    const newEligibility = eligibilityEngine.evaluate({
      cgpa: roundedNewCgpa,
      backlogs: newBacklogs,
      earnedCredits: persona.academic.earnedCredits, // course failed, so credits not earned
    });

    // Recalculate health score
    const newHealth = healthScoreEngine.calculate({
      cgpa: roundedNewCgpa,
      targetCgpa: persona.academic.targetCgpa,
      activeBacklogs: newBacklogs,
      aggregateAttendancePercentage: aggregateAtt.metrics.aggregatePercentage,
      eligibleCompaniesCount: newEligibility.eligibleCompaniesCount,
      totalCompaniesCount: newEligibility.companies.length,
    });

    const explanation = `Failing ${course.name} increases active backlogs to ${newBacklogs}. Your CGPA drops from ${persona.academic.currentCgpa} to ${roundedNewCgpa}. Academic Health score plummets from ${origHealth.score} to ${newHealth.score} (${newHealth.status} status). Placement eligibility changes from ${origEligibility.overallStatus} to ${newEligibility.overallStatus} (eligible for ${newEligibility.eligibleCompaniesCount}/${newEligibility.companies.length} companies).`;

    return {
      originalCgpa: persona.academic.currentCgpa,
      newCgpa: roundedNewCgpa,
      originalHealthScore: origHealth.score,
      newHealthScore: newHealth.score,
      activeBacklogsCount: newBacklogs,
      placementStatusBefore: origEligibility.overallStatus,
      placementStatusAfter: newEligibility.overallStatus,
      explanation,
    };
  },

  // Scenario 5: What if attendance drops below 75%?
  runAttendanceDropScenario(persona: DemoPersona, dropLectures: number): AttendanceDropScenarioResult {
    // 1. Calculate original aggregate attendance
    const originalCourses = persona.courses.map(c => ({
      attended: Math.max(0, c.attendanceTotal - c.attendanceBunked),
      conducted: c.attendanceTotal,
    }));

    const origAgg = attendanceEngine.calculateAggregateAttendance(originalCourses, 75, persona.presetId);

    // Calculate original eligibility & health
    const eligibility = eligibilityEngine.evaluate({
      cgpa: persona.academic.currentCgpa,
      backlogs: persona.academic.activeBacklogsCount,
      earnedCredits: persona.academic.earnedCredits,
    });

    const origHealth = healthScoreEngine.calculate({
      cgpa: persona.academic.currentCgpa,
      targetCgpa: persona.academic.targetCgpa,
      activeBacklogs: persona.academic.activeBacklogsCount,
      aggregateAttendancePercentage: origAgg.metrics.aggregatePercentage,
      eligibleCompaniesCount: eligibility.eligibleCompaniesCount,
      totalCompaniesCount: eligibility.companies.length,
    });

    // 2. Simulate dropping/bunking more lectures (reduce attended count for all courses proportionally)
    const simulatedCourses = persona.courses.map(c => {
      // Divide the dropped lectures among courses
      const courseDrop = Math.ceil(dropLectures / persona.courses.length);
      const originalAttended = Math.max(0, c.attendanceTotal - c.attendanceBunked);
      const newAttended = Math.max(0, originalAttended - courseDrop);
      return {
        attended: newAttended,
        conducted: c.attendanceTotal,
      };
    });

    const newAgg = attendanceEngine.calculateAggregateAttendance(simulatedCourses, 75, persona.presetId);

    const newHealth = healthScoreEngine.calculate({
      cgpa: persona.academic.currentCgpa,
      targetCgpa: persona.academic.targetCgpa,
      activeBacklogs: persona.academic.activeBacklogsCount,
      aggregateAttendancePercentage: newAgg.metrics.aggregatePercentage,
      eligibleCompaniesCount: eligibility.eligibleCompaniesCount,
      totalCompaniesCount: eligibility.companies.length,
    });

    const explanation = `Bunking ${dropLectures} more lectures drops aggregate attendance from ${origAgg.metrics.aggregatePercentage}% (${origAgg.metrics.overallRisk} risk) to ${newAgg.metrics.aggregatePercentage}% (${newAgg.metrics.overallRisk} risk). Academic health status changes to ${newHealth.status} (score: ${newHealth.score} vs original: ${origHealth.score}).`;

    return {
      originalPercentage: origAgg.metrics.aggregatePercentage,
      newPercentage: newAgg.metrics.aggregatePercentage,
      originalRisk: origAgg.metrics.overallRisk,
      newRisk: newAgg.metrics.overallRisk,
      originalHealthScore: origHealth.score,
      newHealthScore: newHealth.score,
      explanation,
    };
  },
};
