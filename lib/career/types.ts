export type CareerRole = "SDE" | "DATA_SCIENTIST" | "DEVOPS";

export interface SkillRecommendation {
  name: string;
  category: "Languages" | "Frameworks" | "Core CS" | "Tools & Platforms";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  importance: "CRITICAL" | "RECOMMENDED" | "OPTIONAL";
  description: string;
}

export interface CareerPathDetails {
  role: CareerRole;
  title: string;
  description: string;
  coreSkills: SkillRecommendation[];
  suggestedElectives: string[];
  cgpaTargetRecommendation: number;
}
