export type StrategyMode = 'SAFE' | 'BALANCED' | 'AGGRESSIVE';

export interface CourseGradeTarget {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  currentGrade?: string;        // existing grade if any
  targetGrade: string;           // recommended grade
  targetGradePoint: number;
  isFixed: boolean;              // true if grade already exists (not adjustable)
  difficultyWeight: number;      // 0-1 based on CIE/attendance signals
}

export interface StrategyResult {
  mode: StrategyMode;
  label: string;                 // "Safe Path", "Balanced Path", "Push Path"
  description: string;
  projectedSgpa: number;
  projectedCgpa: number;
  isAchievable: boolean;
  courseTargets: CourseGradeTarget[];
  healthScoreDelta: number;      // predicted health score change
  feasibilityScore: number;      // 0-100
}

export interface StrategyEngineInput {
  currentCgpa: number;
  earnedCredits: number;
  targetCgpa: number;
  presetId: string;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    credits: number;
    grade?: string;
    cieMarks: number;
    attendanceTotal: number;
    attendanceBunked: number;
  }>;
}
