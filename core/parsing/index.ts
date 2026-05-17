/**
 * core/parsing/index.ts — Barrel export for parsing module
 */
export { DefaultPDFParserAdapter } from './pdf/pdf-parser';
export type { PDFMetadata, PDFExtractionResult, PDFParserAdapter } from './pdf/pdf-parser';

export { OCRManager, MockOCRProvider } from './ocr/ocr-provider';

export { SubjectCodeParser, COMMON_CODE_PATTERNS } from './syllabus/subject-code-parser';
export { CreditParser } from './syllabus/credit-parser';
export type { ParsedCreditInfo } from './syllabus/credit-parser';

export { MarksheetParser } from './marksheet/marksheet-parser';
