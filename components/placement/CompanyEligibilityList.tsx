"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Trash2, ShieldAlert, Award } from "lucide-react";
import GlassCard from "../GlassCard";
import { CompanyCriteria, CompanyEligibilityResult } from "../../lib/career/eligibilityEngine";

interface CompanyEligibilityListProps {
  companies: CompanyEligibilityResult[];
  customCompanies: CompanyCriteria[];
  onRemoveCustomCompany: (name: string) => void;
}

export default function CompanyEligibilityList({
  companies,
  customCompanies,
  onRemoveCustomCompany,
}: CompanyEligibilityListProps) {
  
  const getStatusColor = (status: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE") => {
    switch (status) {
      case "ELIGIBLE":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          glowColor: "rgba(16, 185, 129, 0.2)",
        };
      case "BORDERLINE":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          glowColor: "rgba(245, 158, 11, 0.2)",
        };
      case "INELIGIBLE":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
          glowColor: "rgba(239, 68, 68, 0.2)",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Recruiter Eligibility Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation against tier-1 products, mass hiring, and custom target guidelines.
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Eligible ({companies.filter(c => c.status === "ELIGIBLE").length})
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            Borderline ({companies.filter(c => c.status === "BORDERLINE").length})
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            Ineligible ({companies.filter(c => c.status === "INELIGIBLE").length})
          </span>
        </div>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {companies.map((company) => {
            const isCustom = customCompanies.some((cc) => cc.name === company.name);
            const statusStyle = getStatusColor(company.status);

            return (
              <motion.div
                key={company.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative"
              >
                <GlassCard
                  interactive={true}
                  className={`flex flex-col h-full border ${statusStyle.bg} ${statusStyle.glow} transition-shadow duration-300 relative overflow-hidden`}
                >
                  {/* Decorative glowing background mesh matching status */}
                  <div 
                    className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[35px] pointer-events-none opacity-40 transition-colors duration-500"
                    style={{ backgroundColor: statusStyle.glowColor }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white tracking-wide text-base">
                          {company.name}
                        </h3>
                        {isCustom && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Credits Required: {company.requiredCredits}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono tracking-wider">
                        {company.status}
                      </span>
                      {statusStyle.icon}
                    </div>
                  </div>

                  <div className="space-y-3 flex-grow">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Min CGPA</span>
                        <span className="font-semibold text-white font-mono text-sm">
                          {company.cgpaCutoff.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-900/30 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Max Backlogs</span>
                        <span className="font-semibold text-white font-mono text-sm">
                          {company.maxBacklogs}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-start gap-2 leading-relaxed min-h-[56px]">
                      <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{company.explanation}</span>
                    </div>
                  </div>

                  {isCustom && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCustomCompany(company.name);
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 py-1 px-2.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Benchmark
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
