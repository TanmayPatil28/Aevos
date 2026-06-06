"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUSMStore } from "@/stores/usmStore";

/**
 * AcademicHydrationBoundary — Non-Blocking Version
 * 
 * Renders children IMMEDIATELY. Hydrates academic state silently
 * in the background once the user is authenticated.
 * No boot sequence. No blocking. No artificial delays.
 */
export function AcademicHydrationBoundary({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const store = useUSMStore();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt hydration once per mount when authenticated
    if (status === "authenticated" && !hasAttemptedRef.current) {
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
  }, [status, store]);

  // Always render children immediately — never block the UI
  return <>{children}</>;
}
