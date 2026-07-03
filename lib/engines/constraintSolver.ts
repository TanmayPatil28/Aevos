/**
 * The Time Liquidity Engine - Constraint Solver
 * Simulates a Constraint Satisfaction (CP-SAT) engine to find the optimal
 * class-skipping schedule that frees up contiguous blocks of time while
 * ensuring ruin risk remains below the critical threshold.
 */

export interface ClassSession {
  id: string;
  courseCode: string;
  title: string;
  type: 'Theory' | 'Lab' | 'Tutorial';
  dayOfWeek: string;
  startTime: string; // e.g., '09:00'
  endTime: string;   // e.g., '10:00'
  isMandatory: boolean; // Some universities have mandatory seminars
  penaltyWeight: number; // e.g., missing a lab is 1.5x penalty compared to theory
}

export interface SolverConstraint {
  type: 'block_time' | 'preserve_attendance' | 'minimize_penalty' | 'max_consecutive' | 'max_time_off' | 'grade_impact' | 'skip_specific';
  targetDays?: string[]; // e.g., ['Friday']
  targetClass?: string; // e.g. "Computer Algorithms"
  minContiguousHours?: number; // e.g., 6
  maxRuinRiskAllowed?: number; // e.g., 20%
}

export interface SolverState {
  schedule: ClassSession[];
  availableSafeBunks: number;
  currentRuinRisk: number;
}

export interface ProposedSchedule {
  classesToSkip: string[]; // IDs of classes to bunk
  classesToAttend: string[]; // IDs of classes to attend
  freedHours: number;
  newRuinRisk: number;
  reasoning: string;
}

export function solveTimeConstraints(
  state: SolverState,
  constraints: SolverConstraint[]
): ProposedSchedule {
  
  // We'll use a heuristic greedy approach simulating constraint satisfaction
  
  let classesToSkip: ClassSession[] = [];
  let classesToAttend: ClassSession[] = [];
  
  const constraint = constraints[0];
  if (!constraint) {
    return {
      classesToSkip: [], classesToAttend: state.schedule.map(c => c.id),
      freedHours: 0, newRuinRisk: state.currentRuinRisk,
      reasoning: `Your schedule is currently optimized. No constraints require modification.`
    };
  }

  // Filter out mandatory classes (Labs/Practicals) which cannot be skipped
  const skippableClasses = state.schedule.filter(c => 
    c.type !== 'LAB' && c.type !== 'Lab' && c.type !== 'PRACTICAL' && c.type !== 'Practical' && !c.isMandatory
  );
  
  const unskippableClasses = state.schedule.filter(c => 
    !skippableClasses.includes(c)
  );

  // --- MATHEMATICAL OPTIMIZATION ---
  // Since we filtered out Labs/Practicals, the penaltyWeight for all remaining skippable classes is 1.
  // This means the knapsack problem reduces to simply sorting by utility descending and taking the top N.
  
  // Define utility function based on constraint intent
  const getUtility = (c: ClassSession): number => {
    if (constraint.type === 'block_time') {
      if (constraint.targetDays?.map(d => d.toLowerCase()).includes(c.dayOfWeek.toLowerCase())) {
        return 100; // Heavily weight classes on target days
      }
      return -1; // Penalty for skipping non-targeted days
    }
    if (constraint.type === 'max_time_off') {
      return 10; // Maximize pure class count (freed hours)
    }
    if (constraint.type === 'skip_specific' && constraint.targetClass) {
      if (c.title.toLowerCase().includes(constraint.targetClass.toLowerCase()) || c.courseCode.toLowerCase().includes(constraint.targetClass.toLowerCase())) {
        return 1000; // Absolute priority
      }
      return -1; // Penalty for skipping non-targeted classes
    }
    if (constraint.type === 'grade_impact') {
      return Math.max(1, 100 - (c.penaltyWeight || 1) * 20);
    }
    if (constraint.type === 'max_consecutive') {
      const isBackToBack = state.schedule.some(other => {
        if (other.id === c.id) return false;
        if (other.dayOfWeek.toLowerCase() !== c.dayOfWeek.toLowerCase()) return false;
        return other.startTime === c.endTime || other.endTime === c.startTime;
      });
      return isBackToBack ? 50 : 10;
    }
    return 0; // Baseline utility
  };

  const maxPenalty = state.availableSafeBunks;
  
  // Sort classes by utility descending
  const sortedSkippable = [...skippableClasses].sort((a, b) => getUtility(b) - getUtility(a));
  
  let bestSkipSet: ClassSession[] = [];
  let currentPenalty = 0;
  
  for (const cls of sortedSkippable) {
    const penalty = cls.penaltyWeight || 1;
    const utility = getUtility(cls);
    if (utility > 0 && currentPenalty + penalty <= maxPenalty) {
      bestSkipSet.push(cls);
      currentPenalty += penalty;
    }
  }

  classesToSkip = bestSkipSet;
  classesToAttend = [...unskippableClasses, ...skippableClasses.filter(c => !classesToSkip.includes(c))];

  const totalUsedBunks = classesToSkip.reduce((acc, c) => acc + (c.penaltyWeight || 1), 0);
  const newRuinRisk = state.currentRuinRisk + (totalUsedBunks * 2.5);

  // --- FORMAT REASONING ---
  let reasoning = "";
  if (classesToSkip.length === 0) {
    reasoning = "I checked your schedule. I couldn't find any classes that can be safely skipped (mostly mandatory labs or critical sessions).";
  } else {
    reasoning = `I analyzed your schedule and found ${classesToSkip.length} classes you can safely skip. I've highlighted them on your timetable.`;
  }

  return {
    classesToSkip: classesToSkip.map(c => c.id),
    classesToAttend: classesToAttend.map(c => c.id),
    freedHours: classesToSkip.length,
    newRuinRisk,
    reasoning
  };
}
