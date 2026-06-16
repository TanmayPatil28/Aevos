import { AcademicProfile } from "@/types/academicProfile";

export type PipelineState = 
  | "idle"
  | "detecting"
  | "parsing"
  | "normalizing"
  | "diffing"
  | "verifying"
  | "persisting"
  | "completed"
  | "failed";

export type WarningSeverity = "info" | "warning" | "error" | "critical";

export interface ValidationWarning {
  type: "format_mismatch" | "missing_field" | "conflict" | "low_confidence";
  severity: WarningSeverity;
  message: string;
  affectedEntity?: string; // e.g., "Semester 3", "CS-201"
}

// The raw format returned by a specific institution's parser before canonical normalization
export interface IntermediateExtractionModel {
  institutionId: string;
  studentName?: string;
  registrationId?: string;
  programme?: string;
  regulation?: string;
  branch?: string;
  batchYear?: number;
  semesters: Array<{
    semesterIndex: number;
    isBacklogClearance?: boolean;
    sgpa?: number;
    credits?: number;
    earnedCredits?: number;
    courses: Array<{
      code: string;
      name: string;
      credits: number;
      grade?: string;
      internalMarks?: number;
      externalMarks?: number;
    }>;
  }>;
  timetable?: AcademicProfile["timetable"];
  academicCalendar?: AcademicProfile["academicCalendar"];
  backlogs?: AcademicProfile["backlogs"];
}

export interface ParserResult {
  detectedInstitution: string;
  parserVersion: string;
  confidenceScore: number; // 0-100
  validationWarnings: ValidationWarning[];
  extractedData: IntermediateExtractionModel;
}

export interface AcademicParser {
  parserId: string;
  version: string;
  canParse: (rawInput: string) => boolean;
  parse: (rawInput: string) => ParserResult;
}

export interface ImportDiff {
  isDuplicate: boolean;
  hasConflicts: boolean;
  newSemestersAdded: number[];
  coursesUpdated: string[]; // Course codes
  backlogsResolved: string[]; // Course codes
  sgpaChanges: Array<{ semester: number; oldSgpa: number; newSgpa: number }>;
  warnings: ValidationWarning[];
  profileUpdated?: boolean;
}

export interface NormalizedImportPayload {
  profile: AcademicProfile;
  confidenceScore: number;
  parserVersion: string;
  detectedInstitution: string;
}

export interface ImportCourseData {
  code: string;
  name: string;
  credits: number;
  grade?: string;
  cieMarks?: number;
  attendanceTotal?: number;
  attendanceBunked?: number;
}

export interface ImportSemesterData {
  semester: number;
  sgpa: number;
  credits: number;
  earnedCredits: number;
  courses?: ImportCourseData[];
}

export interface AcademicImportPayload {
  presetId: string;
  currentCgpa: number;
  targetCgpa: number;
  activeBacklogsCount: number;
  semesterHistory: ImportSemesterData[];
  currentSemesterCourses?: ImportCourseData[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedData?: AcademicImportPayload;
}
