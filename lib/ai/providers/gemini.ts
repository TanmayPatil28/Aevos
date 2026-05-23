import { AIProvider, AIResult, AIModelOptions } from "../types";
import { ParsedAcademicDocument } from "../../ingestion/parser/types";
import { AIProviderError, AIRateLimitError, AITimeoutError, AIAuthenticationError } from "../errors";

export class GeminiAIProvider implements AIProvider {
  id = "gemini";
  name = "Google Gemini Core Provider";

  isAvailable(): boolean {
    return typeof process !== "undefined" && !!process.env.GEMINI_API_KEY;
  }

  async complete(prompt: string, systemPrompt?: string, options?: AIModelOptions): Promise<AIResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIAuthenticationError("Gemini API key is missing.", this.id);
    }

    const timeoutMs = options?.timeoutMs || 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const contents: { role: string; parts: Array<{ text: string }> }[] = [];
      if (systemPrompt) {
        // System prompt format for Gemini: we can inject it via systemInstruction or model configs
      }

      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const requestBody: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.1,
          maxOutputTokens: options?.maxTokens ?? 2000
        }
      };

      if (systemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        throw new AIAuthenticationError("Gemini API authentication failed.", this.id);
      }
      if (response.status === 429) {
        throw new AIRateLimitError("Gemini API rate limit exceeded.", this.id);
      }
      if (!response.ok) {
        throw new AIProviderError(`Gemini API error: ${response.statusText}`, this.id);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AIProviderError("Empty completion text returned from Gemini.", this.id);
      }

      return {
        text,
        rawResponse: data,
        providerId: this.id
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const isAbort = error instanceof Error && (error.name === "AbortError" || error.message?.includes("aborted"));
      if (isAbort) {
        throw new AITimeoutError(`Gemini request timed out after ${timeoutMs}ms.`, this.id, error);
      }
      if (error instanceof AIProviderError) {
        throw error;
      }
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new AIProviderError(errMsg || "Failed to make request to Gemini.", this.id, error);
    }
  }

  async extractAcademicData(rawText: string, presetId: string, options?: AIModelOptions): Promise<ParsedAcademicDocument> {
    const prompt = `Extract academic records from this transcript for preset university [${presetId.toUpperCase()}].
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
}`;

    const systemPrompt = "You are a precise academic data extractor. You only return raw JSON, no conversational markdown wrappers.";
    const result = await this.complete(prompt, systemPrompt, options);

    try {
      // Clean up markdown blockquotes if LLM returns them
      const cleaned = result.text.replace(/```json\s?|```/g, "").trim();
      return JSON.parse(cleaned) as ParsedAcademicDocument;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      throw new AIProviderError(`Failed to parse extracted JSON payload: ${errMsg}`, this.id, e);
    }
  }
}
