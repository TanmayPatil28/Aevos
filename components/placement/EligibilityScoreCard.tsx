import React, { useState } from "react";
import { IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export default function EligibilityScoreCard({ result }: { result: IntelligenceResult }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = 
    result.status === "ELIGIBLE" ? "text-emerald-400" :
    result.status === "BORDERLINE" ? "text-amber-400" : "text-rose-400";
    
  const statusGlow = 
    result.status === "ELIGIBLE" ? "shadow-[0_0_15px_rgba(52,211,153,0.3)]" :
    result.status === "BORDERLINE" ? "shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "shadow-[0_0_15px_rgba(244,63,94,0.3)]";

  return (
    <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] overflow-hidden transition-all hover:bg-white/[0.04] group">
      <div 
        className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">{result.name}</h4>
            <div className={cn("px-3 py-1 rounded-full border border-white/[0.05] bg-black/50 text-[10px] font-bold uppercase tracking-wider", statusColor, statusGlow)}>
              {result.status}
            </div>
          </div>
          
          <div className="flex items-end gap-4">
             <div className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-none">
               {result.eligibilityScore}<span className="text-2xl text-white/30 font-medium">%</span>
             </div>
             <div className="flex-1 max-w-[200px] mb-2">
               <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                 <div 
                   className={cn("h-full", result.eligibilityScore >= 80 ? 'bg-emerald-500' : result.eligibilityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500')} 
                   style={{ width: `${result.eligibilityScore}%` }}
                 />
               </div>
             </div>
          </div>
        </div>
        
        <div className="text-white/30 ml-4 p-2 group-hover:text-white transition-colors bg-white/5 rounded-full">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/40 border-t border-white/[0.05]"
          >
            <div className="p-6 md:p-8">
              <h5 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Eligibility Breakdown</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 bg-black/50 p-1.5 rounded-full border border-white/[0.05]">
                      {item.status === "Strong" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {item.status === "Moderate" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {(item.status === "Weak" || item.status === "Risk") && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <span className="font-semibold text-white block text-sm mb-1">{item.factor}</span>
                      <span className={cn("text-xs leading-relaxed block", 
                        item.status === "Strong" ? "text-emerald-400/80" :
                        item.status === "Moderate" ? "text-amber-400/80" :
                        "text-rose-400/80"
                      )}>{item.message}</span>
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
