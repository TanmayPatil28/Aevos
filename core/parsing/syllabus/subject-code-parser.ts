/**
 * core/parsing/syllabus/subject-code-parser.ts
 *
 * Config-driven regex parsing for extracting subject codes from raw syllabus text.
 */

import type { SubjectCodePattern } from '../../types';

export const COMMON_CODE_PATTERNS: readonly SubjectCodePattern[] = [
  {
    // SPPU 2019 Pattern: e.g., "310241" or "310245A"
    applicableTo: 'sppu-2019',
    regex: /\b([1-4])(1[0-4])([0-2][0-9])([A-Z]?)\b/g,
    groups: {
      year: '$1',
      branch: '$2',
      sequence: '$3',
      type: '$4',
    },
  },
  {
    // VTU 2022 Scheme: e.g., "22CS31" or "22MATS11"
    applicableTo: 'vtu-2022',
    regex: /\b(22)([A-Z]{2,4})([1-8])([0-9]{1,2})\b/g,
    groups: {
      year: '$1',
      branch: '$2',
      semester: '$3',
      sequence: '$4',
    },
  },
  {
    // Anna University R2021: e.g., "CS3351"
    applicableTo: 'au-r2021',
    regex: /\b([A-Z]{2})([3-8])([0-9]{3})\b/g,
    groups: {
      branch: '$1',
      semester: '$2',
      sequence: '$3',
    },
  },
];

export class SubjectCodeParser {
  /**
   * Extracts subject codes from raw text based on university patterns.
   */
  static extractCodes(rawText: string, universityId: string): string[] {
    const patterns = COMMON_CODE_PATTERNS.filter((p) => p.applicableTo.startsWith(universityId));

    // Fallback to a generic alphanumeric pattern if no specific pattern found
    if (patterns.length === 0) {
      const genericRegex = /\b[A-Z]{2,4}\s?[0-9]{3,4}[A-Z]?\b/g;
      const matches = rawText.match(genericRegex) || [];
      return Array.from(new Set(matches));
    }

    const foundCodes = new Set<string>();

    for (const pattern of patterns) {
      let match;
      // Reset lastIndex because we're reusing the regex
      pattern.regex.lastIndex = 0;
      while ((match = pattern.regex.exec(rawText)) !== null) {
        foundCodes.add(match[0]);
      }
    }

    return Array.from(foundCodes);
  }
}
