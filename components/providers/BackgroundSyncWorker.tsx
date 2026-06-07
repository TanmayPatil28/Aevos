"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUSMStore } from "@/stores/usmStore";
import { useNetworkState } from "@/lib/hooks/useNetworkState";

export function BackgroundSyncWorker() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();
  const isOnline = useNetworkState();
  const pendingActions = useUSMStore((state) => state.sync.pendingSyncActions);
  const removeSyncActions = useUSMStore((state) => state.removeSyncActions);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!session || !isOnline || pendingActions.length === 0 || isSyncingRef.current) {
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
  }, [session, isOnline, pendingActions, removeSyncActions]);

  return null;
}
