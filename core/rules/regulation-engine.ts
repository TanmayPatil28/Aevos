/**
 * core/rules/regulation-engine.ts
 *
 * Regulation versioning and binding engine.
 *
 * INVARIANT: A student's regulation binding is IMMUTABLE after initial set.
 *
 * This engine:
 * 1. Binds students to their admission-year regulation
 * 2. Resolves the active regulation for a university + year combo
 * 3. Supports regulation migration paths (rare, university-initiated)
 *
 * Pure computation — all state persistence is handled by the caller.
 */

import type {
  RegulationPattern,
  RegulationBinding,
  RegulationResolution,
  RegulationMigration,
} from '../types';

// ─── Regulation Registry ────────────────────────────────────────────────────

const REGULATION_REGISTRY: RegulationPattern[] = [
  // SPPU
  {
    id: 'sppu-2015',
    university: 'sppu',
    universityShortName: 'SPPU',
    regulationYear: 2015,
    activeFrom: new Date('2015-06-01'),
    activeTo: new Date('2019-05-31'),
    displayLabel: '2015 Pattern',
    isCurrent: false,
  },
  {
    id: 'sppu-2019',
    university: 'sppu',
    universityShortName: 'SPPU',
    regulationYear: 2019,
    activeFrom: new Date('2019-06-01'),
    activeTo: new Date('2024-05-31'),
    displayLabel: '2019 Pattern',
    isCurrent: false,
  },
  {
    id: 'sppu-2024',
    university: 'sppu',
    universityShortName: 'SPPU',
    regulationYear: 2024,
    activeFrom: new Date('2024-06-01'),
    displayLabel: '2024 Pattern (NEP)',
    isCurrent: true,
  },
  // VTU
  {
    id: 'vtu-2018',
    university: 'vtu',
    universityShortName: 'VTU',
    regulationYear: 2018,
    activeFrom: new Date('2018-06-01'),
    activeTo: new Date('2022-05-31'),
    displayLabel: '2018 Scheme',
    isCurrent: false,
  },
  {
    id: 'vtu-2022',
    university: 'vtu',
    universityShortName: 'VTU',
    regulationYear: 2022,
    activeFrom: new Date('2022-06-01'),
    displayLabel: '2022 Scheme',
    isCurrent: true,
  },
  // Anna University
  {
    id: 'au-r2017',
    university: 'au',
    universityShortName: 'Anna',
    regulationYear: 2017,
    activeFrom: new Date('2017-06-01'),
    activeTo: new Date('2021-05-31'),
    displayLabel: 'Regulation 2017',
    isCurrent: false,
  },
  {
    id: 'au-r2021',
    university: 'au',
    universityShortName: 'Anna',
    regulationYear: 2021,
    activeFrom: new Date('2021-06-01'),
    displayLabel: 'Regulation 2021',
    isCurrent: true,
  },
  // Mumbai University
  {
    id: 'mu-2019',
    university: 'mu',
    universityShortName: 'MU',
    regulationYear: 2019,
    activeFrom: new Date('2019-06-01'),
    displayLabel: 'Rev 2019',
    isCurrent: true,
  },
];

// ─── Regulation Engine ──────────────────────────────────────────────────────

export class RegulationEngine {
  /**
   * Creates an immutable binding between a student and their regulation.
   *
   * @param userId - Student user ID
   * @param universityId - University identifier
   * @param admissionYear - Year of admission
   * @returns The regulation binding
   */
  static bind(userId: string, universityId: string, admissionYear: number): RegulationBinding {
    const regulation = RegulationEngine.findByAdmissionYear(universityId, admissionYear);

    return {
      userId,
      universityId,
      regulationYear: regulation?.regulationYear ?? admissionYear,
      pattern: regulation?.id ?? `${universityId}-${admissionYear}`,
      boundAt: new Date(),
      isLocked: true,
    };
  }

  /**
   * Resolves the applicable regulation for a student.
   * Priority: explicit binding → admission year lookup → current default
   */
  static resolve(
    universityId: string,
    binding?: RegulationBinding,
    admissionYear?: number
  ): RegulationResolution {
    // 1. Explicit binding (highest priority)
    if (binding) {
      const reg = REGULATION_REGISTRY.find((r) => r.id === binding.pattern);
      if (reg) {
        return {
          regulation: reg,
          source: 'binding',
          hasExplicitBinding: true,
        };
      }
    }

    // 2. Admission year lookup
    if (admissionYear) {
      const reg = RegulationEngine.findByAdmissionYear(universityId, admissionYear);
      if (reg) {
        return {
          regulation: reg,
          source: 'admission-year-lookup',
          hasExplicitBinding: false,
        };
      }
    }

    // 3. Fallback to current regulation
    const current = REGULATION_REGISTRY.find((r) => r.university === universityId && r.isCurrent);

    if (current) {
      return {
        regulation: current,
        source: 'default-current',
        hasExplicitBinding: false,
      };
    }

    // 4. Absolute fallback — construct a synthetic regulation
    return {
      regulation: {
        id: `${universityId}-unknown`,
        university: universityId,
        universityShortName: universityId.toUpperCase(),
        regulationYear: new Date().getFullYear(),
        activeFrom: new Date(),
        displayLabel: 'Unknown Regulation',
        isCurrent: true,
      },
      source: 'default-current',
      hasExplicitBinding: false,
    };
  }

  /**
   * Lists all regulations for a university.
   */
  static listRegulations(universityId: string): readonly RegulationPattern[] {
    return REGULATION_REGISTRY.filter((r) => r.university === universityId);
  }

  /**
   * Returns the currently active regulation for new admissions.
   */
  static getCurrentRegulation(universityId: string): RegulationPattern | null {
    return REGULATION_REGISTRY.find((r) => r.university === universityId && r.isCurrent) ?? null;
  }

  /**
   * Validates a potential regulation migration.
   * Returns null if migration is not possible.
   */
  static validateMigration(migration: RegulationMigration): { valid: boolean; reason: string } {
    const from = REGULATION_REGISTRY.find((r) => r.id === migration.fromRegulationId);
    const to = REGULATION_REGISTRY.find((r) => r.id === migration.toRegulationId);

    if (!from)
      return { valid: false, reason: `Source regulation ${migration.fromRegulationId} not found` };
    if (!to)
      return { valid: false, reason: `Target regulation ${migration.toRegulationId} not found` };
    if (from.university !== to.university)
      return { valid: false, reason: 'Cannot migrate across universities' };
    if (to.regulationYear <= from.regulationYear)
      return { valid: false, reason: 'Cannot migrate to an older regulation' };

    return { valid: true, reason: 'Migration path is valid' };
  }

  /**
   * Registers a new regulation pattern at runtime.
   * Used when loading presets dynamically.
   */
  static registerRegulation(pattern: RegulationPattern): void {
    const existing = REGULATION_REGISTRY.findIndex((r) => r.id === pattern.id);
    if (existing >= 0) {
      REGULATION_REGISTRY[existing] = pattern;
    } else {
      REGULATION_REGISTRY.push(pattern);
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private static findByAdmissionYear(
    universityId: string,
    admissionYear: number
  ): RegulationPattern | undefined {
    const admissionDate = new Date(`${admissionYear}-06-01`);

    return REGULATION_REGISTRY.find(
      (r) =>
        r.university === universityId &&
        r.activeFrom <= admissionDate &&
        (!r.activeTo || r.activeTo >= admissionDate)
    );
  }
}
