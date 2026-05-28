/**
 * Detection Engine
 * Uses regex heuristics to infer the institution from raw text or JSON.
 * MVP implementation designed to be pluggable with future ML models.
 */

const INSTITUTION_SIGNATURES: Record<string, RegExp[]> = {
  sppu: [
    /savitribai phule pune university/i,
    /sppu/i,
    /pune university/i,
    /exam form.*sppu/i,
  ],
  vtu: [
    /visvesvaraya technological university/i,
    /vtu/i,
    /belagavi/i,
  ],
  jntuh: [
    /jawaharlal nehru technological university/i,
    /jntuh/i,
    /hyderabad/i,
  ],
  jspm: [
    /jspm university/i,
    /jspm/i,
    /rscoe/i,
    /rajarshi shahu college/i,
  ]
};

export function detectInstitution(rawInput: string): string | null {
  if (!rawInput) return null;
  
  const text = rawInput.toLowerCase();

  // Score each institution based on signature matches
  const scores: Record<string, number> = {};

  for (const [instId, signatures] of Object.entries(INSTITUTION_SIGNATURES)) {
    scores[instId] = 0;
    for (const regex of signatures) {
      if (regex.test(text)) {
        scores[instId]++;
      }
    }
  }

  // Find the institution with the highest score > 0
  let bestMatch: string | null = null;
  let highestScore = 0;

  for (const [instId, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestMatch = instId;
    }
  }

  // Fallback heuristic: If JSON payload has specific fields
  if (!bestMatch) {
    try {
      const parsed = JSON.parse(rawInput);
      if (parsed.presetId) {
        return parsed.presetId;
      }
      if (parsed.institution) {
        return parsed.institution;
      }
    } catch {
      // Not JSON, ignore
    }
  }

  return bestMatch;
}
