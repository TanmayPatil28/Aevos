"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA, selectActiveCourses } from "@/stores/selectors/academic";

// --- TIME-OF-DAY CONTEXTS ---

interface TimeContext {
  id: string;
  type: 'time_context' | 'schedule' | 'academic_status';
  title: string;
  subtitle?: string;
  metadata?: Record<string, any>;
}

// --- CONTROLLER ---

export default function ContextualIslandController() {
  const pathname = usePathname();
  const { addActivity, removeActivity, isManualOverride } = useDynamicIslandStore();
  const store = useUSMStore();
  
  const hasData = store.identity.hasAuthoritativeData;
  const { cgpa } = selectDerivedGPA(store);
  const activeCourses = selectActiveCourses(store);

  const rotationIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pushContext = useCallback((ctx: TimeContext) => {
    addActivity({
      id: ctx.id,
      type: ctx.type as any,
      title: ctx.title,
      subtitle: ctx.subtitle,
      isActive: true,
      isContextual: true,
      metadata: ctx.metadata,
    });
  }, [addActivity]);

  const clearContexts = useCallback(() => {
    removeActivity('time-ctx-1');
    removeActivity('time-ctx-2');
    removeActivity('route-ctx');
  }, [removeActivity]);

  useEffect(() => {
    // Stop rotation during manual override
    if (isManualOverride) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    clearContexts();

    if (!hasData) {
      // If no data is available, do not show fake mock data! Show a generic status instead.
      const timer = setTimeout(() => {
        pushContext({ id: 'route-ctx', type: 'time_context', title: 'Awaiting Sync', metadata: { icon: 'sync' } });
      }, 400);
      return () => {
        clearTimeout(timer);
        clearContexts();
      };
    }

    // Determine Route-Specific Overrides First
    let routeOverride: TimeContext | null = null;
    switch (pathname) {
      case "/dashboard":
        routeOverride = { id: 'route-ctx', type: 'academic_status', title: `SGPA: ${cgpa.toFixed(2)}` };
        break;
      case "/placement":
        routeOverride = { id: 'route-ctx', type: 'academic_status', title: `CGPA: ${cgpa.toFixed(2)}` };
        break;
      case "/calculator":
        routeOverride = { id: 'route-ctx', type: 'academic_status', title: 'Live Calc Mode' };
        break;
      case "/attendance":
        // Calculate real attendance average
        const totalAtt = activeCourses.reduce((acc, c) => acc + (c.attendanceTotal || 0), 0);
        const bunked = activeCourses.reduce((acc, c) => acc + (c.attendanceBunked || 0), 0);
        const attPercent = totalAtt > 0 ? Math.round(((totalAtt - bunked) / totalAtt) * 100) : 100;
        routeOverride = { id: 'route-ctx', type: 'time_context', title: `Attendance: ${attPercent}%`, metadata: { icon: 'check' } };
        break;
      case "/forecast":
        routeOverride = { id: 'route-ctx', type: 'academic_status', title: 'Forecast Active' };
        break;
    }

    if (routeOverride) {
      // Route takes priority — push immediately, no rotation
      const timer = setTimeout(() => pushContext(routeOverride!), 400);
      return () => {
        clearTimeout(timer);
        clearContexts();
      };
    }

    // No route override — use time-of-day with ambient rotation based on real data
    const hour = new Date().getHours();
    let contexts: TimeContext[] = [];

    if (hour >= 6 && hour < 12) {
      const firstClass = activeCourses[0] ? activeCourses[0].name : "No classes";
      contexts = [
        { id: 'time-ctx-1', type: 'schedule', title: firstClass, subtitle: 'Upcoming', metadata: { totalTime: 3600 } },
        { id: 'time-ctx-2', type: 'time_context', title: `${activeCourses.length} classes active`, metadata: { icon: 'calendar' } },
      ];
    } else if (hour >= 12 && hour < 18) {
      const totalAtt = activeCourses.reduce((acc, c) => acc + (c.attendanceTotal || 0), 0);
      const bunked = activeCourses.reduce((acc, c) => acc + (c.attendanceBunked || 0), 0);
      const attPercent = totalAtt > 0 ? Math.round(((totalAtt - bunked) / totalAtt) * 100) : 100;
      contexts = [
        { id: 'time-ctx-1', type: 'academic_status', title: `Attendance: ${attPercent}%`, metadata: { icon: 'check' } },
      ];
    } else {
      contexts = [
        { id: 'time-ctx-1', type: 'academic_status', title: `CGPA: ${cgpa.toFixed(2)}`, metadata: { icon: 'trending' } },
      ];
    }

    if (contexts.length === 0) return;

    rotationIndexRef.current = 0;
    const initialTimer = setTimeout(() => {
      pushContext(contexts[0]);
    }, 400);

    // Set up rotation every 15 seconds
    intervalRef.current = setInterval(() => {
      rotationIndexRef.current = (rotationIndexRef.current + 1) % contexts.length;
      clearContexts();
      setTimeout(() => {
        pushContext(contexts[rotationIndexRef.current]);
      }, 200);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearContexts();
    };
  }, [pathname, isManualOverride, hasData, cgpa, activeCourses, pushContext, clearContexts]);

  return null;
}
