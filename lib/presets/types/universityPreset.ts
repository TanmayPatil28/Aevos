/**
 * GradeFlow Academic Rule Abstraction Layer — Type Definitions
 * 
 * These types define the structure of UniversityPreset objects — the foundational
 * academic intelligence units that drive ALL computation, validation, and UI behavior
 * across GradeFlow. Feature modules consume these as read-only rule descriptors.
 * 
 * Design Principles:
 * - Presets are structured academic intelligence objects, NOT static display data
 * - Every field exists to drive computation or adaptive UI behavior
 * - Architecture supports future expansion: AI advisors, predictive analytics, 
 *   NEP pathway tracking, multi-country support
 */

// ─── Grade Scale ───────────────────────────────────────────────────────────────

export interface GradeScaleEntry {
  grade: string;          // "O", "A+", "AA", "AB", "S", "A-", etc.
  minMarks?: number;      // Lower bound percentage (omitted for relative grading)
  points: number;         // Grade point value (e.g., 10, 9, 8... or 4.0, 3.0 for 4-point scale)
  description?: string;   // "Outstanding", "Excellent", etc.
  isPass?: boolean;       // Defaults to true; explicit false for F/FF/NC
}

// ─── Pass Rules ────────────────────────────────────────────────────────────────

export interface PassRules {
  minInternal?: number;       // Minimum internal assessment percentage (e.g., 40)
  minExternal?: number;       // Minimum external exam percentage (e.g., 40)
  minOverall?: number;        // Minimum overall percentage to pass a course
  minCgpa?: number;           // Minimum CGPA for graduation/progression (e.g., 5.0)
  minSgpa?: number;           // Minimum SGPA per semester
  minGradePoint?: number;     // Minimum grade point to pass a course
  independentPassing?: boolean; // Whether IA and SEE must be passed independently
  minAttendance?: number;     // Minimum attendance percentage (e.g., 75)
}

// ─── Backlog Policy ────────────────────────────────────────────────────────────

export interface BacklogPolicy {
  description: string;           // Human-readable summary of backlog rules
  maxBacklogs?: number;          // Maximum allowed backlogs for year progression
  retakePenalty?: string;        // Grade penalty description on retake (e.g., "Capped at C")
  replacementPolicy?: string;    // How retake grades replace old grades
  supplementaryExams?: boolean;  // Whether supplementary/summer exams are available
}

// ─── Assessment Scheme ─────────────────────────────────────────────────────────

export interface AssessmentScheme {
  components: string[];    // ["ISE", "MSE", "ESE"] or ["CAT-1", "CAT-2", "TEE"]
  split: string;           // "30/70 internal/external" or "50/50"
  theoryPracticalSeparation?: boolean;
}

// ─── Degree Classification ─────────────────────────────────────────────────────

export interface DegreeClassification {
  label: string;       // "First Class with Distinction", "First Class", etc.
  minCGPA: number;     // Minimum CGPA threshold for this classification
}

// ─── Relative Grading Configuration ────────────────────────────────────────────
// Architecturally preserved for future statistical grading implementation.
// Phase 1: metadata only. Phase 2+: computation support.

export interface RelativeGradingConfig {
  model: string;                    // "statistical_relative_hybrid" | "conditional_relative" | "histogram_clustering" | "banded_relative" | "relative_with_absolute_caps"
  curveDescription: string;         // Human-readable description of the curve logic
  usesStandardDeviation?: boolean;  // Whether σ-based grade bands are used
  usesMean?: boolean;               // Whether μ-based calculations are used
  usesMedian?: boolean;             // Whether median-based LB logic is used  
  hasAbsoluteFloor?: boolean;       // Whether absolute lower bounds protect against curve collapse
  absoluteFloorValue?: number;      // The hard minimum passing marks (e.g., 30, 37)
  minClassStrength?: number;        // Minimum cohort size for relative grading activation (e.g., 10)
  bandCount?: number;               // Number of grade bands (e.g., 6 for NSUT)
}

// ─── Institution Type ──────────────────────────────────────────────────────────

export type InstitutionType =
  | "State Public University"
  | "Autonomous Affiliated"
  | "Deemed to be University"
  | "Private University"
  | "Unitary Public University"
  | "Institute of National Importance"
  | "Custom";

// ─── Trust Configuration ───────────────────────────────────────────────────────

export interface TrustConfig {
  verificationLevel: "official" | "community" | "experimental";
  confidenceScore: number;         // E.g., 98 for official, 70 for experimental
  lastVerifiedAt: string;          // ISO Date, e.g., "2026-05-21"
  verifiedSources: string[];       // ["Ordinance 15(4)", "UG Circular 43/2019"]
  regulationBasis?: string;        // E.g., "Choice Based Credit System Curriculum"
  circularRef?: string;            // E.g., "No. Exam/CoE/2019/84"
  academicReasoning?: string;      // "Why is this percentage formula offset by 0.75?"
}

// ─── Core Preset Interface ─────────────────────────────────────────────────────

export interface UniversityPreset {
  // Identity
  id: string;
  name: string;
  shortName: string;
  state: string;
  type: InstitutionType;

  // Academic System
  gradingSystem: string;     // "10-point CBCS", "Double-Letter 10-point", "4-point", etc.
  evaluationModel: "absolute" | "relative" | "hybrid";
  gradeScale: GradeScaleEntry[];

  // Trust Layer
  trust: TrustConfig;

  // Credit System
  creditType?: "credits" | "units";   // BITS uses "units"; everything else uses "credits"
  totalProgramCredits?: number;
  defaultCreditsPerSem?: number;

  // Computation Rules (formula strings evaluated by presetEngine)
  sgpaFormula?: string;          // "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)"
  cgpaFormula?: string;
  sgpaToPercentage?: string;     // "(SGPA - 0.75) * 10" or "IF(SGPA < 7, 7.1*SGPA + 12, ...)"
  cgpaToPercentage?: string;

  // Academic Rules
  passRules?: PassRules;
  backlogPolicy?: BacklogPolicy;
  assessmentScheme?: AssessmentScheme;
  degreeClassification?: DegreeClassification[];

  // Relative Grading (architecture preserved for future computation)
  relativeGrading?: RelativeGradingConfig;

  // Future Expansion & Versioning Strategy
  canonicalInstitutionId?: string;     // E.g., "sppu" to link SPPU 2019 & SPPU 2024
  version?: string;                    // Preset schema version, e.g., "1.0.0"
  regulationYear?: number;             // E.g., 2019, 2024
  status?: "active" | "deprecated" | "experimental";
  country?: string;                    // ISO country code, e.g., "IN", "US"
  nepAligned?: boolean;                // National Education Policy alignment
  supersededByPresetId?: string;        // E.g., "sppu_2024" replaces "sppu"

  // Metadata
  metadata?: {
    patternYear?: string;
    erpSystem?: string;
    affiliatedAuthority?: string;
  };

  // Feature Flags
  specialFeatures?: {
    isVerified?: boolean;
    hasLetterGrades?: boolean;
    hasRelativeCurve?: boolean;
    hasZeroCreditBlockers?: boolean;
    hasDoubleLetter?: boolean;
    hasMinusGrades?: boolean;
    defaultCreditsPerSem?: number[];
  };
}

// ─── Derived Types ─────────────────────────────────────────────────────────────

export type GradingScale = "10" | "4" | "percent";

/**
 * Derives the scaleMode (GradingScale) from a UniversityPreset.
 * Used for backward compatibility with UI hooks that branched on scale type.
 */
export function getScaleMode(preset: UniversityPreset): GradingScale {
  const sys = preset.gradingSystem.toLowerCase();
  if (sys.includes("10-point") || sys.includes("double-letter") || sys.includes("alphanumeric") || sys.includes("relative")) {
    return "10";
  }
  if (sys.includes("4-point") || sys.includes("4.0")) {
    return "4";
  }
  if (sys.includes("percentage") || sys.includes("percent")) {
    return "percent";
  }
  return "10";
}
