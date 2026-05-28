import { CourseState, AcademicState, SemesterHistoryEntry } from "../stores/usmStore";

export interface TrustMetadata {
  confidenceScore: number;
  parserType: string;
  verified: boolean;
  sourceInstitution: string;
  importedAt: string;
}

export interface AcademicIdentityState {
  status: "empty" | "imported" | "hydrated" | "syncing" | "simulation" | "error";
  sourceType: "digicampus" | "manual" | "ocr" | "demo" | null;
  lastUpdatedAt: string | null;
  isVerified: boolean;
  hasAuthoritativeData: boolean;
  trustMetadata?: TrustMetadata;
  studentIdentity?: {
    name?: string;
    registrationId?: string;
  };
  institution?: string;
  regulation?: string;
  academic?: {
    programme?: string;
    branch?: string;
    batchYear?: number;
  };
}

// Canonical Academic Profile structure (matches USMStore representation)
export interface AcademicProfile {
  studentIdentity: {
    id?: string;
    name?: string;
  };
  institution: string;
  presetId: string;
  regulation: string;
  academic: AcademicState;
  courses: CourseState[];
  semesterHistory: SemesterHistoryEntry[];
}
