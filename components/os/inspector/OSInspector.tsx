"use client";

import { useUIStore } from "@/stores/os/uiStore";
import { useEffect } from "react";
import CourseInspectorContent from "./CourseInspectorContent";

export default function OSInspector() {
  const { activeInspectorEntity, closeInspector } = useUIStore();

  const isOpen = activeInspectorEntity !== null;

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeInspector();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeInspector]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile (dim) and desktop (transparent or subtle dim) */}
      <div 
        onClick={closeInspector}
        className="fixed inset-0 z-50 bg-black/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none transition-opacity"
      />

      {/* 
        Responsive Drawer: 
        Mobile: Bottom Sheet (fixed bottom, rounded top)
        Desktop: Slide-over (fixed right, full height)
      */}
      <div className="
        fixed z-50 flex flex-col bg-slate-900 border-slate-800 shadow-2xl transition-transform duration-300 ease-out
        
        /* Mobile: Bottom Sheet */
        bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl border-t sm:bottom-auto sm:left-auto sm:rounded-none sm:border-t-0
        
        /* Desktop: Slide-over */
        sm:top-0 sm:right-0 sm:h-full sm:w-96 sm:border-l
      ">
        {/* Handle for mobile */}
        <div className="w-full flex justify-center py-3 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            {activeInspectorEntity.type === "COURSE" ? "Course Details" : "Details"}
          </h2>
          <button 
            onClick={closeInspector}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeInspectorEntity.type === "COURSE" && (
            <CourseInspectorContent courseId={activeInspectorEntity.id} />
          )}
        </div>
      </div>
    </>
  );
}
