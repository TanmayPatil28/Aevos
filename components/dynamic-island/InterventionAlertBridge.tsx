"use client";

import { useEffect, useRef } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";

export default function InterventionAlertBridge() {
  const interventions = useUSMStore((s) => s.interventions);
  const showAlert = useDynamicIslandStore((s) => s.showAlert);
  
  // Track which interventions we've already alerted the user about
  const seenInterventionIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!interventions || interventions.length === 0) return;

    // Find new interventions that are actionable
    const newInterventions = interventions.filter(
      (inv) => inv.status === "ACTIVE" && !seenInterventionIds.current.has(inv.id)
    );

    newInterventions.forEach((inv) => {
      // Mark as seen
      seenInterventionIds.current.add(inv.id);

      // Map severity to alert type
      let alertType: 'info' | 'success' | 'warning' | 'error' = 'info';
      if (inv.severity === 'CRITICAL' || inv.severity === 'HIGH') {
        alertType = 'error';
      } else if (inv.severity === 'MEDIUM') {
        alertType = 'warning';
      }

      // Auto-push the alert to the island
      showAlert({
        id: inv.id,
        type: alertType,
        title: inv.title,
        message: inv.description,
        duration: inv.severity === 'CRITICAL' ? 8000 : 5000, // Longer for critical
      });
    });

  }, [interventions, showAlert]);

  return null;
}
