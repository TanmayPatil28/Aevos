/**
 * core/parsing/ocr/ocr-provider.ts
 *
 * Pluggable OCR infrastructure for parsing scanned marksheets.
 *
 * To avoid vendor lock-in, the system relies on an abstract OCRProvider contract.
 * We can swap Tesseract.js (local, free) with Google Cloud Vision (accurate, paid)
 * seamlessly.
 */

import type { OCRProvider } from '../../types';

export class MockOCRProvider implements OCRProvider {
  readonly name = 'mock-ocr';

  async extractText(buffer: ArrayBuffer): Promise<string> {
    // Stub implementation
    return 'MOCK OCR TEXT RESULT\nName: John Doe\nSubject 1: 85 marks\nSubject 2: 90 marks\n';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

export class OCRManager {
  private provider: OCRProvider;

  constructor(provider?: OCRProvider) {
    this.provider = provider ?? new MockOCRProvider();
  }

  setProvider(provider: OCRProvider): void {
    this.provider = provider;
  }

  async extract(buffer: ArrayBuffer): Promise<string> {
    if (!(await this.provider.isAvailable())) {
      throw new Error(`OCR Provider ${this.provider.name} is currently unavailable.`);
    }
    return this.provider.extractText(buffer);
  }
}
