import { AIProvider, AIResult, AIModelOptions, OCRProvider, OCRResult, OCRExtractionOptions } from "../types";
import { ParsedAcademicDocument } from "../../ingestion/parser/types";
import { AIRateLimitError, AITimeoutError, AIAuthenticationError } from "../errors";

export class MockAIProvider implements AIProvider {
  id = "mock";
  name = "Mock Offline AI Provider";

  isAvailable(): boolean {
    return true;
  }

  private handleSimulatedFailure(options?: AIModelOptions) {
    if (!options) return;
    if (options.simulateFailure === "rateLimit") {
      throw new AIRateLimitError("Simulated rate limit hit on mock provider.", this.id);
    }
    if (options.simulateFailure === "timeout") {
      throw new AITimeoutError("Simulated network timeout on mock provider.", this.id);
    }
    if (options.simulateFailure === "auth") {
      throw new AIAuthenticationError("Simulated authentication error on mock provider.", this.id);
    }
  }

  async complete(prompt: string, _systemPrompt?: string, options?: AIModelOptions): Promise<AIResult> {
    this.handleSimulatedFailure(options);

    return {
      text: JSON.stringify({ message: "Mocked offline response successfully generated." }),
      rawResponse: {},
      providerId: this.id
    };
  }

  async extractAcademicData(rawText: string, presetId: string, options?: AIModelOptions): Promise<ParsedAcademicDocument> {
    this.handleSimulatedFailure(options);

    const normPreset = presetId.toLowerCase();

    // Deterministic mock datasets matching authentic university telemetry
    if (normPreset === "sppu") {
      return {
        presetId: { value: "sppu", confidence: 100 },
        currentCgpa: { value: 8.24, confidence: 98 },
        targetCgpa: { value: 8.75, confidence: 98 },
        activeBacklogsCount: { value: 0, confidence: 99 },
        semesterHistory: [
          {
            semester: { value: 1, confidence: 95 },
            sgpa: { value: 8.10, confidence: 98 },
            credits: { value: 12, confidence: 98 },
            earnedCredits: { value: 12, confidence: 98 },
            courses: [
              { code: { value: "CS-101", confidence: 96 }, name: { value: "Programming & Problem Solving", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A", confidence: 96 } },
              { code: { value: "MA-101", confidence: 96 }, name: { value: "Linear Algebra & Calculus", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "B+", confidence: 96 } },
              { code: { value: "EE-101", confidence: 96 }, name: { value: "Basic Electrical Eng", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A", confidence: 96 } }
            ]
          },
          {
            semester: { value: 2, confidence: 95 },
            sgpa: { value: 8.38, confidence: 98 },
            credits: { value: 8, confidence: 98 },
            earnedCredits: { value: 8, confidence: 98 },
            courses: [
              { code: { value: "CS-102", confidence: 96 }, name: { value: "Data Structures & Algorithms", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "O", confidence: 96 } },
              { code: { value: "MA-102", confidence: 96 }, name: { value: "Differential Equations", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A", confidence: 96 } }
            ]
          }
        ]
      };
    }

    if (normPreset === "vtu") {
      return {
        presetId: { value: "vtu", confidence: 100 },
        currentCgpa: { value: 7.90, confidence: 98 },
        targetCgpa: { value: 8.40, confidence: 98 },
        activeBacklogsCount: { value: 0, confidence: 99 },
        semesterHistory: [
          {
            semester: { value: 1, confidence: 95 },
            sgpa: { value: 7.90, confidence: 98 },
            credits: { value: 9, confidence: 98 },
            earnedCredits: { value: 9, confidence: 98 },
            courses: [
              { code: { value: "MATH11", confidence: 96 }, name: { value: "Advanced Mathematics I", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A", confidence: 96 } },
              { code: { value: "PHYS12", confidence: 96 }, name: { value: "Engineering Physics", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A+", confidence: 96 } },
              { code: { value: "CIV14", confidence: 96 }, name: { value: "Environmental Studies", confidence: 96 }, credits: { value: 1, confidence: 96 }, grade: { value: "PP", confidence: 96 } }
            ]
          }
        ]
      };
    }

    // Default to JNTUH mock structure
    return {
      presetId: { value: "jntuh", confidence: 100 },
      currentCgpa: { value: 8.10, confidence: 98 },
      targetCgpa: { value: 8.60, confidence: 98 },
      activeBacklogsCount: { value: 0, confidence: 99 },
      semesterHistory: [
        {
          semester: { value: 1, confidence: 95 },
          sgpa: { value: 8.10, confidence: 98 },
          credits: { value: 11, confidence: 98 },
          earnedCredits: { value: 11, confidence: 98 },
          courses: [
            { code: { value: "MA101BS", confidence: 96 }, name: { value: "Matrices and Calculus", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A", confidence: 96 } },
            { code: { value: "CH102BS", confidence: 96 }, name: { value: "Engineering Chemistry", confidence: 96 }, credits: { value: 4, confidence: 96 }, grade: { value: "A+", confidence: 96 } },
            { code: { value: "CS103ES", confidence: 96 }, name: { value: "Programming for Problem Solving", confidence: 96 }, credits: { value: 3, confidence: 96 }, grade: { value: "B", confidence: 96 } }
          ]
        }
      ]
    };
  }
}

export class MockOCRProvider implements OCRProvider {
  id = "mock-ocr";
  name = "Mock OCR Text Extractor";

  isAvailable(): boolean {
    return true;
  }

  async extractText(_fileBuffer: Buffer, _mimeType: string, options?: OCRExtractionOptions): Promise<OCRResult> {
    const preset = options?.presetId?.toLowerCase() || "sppu";

    let text = "";
    if (preset === "sppu") {
      text = `SAVITRIBAI PHULE PUNE UNIVERSITY\nCURRENT CGPA: 8.24\nTARGET CGPA: 8.75\nACTIVE BACKLOGS: 0\n\nSEMESTER 1\nCS-101 Programming & Problem Solving 4 A\nMA-101 Linear Algebra & Calculus 4 B+\nEE-101 Basic Electrical Eng 4 A\nSGPA: 8.10\nCREDITS: 12\n\nSEMESTER 2\nCS-102 Data Structures & Algorithms 4 O\nMA-102 Differential Equations 4 A\nSGPA: 8.38\nCREDITS: 8`;
    } else if (preset === "vtu") {
      text = `VISVESVARAYA TECHNOLOGICAL UNIVERSITY\nCGPA: 7.90\nTARGET CGPA: 8.40\nBACKLOGS: 0\n\nSEMESTER 1\nMATH11 Advanced Mathematics I 4 A\nPHYS12 Engineering Physics 4 A+\nCIV14 Environmental Studies 1 PP\nSGPA: 7.90\nCREDITS: 9`;
    } else {
      text = `JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY HYDERABAD\nCGPA: 8.10\nTARGET CGPA: 8.60\nBACKLOGS: 0\n\nSEMESTER 1\nMA101BS Matrices and Calculus 4 A\nCH102BS Engineering Chemistry 4 A+\nCS103ES Programming for Problem Solving 3 B\nSGPA: 8.10\nCREDITS: 11`;
    }

    return {
      text,
      confidence: 96,
      providerId: this.id
    };
  }
}
