/**
 * core/parsing/pdf/pdf-parser.ts
 *
 * Abstract PDF extraction infrastructure.
 * This is an interface boundary — we don't include heavy PDF dependencies (like pdf.js)
 * directly in the core to keep it lightweight. Instead, we define the adapter contract.
 */

export interface PDFMetadata {
  readonly pageCount: number;
  readonly title?: string;
  readonly author?: string;
  readonly creationDate?: Date;
}

export interface PDFExtractionResult {
  readonly metadata: PDFMetadata;
  readonly rawText: string;
  readonly pages: readonly string[];
  /** Flag indicating if the PDF contains scanned images (requires OCR) */
  readonly requiresOCR: boolean;
}

export interface PDFParserAdapter {
  /**
   * Extracts raw text and metadata from a PDF buffer.
   * If the PDF is scanned (no text layer), sets requiresOCR to true.
   */
  extract(buffer: ArrayBuffer): Promise<PDFExtractionResult>;
}

/**
 * Stub implementation for Phase 4 scaffold.
 * In a real environment, this would use a library like `pdf-parse` or `pdfjs-dist`.
 */
export class DefaultPDFParserAdapter implements PDFParserAdapter {
  async extract(buffer: ArrayBuffer): Promise<PDFExtractionResult> {
    // Stub
    return {
      metadata: { pageCount: 1 },
      rawText: 'Mock PDF Text Content',
      pages: ['Mock PDF Text Content'],
      requiresOCR: false,
    };
  }
}
