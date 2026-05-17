/**
 * core/erp/providers/samarth-adapter.ts
 *
 * Mock adapter for Samarth ERP.
 * Demonstrates how a specific provider implements the contract.
 */

import type { SyncRequest, SyncResult } from '../../types';
import type { ERPAdapter } from '../erp-registry';

export class SamarthAdapter implements ERPAdapter {
  readonly providerId = 'samarth';

  async connect(credentialsOrToken: unknown): Promise<void> {
    // In a real implementation, this would validate an API token or OAuth grant.
  }

  async sync(request: SyncRequest): Promise<SyncResult> {
    // Simulate API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      syncedTypes: request.dataTypes,
      failedTypes: [],
      recordCount: 15,
      summary: `Successfully synced ${request.dataTypes.join(', ')} from Samarth ERP.`,
      errors: [],
      syncedAt: new Date(),
    };
  }
}
