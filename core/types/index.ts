/**
 * core/types/index.ts
 *
 * Barrel export for the entire canonical type system.
 *
 * Consumers should import from '@/core/types' for all domain types.
 * This provides a single, stable entry point for the type system
 * across the Academic Intelligence Infrastructure.
 */

// ─── Academic Domain ────────────────────────────────────────────────────────
export type {
  SubjectType,
  CreditTransferSource,
  SubjectPreset,
  SemesterPreset,
  BranchPreset,
  UniversityType,
  AcademicConfig,
  NepExitCertification,
} from './academic';

// ─── Assessment Engine ──────────────────────────────────────────────────────
export type {
  AssessmentComponentType,
  AssessmentComponent,
  AssessmentPattern,
  AssessmentResolution,
  InternalMarkSimulation,
} from './assessment';

// ─── Academic Domain Taxonomy ───────────────────────────────────────────────
export type { AcademicDomainName, AcademicDomain, DomainClassification } from './domain';
export { ACADEMIC_DOMAINS } from './domain';

// ─── Grading Systems ────────────────────────────────────────────────────────
export type {
  GradingSystemType,
  CreditType,
  GradeRule,
  PassCriteria,
  GradingSystemConfig,
  GradingResult,
} from './grading';

// ─── Regulation Versioning ──────────────────────────────────────────────────
export type {
  RegulationPattern,
  RegulationBinding,
  RegulationResolution,
  RegulationMigration,
} from './regulation';

// ─── Graduation & NEP ───────────────────────────────────────────────────────
export type {
  ExitPointType,
  ExitPoint,
  GraduationDependency,
  GraduationAuditResult,
} from './graduation';
export { NEP_EXIT_POINTS } from './graduation';

// ─── Student Feature Vectors ────────────────────────────────────────────────
export type {
  StudentFeatureVector,
  FeatureSnapshot,
  FeatureNormalizationConfig,
} from './feature-vector';
export { DEFAULT_NORMALIZATION } from './feature-vector';

// ─── Academic Events ────────────────────────────────────────────────────────
export type {
  AcademicEventType,
  GradeUpdatedPayload,
  BacklogClearedPayload,
  SemesterFinalizedPayload,
  RegulationChangedPayload,
  AcademicEventPayloadMap,
  AcademicEvent,
  AcademicEventHandler,
} from './events';

// ─── ERP Interoperability ───────────────────────────────────────────────────
export type { ERPSyncMethod, ERPProvider, SyncDataType, SyncRequest, SyncResult } from './erp';
export { ERP_PROVIDERS } from './erp';

// ─── ML Infrastructure ──────────────────────────────────────────────────────
export type {
  ModelType,
  PredictionInput,
  PredictionOutput,
  PredictionExplanation,
  PredictionModel,
  ModelRegistryEntry,
  InferenceClientConfig,
} from './ml';

// ─── Capabilities & Metadata ────────────────────────────────────────────────
export type {
  UniversityCapabilities,
  GradingComplexity,
  AcademicMetadata,
  CapabilityGatedFeatures,
} from './capabilities';
export { deriveGatedFeatures } from './capabilities';

// ─── Academic Rules ─────────────────────────────────────────────────────────
export type {
  RuleCategory,
  RuleDefinition,
  RuleEvaluationInput,
  RuleEvaluationResult,
  ModificationType,
  RuleModification,
  GraceMarksConfig,
  ATKTModel,
  ATKTConfig,
  PromotionDecision,
} from './rules';

// ─── Parsing Infrastructure ─────────────────────────────────────────────────
export type {
  DocumentType,
  ParsedDocument,
  ParsedAcademicData,
  ParsedSubject,
  ParsedSemester,
  ParsedAssessment,
  ParsedStudentResult,
  SubjectCodePattern,
  OCRProvider,
  ParserPipelineConfig,
} from './parsing';

// ─── API & Integration ──────────────────────────────────────────────────────
export type { ExplainabilityMetadata, ApiResponseMetadata, IntelligenceApiResponse } from './api';
