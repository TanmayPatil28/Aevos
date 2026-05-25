"use client";

import { useDomainStore } from "@/stores/os/domainStore";

export default function CourseInspectorContent({ courseId }: { courseId: string }) {
  const { courses, deleteCourse } = useDomainStore();
  const course = courses.find(c => c.id === courseId);

  if (!course) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Basic Info */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course Code</div>
        <div className="text-xl font-mono text-slate-200">{course.code || "UNTITLED"}</div>
        
        <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Course Name</div>
        <div className="text-sm text-slate-300">{course.name || "No name provided"}</div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Credits</div>
          <div className="text-2xl font-bold text-indigo-400">{course.credits}</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Grade</div>
          <div className="text-2xl font-bold text-emerald-400">{course.grade || "-"}</div>
        </div>
      </div>

      {/* Interventions / Quick Actions */}
      {course.grade === "F" && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
          <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Backlog Detected
          </h4>
          <p className="text-xs text-rose-300/80 mb-3">
            This course is marked as failed. You need to clear it in a future semester.
          </p>
          <button className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-md transition-colors">
            Add to Recovery Plan
          </button>
        </div>
      )}

      {/* Utilities */}
      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={() => deleteCourse(course.id)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Remove Course
        </button>
      </div>

    </div>
  );
}
