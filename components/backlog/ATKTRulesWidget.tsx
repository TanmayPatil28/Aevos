import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ChevronRight, FileText } from "lucide-react";
import { ATKTRulesStatus } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function ATKTRulesWidget({ status }: { status: ATKTRulesStatus }) {
  const [showOrdinance, setShowOrdinance] = useState(false);
  
  const isDanger = status.yearDownRisk;
  const isWarning = status.currentActiveBacklogs >= status.allowedBacklogsToProceed - 1 && !isDanger;

  return (
    <>
      <div className={`p-6 rounded-[32px] flex flex-col h-full ${
        isDanger ? "bg-[#FF453A]/10 border border-[#FF453A]/20" : 
        isWarning ? "bg-[#FF9F0A]/10 border border-[#FF9F0A]/20" : 
        "bg-[#30D158]/10 border border-[#30D158]/20"
      }`}>
        <div className="flex items-center gap-3 w-full justify-between mb-4">
          <h3 className={`text-[17px] font-semibold flex items-center gap-2 tracking-tight ${
            isDanger ? "text-[#FF453A]" : isWarning ? "text-[#FF9F0A]" : "text-[#30D158]"
          }`}>
            {isDanger ? <ShieldAlert size={20} /> :
             isWarning ? <AlertTriangle size={20} /> :
             <CheckCircle2 size={20} />}
            ATKT Status
          </h3>
          <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-black/20 ${
            isDanger ? "text-[#FF453A]" : isWarning ? "text-[#FF9F0A]" : "text-[#30D158]"
          }`}>
            {isDanger ? "YEAR DOWN RISK" : isWarning ? "WARNING" : "SAFE"}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-[48px] font-black leading-none ${
              isDanger ? "text-[#FF453A]" : isWarning ? "text-[#FF9F0A]" : "text-[#30D158]"
            }`}>{status.currentActiveBacklogs}</span>
            <span className="text-[20px] text-white/50 mb-1 font-semibold">/ {status.allowedBacklogsToProceed}</span>
          </div>
          <p className="text-[15px] text-white/70 font-medium">Active Backlogs vs Allowed</p>
        </div>

        {status.criticalWarning && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FF453A]/20 text-[13px] text-[#FF453A] font-semibold leading-relaxed">
            {status.criticalWarning}
          </div>
        )}

        <button 
          onClick={() => setShowOrdinance(true)}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-[15px] hover:opacity-80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isDanger ? "bg-[#FF453A] text-white" : 
            isWarning ? "bg-[#FF9F0A] text-black" : 
            "bg-[#30D158] text-black"
          }`}
        >
          Read Full Ordinance
        </button>
      </div>

      <IOSSheetModal 
        isOpen={showOrdinance} 
        onClose={() => setShowOrdinance(false)} 
        title="ATKT Guidelines"
      >
        <div className="space-y-6 text-[#8E8E93] text-[15px] leading-relaxed pb-8">
          <div className="bg-[#2C2C2E] p-4 rounded-2xl flex items-center gap-4">
            <FileText className="text-[#0A84FF]" size={32} />
            <div>
              <h4 className="text-white font-semibold text-[17px]">Allowed To Keep Terms (ATKT)</h4>
              <p className="text-[13px]">University Standard Ordinance</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">1. Eligibility for Next Year</h4>
            <p>
              A student is eligible for admission to the next academic year provided they do not carry forward more than <strong>{status.allowedBacklogsToProceed} total backlog subjects</strong> from all previous semesters combined.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">2. Year Down Rules</h4>
            <p>
              If a student exceeds the maximum limit, their admission to the next academic year is withheld ("Year Down"). They must clear the pending subjects in the supplementary exams before they can resume their regular degree progression.
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border ${
            isDanger ? "bg-[#FF453A]/10 border-[#FF453A]/20 text-[#FF453A]" : 
            isWarning ? "bg-[#FF9F0A]/10 border-[#FF9F0A]/20 text-[#FF9F0A]" : 
            "bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]"
          }`}>
            <strong>Your Status:</strong> You currently have {status.currentActiveBacklogs} backlogs out of the allowed {status.allowedBacklogsToProceed}. 
            {isDanger && " You are violating the limit and facing a Year Down."}
            {isWarning && " You are dangerously close to the limit."}
            {!isDanger && !isWarning && " You are safely within the permitted limits."}
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
