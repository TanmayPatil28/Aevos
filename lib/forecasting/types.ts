export interface SemesterProjection {
  semester: number;          // future semester number
  projectedSgpa: number;
  projectedCgpa: number;
  cumulativeCredits: number;
  upper: number;             // CGPA + confidence band
  lower: number;             // CGPA - confidence band
}

export interface ForecastScenario {
  id: string;
  name: string;              // "Maintain Current", "Steady Improvement", "Decline Risk"
  description: string;
  assumedSgpa: number;       // the SGPA assumed per semester in this scenario
  projections: SemesterProjection[];
  finalCgpa: number;
  meetsTarget: boolean;
}

export interface ForecastEngineInput {
  currentCgpa: number;
  completedSemesters: number;
  earnedCredits: number;
  targetCgpa: number;
  totalProgramSemesters: number;    // e.g. 8
  creditsPerSemester: number;       // e.g. 20
  currentSgpa: number;              // latest semester SGPA
  volatility: number;               // from selectVolatility
}
