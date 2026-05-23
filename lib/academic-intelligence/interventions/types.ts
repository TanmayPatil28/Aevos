import { ExplanationTree } from "../types";

export type InterventionType = "RISK" | "OPPORTUNITY" | "STRATEGY_ALERT" | "MILESTONE";
export type WorkspaceContextType = "RECOVERY" | "OPTIMIZATION" | "ACTIVE_SEMESTER" | "GRADUATION_READY" | "DEFAULT";
export type InterventionStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
export type PriorityTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface AcademicIntervention {
  id: string;
  type: InterventionType;
  priorityTier: PriorityTier;
  status: InterventionStatus;
  title: string;
  description: string;
  urgencyScore: number; // 0-100
  impactScore: number; // 0-100
  actionTrigger?: string; // Route or action identifier
  explanation: ExplanationTree;
  createdAt: number;
}

export interface AcademicHealthScore {
  overall: number; // 0-100
  risk: number; // 0-100 (higher means more risk)
  momentum: number; // 0-100
  stability: number; // 0-100
  recovery: number; // 0-100
}
