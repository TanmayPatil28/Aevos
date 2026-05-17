export type UniversityType =
  | 'Public'
  | 'Private'
  | 'Autonomous'
  | 'Affiliated'
  | 'Deemed'
  | 'Institute of National Importance';
export type SubjectType = 'theory' | 'practical' | 'project' | 'elective' | 'audit' | 'non-credit';
export type GradingSystemType = 'absolute' | 'relative' | 'hybrid' | 'statistical' | 'z-score';
export type AssessmentType =
  | 'ISE'
  | 'ESE'
  | 'MSE'
  | 'TW'
  | 'PR'
  | 'OR'
  | 'FA1'
  | 'FA2'
  | 'IA'
  | 'UE'
  | 'CA'
  | 'CWS';

export interface GradeRule {
  grade: string;
  points: number;
  minMarks?: number;
  minPercentage?: number;
  maxMarks?: number;
  description?: string;
  isPass?: boolean;
}

export interface PassCriteria {
  minGradePoint?: number;
  minSgpa?: number;
  minCgpaForGraduation?: number;
  minCreditsPercentageForPromotion?: number;
  atktCondition?: string;
  maxBacklogsAllowed?: number;
  maxLowGradesPerSem?: { grade: string; count: number };
  absoluteLowerCutoffPercentage?: number;
}

export interface AssessmentPreset {
  type: AssessmentType;
  maxMarks: number;
  minPassingMarks?: number;
  weightage?: number;
}

export interface SubjectPreset {
  subjectCode: string;
  subjectName: string;
  credits: number;
  type: SubjectType;
  semester: number;
  assessments?: AssessmentPreset[];
  isAuditCourse?: boolean;
  isMandatoryNonCredit?: boolean;
  isTransferable?: boolean;
  transferableSource?: 'NPTEL' | 'SWAYAM' | 'MOOC' | 'Exchange';
  description?: string;
}

export interface BranchPreset {
  id: string;
  name: string;
  subjects: SubjectPreset[];
}

export interface ERPMetadata {
  provider: string; // e.g., "Digicampus", "Moodle", "ERPNext"
  supportsAttendance?: boolean;
  supportsResults?: boolean;
  supportsInternals?: boolean;
  supportsExamSchedules?: boolean;
  supportsProfileSync?: boolean;
  portalUrl?: string;
}

export interface CreditTransferRule {
  provider: string;
  durationWeeks: number;
  awardedCredits: number;
}

export interface GradeReplacementPolicy {
  replaceOnPass: boolean;
  preserveHistory: boolean;
  affectsCgpaRetroactively: boolean;
}

export interface GraduationRule {
  type: 'min_cgpa' | 'max_backlogs' | 'max_semesters' | 'max_low_grades' | 'total_credits';
  value: number;
}

export interface GradingSystem {
  type: GradingSystemType;
  scale: GradeRule[];
  sgpaFormula: string; // "SUM(C * G) / SUM(C)"
  cgpaFormula?: string;
  creditType: 'credits' | 'units';
  percentageConversion?: {
    sgpa?: string;
    cgpa?: string;
  };
  passCriteria?: PassCriteria;
  isRelativeGrading?: boolean;
  supportsStatisticalCurves?: boolean;
  supportsGradeReplacement?: boolean;
  curveLogic?: string;
  creditsExclusions?: string[]; // e.g., ["Open Elective", "Human Values"]
}

export interface UniversityCapabilities {
  supportsRelativeGrading: boolean;
  supportsCreditTransfer: boolean;
  supportsGradeReplacement: boolean;
  supportsAuditCourses: boolean;
  supportsUnitSystem: boolean;
  supportsDynamicPassCriteria: boolean;
}

export interface AcademicMetadata {
  supportsOCRImport?: boolean;
  supportsERPImport?: boolean;
  gradingComplexity: 'simple' | 'moderate' | 'advanced' | 'statistical';
}

export interface UniversityPreset {
  id: string;
  university: string;
  shortName: string;
  state: string;
  type: UniversityType;
  pattern: string;
  gradingSystem: GradingSystem;
  semesters: number;
  branches: BranchPreset[];
  regulations?: Regulation[];
  graduationRules?: GraduationRule[];
  replacementPolicy?: GradeReplacementPolicy;
  creditTransferRules?: CreditTransferRule[];
  erp?: ERPMetadata;
  capabilities: UniversityCapabilities;
  metadata: AcademicMetadata;
  lastUpdated: string;
}

export interface Regulation {
  name: string;
  year: number;
  description?: string;
  totalCreditsRequired: number;
}

export interface PresetIdentifier {
  state?: string;
  universityId: string;
  pattern: string;
  branchId: string;
  semester?: number;
}
