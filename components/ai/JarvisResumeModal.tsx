"use client";

import { useUIStore } from "@/stores/os/uiStore";
import { useUSMStore } from "@/stores/usmStore";
import { X, Printer, Download, Sparkles } from "lucide-react";

export default function JarvisResumeModal() {
  const resumeData = useUIStore(s => s.activeResumeData);
  const closeResume = useUIStore(s => s.closeResume);
  const usmStore = useUSMStore();

  if (!resumeData) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      
      {/* Action Bar (Hidden during printing) */}
      <div className="absolute top-6 right-6 flex gap-3 no-print">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-colors"
        >
          <Printer size={16} /> Save as PDF
        </button>
        <button 
          onClick={closeResume}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] text-black shadow-2xl p-12 overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:w-[210mm] print:h-[297mm] print:overflow-hidden print:m-0 print:p-12 relative font-sans">
        
        {/* Header */}
        <div className="border-b-2 border-black pb-6 mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 uppercase">
            Tanmay (Student)
          </h1>
          <p className="text-xl text-gray-600 font-medium tracking-wide uppercase">
            Computer Science & Engineering
          </p>
          <div className="flex gap-4 mt-4 text-sm font-semibold text-gray-500">
            <span>CGPA: {usmStore.academic.currentCgpa.toFixed(2)}</span>
            <span>•</span>
            <span>{resumeData.company} Applicant</span>
          </div>
        </div>

        {/* AI Generator Tag (Hidden during printing) */}
        <div className="absolute top-12 right-12 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full no-print">
          <Sparkles size={12} /> JARVIS GENERATED
        </div>

        {/* Executive Summary */}
        <section className="mb-10">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-3">Professional Summary</h2>
          <p className="text-gray-800 leading-relaxed text-lg">
            {resumeData.summary}
          </p>
        </section>

        {/* Skills aligned with company */}
        <section className="mb-10">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Core Competencies</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-sm font-semibold text-gray-800">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Relevant Coursework */}
        <section className="mb-10">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Relevant Academic Coursework</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800 font-medium">
            {resumeData.coursework.map((course, i) => (
              <li key={i}>{course}</li>
            ))}
          </ul>
        </section>

        {/* Projects / Experience Boilerplate */}
        <section>
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Key Projects</h2>
          <div className="mb-6">
            <h3 className="text-lg font-bold">GradeFlow OS</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">Lead Developer • Next.js, React, Zustand</p>
            <p className="text-gray-800">Developed a comprehensive academic operating system featuring autonomous AI agents, intelligent grade forecasting, and robust state management utilizing Zustand and Next.js 14.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
