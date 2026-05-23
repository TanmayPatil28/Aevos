export const PROMPT_VERSIONS = {
  v1: {
    systemPrompt: "You are a precise academic data extractor. You only return a raw, syntactically correct JSON object matching the requested schema.",
    getExtractionPrompt: (presetId: string, rawText: string) => `Extract academic records from this transcript for preset university [${presetId.toUpperCase()}].
Raw text:
${rawText}

You MUST return a JSON object matching this schema exactly:
{
  "presetId": { "value": "${presetId}", "confidence": 100 },
  "currentCgpa": { "value": float, "confidence": int },
  "targetCgpa": { "value": float, "confidence": int },
  "activeBacklogsCount": { "value": int, "confidence": int },
  "semesterHistory": [
    {
      "semester": { "value": int, "confidence": int },
      "sgpa": { "value": float, "confidence": int },
      "credits": { "value": int, "confidence": int },
      "earnedCredits": { "value": int, "confidence": int },
      "courses": [
        {
          "code": { "value": "string", "confidence": int },
          "name": { "value": "string", "confidence": int },
          "credits": { "value": int, "confidence": int },
          "grade": { "value": "string", "confidence": int }
        }
      ]
    }
  ]
}`
  },
  v2: {
    systemPrompt: "You are an expert academic transcript parser. You convert raw marksheet OCR text into structured intermediate formats. Output ONLY raw JSON.",
    getExtractionPrompt: (presetId: string, rawText: string) => `Analyze the following university grade sheet under institutional rules [${presetId.toUpperCase()}].
Text:
${rawText}

Format strictly to this schema:
{
  "presetId": { "value": "${presetId}", "confidence": 100 },
  "currentCgpa": { "value": float, "confidence": int },
  "targetCgpa": { "value": float, "confidence": int },
  "activeBacklogsCount": { "value": int, "confidence": int },
  "semesterHistory": [
    {
      "semester": { "value": int, "confidence": int },
      "sgpa": { "value": float, "confidence": int },
      "credits": { "value": int, "confidence": int },
      "earnedCredits": { "value": int, "confidence": int },
      "courses": [
        {
          "code": { "value": "string", "confidence": int },
          "name": { "value": "string", "confidence": int },
          "credits": { "value": int, "confidence": int },
          "grade": { "value": "string", "confidence": int }
        }
      ]
    }
  ]
}`
  }
};

export type PromptVersion = keyof typeof PROMPT_VERSIONS;

export function getSystemPrompt(version: PromptVersion = "v1"): string {
  return PROMPT_VERSIONS[version].systemPrompt;
}

export function getExtractionPrompt(
  presetId: string,
  rawText: string,
  version: PromptVersion = "v1"
): string {
  return PROMPT_VERSIONS[version].getExtractionPrompt(presetId, rawText);
}
