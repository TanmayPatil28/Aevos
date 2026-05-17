/**
 * core/types/capabilities.ts
 *
 * Runtime university capability detection types.
 *
 * Not every university supports every feature. The capability system
 * allows dynamic UX rendering and conditional engine activation.
 *
 * Example: If a university doesn't support relative grading,
 * the z-score engine is never invoked, and the UI hides
 * statistical grading widgets.
 */

// ─── University Capabilities ────────────────────────────────────────────────

export interface UniversityCapabilities {
  /** Whether the university uses relative/statistical grading */
  readonly supportsRelativeGrading: boolean;
  /** Whether audit courses (0-credit, mandatory) exist */
  readonly supportsAuditCourses: boolean;
  /** Whether credits can be transferred from NPTEL/SWAYAM/MOOC */
  readonly supportsCreditTransfer: boolean;
  /** Whether ERP sync is available */
  readonly supportsErpSync: boolean;
  /** Whether we have enough data for predictive analytics */
  readonly supportsPredictiveAnalytics: boolean;
  /** Whether grade replacement (retake best-of) is allowed */
  readonly supportsGradeReplacement: boolean;
  /** Whether the university uses units instead of credits */
  readonly supportsUnitSystem: boolean;
  /** Whether dynamic (regulation-specific) pass criteria exist */
  readonly supportsDynamicPassCriteria: boolean;
  /** Whether improvement exams are offered */
  readonly supportsImprovementExams: boolean;
  /** Whether grace marks are applied */
  readonly supportsGraceMarks: boolean;
  /** Whether NEP 2020 exit points are applicable */
  readonly supportsNepExitPoints: boolean;
}

// ─── Academic Metadata ──────────────────────────────────────────────────────

export type GradingComplexity = 'simple' | 'moderate' | 'advanced' | 'statistical';

export interface AcademicMetadata {
  /** Complexity of the grading system */
  readonly gradingComplexity: GradingComplexity;
  /** Whether OCR import of marksheets is supported */
  readonly supportsOCRImport: boolean;
  /** Whether ERP import is supported */
  readonly supportsERPSync: boolean;
  /** Whether real-time analytics are available */
  readonly supportsRealtimeAnalytics: boolean;
  /** Data quality score (0-100) for preset completeness */
  readonly presetQualityScore: number;
}

// ─── Capability Detection Helpers ───────────────────────────────────────────

/**
 * Determines which UI components and engines should be activated
 * based on the university's capability profile.
 */
export interface CapabilityGatedFeatures {
  /** Show relative grading widget in calculator */
  readonly showRelativeGradingWidget: boolean;
  /** Show credit transfer section in planner */
  readonly showCreditTransferSection: boolean;
  /** Enable "Auto-Populate from ERP" button */
  readonly enableErpSync: boolean;
  /** Show SGPA forecast widget on dashboard */
  readonly showPredictiveWidgets: boolean;
  /** Show NEP exit point progress tracker */
  readonly showNepProgressTracker: boolean;
  /** Show grade replacement option in calculator */
  readonly showGradeReplacementOption: boolean;
  /** Show grace marks toggle in settings */
  readonly showGraceMarksToggle: boolean;
}

/**
 * Derives which features should be shown/enabled based on capabilities.
 * Pure function — no side effects.
 */
export function deriveGatedFeatures(caps: UniversityCapabilities): CapabilityGatedFeatures {
  return {
    showRelativeGradingWidget: caps.supportsRelativeGrading,
    showCreditTransferSection: caps.supportsCreditTransfer,
    enableErpSync: caps.supportsErpSync,
    showPredictiveWidgets: caps.supportsPredictiveAnalytics,
    showNepProgressTracker: caps.supportsNepExitPoints,
    showGradeReplacementOption: caps.supportsGradeReplacement,
    showGraceMarksToggle: caps.supportsGraceMarks,
  };
}
