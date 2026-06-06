export interface StudentState {
  currentCgpa: number;
  completedSemesters: number;
  skillPoints: number;
  careerReadiness: number; // 0 to 100
  stressLevel: number; // 0 to 100
  logs: string[]; // Narrative logs of the journey
}

export interface DecisionImpact {
  gpaDelta: number;
  skillDelta: number;
  careerDelta: number;
  stressDelta: number;
  narrative: string;
}

export interface DecisionNode {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'career' | 'life';
  isPremium?: boolean; // NEW: Marks a node as a Pro feature
  impact: DecisionImpact;
  nextOptions: string[]; // IDs of the next decisions available
}

export interface DecisionPath {
  nodeId: string;
  stateAfterDecision: StudentState;
}
