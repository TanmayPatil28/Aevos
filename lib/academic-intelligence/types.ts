import { AcademicProfile, TrustMetadata } from "@/types/academicProfile";

export interface ExplanationTree {
  assumptions: string[];
  calculations: Array<{ step: string; formula: string; result: string }>;
  dependencies: string[]; // e.g., ["Semester 3 SGPA", "DS-201 Grade"]
  constraints: string[]; // Institutional constraints considered
  confidence: "HIGH" | "MEDIUM" | "LOW";
  projectedImpact: string;
}

export interface EngineTrace {
  engineId: string;
  engineVersion: string;
  inputs: Record<string, any>;
  assumptions: string[];
  executionTimestamp: number;
}

export interface IntelligenceResult<T> {
  outcome: T;
  explanation: ExplanationTree;
  trace: EngineTrace;
  dataQualityContext?: string;
}

export interface IntelligenceContext {
  authoritativeProfile: AcademicProfile;
  trustMetadata?: TrustMetadata; // From academic identity
}

// Scenarios represent hypothetical states to apply against the sandbox
export interface SimulationScenario {
  id: string;
  name: string;
  overrides: {
    courses: Record<string, { grade?: string; cieMarks?: number; seeMarks?: number }>;
    semesters: Record<number, { sgpa?: number }>;
  };
}
