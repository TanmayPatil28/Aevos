"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Target, FileText, Lock } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { useUIStore } from "@/stores/uiStore";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import Card from "@/components/ui/Card";

const MotionCard = motion(Card);

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
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.08, delayChildren: 0.05 }
    },
    exit: { opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <MotionCard 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      variant="accent"
      padding="xl"
      className="group flex flex-col md:flex-row w-full h-full !p-0 shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/[0.06]"
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* LEFT COLUMN: Drag & Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "w-full md:w-3/5 flex flex-col items-center justify-center p-6 md:p-8 pb-24 md:pb-24 relative z-10 transition-all duration-700 cursor-pointer overflow-hidden group/zone",
          isDragging ? "bg-[#0a84ff]/[0.03]" : "hover:bg-white/[0.02]"
        )}
      >
        {isDragging && (
          <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-brand bg-brand pointer-events-none transition-all duration-500 animate-in fade-in" />
        )}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center w-full gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-foreground" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mb-2">{loadingPhase}</h3>
              <p className="text-lg text-foreground/60">Parsing your experience and skills...</p>
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center w-full gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mb-2">Resume Synced</h3>
              <p className="text-lg text-foreground/60">Your profile has been updated with the latest data.</p>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center w-full gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mb-2">Upload Failed</h3>
              <p className="text-lg text-foreground/60">Something went wrong parsing your resume. Try again.</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center w-full h-full pointer-events-none"
            >
              <motion.div variants={itemVariants} className="relative w-32 h-32 flex items-center justify-center mb-10">
                {/* Glowing Background Ring */}
                <div className={cn(
                  "absolute inset-0 rounded-full transition-all duration-700",
                  isDragging ? "bg-brand animate-[ping_1.5s_infinite]" : "bg-surface-raised group-hover:bg-surface-overlay shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                )} />
                {/* Inner Border Ring */}
                <div className={cn(
                  "absolute inset-2 rounded-full border transition-all duration-700",
                  isDragging ? "border-[#0a84ff] scale-125" : "border-border group-hover/zone:scale-110 group-hover/zone:border-border-strong"
                )} />
                {/* Pulsing effect when idle */}
                {!isDragging && (
                  <div className="absolute inset-0 rounded-full border border-border animate-[ping_4s_infinite]" />
                )}
                
                <UploadCloud className={cn(
                  "relative z-10 transition-all duration-700",
                  isDragging ? "w-16 h-16 text-[#0a84ff]" : "w-10 h-10 text-foreground/80 group-hover/zone:text-foreground"
                )} />
              </motion.div>
              
              <motion.div variants={itemVariants} className="text-center z-10 px-4">
                <h3 className={cn(
                  "text-3xl md:text-5xl font-semibold tracking-tight mb-4 transition-all duration-700",
                  isDragging ? "text-foreground drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" : "bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
                )}>
                  {isDragging ? "RELEASE TO UPLOAD" : "Upload your Resume"}
                </h3>
                <p className={cn(
                  "text-lg md:text-[19px] max-w-md mx-auto font-medium transition-all duration-500",
                  isDragging ? "text-[#0a84ff] drop-shadow-[0_0_10px_rgba(10,132,255,0.8)]" : "text-foreground/40"
                )}>
                  {isDragging ? "Drop your PDF anywhere to begin." : "Drop your PDF anywhere, or click to browse. We'll parse it instantly."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: Extraction Context */}
      <div className="w-full md:w-2/5 relative p-6 md:p-8 pb-24 md:pb-24 border-t md:border-t-0 md:border-l border-white/[0.06] bg-surface flex flex-col overflow-hidden pointer-events-none">
        <div className="relative z-10 flex-grow flex flex-col justify-between space-y-4">
          <motion.div variants={itemVariants}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80 mb-6">
              Extraction Engine
            </h3>
            
            <div className="flex flex-col gap-6">
              {/* Item 1 */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border shrink-0">
                  <FileText className="w-4 h-4 text-foreground/70" />
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-foreground/90">Semantic Parsing</h4>
                  <p className="text-[13px] text-foreground-muted/80 mt-1 leading-[1.6]">Extracts deep technical skills, soft skills, and specific industry tools perfectly.</p>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-surface-raised border border-border shrink-0">
                  <Target className="w-4 h-4 text-foreground/70" />
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-foreground/90">Experience Timeline</h4>
                  <p className="text-[13px] text-foreground-muted/80 mt-1 leading-[1.6]">Maps your professional timeline to intelligently identify career trajectory and impact.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80 mb-4">
              Privacy Context
            </h3>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground/40 tracking-widest uppercase">
                <Lock className="w-3 h-3" /> Secure Enclave
              </span>
              <p className="text-[13px] text-foreground-muted/80 leading-[1.618] font-medium">
                Your resume data is processed securely entirely in-memory. We extract only the core professional signals required by JARVIS for personalization.
              </p>
            </div>
          </motion.div>
        </div>
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
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative w-full max-w-lg bg-surface border border-white/[0.08] rounded-[24px] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">Target Job Description</h3>
                <p className="text-foreground-muted text-[13px] mb-5">
                  Paste the URL or full text of the job description to improve ATS simulation accuracy. If you don't have one, just skip!
                </p>
                
                <textarea
                  placeholder="e.g. Seeking a Senior Frontend Engineer with 5+ years of React experience..."
                  className="w-full p-4 bg-white/[0.02] border border-white/[0.05] rounded-[16px] text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-brand focus:bg-[#1A1A1A] transition-all resize-none h-40 text-[14px] font-medium leading-relaxed"
                  value={targetJD}
                  onChange={(e) => setTargetJD(e.target.value)}
                />
                
                <div className="flex justify-end items-center mt-6 gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCancelJD(); }}
                    className="text-[14px] font-semibold text-foreground/50 hover:text-[#ff3b30] transition-colors px-4 py-2 outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartProcessing(); }}
                    className="text-[14px] font-bold bg-white/10 text-foreground hover:bg-white/20 px-6 py-2.5 rounded-full transition-colors outline-none"
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
    </MotionCard>
  );
}
