"use client";

import { User, ShieldCheck, MapPin, Building2, RefreshCw } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";
import { getPresetById } from "@/lib/presets";

interface AcademicIdentityBarProps {
  onSyncClick: () => void;
}

export function AcademicIdentityBar({ onSyncClick }: AcademicIdentityBarProps) {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const preset = getPresetById(context.presetId || "sppu");

  const { studentIdentity = {}, institution, academic, hasAuthoritativeData } = context.identity;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-[#1D1D1F] p-6 shadow-none group">
      {/* Background glow */}
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Identity Info */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] shrink-0">
            <User className="w-8 h-8 text-indigo-400" />
          </div>
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {(studentIdentity as any)?.name || "Academic Profile"}
              </h1>
              {hasAuthoritativeData && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </div>
              )}
            </div>
            
            <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {preset?.name || institution || "No Institution Selected"}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {academic?.programme && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <MapPin className="w-3 h-3" /> {(academic as any).programme}
                </div>
              )}
              {context.identity.regulation && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
                  Reg: {context.identity.regulation}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Sync */}
        <div className="flex items-center gap-8 border-t md:border-t-0 md: border-t border-white/20 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current CGPA</span>
            <span className="text-3xl font-black font-mono text-white leading-none">
              {context.metrics.cgpa > 0 ? context.metrics.cgpa.toFixed(2) : "--"}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Credits Earned</span>
            <span className="text-3xl font-black font-mono text-white leading-none">
              {context.metrics.earnedCredits > 0 ? context.metrics.earnedCredits : "--"}
            </span>
          </div>

          <button 
            onClick={onSyncClick}
            className="ml-auto md:ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl transition-colors font-bold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}
