import { useState } from "react";
import { Target, AlertOctagon, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { PlacementDisqualification } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function PlacementScannerWidget({ disqualifications }: { disqualifications: PlacementDisqualification[] }) {
  const [showPolicies, setShowPolicies] = useState(false);
  const isDanger = disqualifications.length > 0;

  return (
    <>
      <div className="p-6 rounded-[24px] bg-surface-raised border border-white/[0.04] shadow-none flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <Target className={isDanger ? "text-status-critical" : "text-brand"} size={20} /> Placement Scanner
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Dream Company Criteria</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-between">
          {isDanger ? (
            <div className="space-y-4">
              <div className="p-4 bg-surface border border-status-critical rounded-2xl flex items-start gap-3">
                <AlertOctagon className="text-status-critical shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-[15px] text-status-critical font-semibold tracking-tight">Auto-Disqualification Risk</p>
                  <p className="text-[13px] text-white/70 mt-1 leading-snug">The following backlogs violate the strict criteria of your pinned dream companies.</p>
                </div>
              </div>
              <ul className="space-y-3">
                {disqualifications.map(dis => (
                  <li key={dis.courseId} className="bg-surface border border-white/[0.04] p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[15px] text-white font-bold">{dis.courseCode}</span>
                      <span className="text-[11px] uppercase tracking-wider font-bold bg-status-critical text-white px-2.5 py-1 rounded-full">Critical</span>
                    </div>
                    <p className="text-[13px] text-[#8E8E93]">Blocks: <span className="text-white">{dis.blockedCompanies.join(", ")}</span></p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <div className="p-4 bg-status-success rounded-full mb-4">
                <CheckCircle2 className="text-black" size={32} />
              </div>
              <p className="text-[17px] text-white font-semibold tracking-tight">No Placement Blockers</p>
              <p className="text-[15px] text-[#8E8E93] mt-2 leading-snug max-w-[200px]">
                Your current backlogs do not instantly disqualify you from your target companies.
              </p>
            </div>
          )}

          <button 
            onClick={() => setShowPolicies(true)}
            className="w-full mt-4 py-3 rounded-xl bg-surface border border-white/[0.04] text-white font-semibold text-[15px] hover:bg-[#2A2A2D] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            View Company Policies <ChevronRight size={16} className="text-[#8E8E93]" />
          </button>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showPolicies} 
        onClose={() => setShowPolicies(false)} 
        title="Pinned Companies"
      >
        <div className="space-y-4 pb-6">
          <div className="bg-surface border border-white/[0.04] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Briefcase className="text-status-critical" size={20} />
              </div>
              <div>
                <h4 className="text-[17px] font-semibold text-white tracking-tight">Google</h4>
                <p className="text-[13px] text-[#8E8E93]">Software Engineering</p>
              </div>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#8E8E93]">Max Active Backlogs</span>
                <span className="font-semibold text-white">0</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#8E8E93]">Max Historical Backlogs</span>
                <span className="font-semibold text-white">2</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#8E8E93]">Min CGPA</span>
                <span className="font-semibold text-white">8.0</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-white/[0.04] p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <div>
                <h4 className="text-[17px] font-semibold text-white tracking-tight">TCS Digital</h4>
                <p className="text-[13px] text-[#8E8E93]">Systems Engineer</p>
              </div>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#8E8E93]">Max Active Backlogs</span>
                <span className="font-semibold text-[#FF453A]">1</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#8E8E93]">Min CGPA</span>
                <span className="font-semibold text-white">7.0</span>
              </div>
            </div>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
