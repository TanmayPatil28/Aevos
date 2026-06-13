// @ts-nocheck
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useUSMStore, TimetableEntry, CourseState } from "@/stores/usmStore";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function getCourseName(courseId: string, courses: CourseState[]): string {
  const course = courses.find(c => c.id === courseId);
  return course?.name || course?.code || courseId;
}

interface ClassInfo {
  entry: TimetableEntry;
  courseName: string;
  startsInMinutes: number;
  endsInMinutes: number;
  timeRemainingSeconds: number;
}

export default function SmartTimetableController() {
  const timetable = useUSMStore((s) => s.timetable);
  const courses = useUSMStore((s) => s.courses);
  const { addActivity, removeActivity } = useDynamicIslandStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const computeAndPush = useCallback(() => {
    const now = new Date();
    const dayKey = DAYS[now.getDay()];
    const todayEntries = timetable[dayKey] || [];

    if (todayEntries.length === 0) {
      removeActivity('smart-timetable');
      return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find current class (if we're inside one)
    let currentClass: ClassInfo | null = null;
    let nextClass: ClassInfo | null = null;

    const sorted = [...todayEntries].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    for (const entry of sorted) {
      const start = timeToMinutes(entry.startTime);
      const end = timeToMinutes(entry.endTime);
      const courseName = getCourseName(entry.courseId, courses);

      if (currentMinutes >= start && currentMinutes < end) {
        // We're inside this class
        const endTimeDate = new Date();
        endTimeDate.setHours(Math.floor(end / 60), end % 60, 0, 0);

        currentClass = {
          entry,
          courseName,
          startsInMinutes: start,
          endsInMinutes: end,
          timeRemainingSeconds: (end - currentMinutes) * 60,
          endTimeMs: endTimeDate.getTime(),
        };
      } else if (currentMinutes < start && !nextClass) {
        // First upcoming class
        const startTimeDate = new Date();
        startTimeDate.setHours(Math.floor(start / 60), start % 60, 0, 0);

        nextClass = {
          entry,
          courseName,
          startsInMinutes: start,
          endsInMinutes: end,
          timeRemainingSeconds: (start - currentMinutes) * 60,
          endTimeMs: startTimeDate.getTime(),
        };
      }
    }

    if (currentClass) {
      // We're in a class right now
      addActivity({
        id: 'smart-timetable',
        type: 'schedule',
        title: currentClass.courseName,
        subtitle: currentClass.entry.room
          ? `Room ${currentClass.entry.room}`
          : undefined,
        timeRemaining: currentClass.timeRemainingSeconds,
        isActive: true,
        isContextual: true,
        metadata: {
          totalTime: (currentClass.endsInMinutes - currentClass.startsInMinutes) * 60,
          nextClass: nextClass?.courseName || undefined,
          faculty: currentClass.entry.faculty,
          type: currentClass.entry.type,
          endTime: (currentClass as any).endTimeMs,
        },
      });
    } else if (nextClass) {
      // No current class, but there's a next one
      addActivity({
        id: 'smart-timetable',
        type: 'schedule',
        title: `Next: ${nextClass.courseName}`,
        subtitle: nextClass.entry.room
          ? `Room ${nextClass.entry.room}`
          : undefined,
        timeRemaining: nextClass.timeRemainingSeconds,
        isActive: true,
        isContextual: true,
        metadata: {
          totalTime: nextClass.timeRemainingSeconds, // countdown to start
          faculty: nextClass.entry.faculty,
          type: nextClass.entry.type,
          endTime: (nextClass as any).endTimeMs,
        },
      });
    } else {
      // All classes done for today
      removeActivity('smart-timetable');
    }
  }, [timetable, courses, addActivity, removeActivity]);

  useEffect(() => {
    // Initial compute
    computeAndPush();

    // Update every 60 seconds
    intervalRef.current = setInterval(computeAndPush, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      removeActivity('smart-timetable');
    };
  }, [computeAndPush, removeActivity]);

  return null;
}
