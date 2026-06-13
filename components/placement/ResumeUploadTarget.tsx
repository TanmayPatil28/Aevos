"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Target } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { useUIStore } from "@/stores/os/uiStore";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

export default function ResumeUploadTarget() {
  const [mounted, setMounted] = React.useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [targetJD, setTargetJD] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loadingPhase, setLoadingPhase] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const setCareer = useUSMStore((state) => state.setCareer);
  const setResumeData = useUIStore((state) => state.setResumeData);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setPendingFile(file);
      setShowJD(true);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPendingFile(file);
      setShowJD(true);
    }
  };

  const handleStartProcessing = async () => {
    setShowJD(false);
    if (pendingFile) {
      await processFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleCancelJD = () => {
    setShowJD(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setIsUploading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", file);
    if (targetJD.trim()) {
      formData.append("targetJD", targetJD.trim());
    }

    const phases = [
      "Parsing resume...",
      "Analyzing JD...",
      "Extrapolating projects...",
      "Generating ATS template..."
    ];
    let phaseIdx = 0;
    setLoadingPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
      setLoadingPhase(phases[phaseIdx]);
    }, 2000);

    try {
      const res = await fetch("/api/parse/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await res.json();
      
      clearInterval(phaseInterval);
      
      if (data.skills && Array.isArray(data.skills)) {
        setCareer({ skills: data.skills });
        
        setResumeData({
          company: data.company || "Unknown",
          summary: data.summary || "Summary not provided",
          skills: data.skills,
          coursework: data.coursework || [],
          atsScore: data.atsScore,
          actionPlan: data.actionPlan,
          projects: data.projects
        });

        setStatus("success");
        toast.success(`Extracted ${data.skills.length} skills!`);
        
        // Reset after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      clearInterval(phaseInterval);
      setStatus("error");
      toast.error(err.message || "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative w-full z-20">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "flex items-center justify-between p-2 pl-5 rounded-full border transition-all duration-300 h-14 w-full cursor-pointer overflow-hidden",
          isDragging ? "bg-[#0a84ff]/20 border-[#0a84ff]/50 text-[#0a84ff]" : "bg-[#1c1c1e] border-white/[0.04] text-white hover:bg-white/[0.02] hover:border-white/10"
        )}
      >
        <input 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full pr-3"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span className="text-[14px] font-bold tracking-tight text-white">{loadingPhase}</span>
              </div>
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full pr-3"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#34c759]" />
                <span className="text-[14px] font-bold tracking-tight text-[#34c759]">Resume Synced</span>
              </div>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full pr-3"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#ff3b30]" />
                <span className="text-[14px] font-bold tracking-tight text-[#ff3b30]">Upload Failed</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <UploadCloud className={cn("w-5 h-5", isDragging ? "text-[#0a84ff]" : "text-white")} />
                <span className="text-[14px] font-bold tracking-tight">
                  {isDragging ? "Drop Resume Here" : "AirDrop Resume (PDF)"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MagneticWrapper strength={0.6}>
                  <div className={cn(
                    "inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px] font-bold shrink-0 transition-colors",
                    isDragging ? "bg-[#0a84ff] text-white" : "bg-white text-black hover:bg-white/90"
                  )}>
                    Select
                  </div>
                </MagneticWrapper>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Modal Overlay for Target JD */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showJD && (
            <div className="fixed inset-0 z-[99990] flex items-center justify-center px-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); setShowJD(false); }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative w-full max-w-lg bg-[#1c1c1e] border border-white/[0.08] rounded-[24px] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">Target Job Description</h3>
                <p className="text-[#86868b] text-[13px] mb-5">
                  Paste the URL or full text of the job description to improve ATS simulation accuracy. If you don't have one, just skip!
                </p>
                
                <textarea
                  placeholder="e.g. Seeking a Senior Frontend Engineer with 5+ years of React experience..."
                  className="w-full p-4 bg-white/[0.02] border border-white/[0.05] rounded-[16px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#0a84ff]/50 focus:bg-[#1A1A1A] transition-all resize-none h-40 text-[14px] font-medium leading-relaxed"
                  value={targetJD}
                  onChange={(e) => setTargetJD(e.target.value)}
                />
                
                <div className="flex justify-end items-center mt-6 gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCancelJD(); }}
                    className="text-[14px] font-semibold text-white/50 hover:text-[#ff3b30] transition-colors px-4 py-2 outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartProcessing(); }}
                    className="text-[14px] font-bold bg-white/10 text-white hover:bg-white/20 px-6 py-2.5 rounded-full transition-colors outline-none"
                  >
                    Skip & Analyze
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartProcessing(); }}
                    className="text-[14px] font-bold bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-full transition-colors outline-none shadow-lg"
                  >
                    Analyze with JD
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
