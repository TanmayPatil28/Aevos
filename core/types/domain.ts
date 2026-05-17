/**
 * core/types/domain.ts
 *
 * Academic domain taxonomy engine types.
 *
 * Engineering curricula across India follow recurring structural patterns:
 * - Semesters I-II:   Core Foundations (Mathematics, Physics, Basic CS)
 * - Semesters III-IV: Advanced Core (DSA, DBMS, OS, CN)
 * - Semesters V-VI:   AI & Emerging Tech / Specialization
 * - Semesters VII-VIII: Projects, Internships, Capstone
 *
 * This taxonomy enables:
 * - AI-powered difficulty prediction
 * - Curriculum analytics and gap analysis
 * - Automated semester generation
 * - Planner intelligence and recommendations
 */

// ─── Domain Classification ──────────────────────────────────────────────────

export type AcademicDomainName =
  | 'core-fundamentals'
  | 'advanced-core'
  | 'ai-emerging-tech'
  | 'data-security'
  | 'projects-internships'
  | 'humanities-management'
  | 'specialization-elective'
  | 'research-seminar';

export interface AcademicDomain {
  /** Unique domain identifier */
  readonly id: string;
  /** Domain classification name */
  readonly name: AcademicDomainName;
  /** Human-readable display label */
  readonly displayName: string;
  /** Semesters where this domain is typically concentrated */
  readonly recommendedSemesterRange: readonly number[];
  /** Average difficulty level (1-10 scale, empirically derived) */
  readonly avgDifficulty?: number;
  /** Typical credit load for subjects in this domain */
  readonly typicalCredits?: number;
  /** Tags for AI matching (e.g., ["dsa", "algorithms", "competitive-programming"]) */
  readonly tags?: readonly string[];
}

// ─── Predefined Domain Registry ─────────────────────────────────────────────

export const ACADEMIC_DOMAINS: readonly AcademicDomain[] = [
  {
    id: 'core-fund',
    name: 'core-fundamentals',
    displayName: 'Core Foundations',
    recommendedSemesterRange: [1, 2, 3],
    avgDifficulty: 5,
    typicalCredits: 4,
    tags: ['mathematics', 'physics', 'basic-programming', 'engineering-graphics'],
  },
  {
    id: 'adv-core',
    name: 'advanced-core',
    displayName: 'Advanced Core',
    recommendedSemesterRange: [3, 4, 5],
    avgDifficulty: 7,
    typicalCredits: 4,
    tags: ['dsa', 'dbms', 'operating-systems', 'computer-networks', 'theory-of-computation'],
  },
  {
    id: 'ai-emerging',
    name: 'ai-emerging-tech',
    displayName: 'AI & Emerging Technologies',
    recommendedSemesterRange: [5, 6, 7],
    avgDifficulty: 8,
    typicalCredits: 3,
    tags: ['machine-learning', 'deep-learning', 'nlp', 'cloud-computing', 'iot', 'blockchain'],
  },
  {
    id: 'data-sec',
    name: 'data-security',
    displayName: 'Data & Security',
    recommendedSemesterRange: [5, 6],
    avgDifficulty: 7,
    typicalCredits: 3,
    tags: ['cybersecurity', 'cryptography', 'data-mining', 'big-data', 'information-security'],
  },
  {
    id: 'proj-intern',
    name: 'projects-internships',
    displayName: 'Projects & Internships',
    recommendedSemesterRange: [7, 8],
    avgDifficulty: 6,
    typicalCredits: 6,
    tags: ['capstone', 'internship', 'mini-project', 'seminar', 'dissertation'],
  },
  {
    id: 'hum-mgmt',
    name: 'humanities-management',
    displayName: 'Humanities & Management',
    recommendedSemesterRange: [1, 2, 7, 8],
    avgDifficulty: 3,
    typicalCredits: 2,
    tags: [
      'communication',
      'economics',
      'management',
      'professional-ethics',
      'environmental-studies',
    ],
  },
  {
    id: 'spec-elec',
    name: 'specialization-elective',
    displayName: 'Specialization Electives',
    recommendedSemesterRange: [5, 6, 7],
    avgDifficulty: 7,
    typicalCredits: 3,
    tags: ['elective', 'open-elective', 'department-elective', 'professional-elective'],
  },
  {
    id: 'res-sem',
    name: 'research-seminar',
    displayName: 'Research & Seminars',
    recommendedSemesterRange: [6, 7, 8],
    avgDifficulty: 5,
    typicalCredits: 2,
    tags: ['seminar', 'paper-presentation', 'research-methodology', 'literature-survey'],
  },
] as const;

// ─── Domain Classifier ─────────────────────────────────────────────────────

/**
 * Classifies a subject into an academic domain based on its tags/name.
 * Used by AI recommendation and difficulty prediction engines.
 */
export interface DomainClassification {
  /** The matched domain */
  readonly domain: AcademicDomain;
  /** Confidence score (0.0 - 1.0) */
  readonly confidence: number;
  /** Matched tags that triggered the classification */
  readonly matchedTags: readonly string[];
}
