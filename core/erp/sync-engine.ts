/**
 * core/erp/sync-engine.ts
 *
 * Orchestrates ERP data synchronization.
 * Handles the high-level workflow: validation -> adapter execution -> event emission.
 */

import type { SyncRequest, SyncResult } from '../types';
import { ERPRegistry } from './erp-registry';
// import { eventBus } from '../events/event-bus';

export class SyncEngine {
  /**
   * Executes a synchronization request.
   */
  static async execute(request: SyncRequest): Promise<SyncResult> {
    const adapter = ERPRegistry.getAdapter(request.provider);

    try {
      // 1. Adapter execution
      const result = await adapter.sync(request);

      // 2. Event Emission
      // If results were synced, we emit events to trigger recalculations.
      // Example:
      // if (result.syncedTypes.includes('results')) {
      //   eventBus.dispatch({ type: 'grade-updated', ... });
      // }

      return result;
    } catch (error: any) {
      return {
        success: false,
        syncedTypes: [],
        failedTypes: request.dataTypes,
        recordCount: 0,
        summary: `Sync failed: ${error.message}`,
        errors: [error.message],
        syncedAt: new Date(),
      };
    }
  }
}
