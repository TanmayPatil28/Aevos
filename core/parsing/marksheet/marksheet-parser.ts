/**
 * core/parsing/marksheet/marksheet-parser.ts
 *
 * Abstract marksheet parser.
 * Combines OCR and regex patterns to extract structured results from images/PDFs.
 */

import type { OCRProvider, ParsedStudentResult } from '../../types';
import { SubjectCodeParser } from '../syllabus/subject-code-parser';

export class MarksheetParser {
  private readonly ocr: OCRProvider;

  constructor(ocrProvider: OCRProvider) {
    this.ocr = ocrProvider;
  }

  /**
   * Orchestrates the parsing of a marksheet buffer.
   */
  async parse(buffer: ArrayBuffer, universityId: string): Promise<ParsedStudentResult> {
    if (!(await this.ocr.isAvailable())) {
      throw new Error(`OCR provider ${this.ocr.name} is unavailable.`);
    }

    const rawText = await this.ocr.extractText(buffer);

    // This is a stub implementation.
    // In reality, we'd use university-specific regex blocks to parse out
    // tables, student name, and PRN/Enrollment Number.

    const codes = SubjectCodeParser.extractCodes(rawText, universityId);

    // Mock returning extracted data
    return {
      studentName: 'Extracted Student Name', // Stub
      enrollmentNumber: 'Extracted PRN', // Stub
      subjects: codes.map((code) => ({
        code,
        name: 'Extracted Subject Name',
        credits: 3,
        grade: 'A',
        gradePoint: 8,
      })),
    };
  }
}
