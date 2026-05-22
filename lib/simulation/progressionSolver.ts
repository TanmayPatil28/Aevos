import { TraceMetadata } from "../../stores/selectors";
import { getPresetById } from "../presets/presetRegistry";
import { pluggableRegulationEngine } from "../academic-intelligence/regulations/regulationEngine";

export interface ProgressionSolverInput {
  currentCgpa: number;
  completedSemesters: number;
  earnedCredits: number;
  targetCgpa: number;
  presetId: string;
  semesterCourses: Array<{
    id: string;
    credits: number;
    grade?: string; // fixed or simulated grade
  }>;
}

export interface CourseTargetGrade {
  courseId: string;
  requiredGradePoint: number;
  recommendedGrade: string;
  isAchievable: boolean;
}

export interface ProgressionSolverResult {
  currentDerivedCgpa: number;
  currentDerivedSgpa: number;
  requiredSgpaToMeetTarget: number;
  averageRequiredGradePoint: number;
  recommendedRemainingGrade: string;
  isTargetAchievable: boolean;
  remainingCredits: number;
  courseTargetGrades: CourseTargetGrade[];
  trace: TraceMetadata;
}

export const progressionSolver = {
  /**
   * Calculates SGPA, CGPA and back-solves target grade points for remaining courses.
   */
  solve(input: ProgressionSolverInput): ProgressionSolverResult {
    const { currentCgpa, earnedCredits, targetCgpa, presetId, semesterCourses } = input;
    const preset = getPresetById(presetId);

    const gradeScale = preset?.gradeScale || [
      { grade: "O", points: 10, isPass: true },
      { grade: "A+", points: 9, isPass: true },
      { grade: "A", points: 8, isPass: true },
      { grade: "B+", points: 7, isPass: true },
      { grade: "B", points: 6, isPass: true },
      { grade: "C", points: 5, isPass: true },
      { grade: "D", points: 4, isPass: true },
      { grade: "F", points: 0, isPass: false },
    ];

    // Filter out 0 credit audit courses from GP calculations
    const activeCreditCourses = semesterCourses.filter((c) => c.credits > 0);
    const totalSemesterCredits = activeCreditCourses.reduce((sum, c) => sum + c.credits, 0);

    // 2. Identify fixed and remaining courses
    const fixedCourses = activeCreditCourses.filter((c) => c.grade !== undefined && c.grade !== "");
    const remainingCourses = activeCreditCourses.filter((c) => c.grade === undefined || c.grade === "");

    const remainingCredits = remainingCourses.reduce((sum, c) => sum + c.credits, 0);

    // 3. Compute SGPA of fixed courses
    let fixedGradePoints = 0;
    let fixedCredits = 0;

    for (const c of fixedCourses) {
      const scaleEntry = gradeScale.find((g) => g.grade === c.grade);
      if (scaleEntry) {
        fixedGradePoints += scaleEntry.points * c.credits;
        fixedCredits += c.credits;
      }
    }

    // Current SGPA of courses that have grades
    const currentDerivedSgpa = fixedCredits > 0 ? fixedGradePoints / fixedCredits : 0;
    const totalSemesterPoints = fixedGradePoints; // assuming remaining courses have 0 points for now

    // Current overall derived CGPA
    const totalSemesterCreditsAttempted = totalSemesterCredits;
    const currentDerivedSgpaAll =
      totalSemesterCreditsAttempted > 0 ? totalSemesterPoints / totalSemesterCreditsAttempted : 0;

    const currentDerivedCgpa =
      totalSemesterCreditsAttempted > 0
        ? (currentCgpa * earnedCredits + currentDerivedSgpaAll * totalSemesterCreditsAttempted) /
          (earnedCredits + totalSemesterCreditsAttempted)
        : currentCgpa;

    // 4. Back-solving required SGPA to hit the overall Target CGPA
    // targetCgpa = (currentCgpa * earnedCredits + requiredSgpa * totalSemesterCredits) / (earnedCredits + totalSemesterCredits)
    // requiredSgpa = (targetCgpa * (earnedCredits + totalSemesterCredits) - currentCgpa * earnedCredits) / totalSemesterCredits
    let requiredSgpaToMeetTarget = 0;
    if (totalSemesterCredits > 0) {
      requiredSgpaToMeetTarget =
        (targetCgpa * (earnedCredits + totalSemesterCredits) - currentCgpa * earnedCredits) /
        totalSemesterCredits;
    }

    // 5. Back-solving average required grade point for remaining courses
    // totalRequiredPoints = requiredSgpaToMeetTarget * totalSemesterCredits
    // pointsRemainingNeeded = totalRequiredPoints - fixedGradePoints
    // averageRequiredGradePoint = pointsRemainingNeeded / remainingCredits
    const totalRequiredPointsForSem = requiredSgpaToMeetTarget * totalSemesterCredits;
    const pointsRemainingNeeded = totalRequiredPointsForSem - fixedGradePoints;

    let averageRequiredGradePoint = 0;
    if (remainingCredits > 0) {
      averageRequiredGradePoint = pointsRemainingNeeded / remainingCredits;
    }

    // Cap and check achievability
    const maxGradePoint = Math.max(...gradeScale.map((g) => g.points));
    const isTargetAchievable = averageRequiredGradePoint <= maxGradePoint;

    let recommendedRemainingGrade = "F";
    
    // Sort scale descending by points to find first matching passing grade
    const passingScale = [...gradeScale]
      .filter((g) => g.isPass !== false)
      .sort((a, b) => b.points - a.points);

    if (averageRequiredGradePoint <= 0) {
      const easiestPassGrade = passingScale[passingScale.length - 1];
      recommendedRemainingGrade = easiestPassGrade ? easiestPassGrade.grade : "D";
    } else {
      // Find a grade that has points >= averageRequiredGradePoint
      const exactOrHigher = passingScale
        .slice()
        .reverse()
        .find((g) => g.points >= averageRequiredGradePoint);

      if (exactOrHigher) {
        recommendedRemainingGrade = exactOrHigher.grade;
      } else {
        // Fallback to highest available grade if required GP exceeds max pass point but might be rounded down,
        // or just mark as impossible
        recommendedRemainingGrade = passingScale[0] ? passingScale[0].grade : "O";
      }
    }

    // 7. Distribute target grades to remaining courses proportionally
    const courseTargetGrades: CourseTargetGrade[] = remainingCourses.map((c) => {
      // Proportional grade point assignment
      const requiredGradePoint = Math.max(0, averageRequiredGradePoint);
      let recommendedGrade = "F";
      
      const gradeMatch = passingScale
        .slice()
        .reverse()
        .find((g) => g.points >= requiredGradePoint);

      if (gradeMatch) {
        recommendedGrade = gradeMatch.grade;
      } else {
        recommendedGrade = passingScale[0] ? passingScale[0].grade : "O";
      }

      return {
        courseId: c.id,
        requiredGradePoint: parseFloat(requiredGradePoint.toFixed(2)),
        recommendedGrade,
        isAchievable: requiredGradePoint <= maxGradePoint,
      };
    });

    // 8. Traceability metadata
    const resolvedTrace = pluggableRegulationEngine.resolveProgressionTrace(presetId);
    const sourceClause = resolvedTrace.sourceClause;
    const sourceCircular = resolvedTrace.sourceCircular;
    const sourceRegulationId = resolvedTrace.sourceRegulationId;

    const solverWarnings: string[] = [];
    if (requiredSgpaToMeetTarget > 10.0) {
      solverWarnings.push(`Required SGPA is ${requiredSgpaToMeetTarget.toFixed(2)}, which exceeds the maximum possible SGPA of 10.0.`);
    } else if (requiredSgpaToMeetTarget > 9.5) {
      solverWarnings.push(`Required SGPA is extremely high (${requiredSgpaToMeetTarget.toFixed(2)}). Achieving this requires securing perfect grades (O/A+) in all courses.`);
    } else if (requiredSgpaToMeetTarget > 8.5) {
      solverWarnings.push(`Required SGPA is challenging (${requiredSgpaToMeetTarget.toFixed(2)}). Focus on maximizing internal CIE marks.`);
    }

    const trace: TraceMetadata = {
      formulaApplied: `RequiredSemSGPA = (TargetCGPA * (CompletedCredits + SemCredits) - CurrentCGPA * CompletedCredits) / SemCredits`,
      sourceRegulationId,
      sourceClause,
      sourceCircular,
      lastVerifiedAt: "2026-05-21T00:00:00Z",
      confidenceScore: 100,
      assumptions: [
        "Assumes standard university GPA calculation rules (weighted by credit hours)",
        "Assumes all remaining courses are graded on the standard numeric grade-point scale",
        "Assumes target CGPA is stable for the duration of the current academic year"
      ],
      warnings: solverWarnings.length > 0 ? solverWarnings : undefined,
    };

    return {
      currentDerivedCgpa: parseFloat(currentDerivedCgpa.toFixed(2)),
      currentDerivedSgpa: parseFloat(currentDerivedSgpa.toFixed(2)),
      requiredSgpaToMeetTarget: parseFloat(Math.max(0, requiredSgpaToMeetTarget).toFixed(2)),
      averageRequiredGradePoint: parseFloat(averageRequiredGradePoint.toFixed(2)),
      recommendedRemainingGrade,
      isTargetAchievable,
      remainingCredits,
      courseTargetGrades,
      trace,
    };
  },
};
