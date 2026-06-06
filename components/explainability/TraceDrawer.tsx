"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, BookOpen, AlertCircle, HelpCircle } from "lucide-react";
import { TraceMetadata } from "../../stores/selectors";

export interface VariableItem {
  name: string;
  value: string | number;
  description: string;
}

export interface TraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trace: TraceMetadata | null;
  explanation: string;
  equation?: string;
  variables?: VariableItem[];
}

export default function TraceDrawer({
  isOpen,
  onClose,
  title,
  trace,
  explanation,
  equation,
  variables = [],
}: TraceDrawerProps) {
  if (!trace) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet for Mobile / Centered Panel for Desktop */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-white/20 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl md:left-auto md:right-4 md:top-20 md:bottom-auto md:w-[480px] md:rounded-3xl md:border"
          >
            {/* Grabber indicator for mobile swipes */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-xs text-slate-400">Deterministic Audit Trace</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="custom-scrollbar overflow-y-auto py-4 space-y-5 flex-1 pr-1 text-sm text-slate-300">
              {/* Ordinance Regulation Box */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start space-x-3 text-emerald-400">
                  <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="space-y-1">
                    <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                      Regulation Authority Source
                    </span>
                    <h4 className="text-sm font-bold text-emerald-300">
                      {trace.sourceRegulationId}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Verified from <span className="text-slate-300 font-medium">{trace.sourceClause}</span> under{" "}
                      <span className="text-slate-300 font-medium">{trace.sourceCircular}</span>.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-emerald-500/10 pt-2 text-[10px] text-slate-500">
                  <span>Confidence: {trace.confidenceScore}% (Verified Audit)</span>
                  <span>Verified: {new Date(trace.lastVerifiedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Arithmetic Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Arithmetic Logic & Explanation
                </h4>
                <p className="text-slate-300 leading-relaxed bg-white/5 rounded-2xl p-4 border border-white/5">
                  {explanation}
                </p>
              </div>

              {/* Equation Box */}
              {equation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Mathematical Equation Applied
                  </h4>
                  <div className="overflow-x-auto rounded-2xl bg-black/40 p-4 font-mono text-xs text-violet-400 border border-white/5">
                    <pre className="whitespace-pre-wrap">{equation}</pre>
                  </div>
                </div>
              )}

              {/* Variable Trace Parameter Grid */}
              {variables.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Parameter Resolution (Active State)
                  </h4>
                  <div className=" divide-y divide-white/20 overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                    {variables.map((v, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between p-3.5 hover:bg-white/5 transition"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs font-bold text-violet-300">
                              {v.name}
                            </span>
                            <div className="relative cursor-help text-slate-500 hover:text-slate-400">
                              <HelpCircle className="h-3 w-3" />
                              {/* Simple Tooltip on hover */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded bg-slate-950 p-2 text-[10px] text-slate-300 opacity-0 shadow-lg border border-white/10 transition group-hover:opacity-100 z-10">
                                {v.description}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-tight">
                            {v.description}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-white bg-white/5 px-2 py-1 rounded">
                          {v.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Trust Warning */}
              <div className="flex items-start space-x-2 text-[11px] text-slate-500">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <p>
                  GradeFlow calculations are strictly deterministic and run fully on the client-side
                  according to verified university statutes. No LLM-hallucination occurs.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
