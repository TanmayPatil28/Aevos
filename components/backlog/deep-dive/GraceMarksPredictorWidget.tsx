import { useState } from "react";
import { Sparkles, Check, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import { CourseState } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function GraceMarksPredictorWidget({ course, courses }: { course: CourseState, courses: CourseState[] }) {
  const { isEligible, requiredMarks } = BacklogEngine.checkGraceMarksEligibility(courses, course);
  const [applied, setApplied] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);
  const [showApplyProgress, setShowApplyProgress] = useState(false);
  const [applyStep, setApplyStep] = useState(0);

  const handleApply = () => {
    setShowApplyProgress(true);
    setApplyStep(0);
    setTimeout(() => setApplyStep(1), 1000); // Verifying
    setTimeout(() => setApplyStep(2), 2500); // Submitting
    setTimeout(() => {
      setApplyStep(3); // Done
      setApplied(true);
      setTimeout(() => setShowApplyProgress(false), 1500);
    }, 4000);
  };

  return (
    <>
      <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="text-[#FFD60A]" size={20} /> Grace Predictor
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Ordinance Verification</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          {isEligible ? (
            <div className="w-full p-4 rounded-[24px] bg-[#FFD60A]/10 flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFD60A]/20 text-[#FFD60A] mb-2">
                <Sparkles size={20} />
              </div>
              <h4 className="text-[17px] font-semibold text-[#FFD60A] mb-1 tracking-tight">Golden Pass Eligible</h4>
              <p className="text-[13px] text-[#FFD60A]/80 leading-snug mb-3">
                You only need <strong>{requiredMarks} more mark{requiredMarks > 1 ? 's' : ''}</strong>. Eligible for ordinance grace.
              </p>
              <button 
                onClick={handleApply}
                disabled={applied || showApplyProgress}
                className={`w-full py-2.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  applied ? "bg-[#30D158] text-white" : "bg-[#FFD60A] text-black hover:bg-[#FFD60A]/90 active:scale-[0.98]"
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
            <div className="w-full p-5 rounded-[24px] bg-[#2C2C2E]">
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Not Eligible</h4>
              <p className="text-[13px] text-[#8E8E93] leading-snug max-w-[200px] mx-auto mb-4">
                You do not meet the strict criteria for university grace marks on this subject.
              </p>
              <button 
                onClick={() => setShowRulebook(true)}
                className="flex items-center justify-center gap-1 mx-auto text-[13px] font-semibold text-[#0A84FF] hover:opacity-80 transition-opacity"
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
          <div className="bg-[#2C2C2E] p-4 rounded-2xl flex items-center gap-4">
            <FileText className="text-[#FF453A]" size={32} />
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
          
          <div className="p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-xl text-[#FF453A]">
            <strong>Your Status:</strong> You require more than the maximum allowable 3 marks, OR you have too many active backlogs to qualify for this ordinance.
          </div>
        </div>
      </IOSSheetModal>

      <IOSSheetModal 
        isOpen={showApplyProgress} 
        onClose={() => {}} // Disabled close during progress
        title="Processing Application"
      >
        <div className="flex flex-col items-center justify-center py-10 space-y-8">
          <div className="relative">
            {applyStep >= 3 ? (
              <CheckCircle2 className="text-[#30D158]" size={64} />
            ) : (
              <div className="w-16 h-16 border-4 border-[#2C2C2E] border-t-[#0A84FF] rounded-full animate-spin" />
            )}
          </div>
          
          <div className="w-full space-y-4 px-6">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${applyStep >= 1 ? 'bg-[#30D158] text-white' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
                {applyStep >= 1 && <Check size={14} />}
              </div>
              <p className={`text-[15px] ${applyStep >= 1 ? 'text-white' : 'text-[#8E8E93]'}`}>Verifying eligibility with Ordinance DB...</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${applyStep >= 2 ? 'bg-[#30D158] text-white' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
                {applyStep >= 2 && <Check size={14} />}
              </div>
              <p className={`text-[15px] ${applyStep >= 2 ? 'text-white' : 'text-[#8E8E93]'}`}>Drafting automated Section-B application...</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${applyStep >= 3 ? 'bg-[#30D158] text-white' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
                {applyStep >= 3 && <Check size={14} />}
              </div>
              <p className={`text-[15px] ${applyStep >= 3 ? 'text-white' : 'text-[#8E8E93]'}`}>Submitting to digital Exam Cell</p>
            </div>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
