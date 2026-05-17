/**
 * core/types/regulation.ts
 *
 * Regulation versioning and binding types.
 *
 * CRITICAL INVARIANT:
 * A student is PERMANENTLY bound to the regulation that was active
 * during their admission year. This binding is immutable.
 *
 * Examples:
 * - SPPU 2015 vs SPPU 2019 vs SPPU 2024
 * - VTU 2018 Scheme vs VTU 2022 Scheme
 * - Anna University R2017 vs R2021
 *
 * The regulation determines:
 * - Grading scale
 * - Assessment patterns
 * - Curriculum structure
 * - Pass criteria
 * - CGPA-to-percentage conversion formula
 */

// ─── Regulation Pattern ─────────────────────────────────────────────────────

export interface RegulationPattern {
  /** Unique regulation identifier (e.g., "sppu-2019", "vtu-2022") */
  readonly id: string;
  /** University this regulation belongs to */
  readonly university: string;
  /** University short name for UI */
  readonly universityShortName: string;
  /** Year this regulation was introduced */
  readonly regulationYear: number;
  /** Date from which this regulation is active */
  readonly activeFrom: Date;
  /** Date until which this regulation is active (undefined = currently active) */
  readonly activeTo?: Date;
  /** Human-readable label (e.g., "2019 Pattern", "Regulation 2021") */
  readonly displayLabel: string;
  /** Whether this is the currently active regulation for new admissions */
  readonly isCurrent: boolean;
}

// ─── Regulation Binding ─────────────────────────────────────────────────────

/**
 * Immutable binding between a student and their regulation.
 * Once bound, this cannot be changed unless the university
 * explicitly allows regulation migration (rare).
 */
export interface RegulationBinding {
  /** The student's user ID */
  readonly userId: string;
  /** University identifier */
  readonly universityId: string;
  /** The regulation year the student is bound to */
  readonly regulationYear: number;
  /** The specific pattern identifier */
  readonly pattern: string;
  /** Timestamp of when the binding was established */
  readonly boundAt: Date;
  /** Whether this binding is locked (should always be true after initial set) */
  readonly isLocked: boolean;
}

// ─── Regulation Resolution ──────────────────────────────────────────────────

/**
 * Result of resolving the applicable regulation for a student.
 * Includes explainability metadata.
 */
export interface RegulationResolution {
  /** The resolved regulation pattern */
  readonly regulation: RegulationPattern;
  /** How the regulation was resolved */
  readonly source: 'binding' | 'admission-year-lookup' | 'default-current';
  /** Whether the student has an explicit binding */
  readonly hasExplicitBinding: boolean;
}

// ─── Regulation Migration ───────────────────────────────────────────────────

/**
 * Represents a potential migration path between regulations.
 * Used when a university updates its regulation and offers
 * students the option to migrate (e.g., SPPU 2015 → 2019).
 */
export interface RegulationMigration {
  /** Source regulation ID */
  readonly fromRegulationId: string;
  /** Target regulation ID */
  readonly toRegulationId: string;
  /** Grade equivalency mapping (old grade → new grade) */
  readonly gradeMapping?: ReadonlyMap<string, string>;
  /** Whether CGPA is recalculated under the new regulation */
  readonly recalculatesCgpa: boolean;
  /** Additional notes about the migration */
  readonly notes?: string;
}
