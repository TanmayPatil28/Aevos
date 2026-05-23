export interface DocumentMetadata {
  fileName?: string;
  mimeType?: string;
  uploadedAt?: number;
  presetId?: string;
}

export interface ExtractedField<T> {
  value: T;
  confidence: number; // 0 - 100
}

export interface ParsedCourse {
  code: ExtractedField<string>;
  name: ExtractedField<string>;
  credits: ExtractedField<number>;
  grade: ExtractedField<string>;
}

export interface ParsedSemester {
  semester: ExtractedField<number>;
  sgpa: ExtractedField<number>;
  credits: ExtractedField<number>;
  earnedCredits: ExtractedField<number>;
  courses?: ParsedCourse[];
}

export interface ParsedCurrentCourse {
  code: ExtractedField<string>;
  name: ExtractedField<string>;
  credits: ExtractedField<number>;
  grade?: ExtractedField<string>;
  cieMarks?: ExtractedField<number>;
  attendanceTotal?: ExtractedField<number>;
  attendanceBunked?: ExtractedField<number>;
}

export interface ParsedAcademicDocument {
  presetId: ExtractedField<string>;
  currentCgpa: ExtractedField<number>;
  targetCgpa: ExtractedField<number>;
  activeBacklogsCount: ExtractedField<number>;
  semesterHistory: ParsedSemester[];
  currentSemesterCourses?: ParsedCurrentCourse[];
}

export interface AcademicDocumentParser {
  supports(presetId: string): boolean;
  parse(rawText: string, metadata?: DocumentMetadata): ParsedAcademicDocument;
}
