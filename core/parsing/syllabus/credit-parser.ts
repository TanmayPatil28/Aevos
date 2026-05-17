/**
 * core/parsing/syllabus/credit-parser.ts
 *
 * Extracts credit weightage and L/T/P distribution from raw text.
 */

export interface ParsedCreditInfo {
  readonly totalCredits: number;
  readonly lectures?: number;
  readonly tutorials?: number;
  readonly practicals?: number;
}

export class CreditParser {
  /**
   * Parses common L-T-P-C patterns found in syllabi.
   * e.g., "3-1-0-4", "L:3 T:0 P:2 C:4", "Credits: 3"
   */
  static extract(text: string): ParsedCreditInfo | null {
    // Pattern 1: L-T-P-C (e.g. 3-0-2-4)
    const ltpcRegex = /\b([0-4])\s*-\s*([0-4])\s*-\s*([0-6])\s*-\s*([1-6])\b/;
    const ltpcMatch = text.match(ltpcRegex);
    if (ltpcMatch) {
      return {
        lectures: parseInt(ltpcMatch[1], 10),
        tutorials: parseInt(ltpcMatch[2], 10),
        practicals: parseInt(ltpcMatch[3], 10),
        totalCredits: parseInt(ltpcMatch[4], 10),
      };
    }

    // Pattern 2: Explicit Labels (e.g., L:3 T:0 P:2 C:4)
    const labelRegex =
      /L\s*[:=]?\s*([0-4]).*?T\s*[:=]?\s*([0-4]).*?P\s*[:=]?\s*([0-6]).*?C\s*[:=]?\s*([1-6])/i;
    const labelMatch = text.match(labelRegex);
    if (labelMatch) {
      return {
        lectures: parseInt(labelMatch[1], 10),
        tutorials: parseInt(labelMatch[2], 10),
        practicals: parseInt(labelMatch[3], 10),
        totalCredits: parseInt(labelMatch[4], 10),
      };
    }

    // Pattern 3: Just "Credits: X"
    const simpleRegex = /Credits?\s*[:=]?\s*([0-6])/i;
    const simpleMatch = text.match(simpleRegex);
    if (simpleMatch) {
      return {
        totalCredits: parseInt(simpleMatch[1], 10),
      };
    }

    return null;
  }
}
