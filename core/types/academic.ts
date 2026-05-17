/**
 * core/types/academic.ts
 *
 * Canonical academic domain types for India's Academic Intelligence Infrastructure.
 * These types normalize the heterogeneous structures across universities,
 * autonomous colleges, and regulatory bodies into a unified type system.
 *
 * Design principles:
 * - Immutable output contracts (readonly where applicable)
 * - Composable with assessment, regulation, and grading types
 * - No university-specific fields — all variation is captured via metadata
 */

import type { AssessmentPattern } from './assessment';

// ─── Subject Types ──────────────────────────────────────────────────────────

export type SubjectType =
  | 'theory'
  | 'practical'
  | 'project'
  | 'elective'
  | 'audit'
  | 'non-credit'
  | 'open-elective'
  | 'honors'
  | 'minor';

export type CreditTransferSource = 'NPTEL' | 'SWAYAM' | 'MOOC' | 'Exchange' | 'Internship';

export interface SubjectPreset {
  /** Unique subject code (e.g., BCE23PC01, CS301, AI2104) */
  readonly subjectCode: string;
  /** Human-readable subject name */
  readonly subjectName: string;
  /** Credit weight (0 for audit/non-credit courses) */
  readonly credits: number;
  /** Classification of the subject */
  readonly type: SubjectType;
  /** Semester this subject belongs to */
  readonly semester: number;
  /** Assessment breakdown for this subject */
  readonly assessments?: AssessmentPattern;
  /** L/T/P hours distribution (e.g., "3-1-0" or "2-0-2") */
  readonly contactHours?: string;

  // ── Zero-Credit & Audit Course Support ──
  /** Whether this is an audit course (carries no grade points) */
  readonly isAuditCourse?: boolean;
  /** Whether this is mandatory for graduation but carries no CGPA weight */
  readonly isMandatoryNonCredit?: boolean;
  /** Whether this blocks graduation if not completed */
  readonly blocksGraduation?: boolean;

  // ── Credit Transfer Support ──
  /** Whether credits can be transferred from external sources */
  readonly isTransferable?: boolean;
  /** Source of credit transfer */
  readonly transferableSource?: CreditTransferSource;

  /** Optional description or learning objectives */
  readonly description?: string;
}

// ─── Semester Types ─────────────────────────────────────────────────────────

export interface SemesterPreset {
  /** Semester number (1-indexed) */
  readonly semester: number;
  /** Academic focus area for this semester (e.g., "Core Foundations", "AI & Emerging Tech") */
  readonly focusArea?: string;
  /** Expected total credits for this semester */
  readonly totalCredits?: number;
  /** Subjects in this semester */
  readonly subjects: readonly SubjectPreset[];
  /** Default assessment pattern for the semester (can be overridden per subject) */
  readonly assessmentPattern?: AssessmentPattern;
}

// ─── Branch Types ───────────────────────────────────────────────────────────

export interface BranchPreset {
  /** Machine-readable branch identifier (e.g., "computer-engineering", "ai-ds") */
  readonly id: string;
  /** Human-readable branch name */
  readonly name: string;
  /** All semesters for this branch under a specific regulation */
  readonly semesters: readonly SemesterPreset[];
  /** Total credits required for graduation in this branch */
  readonly totalCreditsRequired?: number;
}

// ─── University-Level Academic Config ───────────────────────────────────────

export type UniversityType =
  | 'Public'
  | 'Private'
  | 'Autonomous'
  | 'Affiliated'
  | 'Deemed'
  | 'Institute of National Importance';

export interface SyncResult {
  readonly success: boolean;
  readonly syncedTypes: readonly string[];
  readonly failedTypes: readonly string[];
  readonly recordCount: number;
  readonly summary: string;
  readonly errors: readonly string[];
  readonly syncedAt: Date;
}

// ─── NEP 2020 Definitions ───────────────────────────────────────────────

export interface NepExitCertification {
  readonly type: 'certificate' | 'diploma' | 'degree' | 'honors';
  readonly title: string;
  readonly minCreditsRequired: number;
  readonly eligible: boolean;
}

export interface AcademicConfig {
  /** University identifier */
  readonly id: string;
  /** Full university name */
  readonly university: string;
  /** Short name for UI display */
  readonly shortName: string;
  /** State/UT the university belongs to */
  readonly state: string;
  /** Type of institution */
  readonly type: UniversityType;
  /** Academic pattern/regulation identifier */
  readonly pattern: string;
  /** Total semesters in the program */
  readonly totalSemesters: number;
  /** Branches available under this configuration */
  readonly branches: readonly BranchPreset[];
  /** ISO date string of last metadata update */
  readonly lastUpdated: string;
}
