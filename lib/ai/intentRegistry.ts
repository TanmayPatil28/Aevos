export type IntentCategory = 
  | "attendance_analysis"
  | "placement_analysis"
  | "academic_risk"
  | "cgpa_calculation"
  | "roadmap_generator"
  | "timeline"
  | "unknown";

export interface IntentMatch {
  intent: IntentCategory;
  confidence: number;
  route: string | null;
  message?: string;
}

export const INTENT_REGISTRY: Record<IntentCategory, { route: string | null, message?: string }> = {
  attendance_analysis: { route: "/attendance", message: "Opening Bunk Calculator & Attendance Simulator..." },
  placement_analysis: { route: "/placement", message: "Loading Career Hub & Placement Radar..." },
  academic_risk: { route: "/dashboard", message: "Analyzing Academic Risks..." },
  cgpa_calculation: { route: "/calculator", message: "Launching Grade Calculator..." },
  roadmap_generator: { route: "/multi-semester", message: "Generating Academic Roadmap..." },
  timeline: { route: "/timeline", message: "Navigating to Timeline..." },
  unknown: { route: null, message: "I'm not sure how to help with that yet." }
};
