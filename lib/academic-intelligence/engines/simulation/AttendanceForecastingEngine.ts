import { CourseState, TimetableState } from "@/stores/usmStore";
import { getStudentDayIndex } from "@/lib/dateUtils";

export interface AttendanceProjection {
  courseId: string;
  totalConducted: number;
  totalAttended: number;
  projectedConducted: number;
  projectedAttended: number;
  projectedPercentage: number;
  safeBunksRemaining: number;
  recoveryRequired: number;
  smartBunks: string[]; // Dates of recommended bunks (YYYY-MM-DD)
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export class AttendanceForecastingEngine {
  /**
   * Calculates the remaining classes for a given course based on the timetable
   * and the remaining days in the semester.
   */
  static calculateRemainingLectures(
    courseId: string,
    timetable: TimetableState,
    holidays: string[],
    startDate: Date,
    endDate: Date
  ): number {
    let count = 0;
    
    // Normalize dates
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      
      if (!holidays.includes(dateStr)) {
        const dayOfWeek = DAYS[current.getDay()];
        const classesOnDay = timetable[dayOfWeek] || [];
        const matches = classesOnDay.filter(c => c.courseId === courseId).length;
        count += matches;
      }
      
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Generates a smart bunk schedule by finding the "cheapest" days to bunk.
   * Prefer days with fewer total classes (so you get a day off) or days adjacent to weekends.
   */
  static generateSmartBunkSchedule(
    course: CourseState,
    timetable: TimetableState,
    holidays: string[],
    startDate: Date,
    endDate: Date,
    minAttendance: number,
    strategy: "SAFE" | "BALANCED" | "SURVIVAL" | "PLACEMENT_PREP" = "BALANCED"
  ): AttendanceProjection {
    
    let currentTotal = course.attendanceTotal || 0;
    let currentBunked = course.attendanceBunked || 0;
    let currentAttended = Math.max(0, currentTotal - currentBunked);
    
    const remainingClasses = this.calculateRemainingLectures(course.id, timetable, holidays, startDate, endDate);
    
    const projectedConducted = currentTotal + remainingClasses;
    // Assume attending all by default
    let projectedAttended = currentAttended + remainingClasses;
    
    // Calculate Safe Bunks
    let safeBunksRemaining = 0;
    let testAttended = projectedAttended;
    
    while (((testAttended - 1) / projectedConducted) * 100 >= minAttendance) {
      safeBunksRemaining++;
      testAttended--;
    }

    // Calculate Recovery Required if already failing
    let recoveryRequired = 0;
    if ((projectedAttended / projectedConducted) * 100 < minAttendance) {
      let tempAttended = currentAttended;
      let tempConducted = currentTotal;
      while ((tempAttended / tempConducted) * 100 < minAttendance) {
        tempAttended++;
        tempConducted++;
        recoveryRequired++;
      }
    }

    // Assign Smart Bunks
    const smartBunks: string[] = [];
    if (safeBunksRemaining > 0) {
      // Find all future occurrences of this class
      const occurrences: { date: Date; dateStr: string; totalClassesThatDay: number }[] = [];
      const current = new Date();
      current.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        if (!holidays.includes(dateStr)) {
          const dayOfWeek = DAYS[current.getDay()];
          const classesOnDay = timetable[dayOfWeek] || [];
          
          const hasCourse = classesOnDay.some(c => c.courseId === course.id);
          if (hasCourse) {
            occurrences.push({
              date: new Date(current),
              dateStr,
              totalClassesThatDay: classesOnDay.length
            });
          }
        }
        current.setDate(current.getDate() + 1);
      }

      // Sort occurrences based on Strategy Mode Heuristics
      occurrences.sort((a, b) => {
        if (strategy === "SURVIVAL") {
          // SURVIVAL: Instant rest. Prioritize dates that are closest to today.
          return a.date.getTime() - b.date.getTime();
        } 
        else if (strategy === "PLACEMENT_PREP") {
          // PLACEMENT_PREP: Maximize consecutive free time. Prioritize days with fewest classes.
          // If a day only has 1 class, bunking it clears the entire day for coding/prep.
          if (a.totalClassesThatDay !== b.totalClassesThatDay) {
            return a.totalClassesThatDay - b.totalClassesThatDay;
          }
          // Secondary: group them towards the end of the week
          return b.date.getDay() - a.date.getDay();
        }
        else if (strategy === "SAFE") {
          // SAFE: Highly conservative. Spread bunks out far into the future, and only on busy days
          // so you don't form bad habits of taking whole days off.
          if (a.totalClassesThatDay !== b.totalClassesThatDay) {
            return b.totalClassesThatDay - a.totalClassesThatDay; // Prefer busy days
          }
          return b.date.getTime() - a.date.getTime(); // Prefer later dates
        }
        else {
          // BALANCED (Default): Prefer Fridays (5) and Mondays (1) for long weekends
          const dayA = a.date.getDay();
          const dayB = b.date.getDay();
          const scoreA = (dayA === 1 || dayA === 5) ? 1 : 0;
          const scoreB = (dayB === 1 || dayB === 5) ? 1 : 0;
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          return a.totalClassesThatDay - b.totalClassesThatDay;
        }
      });

      // Take the top N safe bunks
      const numToSchedule = Math.min(safeBunksRemaining, occurrences.length);
      for (let i = 0; i < numToSchedule; i++) {
        smartBunks.push(occurrences[i].dateStr);
        projectedAttended--; // Actually take the bunk
      }
    }

    return {
      courseId: course.id,
      totalConducted: currentTotal,
      totalAttended: currentAttended,
      projectedConducted,
      projectedAttended,
      projectedPercentage: projectedConducted > 0 ? (projectedAttended / projectedConducted) * 100 : 0,
      safeBunksRemaining,
      recoveryRequired,
      smartBunks
    };
  }
}
