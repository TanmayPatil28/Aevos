import { AIProvider, AIResult, AIModelOptions } from "../types";
import { ParsedAcademicDocument } from "../../ingestion/parser/types";
import { AIProviderError, AIRateLimitError, AITimeoutError, AIAuthenticationError } from "../errors";

export class GroqAIProvider implements AIProvider {
  id = "groq";
  name = "Groq LPU Provider (Free Tier)";

  isAvailable(): boolean {
    return typeof process !== "undefined" && !!process.env.GROQ_API_KEY;
  }

  async complete(prompt: string, systemPrompt?: string, options?: AIModelOptions): Promise<AIResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AIAuthenticationError("Groq API key is missing.", this.id);
    }

    const timeoutMs = options?.timeoutMs || 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const messages: { role: string; content: string }[] = [];

      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const requestBody = {
        model: "llama-4-scout-17b-16e-instruct",
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens ?? 2000,
      };

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        throw new AIAuthenticationError("Groq API authentication failed.", this.id);
      }
      if (response.status === 429) {
        throw new AIRateLimitError("Groq API rate limit exceeded.", this.id);
      }
      if (!response.ok) {
        throw new AIProviderError(`Groq API error: ${response.statusText}`, this.id);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new AIProviderError("Empty completion text returned from Groq.", this.id);
      }

      return {
        text,
        rawResponse: data,
        providerId: this.id,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const isAbort = error instanceof Error && (error.name === "AbortError" || error.message?.includes("aborted"));
      if (isAbort) {
        throw new AITimeoutError(`Groq request timed out after ${timeoutMs}ms.`, this.id, error);
      }
      if (error instanceof AIProviderError) {
        throw error;
      }
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new AIProviderError(errMsg || "Failed to make request to Groq.", this.id, error);
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
      const cleaned = result.text.replace(/```json\s?|```/g, "").trim();
      return JSON.parse(cleaned) as ParsedAcademicDocument;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      throw new AIProviderError(`Failed to parse extracted JSON payload: ${errMsg}`, this.id, e);
    }
  }
}
