"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUSMStore } from "@/stores/usmStore";

/**
 * AcademicHydrationBoundary — Non-Blocking Version
 * 
 * Renders children IMMEDIATELY. Hydrates academic state silently
 * in the background once the user is authenticated.
 * No boot sequence. No blocking. No artificial delays.
 */
export function AcademicHydrationBoundary({ children }: { children: React.ReactNode }) {
  const store = useUSMStore();
  const hasAttemptedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !hasAttemptedRef.current) {
        hasAttemptedRef.current = true;

      const hydrateAcademics = async () => {
        try {
          const response = await fetch("/api/academic/snapshots?activeOnly=true");

          if (response.ok) {
            const data = await response.json();
            if (data.snapshot) {
              store.hydrateFromSnapshot(data.snapshot);
              console.log("[Hydration] Silently hydrated from snapshot:", data.snapshot.id);
            }
          }
        } catch (error) {
          console.error("[Hydration] Background hydration error:", error);
        }
      };

      hydrateAcademics();
      }
    });
  }, [supabase.auth, store]);

  // Always render children immediately — never block the UI
  return <>{children}</>;
}
