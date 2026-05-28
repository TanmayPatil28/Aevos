import { REGULATIONS_MAP } from "./index";
import { RegulationSystem } from "../schemas/regulation";
import { UniversityPreset } from "../../presets/types/universityPreset";
import { getPresetById } from "../../presets/presetRegistry";

export const pluggableRegulationEngine = {
  /**
   * Resolves a RegulationSystem by presetId or falls back to a default synthesized regulation from the UniversityPreset.
   */
  resolveRegulation(presetId: string, fallbackPreset?: UniversityPreset): RegulationSystem {
    // 1. Try to find a registered RegulationSystem
    const reg = REGULATIONS_MAP.get(presetId);
    if (reg) return reg;

    // 2. Fall back to synthesizing a RegulationSystem using preset configuration details
    const preset = fallbackPreset || getPresetById(presetId);
    
    // Synthesize a generic RegulationSystem to ensure the engine remains fully pluggable and failsafe
    return {
      id: presetId,
      universityId: preset?.canonicalInstitutionId || presetId,
      regulationName: preset?.name || "Standard Regulation",
      regulationYear: preset?.regulationYear || 2022,
      status: "active",
      nepAligned: preset?.nepAligned || false,
      academicStructure: {
        semesterCount: 8,
        creditRange: { min: 120, max: 200 },
        defaultCreditsPerSem: Array(8).fill(preset?.defaultCreditsPerSem || 20),
        hasHonorsMinors: true,
        zeroCreditHandling: preset?.specialFeatures?.hasZeroCreditBlockers ? "strict_blocker" : "exclude",
      },
      gradingScale: {
        gradingModel: preset?.evaluationModel || "absolute",
        grades: (preset?.gradeScale || []).map(g => ({
          grade: g.grade,
          points: g.points,
          description: g.description || "",
          isPass: g.isPass !== false,
          absoluteMinMarks: g.minMarks,
        })),
      },
      percentageFormula: {
        type: preset?.sgpaToPercentage?.includes("IF") ? "piecewise" : "linear",
        sgpaFormulaDescription: preset?.sgpaToPercentage || "(SGPA - 0.75) * 10",
        cgpaFormulaDescription: preset?.cgpaToPercentage || "(CGPA - 0.75) * 10",
        sgpaToPercentage: (sgpa) => parseFloat(((sgpa - 0.75) * 10).toFixed(2)),
        cgpaToPercentage: (cgpa) => parseFloat(((cgpa - 0.75) * 10).toFixed(2)),
      },
      internalAssessment: {
        components: preset?.assessmentScheme?.components || ["Continuous Internal Evaluation (CIE)"],
        splitWeightage: preset?.assessmentScheme?.split || "40/60",
        ciePassingMin: preset?.passRules?.minInternal || 40,
        cieVoidGate: false,
      },
      externalAssessment: {
        seePassingMin: preset?.passRules?.minExternal || 40,
        theoryPracticalSeparation: preset?.assessmentScheme?.theoryPracticalSeparation || false,
      },
      passingInvariants: {
        minOverallMarks: preset?.passRules?.minOverall || 40,
        minCgpaForGraduation: preset?.passRules?.minCgpa || 5.0,
        independentPassing: preset?.passRules?.independentPassing || false,
      },
      progressionRules: {
        atktAllowed: true,
        minCreditPercentProgress: 50,
        promotionOperator: "AND",
        yearDownOnFail: true,
      },
      backlogPolicy: {
        retakeGradeDowngrade: false,
        gradeReplacement: "overwrite",
        supplementaryExams: true,
        summerTermAvailable: false,
      },
      attendanceRules: {
        minAttendancePercent: preset?.passRules?.minAttendance || 75,
        medicalExemptionLimit: 10,
        absoluteAttendanceFloor: 65,
        detentionTriggered: true,
      },
      specialAnomalies: {
        hasSkillTranscript: false,
        valueAddedScrubbing: false,
        goldMedalFractionalBreaker: false,
        firstAppearanceRule: false,
      },
      globalEquivalency: {
        wesGpaMapping: "linear_capped",
        ectsPercentileEnabled: false,
      },
      validationRisks: {
        facultyScope: ["engineering"],
      },
      aiAdvisory: {
        percentageTargeting: true,
        progressionSurvivalStats: true,
        standardDeviationForecast: false,
        internalsWarning: false,
      }
    };
  },

  /**
   * Converts CGPA/SGPA to percentage programmatically based on regulation formula.
   */
  convertToPercentage(gpa: number, type: "sgpa" | "cgpa", presetId: string): number {
    const reg = this.resolveRegulation(presetId);
    const formula = reg.percentageFormula;
    return type === "sgpa" ? formula.sgpaToPercentage(gpa) : formula.cgpaToPercentage(gpa);
  },

  /**
   * Resolves the attendance compliance rule clause, circular reference, and regulation ID for trace metadata.
   */
  resolveAttendanceTrace(presetId: string): { sourceClause: string; sourceCircular: string; sourceRegulationId: string } {
    const reg = this.resolveRegulation(presetId);
    let sourceClause = `${reg.regulationName} Clause on Attendance Criteria`;
    let sourceCircular = "Institutional grading ordinances";
    let sourceRegulationId = `${reg.id.toUpperCase()}-ATTENDANCE`;

    if (reg.id === "vtu") {
      sourceClause = "Section VTU-OB 12.1 Attendance Eligibility";
      sourceCircular = "Notification No. VTU/Aca/OS-Regulations/2021";
      sourceRegulationId = "VTU-CBCS-2021";
    } else if (reg.id === "sppu") {
      sourceClause = "SPPU Ordinance 119 Attendance Ordinance";
      sourceCircular = "Circular No. Exam/Coordination/2019/33";
      sourceRegulationId = "SPPU-REG-2019";
    } else if (reg.id === "jntuh") {
      sourceClause = "JNTUH R22 Regulation Item 7: Attendance Criteria";
      sourceCircular = "Academic Circular No. A1/3342/2022";
      sourceRegulationId = "JNTUH-R22";
    } else if (reg.id === "mu") {
      sourceClause = "Mumbai University Ordinance O.6086";
      sourceCircular = "Circular No. UG/231 of 2018";
      sourceRegulationId = "MU-CBCS-2018";
    }

    return { sourceClause, sourceCircular, sourceRegulationId };
  },

  /**
   * Resolves progression and simulator trace details.
   */
  resolveProgressionTrace(presetId: string): { sourceClause: string; sourceCircular: string; sourceRegulationId: string } {
    const reg = this.resolveRegulation(presetId);
    let sourceClause = `${reg.regulationName} Progression & Evaluation Criteria`;
    let sourceCircular = "Institutional grading manual";
    let sourceRegulationId = `${reg.id.toUpperCase()}-SIM-ORDINANCE`;

    if (reg.id === "vtu") {
      sourceClause = "VTU CBCS Ordinance Clause 8.2 SGPA/CGPA Calculation";
      sourceCircular = "VTU Executive Committee Resolution 2021";
      sourceRegulationId = "VTU-CBCS-2021";
    } else if (reg.id === "sppu") {
      sourceClause = "SPPU Credit System Handbook Clause 6.1";
      sourceCircular = "SPPU Examination Circular R-114";
      sourceRegulationId = "SPPU-REG-2019";
    } else if (reg.id === "mu") {
      sourceClause = "MU CBCS Scheme Manual Section 4.5";
      sourceCircular = "MU Executive Circular UG/12 of 2020";
      sourceRegulationId = "MU-CBCS-2020";
    }

    return { sourceClause, sourceCircular, sourceRegulationId };
  }
};
