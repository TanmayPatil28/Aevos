/**
 * core/erp/index.ts — Barrel export for the ERP module.
 */
export { ERPRegistry } from './erp-registry';
export type { ERPAdapter } from './erp-registry';

export { SyncEngine } from './sync-engine';

// Providers
export { SamarthAdapter } from './providers/samarth-adapter';
