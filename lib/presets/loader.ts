import { UniversityPreset, PresetIdentifier } from './types';
import { FormulaEngine } from './formula-engine';

export class PresetLoader {
  private static instance: PresetLoader;
  private registry: Map<string, unknown> = new Map();

  private constructor() {}

  static getInstance(): PresetLoader {
    if (!PresetLoader.instance) {
      PresetLoader.instance = new PresetLoader();
    }
    return PresetLoader.instance;
  }

  /**
   * Loads a complete university preset based on identifiers
   */
  async loadPreset(id: PresetIdentifier): Promise<UniversityPreset | null> {
    try {
      // In a real production app, this would be a dynamic import or an API call
      // For this implementation, we'll simulate the lookup

      const { state, universityId, pattern } = id;

      // Alias Map for affiliated colleges
      const aliasMap: Record<string, string> = {
        scoe: 'sppu',
        pccoe: 'sppu', // Fallback if no specific pccoe preset
        mitwpu: 'sppu', // Fallback
        dypiu: 'sppu', // Fallback
      };

      const resolvedUniId = aliasMap[universityId] || universityId;

      const stateMap: Record<string, string> = {
        vtu: 'karnataka',
        mahe: 'karnataka',
        au: 'tamil-nadu',
        srm: 'tamil-nadu',
        'vit-vellore': 'tamil-nadu',
        jntuh: 'telangana',
        dtu: 'delhi',
        nsut: 'delhi',
        'nit-council': 'national',
        'bits-pilani': 'national',
        sppu: 'maharashtra',
        mu: 'maharashtra',
        coep: 'maharashtra',
        'jspm-rscoe': 'maharashtra',
      };

      let activeState = state?.toLowerCase() || stateMap[resolvedUniId];

      if (!activeState) {
        activeState = 'maharashtra'; // Default for unidentified
      }

      // Normalize pattern (e.g. "SPPU 2019" -> "2019", "NEP 2023" -> "2023")
      const normalizedPattern = pattern
        ? pattern
            .replace(/^[A-Z-]+\s+/, '')
            .toLowerCase()
            .trim()
        : '';

      try {
        const metadataModule = await import(
          `./${activeState}/${resolvedUniId}/${normalizedPattern ? normalizedPattern + '/' : ''}metadata.json`
        );
        const preset = metadataModule.default as UniversityPreset;

        // Inject capabilities at runtime
        preset.capabilities = FormulaEngine.getCapabilities(preset);

        // Load subjects if branch and semester are provided
        if (id.branchId) {
          try {
            const subjectsModule = await import(
              `./${activeState}/${resolvedUniId}/${normalizedPattern ? normalizedPattern + '/' : ''}${id.branchId}/subjects.json`
            );
            preset.branches = [
              {
                id: id.branchId,
                name: id.branchId
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' '),
                subjects:
                  subjectsModule.default.find(
                    (s: { semester: number }) => s.semester === id.semester
                  )?.subjects || [],
              },
            ];
          } catch {
            console.warn(`Subjects not found for ${id.branchId} in ${universityId}`);
            preset.branches = [{ id: id.branchId, name: id.branchId, subjects: [] }];
          }
        }

        return preset;
      } catch (error) {
        console.error(`Failed to load preset: ${universityId} in ${activeState}`, error);
        throw new Error(`Preset not found for ${universityId} in ${activeState}`);
      }
    } catch (error) {
      console.error('Failed to load preset:', error);
      return null;
    }
  }

  /**
   * Validates if a preset is production-ready
   */
  validatePreset(preset: UniversityPreset): boolean {
    if (!preset.university || !preset.gradingSystem) return false;
    if (!preset.gradingSystem.sgpaFormula) return false;
    if (preset.semesters <= 0) return false;
    return true;
  }
}

export const presetLoader = PresetLoader.getInstance();
