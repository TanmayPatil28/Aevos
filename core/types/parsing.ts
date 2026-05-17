/**
 * core/types/parsing.ts
 *
 * Academic document parsing infrastructure types.
 *
 * Universities publish regulations, syllabi, marksheets, and curriculum
 * matrices as PDFs. The parsing layer extracts structured data from
 * these documents using configurable regex/pattern engines.
 *
 * Design:
 * - NO university-specific parsers — all patterns are config-driven
 * - OCR provider is swappable (Tesseract, Google Vision, AWS Textract)
 * - Parser adapters compose into pipelines
 */

// ─── Parser Types ───────────────────────────────────────────────────────────

export type DocumentType =
  | 'marksheet'
  | 'syllabus'
  | 'regulation'
  | 'curriculum-matrix'
  | 'assessment-table';

export interface ParsedDocument {
  /** Type of document parsed */
  readonly documentType: DocumentType;
  /** Source file name */
  readonly sourceFile: string;
  /** Extracted raw text */
  readonly rawText: string;
  /** Structured extraction result */
  readonly extracted: ParsedAcademicData;
  /** Confidence score of the extraction (0.0 - 1.0) */
  readonly confidence: number;
  /** Timestamp of parsing */
  readonly parsedAt: Date;
}

// ─── Extracted Data Structures ──────────────────────────────────────────────

export interface ParsedAcademicData {
  /** Extracted subjects with codes and credits */
  readonly subjects?: readonly ParsedSubject[];
  /** Extracted semester structure */
  readonly semesters?: readonly ParsedSemester[];
  /** Extracted assessment patterns */
  readonly assessments?: readonly ParsedAssessment[];
  /** Extracted student result data (from marksheets) */
  readonly results?: ParsedStudentResult;
}

export interface ParsedSubject {
  /** Subject code (e.g., BCE23PC01, CS301) */
  readonly code: string;
  /** Subject name */
  readonly name: string;
  /** Credits */
  readonly credits: number;
  /** L/T/P distribution */
  readonly contactHours?: string;
  /** Subject type inferred from code pattern */
  readonly inferredType?: string;
  /** Semester number (if extracted) */
  readonly semester?: number;
}

export interface ParsedSemester {
  readonly semesterNumber: number;
  readonly subjects: readonly ParsedSubject[];
  readonly totalCredits: number;
}

export interface ParsedAssessment {
  readonly subjectCode: string;
  readonly components: readonly {
    readonly type: string;
    readonly maxMarks: number;
  }[];
}

export interface ParsedStudentResult {
  readonly studentName?: string;
  readonly enrollmentNumber?: string;
  readonly semester?: number;
  readonly subjects: readonly {
    readonly code: string;
    readonly name: string;
    readonly credits: number;
    readonly grade: string;
    readonly gradePoint: number;
    readonly marks?: number;
  }[];
  readonly sgpa?: number;
  readonly cgpa?: number;
}

// ─── Subject Code Pattern ───────────────────────────────────────────────────

/**
 * Configurable regex pattern for parsing subject codes.
 * Each university has different code conventions:
 * - SPPU: BCE23PC01 (Branch + Year + Type + Sequence)
 * - VTU: 22CS35 (Year + Branch + Semester + Sequence)
 * - Anna: CS3301 (Branch + Semester + Sequence)
 */
export interface SubjectCodePattern {
  /** University/regulation this pattern applies to */
  readonly applicableTo: string;
  /** Regex pattern for subject code extraction */
  readonly regex: RegExp;
  /** Named group mapping */
  readonly groups: {
    readonly branch?: string;
    readonly year?: string;
    readonly semester?: string;
    readonly type?: string;
    readonly sequence?: string;
  };
}

// ─── OCR Provider Interface ─────────────────────────────────────────────────

export interface OCRProvider {
  /** Provider name */
  readonly name: string;
  /** Extract text from an image/PDF buffer */
  extractText(buffer: ArrayBuffer): Promise<string>;
  /** Whether this provider is currently available */
  isAvailable(): Promise<boolean>;
}

// ─── Parser Pipeline ────────────────────────────────────────────────────────

export interface ParserPipelineConfig {
  /** OCR provider to use for image-based documents */
  readonly ocrProvider?: string;
  /** Subject code patterns to apply */
  readonly codePatterns: readonly SubjectCodePattern[];
  /** Credit parsing regex (e.g., for "3-1-0" L/T/P) */
  readonly creditRegex?: RegExp;
  /** Whether to attempt table extraction */
  readonly extractTables: boolean;
}
