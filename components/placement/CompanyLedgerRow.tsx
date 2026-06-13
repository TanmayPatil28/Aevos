import React, { useState } from "react";
import { IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { CheckCircle2, AlertTriangle, XCircle, Pin, ChevronDown, ChevronUp, Briefcase, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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

  const statusDot = 
    result.status === "ELIGIBLE" ? "bg-[#34c759]" :
    result.status === "BORDERLINE" ? "bg-[#ff9f0a]" : "bg-[#ff453a]";

  const getProgressWidth = (status: string) => {
    switch (status) {
      case "Strong": return "100%";
      case "Moderate": return "70%";
      case "Weak": return "35%";
      case "Risk": return "15%";
      default: return "0%";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "Strong": return "bg-[#34c759]";
      case "Moderate": return "bg-[#ff9f0a]";
      case "Weak": return "bg-[#ff453a]";
      case "Risk": return "bg-[#ff453a]";
      default: return "bg-white/20";
    }
  };

  return (
    <div className={cn(
      "group flex flex-col transition-colors duration-200",
      !isLast && "border-b border-white/[0.05]",
      isPinned ? "bg-[#1c1c1e]" : "bg-transparent hover:bg-[#1c1c1e]/50"
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
        className="flex items-center justify-between gap-4 p-4 cursor-pointer relative z-10 focus:outline-none"
      >
        {/* Left Side: Icon & Name */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className={cn(
            "w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 border",
            result.status === "ELIGIBLE" ? "bg-[#34c759]/10 border-[#34c759]/20" : 
            result.status === "BORDERLINE" ? "bg-[#ff9f0a]/10 border-[#ff9f0a]/20" : 
            "bg-[#ff3b30]/10 border-[#ff3b30]/20"
          )}>
            <span className={cn(
              "text-[14px] font-bold",
              result.status === "ELIGIBLE" ? "text-[#34c759]" : 
              result.status === "BORDERLINE" ? "text-[#ff9f0a]" : "text-[#ff3b30]"
            )}>{result.eligibilityScore}</span>
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <h4 className="text-[16px] font-medium text-white truncate">{result.name}</h4>
            <div className="flex items-center text-[13px] text-[#86868b] truncate mt-0.5">
              {(() => {
                const blockers = result.breakdown.filter(b => b.status === "Weak" || b.status === "Risk").map(b => b.factor);
                const warnings = result.breakdown.filter(b => b.status === "Moderate").map(b => b.factor);
                
                if (blockers.length === 0 && warnings.length === 0) {
                  return <span>Meets all criteria</span>;
                }
                
                return (
                  <span className="truncate">
                    {blockers.length > 0 && `Blocked: ${blockers.join(", ")}`}
                    {blockers.length > 0 && warnings.length > 0 && " • "}
                    {warnings.length > 0 && `Needs work: ${warnings.join(", ")}`}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              import("sonner").then((mod) => {
                mod.toast.success(`Generating ATS-optimized Resume for ${result.name}...`);
              });
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-white text-[13px] font-medium transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            Resume
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onPinToggle && onPinToggle(result.name); }}
            aria-label={isPinned ? "Unpin company" : "Pin company"}
            className={cn(
              "p-2 rounded-full transition-all duration-150",
              isPinned 
                ? "text-[#ff9f0a]" 
                : "text-[#86868b] hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100"
            )}
          >
            <Pin size={16} className={isPinned ? "fill-[#ff9f0a]" : ""} />
          </button>
          <div className="text-[#86868b] group-hover:text-white transition-colors">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-4 md:p-5 pl-16">
              <div className="flex flex-col gap-0 bg-[#1c1c1e] rounded-[14px] overflow-hidden">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className={cn(
                    "group/item flex flex-col lg:flex-row lg:items-center gap-3 p-4",
                    idx !== result.breakdown.length - 1 && "border-b border-white/[0.05]"
                  )}>
                    <div className="lg:w-1/3 flex items-center gap-3 shrink-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        item.status === "Strong" ? "bg-[#34c759]" :
                        item.status === "Moderate" ? "bg-[#ff9f0a]" :
                        "bg-[#ff3b30]"
                      )} />
                      <h4 className="text-[14px] font-medium text-white">{item.factor}</h4>
                    </div>
                    
                    <div className="lg:w-1/3 flex flex-col justify-center">
                      <p className="text-[13px] text-[#86868b] leading-snug">{item.message}</p>
                    </div>
                    
                    <div className="lg:w-1/3 flex items-center justify-end">
                      {item.gap && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            import("sonner").then((mod) => {
                              mod.toast.success(`Added "${item.gap}" to your Planner!`);
                            });
                          }}
                          className="text-[13px] font-medium text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-3 py-1.5 rounded-full transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100 outline-none w-full lg:w-auto text-left lg:text-center"
                        >
                          Add to Plan
                        </button>
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
