import { useState } from "react";
import { ShieldAlert, ChevronRight, AlertTriangle } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function SafetyNetWidget() {
  const { courses, presetId } = useUSMStore();
  const [showLogic, setShowLogic] = useState(false);
  
  const activeBacklogsCount = courses.filter((c) => ["F", "FF", "FAIL", "ABSENT", "AB", "NP"].includes((c.grade || "").toUpperCase())).length;
  const survival = BacklogEngine.calculateWorstCaseSurvival(activeBacklogsCount, presetId);

  return (
    <>
      <div className="p-6 rounded-[24px] bg-surface-raised border border-white/[0.04] shadow-none flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <ShieldAlert className="text-status-critical" size={20} /> Safety Net
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Worst-Case Survival Calculator</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          {survival.nextYearRisk ? (
            <div 
              onClick={() => setShowLogic(true)}
              className="w-full p-5 rounded-[24px] bg-surface border border-status-critical cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-critical text-white mb-3">
                <ShieldAlert size={24} />
              </div>
              <h4 className="text-[17px] font-semibold text-status-critical mb-2 tracking-tight">Year Down Risk</h4>
              <p className="text-[15px] text-white/80 leading-snug">
                If you fail this exam again, you will exceed the {survival.allowed} backlog limit and be detained.
              </p>
              <div className="mt-3 flex items-center justify-center text-[13px] font-semibold text-white/60">
                Tap for logic breakdown
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setShowLogic(true)}
              className="w-full p-5 rounded-[24px] bg-surface border border-status-success cursor-pointer active:scale-[0.98] transition-transform"
            >
              <h4 className="text-[17px] font-semibold text-status-success mb-2 tracking-tight">Survival Confirmed</h4>
              <p className="text-[15px] text-white/80 leading-snug">
                Even in the absolute worst-case scenario where you fail this exam, you will not hit the Year Down limit.
              </p>
              <div className="mt-3 flex items-center justify-center text-[13px] font-semibold text-white/60">
                Tap for logic breakdown
              </div>
            </div>
          )}
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showLogic} 
        onClose={() => setShowLogic(false)} 
        title="Survival Logic"
      >
        <div className="space-y-6 pb-6">
          <div className="flex justify-between items-center bg-surface border border-white/[0.04] p-4 rounded-2xl">
            <span className="text-[15px] text-[#8E8E93]">Current Backlogs</span>
            <span className="text-[17px] font-bold text-white">{activeBacklogsCount}</span>
          </div>
          
          <div className="flex justify-between items-center bg-surface border border-white/[0.04] p-4 rounded-2xl">
            <span className="text-[15px] text-[#8E8E93]">Failing this target exam</span>
            <span className="text-[17px] font-bold text-status-critical">+1</span>
          </div>
          
          <div className="flex justify-between items-center bg-surface border border-white/[0.04] p-4 rounded-2xl">
            <span className="text-[15px] text-white font-semibold">Total Projected Backlogs</span>
            <span className="text-[20px] font-black text-white">{activeBacklogsCount + 1}</span>
          </div>

          <div className="flex items-center gap-4 py-4 border-y border-white/5">
            <AlertTriangle className={survival.nextYearRisk ? "text-status-critical" : "text-[#8E8E93]"} size={32} />
            <div>
              <h4 className="text-[15px] text-white font-semibold mb-1">University Limit: {survival.allowed} Backlogs</h4>
              <p className="text-[13px] text-[#8E8E93]">
                {survival.nextYearRisk 
                  ? "Your projected total exceeds the maximum limit. You will be detained."
                  : "Your projected total is within the safe limit. You can carry it forward."}
              </p>
            </div>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
