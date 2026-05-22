"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Eye, Trash2, X, ClipboardCheck, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Calculation, Subject } from "@/types/calculation";
import Card from "@/components/ui/Card";

interface HistoryTableProps {
  calculations: Calculation[];
  onDelete: (id: number) => void;
}

export default function HistoryTable({ calculations, onDelete }: HistoryTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCalc, setSelectedCalc] = useState<Calculation | null>(null);

  useEffect(() => {
    if (!selectedCalc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCalc(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCalc]);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((calc) =>
      calc.semester.toLowerCase().includes(search.toLowerCase())
    );
  }, [calculations, search]);

  const getBadgeColor = (sgpa: number) => {
    if (sgpa >= 9.0) return "bg-green-400/10 text-green-400 border-green-400/20";
    if (sgpa >= 8.0) return "bg-[#4F8EF7]/10 text-[#4F8EF7] border-[#4F8EF7]/20";
    if (sgpa >= 7.0) return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    return "bg-red-400/10 text-red-400 border-red-400/20";
  };

  return (
    <Card className="flex flex-col h-fit group">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black font-headline tracking-tighter text-white">Calculation History</h3>
          <p className="text-[11px] text-white/30 font-black uppercase tracking-[0.2em]">Archived Analytics</p>
        </div>
        
        <div className="relative w-full md:w-80 group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-[#4F8EF7] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search semesters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search calculation history by semester"
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-[#4F8EF7]/50 focus:bg-white/[0.05] transition-all font-bold text-sm text-white placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/[0.05]">
              <th className="pb-4 px-4 whitespace-nowrap">Index</th>
              <th className="pb-4 px-4 whitespace-nowrap">Date</th>
              <th className="pb-4 px-4 whitespace-nowrap">Semester</th>
              <th className="pb-4 px-4 whitespace-nowrap">Items</th>
              <th className="pb-4 px-4 whitespace-nowrap">GPA</th>
              <th className="pb-4 px-4 whitespace-nowrap">CGPA</th>
              <th className="pb-4 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            <AnimatePresence mode="popLayout">
              {filteredCalculations.map((calc, index) => (
                <motion.tr
                  key={calc.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  className="group/row hover:bg-white/[0.02] transition-colors duration-300"
                >
                  <td className="py-6 px-4 font-black text-white/10 text-xs italic">#{(index + 1).toString().padStart(2, '0')}</td>
                  <td className="py-6 px-4">
                    <p className="text-sm font-bold text-white/60">{new Date(calc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                  </td>
                  <td className="py-6 px-4">
                    <div className="text-[10px] font-black text-[#4F8EF7] px-3 py-1 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 w-fit uppercase tracking-widest leading-none">
                      {calc.semester}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-sm font-bold text-white/30">{calc.subjects.length} Subjects</p>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black border italic ${getBadgeColor(calc.sgpa)}`}>
                      {calc.sgpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                      {calc.cgpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedCalc(calc)}
                        aria-label={`View details for ${calc.semester}`}
                        className="p-2.5 rounded-xl bg-white/[0.03] text-white hover:bg-white/10 hover:text-[#4F8EF7] transition-all border border-white/[0.05]"
                        title="Analyze Details"
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onDelete(calc.id)}
                        aria-label={`Delete ${calc.semester}`}
                        className="p-2.5 rounded-xl bg-red-400/5 text-red-400/40 hover:bg-red-400 hover:text-white transition-all border border-red-400/10"
                        title="Purge Record"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredCalculations.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 relative">
            <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center text-white/5 border border-dashed border-white/10 animate-pulse">
              <ClipboardCheck size={40} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black font-headline tracking-tighter text-white">Archives Empty.</h4>
              <p className="text-white/20 font-medium max-w-xs mx-auto italic">
                Establish your first academic record to initialize the observatory.
              </p>
            </div>
            <Link href="/calculator" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-black tracking-tight flex items-center gap-3 shadow-[0_20px_50px_rgba(79,142,247,0.3)] cursor-pointer"
              >
                Initialize Calculation <ArrowRight size={18} strokeWidth={3} />
              </motion.a>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-[0.3em] relative z-10">
        <p>Telemetry: {filteredCalculations.length} of {calculations.length} Frames</p>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 rounded-full border border-white/[0.05] opacity-30 cursor-not-allowed">Previous</button>
          <button className="px-5 py-2 rounded-full bg-white/[0.03] text-white/60 border border-white/[0.05] hover:bg-white/10 transition-colors">Next</button>
        </div>
      </div>

      {/* Side Drawer for Details */}
      <AnimatePresence>
        {selectedCalc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCalc(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0A0F1E]/80 backdrop-blur-[100px] border-l border-white/[0.08] z-[101] shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-y-auto custom-scrollbar"
            >
              {/* Refractive Inner Borders */}
              <div className="absolute inset-y-0 left-0 w-[0.5px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              
              <div className="p-10 space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 id="drawer-title" className="text-3xl font-black font-headline tracking-tighter text-white">Observer Report</h4>
                    <p className="text-[10px] text-[#4F8EF7] font-black uppercase tracking-[0.2em]">Detailed Analytics Frame</p>
                  </div>
                   <button
                     onClick={() => setSelectedCalc(null)}
                     aria-label="Close calculation details"
                     className="p-3 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
                   >
                    <X size={24} strokeWidth={3} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.05] overflow-hidden group">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Semester Focus</p>
                    <p className="text-xl font-black text-[#4F8EF7] italic">{selectedCalc.semester}</p>
                  </div>
                  <div className="relative p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Telemetry Date</p>
                    <p className="text-xl font-black text-white/60">{new Date(selectedCalc.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                  </div>
                  <div className="relative p-6 rounded-[24px] bg-[#4F8EF7]/5 border border-[#4F8EF7]/20 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-[#4F8EF7]/60 tracking-widest mb-2">SGPA SCORE</p>
                    <p className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(79,142,247,0.5)]">{selectedCalc.sgpa.toFixed(2)}</p>
                  </div>
                  <div className="relative p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Credit Load</p>
                    <p className="text-4xl font-black text-white tracking-tighter opacity-40">{selectedCalc.total_credits}</p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <h5 className="text-[11px] font-black uppercase text-white/20 tracking-[0.3em]">Subject Breakdown Telemetry</h5>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                   </div>

                  <div className="space-y-4">
                    {selectedCalc.subjects.map((sub: Subject, i: number) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.03] hover:border-[#4F8EF7]/20 hover:bg-white/[0.04] transition-all group/sub relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-1 bg-[#4F8EF7] translate-y-full group-hover/sub:translate-y-0 transition-transform duration-500" />
                        <div>
                          <p className="text-base font-black text-white group-hover/sub:text-[#4F8EF7] transition-colors">{sub.name}</p>
                          <p className="text-[10px] text-white/20 font-black uppercase mt-1 tracking-widest">{sub.credits} Credits</p>
                        </div>
                        <div className={cn(
                           "px-4 py-1.5 rounded-full text-xs font-black italic border",
                           getBadgeColor(sub.score || 0)
                        )}>
                          GRADE: {sub.score || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                 <Card className="bg-gradient-to-br from-[#4F8EF7]/10 to-transparent border-[#4F8EF7]/20 relative overflow-hidden group">
                    <div className="relative z-10">
                       <h5 className="text-lg font-black text-white tracking-tight mb-2">Insight Detected</h5>
                       <p className="text-sm text-white/40 leading-relaxed italic">
                         {selectedCalc.sgpa >= 9 ? "Exceptional performance. You are currently in the 99th percentile of academic trajectory." : "Consistency is key. Improving your credit weighting in core subjects is recommended."}
                       </p>
                    </div>
                    <Sparkles className="absolute -right-4 -bottom-4 text-[#4F8EF7]/10 group-hover:scale-150 transition-transform duration-1000" size={120} />
                 </Card>
               </div>
             </motion.div>
           </>
         )}
       </AnimatePresence>
     </Card>
  );
}
