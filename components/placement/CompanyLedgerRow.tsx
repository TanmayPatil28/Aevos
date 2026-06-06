import React, { useState } from "react";
import { IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { CheckCircle2, AlertTriangle, XCircle, Pin, ChevronDown, ChevronUp, Briefcase, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/cn";

interface CompanyLedgerRowProps {
  result: IntelligenceResult;
  isPinned?: boolean;
  onPinToggle?: (companyName: string) => void;
  isLast?: boolean;
}

export default function CompanyLedgerRow({ result, isPinned, onPinToggle, isLast }: CompanyLedgerRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor = 
    result.status === "ELIGIBLE" ? "text-[#34c759]" :
    result.status === "BORDERLINE" ? "text-[#ff9f0a]" : "text-[#ff453a]";
    
  const statusBg = 
    result.status === "ELIGIBLE" ? "bg-[#34c759]/10" :
    result.status === "BORDERLINE" ? "bg-[#ff9f0a]/10" : "bg-[#ff453a]/10";

  return (
    <div className={cn(
      "group flex flex-col transition-all duration-300",
      isPinned ? "bg-white/5" : "bg-transparent hover:bg-white/5",
      !isLast && "border-b border-white/5"
    )}>
      {/* Main Row Header (macOS List Item style) */}
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
        className="flex items-center justify-between gap-4 py-4 px-6 cursor-pointer relative z-10 focus:outline-none"
      >
        {/* Left Side: Score & Name */}
        <div className="flex items-center gap-4 flex-1">
          <div className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 border border-white/5", statusBg)}>
            <span className={cn("text-lg font-bold leading-none", statusColor)}>{result.eligibilityScore}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              {result.name}
              {isPinned && <Pin size={14} className="text-[#0a84ff] fill-[#0a84ff]" />}
            </h4>
            <span className={cn("text-xs font-semibold uppercase tracking-widest", statusColor)}>
              {result.status}
            </span>
          </div>
        </div>
      
        {/* Middle: Mini Tags (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 flex-wrap gap-2 text-xs opacity-60">
          {result.breakdown.filter(b => b.status !== "Strong").slice(0, 2).map((item, idx) => {
            const isOk = item.status === "Moderate";
            return (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80">
                {isOk ? <AlertTriangle className="w-3 h-3 text-[#ff9f0a]" /> : <XCircle className="w-3 h-3 text-[#ff453a]" />}
                <span className="font-medium truncate max-w-[120px]">{item.factor}</span>
              </div>
            )
          })}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onPinToggle && onPinToggle(result.name); }}
            aria-label={isPinned ? "Unpin company" : "Pin company"}
            className={cn(
              "p-2 rounded-full transition-all duration-300 border",
              isPinned 
                ? "bg-[#0a84ff]/20 text-[#0a84ff] border-[#0a84ff]/40 shadow-[0_0_15px_rgba(10,132,255,0.3)]" 
                : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100"
            )}
          >
            <Pin size={14} className={isPinned ? "fill-[#0a84ff]" : ""} />
          </button>
          <div className="text-white/30 group-hover:text-white/60 transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Accordion Content (Expanded Details & Actions) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-black/20 border-t border-white/5"
          >
            <div className="p-6 md:p-8">
              {/* Pinned Quick Actions */}
              {isPinned && (
                <div className="mb-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      import("react-hot-toast").then((mod) => {
                        mod.toast.success(`Generating ATS-optimized Resume for ${result.name}...`);
                      });
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#34c759]/20 border border-[#34c759]/30 text-sm font-semibold text-[#34c759] hover:bg-[#34c759]/30 transition-all shadow-sm"
                  >
                    <FileText size={16} /> Generate Targeted Resume
                  </button>
                </div>
              )}

              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Briefcase size={16} /> Criterion Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start hover:bg-white/10 transition-colors">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm",
                      item.status === "Strong" ? "bg-[#34c759]" :
                      item.status === "Moderate" ? "bg-[#ff9f0a]" :
                      "bg-[#ff453a]"
                    )} />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1.5">{item.factor}</h4>
                      <p className="text-xs text-white/60 leading-relaxed mb-3">{item.message}</p>
                      
                      {/* Reverse-Engineer Eligibility (Bridge the Gap) */}
                      {item.gap && (
                        <div className="mt-3 p-3 rounded-xl bg-[#0a84ff]/10 border border-[#0a84ff]/20">
                          <p className="text-xs font-semibold text-[#0a84ff] mb-2">{item.gap}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Added "${item.gap}" to your Planner!`);
                            }}
                            className="w-full text-center py-2 rounded-lg bg-[#0a84ff]/20 hover:bg-[#0a84ff]/30 text-xs font-bold text-[#0a84ff] transition-colors"
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
