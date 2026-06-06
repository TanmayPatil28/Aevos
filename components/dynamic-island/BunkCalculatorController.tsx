"use client";

import { useEffect, useRef, useMemo } from "react";
import { useUSMStore, CourseState } from "@/stores/usmStore";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";

export interface BunkStats {
  id: string;
  name: string;
  total: number;
  bunked: number;
  percentage: number;
  bunksRemaining: number;
  risk: "SAFE" | "WARNING" | "CRITICAL";
}

export default function BunkCalculatorController() {
  const courses = useUSMStore((s) => s.courses);
  const { addActivity, removeActivity } = useDynamicIslandStore();

  const prevRiskiestRef = useRef<string | null>(null);

  // Compute bunk stats for all courses
  const bunkData = useMemo(() => {
    if (!courses || courses.length === 0) return null;

    const stats: BunkStats[] = courses
      .filter((c) => c.attendanceTotal > 0)
      .map((c) => {
        const attended = Math.max(0, c.attendanceTotal - c.attendanceBunked);
        const percentage = (attended / c.attendanceTotal) * 100;
        
        // bunksRemaining = floor((total - bunked - 0.75 * total) / 0.75)  -- wait, 
        // Formula for safe bunks:
        // current_attended = total - bunked
        // Let x be the number of future bunks (classes missed without attending any).
        // (attended) / (total + x) >= 0.75
        // attended >= 0.75 * total + 0.75x
        // 0.75x <= attended - 0.75*total
        // x <= (attended - 0.75*total) / 0.75
        
        const safeBunks = Math.floor((attended - 0.75 * c.attendanceTotal) / 0.75);
        const actualRemaining = Math.max(0, safeBunks); // Cannot be negative if already below 75%
        
        // If they are already below 75%, how many do they need to attend?
        // (attended + y) / (total + y) >= 0.75
        // attended + y >= 0.75*total + 0.75*y
        // 0.25*y >= 0.75*total - attended
        // y = 4 * (0.75*total - attended)
        
        let risk: "SAFE" | "WARNING" | "CRITICAL" = "SAFE";
        if (percentage < 75) risk = "CRITICAL";
        else if (percentage < 80) risk = "WARNING";

        return {
          id: c.id,
          name: c.name || c.code || "Unknown",
          total: c.attendanceTotal,
          bunked: c.attendanceBunked,
          percentage,
          bunksRemaining: safeBunks, // Can be negative indicating deficit
          risk
        };
      })
      .sort((a, b) => {
         // Sort by percentage lowest first, then bunksRemaining
         if (a.percentage !== b.percentage) return a.percentage - b.percentage;
         return a.bunksRemaining - b.bunksRemaining;
      });

    return stats.length > 0 ? stats : null;
  }, [courses]);

  useEffect(() => {
    if (!bunkData) {
      removeActivity('bunk-calculator');
      prevRiskiestRef.current = null;
      return;
    }

    const riskiest = bunkData[0];
    
    // Check if it's the exact same state as before to avoid unnecessary state updates
    const stateHash = `${riskiest.id}-${riskiest.bunksRemaining}-${riskiest.percentage}`;
    if (prevRiskiestRef.current === stateHash) return;
    prevRiskiestRef.current = stateHash;

    addActivity({
      id: 'bunk-calculator',
      type: 'bunk_calculator',
      title: riskiest.name,
      subtitle: riskiest.bunksRemaining < 0 
        ? 'Critical Deficit' 
        : riskiest.bunksRemaining === 0 
          ? 'Last safe bunk used' 
          : `${riskiest.bunksRemaining} bunks left`,
      isActive: true,
      isContextual: true,
      metadata: {
        riskiest,
        allStats: bunkData
      }
    });

  }, [bunkData, addActivity, removeActivity]);

  return null;
}
