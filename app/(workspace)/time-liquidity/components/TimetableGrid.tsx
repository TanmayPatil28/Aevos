"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassCard } from "./ClassCard";

interface TimetableGridProps {
  timeSlots: string[];
  isCurrentlyEmpty: boolean;
  activeDays: string[];
  activeDisplayDays: string[];
  timetable: Record<string, any[]>;
  courses: any[];
  activeBatchView: string;
  dimInsteadOfHide: boolean;
  skippedClassIds: string[];
  setShowTimetableManager: (show: boolean) => void;
}

export function TimetableGrid({
  timeSlots,
  isCurrentlyEmpty,
  activeDays,
  activeDisplayDays,
  timetable,
  courses,
  activeBatchView,
  dimInsteadOfHide,
  skippedClassIds,
  setShowTimetableManager
}: TimetableGridProps) {

  const formatTime = (time24: string) => {
    const [h, m] = time24.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return { time: `${hour}:${m}`, ampm };
  };

  if (isCurrentlyEmpty) {
    return (
      <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative z-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 bg-[var(--aevos-canvas)] backdrop-blur-xl flex flex-col">
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto gap-4 h-full min-h-[400px]">
          <AlertTriangle className="w-12 h-12 text-[var(--aevos-status-warning)] animate-pulse" />
          <h2 className="text-xl font-bold text-[var(--aevos-text-primary)]">No Schedule Data Found</h2>
          <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
            Please import your timetable or add courses in the Calculator first to activate the Attendance Optimizer.
          </p>
          <Button
            onClick={() => setShowTimetableManager(true)}
            className="bg-[var(--aevos-primary)] hover:bg-[var(--aevos-primary-fixed-dim)] text-[var(--aevos-on-primary)] font-semibold text-xs px-6 py-2.5 rounded-full shadow-lg transition-all"
          >
            Import Timetable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative z-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 bg-[var(--aevos-canvas)] backdrop-blur-xl flex flex-col -webkit-overflow-scrolling-touch">
      <div className="flex flex-col w-full min-w-[1800px] md:min-w-[1000px]">
        <table className="w-full text-left border-separate border-spacing-0 table-fixed">
          <thead className="relative z-50">
            <tr>
              <th className="w-20 border-b border-white/[0.03] sticky top-0 z-50 bg-[var(--aevos-surface-dim)] border-r"></th>
              {activeDays.map((day, i) => {
                const dayIndices: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

                const today = new Date();
                const currentDayIndex = today.getDay();
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - currentDayIndex + dayIndices[day]);
                const dateNum = targetDate.getDate();

                const isToday = currentDayIndex === dayIndices[day];
                const displayDay = activeDisplayDays[i];
                return (
                  <th
                    key={day}
                    className={`border-b border-white/[0.03] sticky top-0 z-50 font-sans tracking-wide text-[12px] text-center py-2 font-medium bg-[var(--aevos-surface-dim)]`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`text-[9px] font-bold tracking-widest uppercase ${isToday ? "text-[var(--aevos-primary)]" : "text-[var(--aevos-text-secondary)]"}`}>
                        {displayDay}
                      </span>
                      <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-[13px] font-sans ${isToday ? 'text-[var(--aevos-primary)] font-bold drop-shadow-[0_0_8px_rgba(191,227,83,0.3)]' : 'text-[var(--aevos-text-secondary)] font-medium'}`}>
                        {dateNum}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="relative z-0">
            {timeSlots.map((slot) => {
              const [start, end] = slot.split('-');
              const startFormatted = formatTime(start);
              const endFormatted = formatTime(end);

              return (
                <tr key={slot} className="group">
                  <td className="align-top p-2 border-b border-r border-white/[0.03] text-[10px] text-[var(--aevos-text-secondary)] font-mono font-medium text-center pt-4 bg-[var(--aevos-surface-dim)]/50 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span>{startFormatted.time} {startFormatted.ampm}</span>
                      <span className="text-[8px] text-[var(--aevos-text-tertiary)] mt-0.5">to</span>
                      <span>{endFormatted.time} {endFormatted.ampm}</span>
                    </div>
                  </td>
                  {activeDays.map((day) => {
                    const entries = timetable[day] || [];
                    
                    return (
                      <td
                        key={`${slot}-${day}`}
                        className={`align-top p-1.5 transition-colors relative border-b border-r border-white/[0.03] last:border-r-0`}
                      >
                        <div className="flex flex-col gap-1.5 h-full">
                          {(() => {
                            const classesForSlot = entries.filter(e => `${e.startTime}-${e.endTime}` === slot);
                            let classesToRender = classesForSlot;

                            if (activeBatchView !== "ALL") {
                              const batchClasses = classesForSlot.filter(c => !c.batch || c.batch === "ALL" || c.batch === activeBatchView);
                              if (batchClasses.length > 0) {
                                classesToRender = batchClasses;
                              } else if (!dimInsteadOfHide) {
                                classesToRender = [];
                              }
                            }

                            return classesToRender.map((classForSlot, idx) => {
                              const course = courses.find(c => c.id === classForSlot.courseId);
                              const isSafeSkip = skippedClassIds.includes(classForSlot.id);
                              const isMatchingBatch = !classForSlot.batch || classForSlot.batch === "ALL" || classForSlot.batch === activeBatchView || activeBatchView === "ALL";
                              const isDimmed = !isMatchingBatch && dimInsteadOfHide;

                              return (
                                <ClassCard
                                  key={classForSlot.id || idx}
                                  courseName={course?.name}
                                  classType={classForSlot.type}
                                  isSafeSkip={isSafeSkip}
                                  startTime={`${formatTime(classForSlot.startTime).time}${formatTime(classForSlot.startTime).ampm}`}
                                  endTime={`${formatTime(classForSlot.endTime).time}${formatTime(classForSlot.endTime).ampm}`}
                                  room={classForSlot.room}
                                  batch={classForSlot.batch}
                                  isDimmed={isDimmed}
                                />
                              );
                            });
                          })()}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
