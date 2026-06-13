export interface JSPMInstitutionConfig {
  id: "jspm_university_wagholi" | "rscoe_autonomous_tathawade" | "sppu_affiliated" | "unknown";
  name: string;
  gradingSystem: "10_point_scale";
  percentageConversion: {
    type: "linear_subtraction" | "multiplier";
    formula: string;
    // Helper to evaluate percentage mathematically
    calculate: (cgpa: number) => number;
  };
  atktRules: {
    progressionThresholdPercentage: number;
  };
}

export const JSPM_CONFIGS: Record<JSPMInstitutionConfig["id"], JSPMInstitutionConfig> = {
  jspm_university_wagholi: {
    id: "jspm_university_wagholi",
    name: "JSPM University (Wagholi)",
    gradingSystem: "10_point_scale",
    percentageConversion: {
      type: "linear_subtraction",
      formula: "(cgpa - 0.5) * 10",
      calculate: (cgpa: number) => Math.max(0, (cgpa - 0.5) * 10),
    },
    atktRules: {
      progressionThresholdPercentage: 50,
    },
  },
  rscoe_autonomous_tathawade: {
    id: "rscoe_autonomous_tathawade",
    name: "JSPM's RSCOE (Tathawade)",
    gradingSystem: "10_point_scale",
    percentageConversion: {
      type: "multiplier",
      formula: "cgpa * 8.9",
      calculate: (cgpa: number) => cgpa * 8.9,
    },
    atktRules: {
      progressionThresholdPercentage: 50,
    },
  },
  sppu_affiliated: {
    id: "sppu_affiliated",
    name: "SPPU Affiliated College",
    gradingSystem: "10_point_scale",
    percentageConversion: {
      type: "multiplier",
      formula: "cgpa * 8.9",
      calculate: (cgpa: number) => cgpa * 8.9,
    },
    atktRules: {
      progressionThresholdPercentage: 50,
    },
  },
  unknown: {
    id: "unknown",
    name: "Unknown / Default",
    gradingSystem: "10_point_scale",
    percentageConversion: {
      type: "multiplier",
      formula: "cgpa * 10",
      calculate: (cgpa: number) => cgpa * 10,
    },
    atktRules: {
      progressionThresholdPercentage: 50,
    },
  }
};
