import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Briefcase, Users, TrendingUp, ChevronRight } from "lucide-react";
import { IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { cn } from "@/lib/cn";

interface CompanyDeepDivePanelProps {
  company: IntelligenceResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyDeepDivePanel({ company, isOpen, onClose }: CompanyDeepDivePanelProps) {
  if (!company) return null;

  const statusColor = 
    company.status === "ELIGIBLE" ? "text-emerald-400" :
    company.status === "BORDERLINE" ? "text-amber-400" : "text-rose-400";
    
  const statusBg = 
    company.status === "ELIGIBLE" ? "bg-emerald-500/10 border-emerald-500/20" :
    company.status === "BORDERLINE" ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[200]"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1D1D1F] border-l border-white/20 z-[210] overflow-y-auto shadow-none"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1D1D1F] border-b border-white/20 p-6 z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border", statusBg, statusColor)}>
                    {company.status}
                  </div>
                  <span className="text-white/40 text-xs font-medium">Eligibility: {company.eligibilityScore}%</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{company.name}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              
              {/* Intelligence Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} /> Criterion Analysis
                </h3>
                <div className="space-y-2">
                  {company.breakdown.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] flex gap-4 items-start">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        item.status === "Strong" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                        item.status === "Moderate" ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                        "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                      )} />
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{item.factor}</h4>
                        <p className="text-xs text-white/60 leading-relaxed">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Historical Data */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} /> Historical Data (Mock)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Avg CTC</div>
                    <div className="text-xl font-bold text-white">12.5 LPA</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Recruitment</div>
                    <div className="text-xl font-bold text-white">On-Campus</div>
                  </div>
                </div>
              </div>

              {/* Selection Process */}
              <div className="space-y-4 pb-12">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} /> Selection Process (Mock)
                </h3>
                <div className="relative pl-6 border-l border-white/20 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
                    <h4 className="text-sm font-bold text-white">Round 1: Online Assessment</h4>
                    <p className="text-xs text-white/50 mt-1">Aptitude, Core CS subjects, 2 DSA questions.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
                    <h4 className="text-sm font-bold text-white">Round 2: Technical Interview</h4>
                    <p className="text-xs text-white/50 mt-1">System Design and deep dive into your projects.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
                    <h4 className="text-sm font-bold text-white">Round 3: HR / Cultural Fit</h4>
                    <p className="text-xs text-white/50 mt-1">Standard HR questions and situational judgment.</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
