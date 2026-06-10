import { CourseState, SemesterHistoryEntry, CareerState } from "../../stores/usmStore";

export type DetentionRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RevaluationAnalysis {
  passProbability: number; // 0 to 1
  recommendation: "APPLY_REVAL" | "APPLY_PHOTOCOPY" | "RETAKE_EXAM";
  estimatedCost: number;
}

export interface ATKTRulesStatus {
  yearDownRisk: boolean;
  allowedBacklogsToProceed: number;
  currentActiveBacklogs: number;
  criticalWarning: string | null;
}

export interface CGPACeilingData {
  semester: number;
  currentTrajectory: number;
  mathematicalCeiling: number;
}

export interface PlacementDisqualification {
  courseId: string;
  courseCode: string;
  blockedCompanies: string[];
}

export interface BacklogAnalysis {
  activeBacklogs: CourseState[];
  totalBacklogCredits: number;
  detentionRisk: DetentionRisk;
  prerequisiteBlockers: CourseState[]; 
  atktStatus: ATKTRulesStatus;
  revaluation: { [courseId: string]: RevaluationAnalysis };
  cgpaCeiling: CGPACeilingData[];
  placementDisqualifications: PlacementDisqualification[];
  totalRecoveryCost: number;
}

export interface RecoveryPlanResult {
  plannedCourses: { [courseId: string]: number }; 
  unplannableCourses: CourseState[]; 
}

export class BacklogEngine {

  static calculateATKTStatus(activeBacklogsCount: number, presetId: string): ATKTRulesStatus {
    // Hardcoded rule example for SPPU/Generic: Max 4 backlogs allowed to progress to next year
    const allowed = presetId === "sppu" ? 4 : 5;
    const yearDownRisk = activeBacklogsCount > allowed;
    
    return {
      yearDownRisk,
      allowedBacklogsToProceed: allowed,
      currentActiveBacklogs: activeBacklogsCount,
      criticalWarning: yearDownRisk 
        ? `CRITICAL: You have ${activeBacklogsCount} backlogs. Maximum allowed is ${allowed}. You are at risk of a Year Down.` 
        : null
    };
  }

  static calculateRevaluationProbability(course: CourseState): RevaluationAnalysis {
    // Simulated probability based on marks (e.g. if close to passing (40), higher chance)
    // In a real system, this would use historical data.
    const passMark = 40;
    const currentMarks = (course.cieMarks || 0) + (course.seeMarks || 0);
    
    let prob = 0.1;
    let recommendation: "APPLY_REVAL" | "APPLY_PHOTOCOPY" | "RETAKE_EXAM" = "RETAKE_EXAM";
    let cost = 500; // Exam fee

    if (currentMarks >= passMark - 5) {
      prob = 0.75; // 75% chance to clear if within 5 marks
      recommendation = "APPLY_REVAL";
      cost = 600; // Reval fee
    } else if (currentMarks >= passMark - 12) {
      prob = 0.35;
      recommendation = "APPLY_PHOTOCOPY";
      cost = 400 + 600; // Photocopy + Reval fee
    }

    return { passProbability: prob, recommendation, estimatedCost: cost };
  }

  static calculateCGPACeiling(
    courses: CourseState[], 
    completedSemesters: number,
    history: SemesterHistoryEntry[],
    timeTravel?: { courseId: string; targetGrade: string }
  ): CGPACeilingData[] {
    // Generate a trajectory for remaining semesters up to 8
    const data: CGPACeilingData[] = [];
    const currentEarnedCredits = history.reduce((acc, sem) => acc + sem.earnedCredits, 0);
    const totalCreditsAttempted = history.reduce((acc, sem) => acc + sem.credits, 0);
    let totalPoints = history.reduce((acc, sem) => acc + (sem.sgpa * sem.credits), 0);

    const gradePoints: { [key: string]: number } = {
      "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0, "FF": 0, "ABSENT": 0, "AB": 0
    };

    if (timeTravel) {
      const tc = courses.find(c => c.id === timeTravel.courseId);
      if (tc) {
        // If it already had points, technically F is 0 so it adds 0. But just in case:
        const oldPoints = (gradePoints[(tc.grade || "").toUpperCase()] || 0) * tc.credits;
        const newPoints = (gradePoints[timeTravel.targetGrade.toUpperCase()] || 0) * tc.credits;
        totalPoints = totalPoints - oldPoints + newPoints;
      }
    }

    const currentCgpa = totalCreditsAttempted > 0 ? totalPoints / totalCreditsAttempted : 0;

    let rollingTrajectoryPoints = totalPoints;
    let rollingCeilingPoints = totalPoints;

    // Add maximum possible points from clearing active backlogs
    const activeBacklogs = courses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase()));
    const backlogCredits = activeBacklogs.reduce((sum, c) => sum + c.credits, 0);
    // When cleared with an O (10 points), they add 10 * credits. F had 0 points, so we just add 10 * credits.
    rollingCeilingPoints += backlogCredits * 10;

    let rollingCredits = totalCreditsAttempted;

    const maxSem = Math.max(8, completedSemesters + 4);
    for (let s = completedSemesters + 1; s <= maxSem; s++) {
      const mockSemCredits = 22; // Assume 22 credits per future sem
      rollingCredits += mockSemCredits;
      
      // Trajectory assumes they continue at their current average SGPA
      const avgSgpa = currentCgpa > 0 ? currentCgpa : 7.0;
      rollingTrajectoryPoints += avgSgpa * mockSemCredits;
      
      // Ceiling assumes they get a perfect 10 SGPA in all future sems AND clear backlogs with a 10
      // Note: Some universities cap backlog clearance grades (e.g., max grade B / 8 points). We assume 10 for absolute max.
      rollingCeilingPoints += 10.0 * mockSemCredits;

      data.push({
        semester: s,
        currentTrajectory: parseFloat((rollingTrajectoryPoints / rollingCredits).toFixed(2)),
        mathematicalCeiling: parseFloat((rollingCeilingPoints / rollingCredits).toFixed(2)),
      });
    }

    return data;
  }

  static checkPlacementDisqualification(activeBacklogs: CourseState[], career: CareerState): PlacementDisqualification[] {
    const disquals: PlacementDisqualification[] = [];
    
    // Example rule: Service companies might allow 1 active backlog, Product/FAANG allow 0.
    const targetCompanies = career.targetCompanies || [];
    const strictCompanies = targetCompanies.filter(c => 
      ["Google", "Microsoft", "Amazon", "Atlassian", "Uber", "Product"].some(t => c.toLowerCase().includes(t.toLowerCase()))
    );

    if (activeBacklogs.length > 0 && strictCompanies.length > 0) {
      // Pick the most critical backlog (e.g., core subjects like DSA, OS, DBMS)
      const coreSubjects = ["Data Structures", "Algorithms", "Operating Systems", "Database", "Networks"];
      for (const backlog of activeBacklogs) {
        const isCore = coreSubjects.some(core => backlog.name.toLowerCase().includes(core.toLowerCase()));
        if (isCore) {
          disquals.push({
            courseId: backlog.id,
            courseCode: backlog.code,
            blockedCompanies: strictCompanies
          });
        }
      }
      
      // If none are core, just flag the first one
      if (disquals.length === 0 && targetCompanies.length > 0) {
         disquals.push({
            courseId: activeBacklogs[0].id,
            courseCode: activeBacklogs[0].code,
            blockedCompanies: targetCompanies
         });
      }
    }
    return disquals;
  }

  static analyzeBacklogs(
    courses: CourseState[], 
    completedSemesters: number,
    history: SemesterHistoryEntry[],
    career: CareerState,
    presetId: string = "sppu",
    timeTravel?: { courseId: string; targetGrade: string }
  ): BacklogAnalysis {
    const activeBacklogs = courses.filter(
      (c) => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())
    );

    const totalBacklogCredits = activeBacklogs.reduce((sum, c) => sum + c.credits, 0);

    const atktStatus = this.calculateATKTStatus(activeBacklogs.length, presetId);
    
    let detentionRisk: DetentionRisk = "LOW";
    if (atktStatus.yearDownRisk) detentionRisk = "CRITICAL";
    else if (activeBacklogs.length >= atktStatus.allowedBacklogsToProceed - 1) detentionRisk = "HIGH";
    else if (activeBacklogs.length > 1) detentionRisk = "MEDIUM";

    const prerequisiteBlockers = activeBacklogs.length > 0 ? [activeBacklogs[0]] : [];
    
    const revaluation: { [courseId: string]: RevaluationAnalysis } = {};
    let totalRecoveryCost = 0;

    for (const backlog of activeBacklogs) {
      const reval = this.calculateRevaluationProbability(backlog);
      revaluation[backlog.id] = reval;
      totalRecoveryCost += reval.estimatedCost;
    }

    const cgpaCeiling = this.calculateCGPACeiling(courses, completedSemesters, history, timeTravel);
    const placementDisqualifications = this.checkPlacementDisqualification(activeBacklogs, career);

    return {
      activeBacklogs,
      totalBacklogCredits,
      detentionRisk,
      prerequisiteBlockers,
      atktStatus,
      revaluation,
      cgpaCeiling,
      placementDisqualifications,
      totalRecoveryCost
    };
  }

  static calculateTimeTravelCGPA(
    course: CourseState,
    targetGrade: string,
    history: SemesterHistoryEntry[],
    courses: CourseState[]
  ): number {
    const gradePoints: { [key: string]: number } = {
      "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0, "FF": 0, "ABSENT": 0, "AB": 0
    };
    
    let totalCredits = history.reduce((acc, sem) => acc + sem.credits, 0);
    let totalPoints = history.reduce((acc, sem) => acc + (sem.sgpa * sem.credits), 0);

    const oldPoints = (gradePoints[(course.grade || "").toUpperCase()] || 0) * course.credits;
    const newPoints = (gradePoints[targetGrade.toUpperCase()] || 0) * course.credits;
    
    totalPoints = totalPoints - oldPoints + newPoints;

    return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
  }

  static calculateCGPARoi(
    courses: CourseState[],
    history: SemesterHistoryEntry[]
  ): { courseId: string; cgpaBoost: number }[] {
    const activeBacklogs = courses.filter(
      (c) => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())
    );

    const gradePoints: { [key: string]: number } = {
      "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0, "FF": 0, "ABSENT": 0, "AB": 0
    };

    let totalCredits = history.reduce((acc, sem) => acc + sem.credits, 0);
    let totalPoints = history.reduce((acc, sem) => acc + (sem.sgpa * sem.credits), 0);
    const currentCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    const roiList = activeBacklogs.map(backlog => {
      const oldPoints = (gradePoints[(backlog.grade || "").toUpperCase()] || 0) * backlog.credits;
      // Assuming a target grade of "A" (8 points) for ROI calculation
      const hypotheticalPoints = totalPoints - oldPoints + (8 * backlog.credits);
      const newCgpa = hypotheticalPoints / totalCredits; // Credits remain same since backlog was already attempted
      return {
        courseId: backlog.id,
        cgpaBoost: parseFloat((newCgpa - currentCgpa).toFixed(3))
      };
    });

    return roiList.sort((a, b) => b.cgpaBoost - a.cgpaBoost);
  }

  static checkGraceMarksEligibility(
    courses: CourseState[],
    course: CourseState
  ): { isEligible: boolean; requiredMarks: number } {
    const activeBacklogs = courses.filter(
      (c) => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())
    );

    // Common Grace Marks logic: if this is the ONLY backlog, and you are within 3 marks of passing (e.g. 37/40)
    if (activeBacklogs.length > 1) {
      return { isEligible: false, requiredMarks: 0 };
    }

    const currentMarks = (course.cieMarks || 0) + (course.seeMarks || 0);
    const passMark = 40;
    const gap = passMark - currentMarks;

    if (gap > 0 && gap <= 3) {
      return { isEligible: true, requiredMarks: gap };
    }

    return { isEligible: false, requiredMarks: gap };
  }

  static calculateWorstCaseSurvival(
    activeBacklogsCount: number,
    presetId: string
  ): { nextYearRisk: boolean; allowed: number } {
    const allowed = presetId === "sppu" ? 4 : 5;
    // Worst case: assuming they fail everything again, plus maybe fail 1 more subject in the current semester
    const hypotheticalFailures = activeBacklogsCount + 1;
    return {
      nextYearRisk: hypotheticalFailures > allowed,
      allowed
    };
  }

  static generateStrategy(
    courses: CourseState[],
    currentSemester: number,
    strategy: "SAFE" | "BALANCED" | "AGGRESSIVE"
  ): RecoveryPlanResult & { insight: string; maxCredits: number } {
    const activeBacklogs = courses.filter(
      (c) => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())
    );
    
    const plannedCourses: { [courseId: string]: number } = {};
    const unplannableCourses: CourseState[] = [];
    
    // Core/Prerequisite keywords
    const coreKeywords = ["math", "data structure", "algorithm", "operating system", "database", "network"];
    
    // Sort backlogs based on strategy
    let sortedBacklogs = [...activeBacklogs];
    
    if (strategy === "SAFE" || strategy === "BALANCED") {
      // Prioritize prerequisite blockers (core subjects) and older semesters
      sortedBacklogs.sort((a, b) => {
        const aIsCore = coreKeywords.some(k => a.name.toLowerCase().includes(k));
        const bIsCore = coreKeywords.some(k => b.name.toLowerCase().includes(k));
        if (aIsCore && !bIsCore) return -1;
        if (!aIsCore && bIsCore) return 1;
        return a.semester - b.semester; // older first
      });
    } else {
      // Aggressive: just older first
      sortedBacklogs.sort((a, b) => a.semester - b.semester);
    }

    const BASE_CREDITS_PER_SEM = 20;
    let maxCreditsPerSemester = 24;
    let insight = "";

    switch (strategy) {
      case "SAFE":
        maxCreditsPerSemester = 24;
        insight = "Prioritizes critical blockers early while keeping credit load strictly under 24 per semester to prevent burnout.";
        break;
      case "BALANCED":
        maxCreditsPerSemester = 28;
        insight = "A steady approach clearing prerequisites quickly while balancing moderate credit loads for interview prep.";
        break;
      case "AGGRESSIVE":
        maxCreditsPerSemester = 32;
        insight = "Pure mathematical maximum. Packs absolute highest credit load into the immediate semester for fastest possible clearance.";
        break;
    }
    
    for (const backlog of sortedBacklogs) {
      let placed = false;
      
      const maxSem = Math.max(8, currentSemester + 4);
      for (let s = currentSemester; s <= maxSem; s++) {
        const existingRecoveryCredits = Object.entries(plannedCourses)
          .filter(([_, sem]) => sem === s)
          .map(([id]) => courses.find(c => c.id === id)?.credits || 0)
          .reduce((sum, cred) => sum + cred, 0);
          
        const totalCreditsThisSem = BASE_CREDITS_PER_SEM + existingRecoveryCredits + backlog.credits;
        
        if (totalCreditsThisSem <= maxCreditsPerSemester) {
          plannedCourses[backlog.id] = s;
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        unplannableCourses.push(backlog);
      }
    }

    return { plannedCourses, unplannableCourses, insight, maxCredits: maxCreditsPerSemester };
  }
}
