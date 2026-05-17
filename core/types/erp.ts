/**
 * core/types/erp.ts
 *
 * ERP interoperability types.
 *
 * Indian universities use heterogeneous ERP systems:
 * - Samarth ERP (central/state universities)
 * - Digicampus (JSPM group, many Maharashtra colleges)
 * - Moodle (LMS-only, no grade management)
 * - ERPNext (open-source, some autonomous colleges)
 * - Custom portals (SPPU, VTU, Anna University student portals)
 *
 * The system must detect provider capabilities at runtime
 * and adapt its sync strategy accordingly.
 *
 * IMPORTANT: All sync operations are consent-based.
 * No credential scraping. No auth bypass.
 */

// ─── ERP Provider Definition ────────────────────────────────────────────────

export type ERPSyncMethod = 'api' | 'dom-scraping' | 'file-upload' | 'manual';

export interface ERPProvider {
  /** Provider identifier */
  readonly name: string;
  /** Human-readable display name */
  readonly displayName: string;
  /** Whether this provider exposes a documented API */
  readonly supportsAPI: boolean;
  /** Whether data can be extracted from DOM (browser extension) */
  readonly supportsDOMSync: boolean;
  /** Whether attendance data is available */
  readonly supportsAttendance: boolean;
  /** Whether exam results are available */
  readonly supportsResults: boolean;
  /** Whether internal/continuous assessment marks are available */
  readonly supportsInternals: boolean;
  /** Whether exam schedules are available */
  readonly supportsExamSchedules: boolean;
  /** Whether student profile data is available */
  readonly supportsProfileSync: boolean;
  /** Base URL pattern for the ERP portal (if known) */
  readonly portalUrlPattern?: string;
  /** Preferred sync method */
  readonly preferredSyncMethod: ERPSyncMethod;
}

// ─── Predefined ERP Registry ────────────────────────────────────────────────

export const ERP_PROVIDERS: readonly ERPProvider[] = [
  {
    name: 'samarth',
    displayName: 'Samarth ERP',
    supportsAPI: true,
    supportsDOMSync: true,
    supportsAttendance: true,
    supportsResults: true,
    supportsInternals: false,
    supportsExamSchedules: true,
    supportsProfileSync: true,
    portalUrlPattern: '*.samarth.ac.in',
    preferredSyncMethod: 'api',
  },
  {
    name: 'digicampus',
    displayName: 'Digicampus',
    supportsAPI: false,
    supportsDOMSync: true,
    supportsAttendance: true,
    supportsResults: true,
    supportsInternals: true,
    supportsExamSchedules: false,
    supportsProfileSync: true,
    portalUrlPattern: '*.digicampus.*',
    preferredSyncMethod: 'dom-scraping',
  },
  {
    name: 'moodle',
    displayName: 'Moodle LMS',
    supportsAPI: true,
    supportsDOMSync: true,
    supportsAttendance: false,
    supportsResults: false,
    supportsInternals: true,
    supportsExamSchedules: false,
    supportsProfileSync: true,
    portalUrlPattern: '*/moodle/*',
    preferredSyncMethod: 'api',
  },
  {
    name: 'erpnext',
    displayName: 'ERPNext',
    supportsAPI: true,
    supportsDOMSync: false,
    supportsAttendance: true,
    supportsResults: true,
    supportsInternals: true,
    supportsExamSchedules: true,
    supportsProfileSync: true,
    preferredSyncMethod: 'api',
  },
] as const;

// ─── Sync Operation Types ───────────────────────────────────────────────────

export type SyncDataType = 'attendance' | 'results' | 'internals' | 'profile' | 'exam-schedule';

export interface SyncRequest {
  /** ERP provider to sync from */
  readonly provider: string;
  /** Data types requested */
  readonly dataTypes: readonly SyncDataType[];
  /** Semester to sync (if applicable) */
  readonly semester?: number;
  /** User consent timestamp */
  readonly consentTimestamp: Date;
}

export interface SyncResult {
  /** Whether the sync was successful */
  readonly success: boolean;
  /** Data types that were successfully synced */
  readonly syncedTypes: readonly SyncDataType[];
  /** Data types that failed */
  readonly failedTypes: readonly SyncDataType[];
  /** Number of records imported */
  readonly recordCount: number;
  /** Human-readable sync summary */
  readonly summary: string;
  /** Any errors encountered */
  readonly errors: readonly string[];
  /** Timestamp of the sync */
  readonly syncedAt: Date;
}
