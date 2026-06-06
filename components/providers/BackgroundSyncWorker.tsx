"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUSMStore } from "@/stores/usmStore";
import { useNetworkState } from "@/lib/hooks/useNetworkState";

export function BackgroundSyncWorker() {
  const { status } = useSession();
  const isOnline = useNetworkState();
  const pendingActions = useUSMStore((state) => state.sync.pendingSyncActions);
  const removeSyncActions = useUSMStore((state) => state.removeSyncActions);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !isOnline || pendingActions.length === 0 || isSyncingRef.current) {
      return;
    }

    const syncData = async () => {
      isSyncingRef.current = true;
      const actionsToSync = [...pendingActions];
      const actionIds = actionsToSync.map(a => a.id);

      try {
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actions: actionsToSync }),
        });

        if (response.ok) {
          console.log(`[Sync Worker] Successfully synced ${actionsToSync.length} actions.`);
          removeSyncActions(actionIds);
        } else {
          console.error("[Sync Worker] Sync failed with status", response.status);
        }
      } catch (error) {
        console.error("[Sync Worker] Network error during sync:", error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Debounce slightly to allow batching
    const timer = setTimeout(syncData, 2000);
    return () => clearTimeout(timer);
  }, [status, isOnline, pendingActions, removeSyncActions]);

  return null;
}
