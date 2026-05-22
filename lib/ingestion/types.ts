export interface ImportSemesterData {
  semester: number;
  sgpa: number;
  credits: number;
  earnedCredits: number;
  courses?: Array<{
    code: string;
    name: string;
    credits: number;
    grade: string;
  }>;
}

export interface AcademicImportPayload {
  presetId: string;
  currentCgpa: number;
  targetCgpa: number;
  activeBacklogsCount: number;
  semesterHistory: ImportSemesterData[];
  currentSemesterCourses?: Array<{
    code: string;
    name: string;
    credits: number;
    grade?: string;
    cieMarks?: number;
    attendanceTotal?: number;
    attendanceBunked?: number;
  }>;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedData?: AcademicImportPayload;
}
