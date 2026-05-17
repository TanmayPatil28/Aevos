/**
 * core/erp/erp-registry.ts
 *
 * Registry and abstract adapter contract for ERP integration.
 */

import type { SyncRequest, SyncResult } from '../types';

export interface ERPAdapter {
  readonly providerId: string;

  /**
   * Initializes connection/session with the ERP.
   * For API-based providers, this might validate tokens.
   * For DOM-scraping providers (extension), this is a no-op on the server.
   */
  connect(credentialsOrToken: unknown): Promise<void>;

  /**
   * Executes the sync request.
   */
  sync(request: SyncRequest): Promise<SyncResult>;
}

export class ERPRegistry {
  private static adapters: Map<string, ERPAdapter> = new Map();

  static register(adapter: ERPAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  static getAdapter(providerId: string): ERPAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(
        `ERP Adapter for provider '${providerId}' not found. Ensure it is registered.`
      );
    }
    return adapter;
  }
}
