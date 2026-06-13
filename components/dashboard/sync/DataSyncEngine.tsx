"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";
import { PipelineState, NormalizedImportPayload, ImportDiff } from "@/lib/ingestion/types";
import { detectInstitution } from "@/lib/ingestion/detectionEngine";
import { SPPUParser } from "@/lib/ingestion/parsers/SPPUParser";
import { DigicampusParser } from "@/lib/ingestion/parsers/DigicampusParser";
import { normalizeExtraction } from "@/lib/ingestion/normalizationEngine";
import { computeImportDiff, mergeProfiles } from "@/lib/ingestion/diffEngine";
import { RawInputForm } from "@/components/ingestion/RawInputForm";
import { ImportVerificationModal } from "@/components/ingestion/ImportVerificationModal";
import { diagnostics } from "@/lib/diagnostics";
import { useNetworkState } from "@/lib/hooks/useNetworkState";
import jspmPreset from "@/lib/presets/curriculum/jspm_comp_eng_2023.json";

interface DataSyncEngineProps {
  onSuccess?: () => void;
  isHero?: boolean;
}

export function DataSyncEngine({ onSuccess, isHero = false }: DataSyncEngineProps) {
  const router = useRouter();
  const store = useUSMStore();
  const isOnline = useNetworkState();
  
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [payload, setPayload] = useState<NormalizedImportPayload | null>(null);
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const handleAnalyze = async (rawInput: string) => {
    setPipelineState("detecting");
    setPipelineError(null);
    
    // Simulate slight delay for UX (engine is very fast)
    await new Promise(r => setTimeout(r, 500));

    // 1. Detect Institution
    const detectedInst = detectInstitution(rawInput) || "unknown";
    
    setPipelineState("parsing");

    // 2. Route to correct parser
    let parser = null;
    if (detectedInst === "sppu") parser = SPPUParser;
    else if (detectedInst === "jspm" || detectedInst === "jspmuni" || DigicampusParser.canParse(rawInput)) parser = DigicampusParser;
    else if (detectedInst === "unknown" && SPPUParser.canParse(rawInput)) parser = SPPUParser;
    
    if (!parser) {
      setPipelineState("failed");
      setPipelineError(`No suitable parser found for detected institution: ${detectedInst}. Please ensure the input matches supported formats.`);
      return;
    }

    const parserResult = parser.parse(rawInput);

    if (parserResult.confidenceScore < 30) {
      setPipelineState("failed");
      setPipelineError("Parser confidence too low. Data appears corrupted or invalid.");
      return;
    }

    setPipelineState("normalizing");

    // 3. Normalize Extraction Model
    try {
      const canonicalProfile = normalizeExtraction(parserResult.extractedData);

      setPipelineState("diffing");

      // 4. Compute Diff against active state
      const activeProfile = store.identity.hasAuthoritativeData ? {
        studentIdentity: store.identity.studentIdentity || { name: "User" },
        presetId: store.presetId,
        institution: store.identity.institution || store.presetId,
        regulation: store.identity.regulation || "unknown",
        academic: store.academic,
        courses: store.courses,
        semesterHistory: store.semesterHistory
      } : null;

      const importDiff = computeImportDiff(activeProfile as any, canonicalProfile);
      const mergedProfile = mergeProfiles(activeProfile as any, canonicalProfile);

      // Merge parser warnings with diff warnings
      importDiff.warnings = [...parserResult.validationWarnings, ...importDiff.warnings];

      setPayload({
        profile: mergedProfile,
        confidenceScore: parserResult.confidenceScore,
        parserVersion: parserResult.parserVersion,
        detectedInstitution: parserResult.detectedInstitution
      });
      setDiff(importDiff);
      
      setPipelineState("verifying");

    } catch (err: any) {
      diagnostics.error("DataSyncEngine", "Normalization failed", err);
      setPipelineState("failed");
      setPipelineError(`Normalization failed: ${err.message}`);
    }
  };

  const handleLoadPreset = () => {
    try {
      setPipelineState("parsing");
      // Simulate slight delay
      setTimeout(() => {
        const courses = jspmPreset.semesters.flatMap(sem => 
          sem.courses.map(c => ({
            id: `course_${c.code}`,
            code: c.code,
            name: c.name,
            semester: sem.semesterIndex,
            credits: c.credits,
            grade: "NA", // Preset has no grades yet
            cieMarks: 0,
            seeMarks: 0,
            attendanceTotal: 0,
            attendanceBunked: 0
          }))
        );

        const canonicalProfile = {
          courses,
          academic: {
            currentCgpa: 0,
            completedSemesters: 0,
            earnedCredits: 0,
            activeBacklogsCount: 0,
            targetCgpa: 0,
            semesterStartDate: "2026-06-01",
            semesterEndDate: "2026-12-01"
          },
          semesterHistory: []
        };

        const activeProfile = store.identity.hasAuthoritativeData ? {
          studentIdentity: store.identity.studentIdentity || { name: "User" },
          presetId: store.presetId,
          institution: store.identity.institution || store.presetId,
          regulation: store.identity.regulation || "unknown",
          academic: store.academic,
          courses: store.courses,
          semesterHistory: store.semesterHistory
        } : null;

        const importDiff = computeImportDiff(activeProfile as any, canonicalProfile as any);
        const mergedProfile = mergeProfiles(activeProfile as any, canonicalProfile as any);

        setPayload({
          profile: mergedProfile,
          confidenceScore: 100, // Presets are 100% confident
          parserVersion: "preset_v1",
          detectedInstitution: jspmPreset.institution
        });
        setDiff(importDiff);
        setPipelineState("verifying");
      }, 500);
    } catch (err: any) {
      setPipelineState("failed");
      setPipelineError(`Failed to load preset: ${err.message}`);
    }
  };

  const handleConfirmPersist = async () => {
    if (!isOnline) {
      setPipelineState("failed");
      setPipelineError("Network disconnected. Please check your connection and try saving again.");
      diagnostics.warn("DataSyncEngine", "Persist blocked: Offline");
      return;
    }
    
    if (!payload) return;
    setPipelineState("persisting");
    diagnostics.info("DataSyncEngine", "Initiating snapshot persist", { sourceInstitution: payload.detectedInstitution });

    try {
      const res = await fetch("/api/academic/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicProfile: payload.profile,
          sourceType: "manual",
          sourceInstitution: payload.detectedInstitution,
          snapshotType: "official_import",
          parserVersion: payload.parserVersion,
          regulationVersion: "1.0",
          normalizationVersion: "1.0",
          confidenceScore: payload.confidenceScore,
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create immutable snapshot.");
      }

      diagnostics.info("DataSyncEngine", "Snapshot persist success");
      setPipelineState("completed");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Force reload to dashboard so Hydration Boundary catches the new snapshot
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      diagnostics.error("DataSyncEngine", "Persistence failed", err);
      setPipelineState("failed");
      setPipelineError(`Persistence failed: ${err.message}`);
    }
  };

  return (
    <div className={`space-y-8 ${isHero ? 'max-w-4xl mx-auto' : ''}`}>
      {isHero && (
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">Bring in your records</h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Securely import your academic history to instantly unlock personalized predictions.
          </p>
        </div>
      )}

      {/* Error State */}
      {pipelineState === "failed" && pipelineError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-center">
          <strong>Import Issue:</strong> {pipelineError}
          <div className="mt-4">
            <button onClick={() => setPipelineState("idle")} className="text-sm underline hover:text-red-100">Try Again</button>
          </div>
        </div>
      )}

      {/* Input Pipeline */}
      {["idle", "detecting", "parsing", "normalizing", "diffing"].includes(pipelineState) && (
        <div className="space-y-6">
          <RawInputForm 
            onAnalyze={handleAnalyze} 
            isLoading={pipelineState !== "idle" && pipelineState !== "failed"} 
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0B0F19] px-2 text-slate-500">Or use official preset</span>
            </div>
          </div>

          <button
            onClick={handleLoadPreset}
            disabled={pipelineState !== "idle" && pipelineState !== "failed"}
            className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-500/30 rounded-xl hover:bg-blue-500/5 hover:border-blue-500/50 transition-all text-slate-300"
          >
            <span className="material-symbols-outlined text-3xl text-blue-400 mb-2">auto_stories</span>
            <span className="font-bold text-sm">Load Curriculum Preset</span>
            <span className="text-xs text-slate-500 mt-1">JSPM Wagholi • Computer Engineering • 2023 Pattern</span>
          </button>
        </div>
      )}

      {/* Verification Modal */}
      {pipelineState === "verifying" && payload && diff && (
        <ImportVerificationModal
          payload={payload}
          diff={diff}
          isPersisting={false}
          onConfirm={handleConfirmPersist}
          onCancel={() => setPipelineState("idle")}
        />
      )}

      {pipelineState === "persisting" && payload && diff && (
         <ImportVerificationModal
         payload={payload}
         diff={diff}
         isPersisting={true}
         onConfirm={handleConfirmPersist}
         onCancel={() => setPipelineState("idle")}
       />
      )}
    </div>
  );
}
