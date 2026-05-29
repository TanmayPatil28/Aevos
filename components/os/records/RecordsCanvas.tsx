"use client";

import { useState } from "react";
import { useUIStore } from "@/stores/os/uiStore";
import { useEffect } from "react";
import UploadZone from "./UploadZone";
import ReviewImport from "./ReviewImport";
import Link from "next/link";
import { COPY } from "@/lib/os/constants/copy";

export type RecordsState = "IDLE" | "UPLOADING" | "REVIEW" | "SUCCESS";

export default function RecordsCanvas() {
  const { setContextBar, clearContextBar } = useUIStore();
  const [flowState, setFlowState] = useState<RecordsState>("IDLE");

  useEffect(() => {
    setContextBar(COPY.RECORDS.TITLE, []);
    return () => clearContextBar();
  }, [setContextBar, clearContextBar]);

  const handleUploadComplete = () => {
    setFlowState("REVIEW");
  };

  const handleConfirmImport = () => {
    setFlowState("SUCCESS");
  };

  const handleReset = () => {
    setFlowState("IDLE");
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-os-section pb-32 animate-fade-in ease-os-smooth duration-700">
      
      {/* Page Header (Only show when not in success state) */}
      {flowState !== "SUCCESS" && (
        <div className="text-center sm:text-left space-y-2 mt-4">
          <h1 className="text-3xl font-bold text-slate-100">{COPY.RECORDS.TITLE}</h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            {COPY.RECORDS.SUBTITLE}
          </p>
        </div>
      )}

      {/* Main Flow Controller */}
      <div className="w-full">
        {flowState === "IDLE" && (
          <UploadZone 
            onUploadStart={() => setFlowState("UPLOADING")} 
            onUploadComplete={handleUploadComplete} 
          />
        )}

        {flowState === "UPLOADING" && (
          <div className="w-full h-64 border-2 border-dashed border-white/10 rounded-[32px] bg-[#1D1D1F] flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-4xl text-indigo-400 animate-pulse">document_scanner</span>
            <div className="text-slate-300 font-medium">Reading your results...</div>
            <div className="text-xs text-slate-500">This usually takes just a few seconds.</div>
          </div>
        )}

        {flowState === "REVIEW" && (
          <ReviewImport 
            onConfirm={handleConfirmImport} 
            onCancel={handleReset} 
          />
        )}

        {flowState === "SUCCESS" && (
          <div className="w-full bg-[#1D1D1F] border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-6 mt-12 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">{COPY.RECORDS.SUCCESS_TITLE}</h2>
              <p className="text-slate-400">
                <strong className="text-slate-200">6 courses</strong> and their grades have been added to your account.
                Your SGPA has been automatically updated.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link 
                href="/ledger"
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">table_chart</span>
                {COPY.RECORDS.SUCCESS_CTA}
              </Link>
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors border border-slate-700/50"
              >
                Upload Another Semester
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Section (Only visible in IDLE) */}
      {flowState === "IDLE" && (
        <div className="pt-8 border-t border-slate-800/50">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Past Imports</h3>
          <div className="bg-[#1D1D1F] border border-white/5 rounded-2xl divide-y divide-white/20">
            {/* Mock History Item */}
            <div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium">Semester 2 Result.pdf</div>
                  <div className="text-xs text-slate-500">Imported on May 12, 2026 • 6 Courses</div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Verified</span>
            </div>
            {/* Mock History Item 2 */}
            <div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                </div>
                <div>
                  <div className="text-slate-200 font-medium">Semester 1 Result.pdf</div>
                  <div className="text-xs text-slate-500">Imported on Dec 10, 2025 • 5 Courses</div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Verified</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
