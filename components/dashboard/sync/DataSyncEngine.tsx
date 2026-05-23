"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";
import { PipelineState, NormalizedImportPayload, ImportDiff } from "@/lib/ingestion/types";
import { detectInstitution } from "@/lib/ingestion/detectionEngine";
import { SPPUParser } from "@/lib/ingestion/parsers/SPPUParser";
import { DigicampusParser } from "@/lib/ingestion/parsers/DigicampusParser";
import { normalizeExtraction } from "@/lib/ingestion/normalizationEngine";
import { computeImportDiff } from "@/lib/ingestion/diffEngine";
import { RawInputForm } from "@/components/ingestion/RawInputForm";
import { ImportVerificationModal } from "@/components/ingestion/ImportVerificationModal";

interface DataSyncEngineProps {
  onSuccess?: () => void;
  isHero?: boolean;
}

export function DataSyncEngine({ onSuccess, isHero = false }: DataSyncEngineProps) {
  const router = useRouter();
  const store = useUSMStore();
  
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

      // Merge parser warnings with diff warnings
      importDiff.warnings = [...parserResult.validationWarnings, ...importDiff.warnings];

      setPayload({
        profile: canonicalProfile,
        confidenceScore: parserResult.confidenceScore,
        parserVersion: parserResult.parserVersion,
        detectedInstitution: parserResult.detectedInstitution
      });
      setDiff(importDiff);
      
      setPipelineState("verifying");

    } catch (err: any) {
      setPipelineState("failed");
      setPipelineError(`Normalization failed: ${err.message}`);
    }
  };

  const handleConfirmPersist = async () => {
    if (!payload) return;
    setPipelineState("persisting");

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

      setPipelineState("completed");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Force reload to dashboard so Hydration Boundary catches the new snapshot
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setPipelineState("failed");
      setPipelineError(`Persistence failed: ${err.message}`);
    }
  };

  return (
    <div className={`space-y-8 ${isHero ? 'max-w-4xl mx-auto' : ''}`}>
      {isHero && (
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">Smart Academic Import Engine</h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Securely extract, verify, and persist your official academic records.
          </p>
        </div>
      )}

      {/* Error State */}
      {pipelineState === "failed" && pipelineError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-center">
          <strong>Import Pipeline Error:</strong> {pipelineError}
          <div className="mt-4">
            <button onClick={() => setPipelineState("idle")} className="text-sm underline hover:text-red-100">Try Again</button>
          </div>
        </div>
      )}

      {/* Input Pipeline */}
      {["idle", "detecting", "parsing", "normalizing", "diffing"].includes(pipelineState) && (
        <RawInputForm 
          onAnalyze={handleAnalyze} 
          isLoading={pipelineState !== "idle" && pipelineState !== "failed"} 
        />
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
