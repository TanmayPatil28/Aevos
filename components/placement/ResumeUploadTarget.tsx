"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/cn";

export default function ResumeUploadTarget() {
  const [mounted, setMounted] = React.useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const setCareer = useUSMStore((state) => state.setCareer);

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
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
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

    try {
      const res = await fetch("/api/parse/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await res.json();
      
      // Expected Data: { skills: string[], experienceLevel: string, projects: any[] }
      if (data.skills && Array.isArray(data.skills)) {
        setCareer({ skills: data.skills });
        setStatus("success");
        toast.success(`Extracted ${data.skills.length} skills!`);
        
        // Reset after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      toast.error(err.message || "Something went wrong");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full relative group">
      <input 
        type="file" 
        accept=".pdf" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />
      
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? "rgba(10, 132, 255, 0.5)" : "rgba(255, 255, 255, 0.1)",
          backgroundColor: isDragging ? "rgba(10, 132, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
        }}
        className={cn(
          "w-full rounded-2xl border border-dashed flex flex-col items-center justify-center p-8 cursor-pointer transition-all relative overflow-hidden",
          "hover:bg-white/[0.04] hover:border-white/20"
        )}
      >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-[#0a84ff]"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-lg bg-[#0a84ff]/30 rounded-full" />
                <Loader2 size={40} className="animate-spin relative z-10" />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-white text-[16px]">JARVIS is reading your resume...</span>
                <span className="text-white/50 text-[13px] mt-1">Extracting skills and semantic entities</span>
              </div>
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-emerald-400"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <span className="font-bold text-white text-[16px]">Resume Synchronized</span>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-red-400"
            >
              <AlertCircle size={40} />
              <span className="font-bold text-white text-[16px]">Parsing Failed</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-white/50 group-hover:text-white/80 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shadow-lg group-hover:bg-[#0a84ff]/10 group-hover:text-[#0a84ff] transition-all">
                <FileText size={28} />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-white text-[16px]">Drop your Resume (PDF)</span>
                <span className="text-white/40 text-[13px] mt-1 max-w-[250px]">JARVIS will auto-extract your skills to optimize your placement readiness.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
