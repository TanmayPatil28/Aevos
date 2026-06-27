import { useState } from "react";
import { Sparkles, Check, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import { CourseState } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function GraceMarksPredictorWidget({ course, courses }: { course: CourseState, courses: CourseState[] }) {
  const { isEligible, requiredMarks } = BacklogEngine.checkGraceMarksEligibility(courses, course);
  const [applied, setApplied] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);

  const handleApply = () => {
    setApplied(true);
  };

  return (
    <>
      <div className="p-6 rounded-[24px] bg-surface-raised border border-white/[0.04] shadow-none flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="text-status-warning" size={20} /> Grace Predictor
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Ordinance Verification</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          {isEligible ? (
            <div className="w-full p-4 rounded-[24px] bg-surface border border-status-warning flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-status-warning text-black mb-2">
                <Sparkles size={20} />
              </div>
              <h4 className="text-[17px] font-semibold text-status-warning mb-1 tracking-tight">Golden Pass Eligible</h4>
              <p className="text-[13px] text-white/80 leading-snug mb-3">
                You only need <strong>{requiredMarks} more mark{requiredMarks > 1 ? 's' : ''}</strong>. Eligible for ordinance grace.
              </p>
              <button 
                onClick={handleApply}
                disabled={applied}
                className={`w-full py-2.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  applied ? "bg-status-success text-white" : "bg-status-warning text-black hover:brightness-110 active:scale-[0.98]"
                }`}
              >
                {applied ? (
                  <>
                    <Check size={18} /> Request Sent to Exam Cell
                  </>
                ) : (
                  "Auto-Apply via Portal"
                )}
              </button>
            </div>
          ) : (
            <div className="w-full p-5 rounded-[24px] bg-surface border border-white/[0.04]">
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Not Eligible</h4>
              <p className="text-[13px] text-[#8E8E93] leading-snug max-w-[200px] mx-auto mb-4">
                You do not meet the strict criteria for university grace marks on this subject.
              </p>
              <button 
                onClick={() => setShowRulebook(true)}
                className="flex items-center justify-center gap-1 mx-auto text-[13px] font-semibold text-brand hover:opacity-80 transition-opacity"
              >
                View Ordinance Rulebook <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showRulebook} 
        onClose={() => setShowRulebook(false)} 
        title="University Ordinance (Extract)"
      >
        <div className="space-y-6 text-[#8E8E93] text-[15px] leading-relaxed pb-8">
          <div className="bg-surface border border-white/[0.04] p-4 rounded-2xl flex items-center gap-4">
            <FileText className="text-status-critical" size={32} />
            <div>
              <h4 className="text-white font-semibold text-[17px]">Ordinance 0.229</h4>
              <p className="text-[13px]">Updated 2024</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">1. Grace Marks for Passing</h4>
            <p>
              A candidate who fails in one or more subjects by a margin of <strong>not more than 1% of the total marks</strong> for that head of passing may be given grace marks to clear the subject, provided they are not simultaneously failing more than 2 distinct heads.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">2. Maximum Allowance</h4>
            <p>
              The maximum grace marks allowable under this ordinance is strictly capped at <strong>3 marks</strong> per subject, regardless of the maximum marks of the paper.
            </p>
          </div>
          
          <div className="p-4 bg-surface border border-status-critical rounded-xl text-white">
            <strong>Your Status:</strong> You require more than the maximum allowable 3 marks, OR you have too many active backlogs to qualify for this ordinance.
          </div>
        </div>
      </IOSSheetModal>

    </>
  );
}
