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
import { BookOpen } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

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
          studentIdentity: { name: "User" },
          institution: jspmPreset.institution || "jspm_university_wagholi",
          presetId: "jspm_comp_eng_2023",
          regulation: jspmPreset.pattern || "unknown",
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
        <div className="relative pt-12 pb-8 flex flex-col items-center justify-center text-center overflow-hidden z-10">
          <span className="text-[12px] leading-[16px] uppercase tracking-[0.12em] text-foreground-muted font-bold mb-4">
            Ingestion Engine
          </span>
          <h1 
            className="text-[64px] font-semibold leading-[68px] tracking-[-0.5px]"
            style={{
              backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bring in your records
          </h1>
          <p className="text-base leading-[24px] text-foreground-muted max-w-[544px] mt-6">
            Securely import your academic history to instantly unlock personalized predictions.
          </p>
        </div>
      )}

      {/* Error State */}
      {pipelineState === "failed" && pipelineError && (
        <Card variant="danger" padding="lg" className="flex flex-col items-center text-center">
          <span className="text-[12px] leading-[16px] uppercase tracking-[0.12em] text-danger font-bold mb-2">
            Import Issue
          </span>
          <p className="text-foreground text-base max-w-lg mb-6">{pipelineError}</p>
          <Button variant="danger" size="md" onClick={() => setPipelineState("idle")} className="font-bold">
            Try Again
          </Button>
        </Card>
      )}

      {/* Input Pipeline */}
      {["idle", "detecting", "parsing", "normalizing", "diffing"].includes(pipelineState) && (
        <div className="space-y-6">
          <RawInputForm 
            onAnalyze={handleAnalyze} 
            isLoading={pipelineState !== "idle" && pipelineState !== "failed"} 
          />
          
          {/* Preset Bento Card */}
          <Card 
            variant="default" 
            padding="lg"
            className={`transition-all group ${pipelineState === "idle" || pipelineState === "failed" ? 'hover:border-brand/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              onClick={pipelineState === "idle" || pipelineState === "failed" ? handleLoadPreset : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 text-foreground-muted transition-all">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Load Curriculum Preset</h3>
                  <p className="text-sm font-medium text-foreground-muted mt-1">JSPM Wagholi • Computer Engineering • 2023 Pattern</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={pipelineState !== "idle" && pipelineState !== "failed"}
                className="w-full sm:w-auto font-bold"
                onClick={handleLoadPreset}
              >
                Apply Preset
              </Button>
            </div>
          </Card>
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
