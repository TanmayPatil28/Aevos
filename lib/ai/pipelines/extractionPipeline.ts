import { AIRuntimeRegistry, globalTelemetry } from "../registry";
import { ParsedAcademicDocument, ParsedSemester, ParsedCourse, ParsedCurrentCourse, ExtractedField } from "../../ingestion/parser/types";
import { AcademicImportPayload, ImportValidationResult } from "../../ingestion/types";
import { validateImportPayload } from "../../ingestion/importValidator";
import { withResilience } from "./retryHandler";
import { AIValidationError, AIProviderError } from "../errors";
import { AIModelOptions, OCRExtractionOptions, TelemetryMetric } from "../types";

/**
 * Coerces and normalizes loose JSON objects returned from LLMs into strict ParsedAcademicDocument shape.
 * If the LLM returns direct values instead of { value, confidence } wrappers, this wraps them with default confidence.
 */
export function coerceParsedAcademicDocument(raw: unknown): ParsedAcademicDocument {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return raw as unknown as ParsedAcademicDocument;
  }

  const rawObj = raw as Record<string, unknown>;

  const coerceField = (field: unknown, defaultValueType: "string" | "number" | "boolean") => {
    if (field === null || field === undefined) return undefined;
    
    // Check if it's already wrapped or if we need to wrap it
    let value = (field && typeof field === "object" && "value" in field) ? (field as Record<string, unknown>).value : field;
    let confidence = (field && typeof field === "object" && "confidence" in field) ? (field as Record<string, unknown>).confidence : 70; // 70 is default fallback confidence

    // Coerce value type
    if (defaultValueType === "number") {
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        value = isNaN(parsed) ? value : parsed;
      }
    } else if (defaultValueType === "string") {
      if (value !== null && value !== undefined) {
        value = String(value);
      }
    }

    // Coerce confidence type
    if (typeof confidence === "string") {
      const parsed = parseInt(confidence, 10);
      confidence = isNaN(parsed) ? 70 : parsed;
    }

    return { 
      value, 
      confidence: typeof confidence === "number" ? confidence : 70 
    };
  };

  const doc = {} as ParsedAcademicDocument;
  doc.presetId = coerceField(rawObj.presetId, "string") as ExtractedField<string>;
  doc.currentCgpa = coerceField(rawObj.currentCgpa, "number") as ExtractedField<number>;
  doc.targetCgpa = coerceField(rawObj.targetCgpa, "number") as ExtractedField<number>;
  doc.activeBacklogsCount = coerceField(rawObj.activeBacklogsCount, "number") as ExtractedField<number>;

  if (Array.isArray(rawObj.semesterHistory)) {
    doc.semesterHistory = rawObj.semesterHistory.map((sem: unknown) => {
      if (!sem || typeof sem !== "object") {
        return sem as unknown as ParsedSemester;
      }
      const semObj = sem as Record<string, unknown>;
      const coercedSem: ParsedSemester = {
        semester: coerceField(semObj.semester, "number") as ExtractedField<number>,
        sgpa: coerceField(semObj.sgpa, "number") as ExtractedField<number>,
        credits: coerceField(semObj.credits, "number") as ExtractedField<number>,
        earnedCredits: coerceField(semObj.earnedCredits, "number") as ExtractedField<number>,
      };
      if (Array.isArray(semObj.courses)) {
        coercedSem.courses = semObj.courses.map((course: unknown) => {
          if (!course || typeof course !== "object") {
            return course as unknown as ParsedCourse;
          }
          const courseObj = course as Record<string, unknown>;
          return {
            code: coerceField(courseObj.code, "string") as ExtractedField<string>,
            name: coerceField(courseObj.name, "string") as ExtractedField<string>,
            credits: coerceField(courseObj.credits, "number") as ExtractedField<number>,
            grade: coerceField(courseObj.grade, "string") as ExtractedField<string>,
          };
        });
      }
      return coercedSem;
    });
  } else {
    doc.semesterHistory = (rawObj.semesterHistory as ParsedSemester[]) || [];
  }

  if (Array.isArray(rawObj.currentSemesterCourses)) {
    doc.currentSemesterCourses = rawObj.currentSemesterCourses.map((course: unknown) => {
      if (!course || typeof course !== "object") {
        return course as unknown as ParsedCurrentCourse;
      }
      const courseObj = course as Record<string, unknown>;
      const coercedCourse: ParsedCurrentCourse = {
        code: coerceField(courseObj.code, "string") as ExtractedField<string>,
        name: coerceField(courseObj.name, "string") as ExtractedField<string>,
        credits: coerceField(courseObj.credits, "number") as ExtractedField<number>,
      };
      if (courseObj.grade !== undefined) {
        coercedCourse.grade = coerceField(courseObj.grade, "string") as ExtractedField<string>;
      }
      if (courseObj.cieMarks !== undefined) {
        coercedCourse.cieMarks = coerceField(courseObj.cieMarks, "number") as ExtractedField<number>;
      }
      if (courseObj.attendanceTotal !== undefined) {
        coercedCourse.attendanceTotal = coerceField(courseObj.attendanceTotal, "number") as ExtractedField<number>;
      }
      if (courseObj.attendanceBunked !== undefined) {
        coercedCourse.attendanceBunked = coerceField(courseObj.attendanceBunked, "number") as ExtractedField<number>;
      }
      return coercedCourse;
    });
  }

  return doc;
}

/**
 * Validates the schema shape and required fields of a ParsedAcademicDocument.
 * Returns an array of error strings.
 */
export function validateParsedAcademicDocumentShape(doc: unknown): string[] {
  const errors: string[] = [];

  if (!doc || typeof doc !== "object") {
    errors.push("Payload is not a valid JSON object.");
    return errors;
  }

  const docObj = doc as Record<string, unknown>;

  const validateField = (field: unknown, fieldPath: string, type: "string" | "number" | "boolean") => {
    if (!field || typeof field !== "object") {
      errors.push(`Field '${fieldPath}' is missing or is not a structured object.`);
      return;
    }
    const fObj = field as Record<string, unknown>;
    if (!("value" in fObj)) {
      errors.push(`Field '${fieldPath}' is missing 'value' property.`);
    } else {
      if (typeof fObj.value !== type) {
        errors.push(`Field '${fieldPath}.value' must be a ${type}, but got ${typeof fObj.value}.`);
      }
    }
    if (!("confidence" in fObj)) {
      errors.push(`Field '${fieldPath}' is missing 'confidence' property.`);
    } else if (typeof fObj.confidence !== "number" || fObj.confidence < 0 || fObj.confidence > 100) {
      errors.push(`Field '${fieldPath}.confidence' must be a number between 0 and 100.`);
    }
  };

  validateField(docObj.presetId, "presetId", "string");
  validateField(docObj.currentCgpa, "currentCgpa", "number");
  validateField(docObj.targetCgpa, "targetCgpa", "number");
  validateField(docObj.activeBacklogsCount, "activeBacklogsCount", "number");

  if (!Array.isArray(docObj.semesterHistory)) {
    errors.push("Field 'semesterHistory' is missing or is not an array.");
  } else {
    docObj.semesterHistory.forEach((sem: unknown, sIdx: number) => {
      const semPath = `semesterHistory[${sIdx}]`;
      if (!sem || typeof sem !== "object") {
        errors.push(`Entry '${semPath}' is not an object.`);
        return;
      }
      const semObj = sem as Record<string, unknown>;
      validateField(semObj.semester, `${semPath}.semester`, "number");
      validateField(semObj.sgpa, `${semPath}.sgpa`, "number");
      validateField(semObj.credits, `${semPath}.credits`, "number");
      validateField(semObj.earnedCredits, `${semPath}.earnedCredits`, "number");

      if (semObj.courses !== undefined) {
        if (!Array.isArray(semObj.courses)) {
          errors.push(`Field '${semPath}.courses' is not an array.`);
        } else {
          semObj.courses.forEach((course: unknown, cIdx: number) => {
            const coursePath = `${semPath}.courses[${cIdx}]`;
            if (!course || typeof course !== "object") {
              errors.push(`Entry '${coursePath}' is not an object.`);
              return;
            }
            const courseObj = course as Record<string, unknown>;
            validateField(courseObj.code, `${coursePath}.code`, "string");
            validateField(courseObj.name, `${coursePath}.name`, "string");
            validateField(courseObj.credits, `${coursePath}.credits`, "number");
            validateField(courseObj.grade, `${coursePath}.grade`, "string");
          });
        }
      }
    });
  }

  // Validate currentSemesterCourses if present
  if (docObj.currentSemesterCourses !== undefined) {
    if (!Array.isArray(docObj.currentSemesterCourses)) {
      errors.push("Field 'currentSemesterCourses' is not an array.");
    } else {
      docObj.currentSemesterCourses.forEach((course: unknown, cIdx: number) => {
        const coursePath = `currentSemesterCourses[${cIdx}]`;
        if (!course || typeof course !== "object") {
          errors.push(`Entry '${coursePath}' is not an object.`);
          return;
        }
        const courseObj = course as Record<string, unknown>;
        validateField(courseObj.code, `${coursePath}.code`, "string");
        validateField(courseObj.name, `${coursePath}.name`, "string");
        validateField(courseObj.credits, `${coursePath}.credits`, "number");
        if (courseObj.grade !== undefined) {
          validateField(courseObj.grade, `${coursePath}.grade`, "string");
        }
        if (courseObj.cieMarks !== undefined) {
          validateField(courseObj.cieMarks, `${coursePath}.cieMarks`, "number");
        }
        if (courseObj.attendanceTotal !== undefined) {
          validateField(courseObj.attendanceTotal, `${coursePath}.attendanceTotal`, "number");
        }
        if (courseObj.attendanceBunked !== undefined) {
          validateField(courseObj.attendanceBunked, `${coursePath}.attendanceBunked`, "number");
        }
      });
    }
  }

  return errors;
}

/**
 * Calculates the arithmetic average of confidence scores within a ParsedAcademicDocument.
 */
export function calculateConfidenceAverage(doc: ParsedAcademicDocument): number {
  const scores: number[] = [];

  const add = (field: unknown) => {
    if (field && typeof field === "object" && "confidence" in field) {
      const confidence = (field as Record<string, unknown>).confidence;
      if (typeof confidence === "number") {
        scores.push(confidence);
      }
    }
  };

  add(doc.presetId);
  add(doc.currentCgpa);
  add(doc.targetCgpa);
  add(doc.activeBacklogsCount);

  doc.semesterHistory.forEach((sem) => {
    add(sem.semester);
    add(sem.sgpa);
    add(sem.credits);
    add(sem.earnedCredits);

    if (sem.courses) {
      sem.courses.forEach((course) => {
        add(course.code);
        add(course.name);
        add(course.credits);
        add(course.grade);
      });
    }
  });

  if (doc.currentSemesterCourses) {
    doc.currentSemesterCourses.forEach((course) => {
      add(course.code);
      add(course.name);
      add(course.credits);
      add(course.grade);
      add(course.cieMarks);
      add(course.attendanceTotal);
      add(course.attendanceBunked);
    });
  }

  if (scores.length === 0) return 100;
  const sum = scores.reduce((a, b) => a + b, 0);
  return parseFloat((sum / scores.length).toFixed(2));
}

/**
 * Converts a ParsedAcademicDocument to a primitive AcademicImportPayload by stripping confidence markers.
 */
export function toPrimitivePayload(doc: ParsedAcademicDocument): AcademicImportPayload {
  return {
    presetId: doc.presetId.value,
    currentCgpa: doc.currentCgpa.value,
    targetCgpa: doc.targetCgpa.value,
    activeBacklogsCount: doc.activeBacklogsCount.value,
    semesterHistory: doc.semesterHistory.map((sem) => ({
      semester: sem.semester.value,
      sgpa: sem.sgpa.value,
      credits: sem.credits.value,
      earnedCredits: sem.earnedCredits.value,
      courses: sem.courses?.map((c) => ({
        code: c.code.value,
        name: c.name.value,
        credits: c.credits.value,
        grade: c.grade.value,
      })),
    })),
    currentSemesterCourses: doc.currentSemesterCourses?.map((c) => ({
      code: c.code.value,
      name: c.name.value,
      credits: c.credits.value,
      grade: c.grade?.value,
      cieMarks: c.cieMarks?.value,
      attendanceTotal: c.attendanceTotal?.value,
      attendanceBunked: c.attendanceBunked?.value,
    })),
  };
}

export interface ExtractionPipelineResult {
  parsedDocument: ParsedAcademicDocument;
  primitivePayload: AcademicImportPayload;
  validationResult: ImportValidationResult;
  telemetry: TelemetryMetric;
}

/**
 * Main ingestion & clean-up pipeline coordinating dynamic failovers and strict validations.
 */
export class IngestionExtractionPipeline {
  /**
   * Orchestrates transcript text analysis across the registered fallback chain (Gemini -> OpenAI -> Mock).
   */
  static async extractTranscript(
    rawText: string,
    presetId: string,
    options?: AIModelOptions
  ): Promise<ExtractionPipelineResult> {
    const startTime = Date.now();
    const providerSequence = ["gemini", "openai", "mock"];
    
    let lastError: unknown = null;
    let selectedProviderId = "";
    let finalParsedDoc: ParsedAcademicDocument | null = null;
    let retriesCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < providerSequence.length; i++) {
      const providerId = providerSequence[i];
      selectedProviderId = providerId;

      try {
        const provider = AIRuntimeRegistry.getAIProvider(providerId);
        
        // If AIRuntimeRegistry skipped or mapped to another provider, align selectedProviderId
        if (provider.id !== providerId) {
          selectedProviderId = provider.id;
        }

        // Execute extraction wrapped in exponential backoff resilience handler
        const { result, retriesTriggered } = await withResilience(
          () => provider.extractAcademicData(rawText, presetId, options),
          selectedProviderId,
          undefined, // we handle failover chain at the pipeline level, so no sub-fallback action needed
          options?.simulateFailure ? 0 : 1, // Skip retries for simulated failures to test failover chains instantly
          500
        );

        finalParsedDoc = result;
        retriesCount = retriesTriggered;
        break; // Successfully extracted academic data!
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn(`Extraction with AI provider [${selectedProviderId}] failed: ${errMsg}`);
        lastError = error;
        fallbackCount++;
        // Continue loop to try next provider in sequence
      }
    }

    if (!finalParsedDoc) {
      const lastErrMsg = lastError instanceof Error ? lastError.message : String(lastError);
      throw new AIProviderError(
        `All extraction providers in the failover chain failed. Last error: ${lastErrMsg}`,
        selectedProviderId,
        lastError
      );
    }

    const latencyMs = Date.now() - startTime;

    // 1. Strict Schema Shape & Coercion validation
    const coercedDoc = coerceParsedAcademicDocument(finalParsedDoc);
    const shapeErrors = validateParsedAcademicDocumentShape(coercedDoc);
    
    if (shapeErrors.length > 0) {
      const valErr = new AIValidationError(
        `Parsed AI output failed schema shape validation.`,
        selectedProviderId,
        shapeErrors
      );
      
      // Track validation failure telemetry
      globalTelemetry.track({
        providerId: selectedProviderId,
        action: "extract",
        latencyMs,
        retriesTriggered: retriesCount,
        fallbackTriggered: fallbackCount > 0,
        validationPassed: false,
        timestamp: Date.now()
      });

      throw valErr;
    }

    // 2. Map to primitive payload and execute pluggable regulation engine (PRE) institutional audits
    const primitivePayload = toPrimitivePayload(coercedDoc);
    const validationResult = validateImportPayload(primitivePayload);

    if (!validationResult.isValid) {
      const valErr = new AIValidationError(
        `Parsed AI output failed pluggable regulation engine (PRE) institutional validation checks.`,
        selectedProviderId,
        validationResult.errors
      );

      // Track validation failure telemetry
      globalTelemetry.track({
        providerId: selectedProviderId,
        action: "extract",
        latencyMs,
        retriesTriggered: retriesCount,
        fallbackTriggered: fallbackCount > 0,
        validationPassed: false,
        timestamp: Date.now()
      });

      throw valErr;
    }

    const confidenceAverage = calculateConfidenceAverage(coercedDoc);

    const telemetryMetric: TelemetryMetric = {
      providerId: selectedProviderId,
      action: "extract",
      latencyMs,
      retriesTriggered: retriesCount,
      fallbackTriggered: fallbackCount > 0,
      validationPassed: true,
      confidenceAverage,
      timestamp: Date.now()
    };

    // Store in global telemetry for production observability
    globalTelemetry.track(telemetryMetric);

    return {
      parsedDocument: coercedDoc,
      primitivePayload,
      validationResult,
      telemetry: telemetryMetric
    };
  }

  /**
   * Dynamic end-to-end OCR Text Ingestion ➔ Semantic Ingest Pipeline.
   * Temporary processing only; strictly adheres to zero-persistence security rules.
   */
  static async extractFromImageOrPdf(
    fileBuffer: Buffer,
    mimeType: string,
    presetId: string,
    options?: AIModelOptions & OCRExtractionOptions
  ): Promise<ExtractionPipelineResult> {
    const ocrProvider = AIRuntimeRegistry.getOCRProvider();
    
    // Step 1: Perform OCR Ingestion
    const ocrResult = await ocrProvider.extractText(fileBuffer, mimeType, options);

    // Step 2: Feed extracted text into Semantic Ingest
    return this.extractTranscript(ocrResult.text, presetId, options);
  }
}
