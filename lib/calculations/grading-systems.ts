export interface GradeScale {
  grade: string;
  minPercentage?: number;
  maxPercentage?: number;
  gradePoint: number;
  description?: string;
}

export interface GradingSystem {
  id: string;
  name: string;
  shortName: string;
  scale: GradeScale[];
  cgpaFormula: 'credit-weighted' | 'simple-average';
  maxGpa: number;
}

export const GRADING_SYSTEMS: Record<string, GradingSystem> = {
  'sppu-2019': {
    id: 'sppu-2019',
    name: 'Savitribai Phule Pune University (2019 Pattern)',
    shortName: 'SPPU',
    cgpaFormula: 'credit-weighted',
    maxGpa: 10,
    scale: [
      {
        grade: 'O',
        minPercentage: 90,
        maxPercentage: 100,
        gradePoint: 10,
        description: 'Outstanding',
      },
      {
        grade: 'A+',
        minPercentage: 80,
        maxPercentage: 89,
        gradePoint: 9,
        description: 'Excellent',
      },
      { grade: 'A', minPercentage: 70, maxPercentage: 79, gradePoint: 8, description: 'Very Good' },
      { grade: 'B+', minPercentage: 60, maxPercentage: 69, gradePoint: 7, description: 'Good' },
      {
        grade: 'B',
        minPercentage: 50,
        maxPercentage: 59,
        gradePoint: 6,
        description: 'Above Average',
      },
      { grade: 'C', minPercentage: 40, maxPercentage: 49, gradePoint: 5, description: 'Average' },
      { grade: 'F', minPercentage: 0, maxPercentage: 39, gradePoint: 0, description: 'Fail' },
    ],
  },
  'mumbai-uni': {
    id: 'mumbai-uni',
    name: 'Mumbai University (CBCS)',
    shortName: 'MU',
    cgpaFormula: 'credit-weighted',
    maxGpa: 10,
    scale: [
      { grade: 'O', minPercentage: 80, maxPercentage: 100, gradePoint: 10 },
      { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gradePoint: 9 },
      { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gradePoint: 8 },
      { grade: 'C', minPercentage: 55, maxPercentage: 59.99, gradePoint: 7 },
      { grade: 'D', minPercentage: 50, maxPercentage: 54.99, gradePoint: 6 },
      { grade: 'E', minPercentage: 45, maxPercentage: 49.99, gradePoint: 5 },
      { grade: 'P', minPercentage: 40, maxPercentage: 44.99, gradePoint: 4 },
      { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gradePoint: 0 },
    ],
  },
  'custom-10': {
    id: 'custom-10',
    name: 'Standard 10-Point Scale',
    shortName: '10-PT',
    cgpaFormula: 'credit-weighted',
    maxGpa: 10,
    scale: [
      { grade: 'A+', gradePoint: 10 },
      { grade: 'A', gradePoint: 9 },
      { grade: 'B+', gradePoint: 8 },
      { grade: 'B', gradePoint: 7 },
      { grade: 'C+', gradePoint: 6 },
      { grade: 'C', gradePoint: 5 },
      { grade: 'D', gradePoint: 4 },
      { grade: 'F', gradePoint: 0 },
    ],
  },
};

export function getGradingSystem(id: string): GradingSystem {
  return GRADING_SYSTEMS[id] || GRADING_SYSTEMS['custom-10'];
}
