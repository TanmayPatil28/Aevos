import { useState } from "react";
import { SlidersHorizontal, BookOpen, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { CourseState } from "@/stores/usmStore";
import { RecoveryPlanResult } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function UnifiedSimulator({ 
  initialPlan, 
  courses, 
  currentSemester,
  onSave 
}: { 
  initialPlan: RecoveryPlanResult; 
  courses: CourseState[]; 
  currentSemester: number;
  onSave: (plan: { [courseId: string]: number }) => void;
}) {
  const [plan, setPlan] = useState<{ [courseId: string]: number }>(initialPlan.plannedCourses);
  const [unplanned, setUnplanned] = useState<CourseState[]>(initialPlan.unplannableCourses);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const activeBacklogs = courses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase()));
  const availableSemesters = Array.from({ length: 8 - currentSemester + 1 }, (_, i) => currentSemester + i);

  const handleMove = (course: CourseState, targetSem: number | "UNPLANNED") => {
    if (targetSem === "UNPLANNED") {
      setPlan(prev => {
        const newPlan = { ...prev };
        delete newPlan[course.id];
        return newPlan;
      });
      if (!unplanned.find(c => c.id === course.id)) setUnplanned(prev => [...prev, course]);
    } else {
      setPlan(prev => ({ ...prev, [course.id]: targetSem }));
      setUnplanned(prev => prev.filter(c => c.id !== course.id));
    }
  };

  const executeSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(plan);
      setIsSaving(false);
      setIsSaved(true);
    }, 1500);
  };

  return (
    <>
      <div className="p-6 rounded-[32px] bg-[#1C1C1E] h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <SlidersHorizontal className="text-[#0A84FF]" size={20} /> Recovery Timeline
            </h3>
          </div>
          <button 
            onClick={() => {
              setIsSaved(false);
              setShowConfirmModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF] text-white text-[15px] font-semibold hover:bg-[#0A84FF]/90 transition-all active:scale-[0.98]"
          >
            <Save size={16} /> Commit Strategy
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {unplanned.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
              <h4 className="text-[13px] font-bold text-[#FF453A] mb-3 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={14} /> Unplanned Backlogs
              </h4>
              <div className="flex flex-wrap gap-2">
                {unplanned.map(c => (
                  <div key={c.id} className="group relative">
                    <span className="px-3 py-1.5 rounded-xl bg-[#FF453A]/20 text-white text-[13px] font-semibold cursor-pointer">
                      {c.code}
                    </span>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover:flex flex-col bg-[#2C2C2E] border border-white/5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 overflow-hidden min-w-[140px]">
                      {availableSemesters.map(s => (
                        <button key={s} onClick={() => handleMove(c, s)} className="px-4 py-2 text-[13px] text-white text-left hover:bg-[#3A3A3C] font-medium border-b border-white/5 last:border-0 transition-colors">
                          Move to Sem {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {availableSemesters.map(sem => {
              const semCourses = activeBacklogs.filter(c => plan[c.id] === sem);
              return (
                <div key={sem} className="p-4 rounded-2xl bg-[#2C2C2E]">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                    <h4 className="text-white text-[15px] font-semibold flex items-center gap-2 tracking-tight">
                      <BookOpen size={16} className="text-[#0A84FF]" /> Semester {sem}
                    </h4>
                    <span className="text-[13px] text-[#8E8E93] font-medium">{semCourses.length} backlogs</span>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {semCourses.map(c => (
                      <div key={c.id} className="group relative">
                        <span className="px-3 py-1.5 rounded-xl bg-[#3A3A3C] text-white text-[13px] font-semibold cursor-pointer">
                          {c.code}
                        </span>
                        <div className="absolute top-full left-0 mt-2 hidden group-hover:flex flex-col bg-[#2C2C2E] border border-white/5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20 overflow-hidden min-w-[140px]">
                          <button onClick={() => handleMove(c, "UNPLANNED")} className="px-4 py-2 text-[13px] text-left hover:bg-[#3A3A3C] font-semibold text-[#FF453A] border-b border-white/5 transition-colors">
                            Unplan
                          </button>
                          {availableSemesters.filter(s => s !== sem).map(s => (
                            <button key={s} onClick={() => handleMove(c, s)} className="px-4 py-2 text-[13px] text-white text-left hover:bg-[#3A3A3C] font-medium border-b border-white/5 last:border-0 transition-colors">
                              Move to Sem {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {semCourses.length === 0 && <span className="text-[13px] text-[#8E8E93] italic pt-1">Empty block</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        title="Commit Strategy"
      >
        {!isSaved ? (
          <div className="space-y-6 pb-6">
            <div className="text-center py-2">
              <h4 className="text-[17px] font-semibold text-white mb-2 tracking-tight">Finalize Recovery Timeline</h4>
              <p className="text-[15px] text-[#8E8E93] max-w-sm mx-auto leading-snug">
                You are about to overwrite your global profile with this new recovery strategy.
              </p>
            </div>

            <div className="bg-[#2C2C2E] rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <span className="text-[15px] text-[#8E8E93]">Planned Backlogs</span>
                <span className="text-[17px] font-bold text-white">{Object.keys(plan).length}</span>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="text-[15px] text-[#8E8E93]">Unplanned (At Risk)</span>
                <span className={`text-[17px] font-bold ${unplanned.length > 0 ? "text-[#FF453A]" : "text-white"}`}>
                  {unplanned.length}
                </span>
              </div>
            </div>

            {unplanned.length > 0 && (
              <div className="p-4 bg-[#FF453A]/10 rounded-2xl">
                <p className="text-[13px] text-[#FF453A] font-medium leading-relaxed">
                  <strong>Warning:</strong> You have {unplanned.length} unplanned backlogs. These will not be tracked in your active study plan, increasing the risk of missing them before graduation.
                </p>
              </div>
            )}

            <button 
              onClick={executeSave}
              disabled={isSaving}
              className={`w-full py-3.5 rounded-xl font-semibold text-[17px] transition-all flex items-center justify-center gap-2 ${
                isSaving ? "bg-[#0A84FF]/70 text-white" : "bg-[#0A84FF] text-white active:scale-[0.98]"
              }`}
            >
              {isSaving ? "Saving to Profile..." : "Confirm & Save"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="text-[#30D158] mb-4" size={80} />
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Strategy Committed</h3>
            <p className="text-[15px] text-[#8E8E93] max-w-sm mb-8">
              Your recovery timeline has been successfully saved to your profile and will dictate your daily study goals.
            </p>
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="px-8 py-3 rounded-xl bg-[#2C2C2E] text-white font-semibold text-[15px] hover:bg-[#3A3A3C] active:scale-[0.98]"
            >
              Dismiss
            </button>
          </div>
        )}
      </IOSSheetModal>
    </>
  );
}
