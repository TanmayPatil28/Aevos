import React, { useState } from "react";
import { IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { CheckCircle2, AlertTriangle, XCircle, Pin, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/cn";

interface CompanyLedgerRowProps {
  result: IntelligenceResult;
  isPinned?: boolean;
  onPinToggle?: (companyName: string) => void;
}

export default function CompanyLedgerRow({ result, isPinned, onPinToggle }: CompanyLedgerRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor = 
    result.status === "ELIGIBLE" ? "text-emerald-400" :
    result.status === "BORDERLINE" ? "text-amber-400" : "text-rose-400";
    
  const statusBg = 
    result.status === "ELIGIBLE" ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" :
    result.status === "BORDERLINE" ? "bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]";

  return (
    <div className={cn(
      "group flex flex-col rounded-[24px] border transition-all duration-300 overflow-hidden",
      isPinned ? "bg-[#1D1D1F] border-[#a855f7]/30 shadow-none ring-1 ring-[#a855f7]/50" : "bg-[#1D1D1F] border-white/5 hover:border-white/10 shadow-none"
    )}>
      {/* Main Row Header */}
      <div 
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 cursor-pointer relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-[24px]"
      >
        <div className="flex items-center gap-4 min-w-[250px]">
        <div className={cn("flex flex-col items-center justify-center w-14 h-14 rounded-xl border bg-black/50 shrink-0", statusBg)}>
          <span className={cn("text-xl font-bold leading-none", statusColor)}>{result.eligibilityScore}</span>
          <span className={cn("text-[8px] font-bold uppercase tracking-wider opacity-70", statusColor)}>Score</span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {result.name}
            {isPinned && <Pin size={12} className="text-purple-400 fill-purple-400" />}
          </h4>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest", statusColor)}>
            {result.status}
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-wrap gap-2 text-xs">
        {result.breakdown.filter(b => b.status !== "Strong").map((item, idx) => {
          const isGood = item.status === "Strong";
          const isOk = item.status === "Moderate";
          return (
            <div key={idx} className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border",
              isGood ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300/80" : 
              isOk ? "bg-amber-500/5 border-amber-500/10 text-amber-300/80" : 
              "bg-rose-500/5 border-rose-500/10 text-rose-300/80"
            )}>
              {isGood ? <CheckCircle2 className="w-3 h-3" /> : isOk ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span className="font-medium">{item.factor}:</span>
              <span className="opacity-80">{item.message}</span>
            </div>
          )
        })}
      </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onPinToggle && onPinToggle(result.name); }}
            aria-label={isPinned ? "Unpin company" : "Pin company"}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300 border",
              isPinned 
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100"
            )}
          >
            <Pin size={16} className={isPinned ? "fill-purple-400" : ""} />
          </button>
          <div className="p-2.5 text-white/30 group-hover:text-white/80 transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Accordion Content (Criterion Analysis Only per user preference) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-[#222224] border-t border-white/20"
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <Briefcase size={14} /> Criterion Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-[20px] bg-white/[0.02] border border-white/[0.04] flex gap-4 items-start hover:bg-white/[0.04] transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      item.status === "Strong" ? "bg-emerald-500 shadow-[0_0_12px_#10b981]" :
                      item.status === "Moderate" ? "bg-amber-500 shadow-[0_0_12px_#f59e0b]" :
                      "bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                    )} />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1.5">{item.factor}</h4>
                      <p className="text-xs text-white/50 leading-relaxed mb-3">{item.message}</p>
                      
                      {/* Reverse-Engineer Eligibility (Bridge the Gap) */}
                      {item.gap && (
                        <div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <p className="text-xs font-bold text-purple-300 mb-2">{item.gap}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Added "${item.gap}" to your Planner!`);
                            }}
                            className="w-full text-center py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-[10px] font-bold text-purple-200 uppercase tracking-wider transition-colors"
                          >
                            Add to Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
