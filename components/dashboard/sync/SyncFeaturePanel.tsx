"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Trash2, AlertTriangle, Sparkles, Copy, Terminal, CheckCircle2, RefreshCw, UploadCloud, ChevronRight, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";

import { detectInstitution } from "@/lib/ingestion/detectionEngine";
import { SPPUParser } from "@/lib/ingestion/parsers/SPPUParser";
import { DigicampusParser } from "@/lib/ingestion/parsers/DigicampusParser";
import { normalizeExtraction } from "@/lib/ingestion/normalizationEngine";
import { computeImportDiff, mergeProfiles } from "@/lib/ingestion/diffEngine";
import { PipelineState, NormalizedImportPayload, ImportDiff } from "@/lib/ingestion/types";
import { useNetworkState } from "@/lib/hooks/useNetworkState";
import { diagnostics } from "@/lib/diagnostics";
import jspmPreset from "@/lib/presets/curriculum/jspm_comp_eng_2023.json";
import Select from "@/components/ui/Select";

// AI Prompt Scopes & Tools
const SCOPES = [
  { id: "student-details", label: "Student Details" },
  { id: "backlog-clearance", label: "Backlog / Summer Term" },
  { id: "semester-1", label: "Semester 1" },
  { id: "semester-2", label: "Semester 2" },
  { id: "semester-3", label: "Semester 3" },
  { id: "semester-4", label: "Semester 4" },
  { id: "semester-5", label: "Semester 5" },
  { id: "semester-6", label: "Semester 6" },
  { id: "semester-7", label: "Semester 7" },
  { id: "semester-8", label: "Semester 8" },
];

const AI_TOOLS = [
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com" },
  { id: "claude", name: "Claude", url: "https://claude.ai" },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com" },
];

const HoldToConfirmButton = ({ 
  onConfirm, 
  idleText, 
  confirmingText, 
  destructive = true 
}: { 
  onConfirm: () => void, idleText: React.ReactNode, confirmingText: React.ReactNode, destructive?: boolean 
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const frameRef = useRef<number>();

  const startHold = () => {
    setIsHolding(true);
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second hold

    const updateProgress = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const p = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(p);

      if (p >= 100) {
        onConfirm();
        setIsHolding(false);
        setProgress(0);
      } else if (isHolding) {
        frameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    frameRef.current = requestAnimationFrame(updateProgress);
  };

  const stopHold = () => {
    setIsHolding(false);
    setProgress(0);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      className={`relative overflow-hidden w-full py-3.5 rounded-full flex items-center justify-center font-bold tracking-widest text-[11px] uppercase transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
        ${destructive ? "bg-[#FF5252] text-white border-none hover:bg-[#FF5252]/90 active:bg-[#FF5252]/80" : "bg-[#3F3F46] border-none text-white hover:bg-[#52525B] active:bg-[#52525B]"}`}
    >
      <div 
        className={`absolute inset-y-0 left-0 ${destructive ? "bg-white/20" : "bg-white/10"} transition-none`} 
        style={{ width: `${progress}%` }} 
      />
      <span className="relative z-10 flex items-center gap-2">
        {isHolding ? confirmingText : idleText}
      </span>
    </button>
  );
};

export function SyncFeaturePanel({ onClose }: { onClose: () => void }) {
  const store = useUSMStore();
  const isOnline = useNetworkState();
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  
  // Pipeline state
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [payload, setPayload] = useState<NormalizedImportPayload | null>(null);
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Terminal AI State
  const [inputText, setInputText] = useState("");
  const [targetScope, setTargetScope] = useState(SCOPES[0].id);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Actions
  const handleReset = async () => {
    try {
      const res = await fetch("/api/academic/reset", { method: "POST" });
      if (res.ok) {
        useUSMStore.persist.clearStorage();
        localStorage.removeItem("gradeflow-usm-storage");
        useUSMStore.getState().resetStore();
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSemester = async () => {
    try {
      const res = await fetch("/api/academic/reset-semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester: selectedSemester }),
      });
      if (res.ok) {
        const numSem = parseInt(selectedSemester);
        useUSMStore.setState((state) => ({
          courses: state.courses.filter(c => c.semester !== numSem),
          semesterHistory: state.semesterHistory.filter(s => s.semester !== numSem)
        }));
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Pipeline Logic
  const handleAnalyze = async (rawInput: string) => {
    if (!rawInput.trim()) return;
    setPipelineState("detecting");
    setPipelineError(null);
    await new Promise(r => setTimeout(r, 500));

    const detectedInst = detectInstitution(rawInput) || "unknown";
    setPipelineState("parsing");

    let parser = null;
    if (detectedInst === "sppu") parser = SPPUParser;
    else if (detectedInst === "jspm" || detectedInst === "jspmuni" || DigicampusParser.canParse(rawInput)) parser = DigicampusParser;
    else if (detectedInst === "unknown" && SPPUParser.canParse(rawInput)) parser = SPPUParser;
    
    if (!parser) {
      setPipelineState("failed");
      setPipelineError(`No suitable parser found for detected institution: ${detectedInst}.`);
      return;
    }

    const parserResult = parser.parse(rawInput);
    if (parserResult.confidenceScore < 30) {
      setPipelineState("failed");
      setPipelineError("Parser confidence too low. Data appears corrupted or invalid.");
      return;
    }

    setPipelineState("normalizing");
    try {
      const canonicalProfile = normalizeExtraction(parserResult.extractedData);
      setPipelineState("diffing");

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
      if (!res.ok) throw new Error("Failed to create immutable snapshot.");
      
      setPipelineState("completed");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setPipelineState("failed");
      setPipelineError(`Persistence failed: ${err.message}`);
    }
  };

  const getTemplateForScope = (scopeId: string) => {
    if (scopeId === "student-details") return `{\n  "studentProfile": {\n    "fullName": "YOUR NAME",\n    "registrationId": "REG_ID",\n    "academicDetails": {\n      "programme": "e.g., B.Tech...",\n      "department": "e.g., Department Of...",\n      "batchYear": 2024,\n      "currentYear": "2nd Year",\n      "currentTerm": "4th Semester"\n    }\n  }\n}`;
    if (scopeId === "backlog-clearance") return `[\n  {\n    "academicTerm": { "level": "Backlog Clearance" },\n    "isBacklogClearance": true,\n    "performance": { "majorSGPA": 0.00 },\n    "courses": [\n      { "courseCode": "SUB101", "courseName": "Subject Name", "credits": 4, "grade": "O" }\n    ]\n  }\n]`;
    const semIndex = parseInt(scopeId.split("-")[1]) || 1;
    return `[\n  {\n    "academicTerm": { "level": "Semester ${semIndex}" },\n    "semesterIndex": ${semIndex},\n    "performance": { "majorSGPA": 0.00 },\n    "courses": [\n      { "courseCode": "SUB101", "courseName": "Subject Name", "credits": 4, "grade": "A+" }\n    ]\n  }\n]`;
  };

  const generateAIPrompt = () => {
    const template = getTemplateForScope(targetScope);
    const instruction = targetScope === "student-details" 
      ? "Extract the student profile details. Return them strictly in the following JSON format. Do not use markdown."
      : "Extract the SGPA, courses, and grades. Return the data strictly in the following JSON format. Do not use markdown.";
    return `${instruction}\n\n${template}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateAIPrompt());
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden rounded-[32px] bg-[#18181B] border-none shadow-2xl">


      {/* 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6 p-6 pb-24 overflow-hidden z-10 relative">
        
        {/* Left Column: Danger Zone */}
        <div className="flex flex-col gap-6 p-6 rounded-[24px] bg-[#27272A] border-none">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h4>
            <p className="text-[11px] text-rose-200/50 leading-relaxed">
              Highly destructive actions. Press and hold to unlock these commands.
            </p>
          </div>

          <div className="space-y-4 mt-auto">
            <div className="flex flex-col gap-2">
              <select 
                className="bg-[#3F3F46] text-white rounded-full px-5 py-3 border-none focus:outline-none focus:ring-2 focus:ring-white/20 text-sm font-sans appearance-none w-full transition-colors"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-[#27272A]">Semester {s}</option>)}
              </select>
              <HoldToConfirmButton 
                idleText={<><Trash2 className="w-4 h-4" /> Delete Sem {selectedSemester}</>}
                confirmingText="Hold to Delete..."
                onConfirm={handleDeleteSemester}
              />
            </div>
            
            <div className="h-px w-full bg-rose-500/10 my-2" />

            <HoldToConfirmButton 
              idleText={<><Trash2 className="w-4 h-4" /> Master Reset</>}
              confirmingText="Hold to Reset All..."
              onConfirm={handleReset}
            />
          </div>
        </div>

        {/* Center Column: Terminal / Pipeline */}
        <div className="flex flex-col rounded-[24px] bg-[#27272A] border-none overflow-hidden shadow-2xl relative">
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-none bg-black/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/30" />
              <div className="w-3 h-3 rounded-full bg-amber-500/30" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              extraction_engine.sh
            </span>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-sm text-zinc-300">
            {pipelineState === "idle" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <div className="text-white/50 mb-4 font-bold text-xs tracking-wider">$ select_target_scope</div>
                  <Select
                    value={targetScope}
                    onChange={setTargetScope}
                    options={SCOPES.map(s => ({ value: s.id, label: s.label }))}
                    className="w-full bg-[#3F3F46] text-white rounded-full border-none hover:bg-[#52525B] font-sans font-bold transition-colors px-4 py-3"
                  />
                </div>

                <div>
                  <div className="text-white/50 mb-4 font-bold text-xs tracking-wider">$ generate_ai_prompt --copy</div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={copyToClipboard}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full transition-all text-xs font-bold tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                        copiedPrompt ? "bg-[#C6F432] text-black border-none" : "bg-[#C6F432] text-black border-none hover:bg-[#C6F432]/90 active:bg-[#C6F432]/80"
                      }`}
                    >
                      {copiedPrompt ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedPrompt ? "COPIED TO CLIPBOARD" : "COPY PROMPT"}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {AI_TOOLS.map(tool => (
                      <a 
                        key={tool.id} href={tool.url} target="_blank" rel="noreferrer"
                        className="flex-1 py-3 text-center text-[10px] uppercase font-sans font-bold tracking-widest rounded-full bg-[#3F3F46] border-none text-white hover:bg-[#52525B] active:bg-[#52525B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      >
                        {tool.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-white/50 mb-4 font-bold text-xs tracking-wider">$ paste_json_result</div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="{\n  // paste AI generated JSON here...\n}"
                    className="w-full h-32 bg-[#3F3F46] text-white rounded-xl p-4 border-none focus:ring-2 focus:ring-white/20 outline-none font-mono resize-none placeholder:text-white/50 transition-colors"
                  />
                  <button 
                    onClick={() => handleAnalyze(inputText)}
                    disabled={!inputText.trim()}
                    className="w-full mt-4 py-3 bg-[#C6F432] text-black border-none font-sans font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#C6F432]/90 active:bg-[#C6F432]/80 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    Run Extraction
                  </button>
                </div>
              </div>
            )}

            {["detecting", "parsing", "normalizing", "diffing"].includes(pipelineState) && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-brand/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                  <Terminal className="absolute inset-0 m-auto w-6 h-6 text-brand" />
                </div>
                <div className="text-center font-mono space-y-2">
                  <div className="text-brand uppercase tracking-widest text-xs">
                    Executing Pipeline
                  </div>
                  <div className="text-zinc-500 text-sm">
                    {pipelineState}...
                  </div>
                </div>
              </div>
            )}

            {pipelineState === "failed" && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-2" />
                <div className="text-rose-400 font-sans font-bold uppercase tracking-widest text-xs">Pipeline Error</div>
                <div className="text-rose-200/60 text-xs max-w-xs">{pipelineError}</div>
                <button onClick={() => setPipelineState("idle")} className="mt-4 px-6 py-2 bg-rose-500/10 text-rose-400 rounded-full font-sans text-xs font-bold hover:bg-rose-500/20">
                  REBOOT ENGINE
                </button>
              </div>
            )}

            {pipelineState === "verifying" && diff && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-emerald-400 mb-4">$ diff_check --verify</div>
                
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                  <div className="text-xs font-sans uppercase tracking-widest text-emerald-500 font-bold flex items-center justify-between">
                    <span>Parsed Integrity</span>
                    <span>{payload?.confidenceScore}%</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Detected: {payload?.detectedInstitution}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-sans uppercase tracking-widest text-zinc-500 mb-2">Delta Changes</div>
                  {diff.addedCourses.map(c => <div key={c.id} className="text-emerald-400 text-xs">+ {c.code} ({c.credits} cr)</div>)}
                  {diff.updatedCourses.map(c => <div key={c.course.id} className="text-amber-400 text-xs">~ {c.course.code} ({c.changes.join(', ')})</div>)}
                  {diff.addedCourses.length === 0 && diff.updatedCourses.length === 0 && (
                    <div className="text-zinc-500 text-xs">No changes detected.</div>
                  )}
                </div>

                <button 
                  onClick={handleConfirmPersist}
                  className="w-full py-3 bg-emerald-500 text-black font-sans font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-emerald-400 transition-colors"
                >
                  Commit & Persist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Presets */}
        <div className="flex flex-col gap-6 p-6 rounded-[24px] bg-[#27272A] border-none">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 mb-2 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-brand" /> Curriculum Presets
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Instantly load official institutional curriculum frameworks.
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 rounded-xl bg-[#3F3F46] border-none space-y-2">
               <div className="text-xs font-bold text-white">JSPM University</div>
               <div className="text-[10px] text-white/50 uppercase tracking-wider">Computer Engineering • 2023</div>
            </div>
            <HoldToConfirmButton 
              idleText={<><UploadCloud className="w-4 h-4" /> Load Preset</>}
              confirmingText="Loading..."
              onConfirm={() => {
                try {
                  setPipelineState("parsing");
                  setTimeout(() => {
                    const courses = jspmPreset.semesters.flatMap(sem => sem.courses.map(c => ({
                      id: `course_${c.code}`, code: c.code, name: c.name, semester: sem.semesterIndex,
                      credits: c.credits, grade: "NA", cieMarks: 0, seeMarks: 0, attendanceTotal: 0, attendanceBunked: 0
                    })));
                    const canonicalProfile = { courses, academic: store.academic, semesterHistory: [] };
                    const activeProfile = { ...store.identity, academic: store.academic, courses: store.courses, semesterHistory: store.semesterHistory };
                    const importDiff = computeImportDiff(activeProfile as any, canonicalProfile as any);
                    const mergedProfile = mergeProfiles(activeProfile as any, canonicalProfile as any);
                    setPayload({ profile: mergedProfile, confidenceScore: 100, parserVersion: "preset_v1", detectedInstitution: jspmPreset.institution });
                    setDiff(importDiff);
                    setPipelineState("verifying");
                  }, 500);
                } catch (err: any) {
                  setPipelineState("failed");
                  setPipelineError(err.message);
                }
              }}
              destructive={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
