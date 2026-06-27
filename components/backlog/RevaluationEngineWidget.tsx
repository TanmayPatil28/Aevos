import { useState } from "react";
import { FileSearch, CheckCircle2, IndianRupee, Check, ShieldCheck } from "lucide-react";
import { RevaluationAnalysis } from "@/lib/backlog-intelligence/engine";
import IOSSheetModal from "@/components/ui/IOSSheetModal";


export default function RevaluationEngineWidget({ analysisData, coursesList }: { analysisData: { [courseId: string]: RevaluationAnalysis }, coursesList: any[] }) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const courses = Object.keys(analysisData);
  if (courses.length === 0) return null;

  // For the widget summary, pick the best candidate for revaluation
  const bestCandidateId = courses.reduce((prev, current) => {
    return (analysisData[current].passProbability > analysisData[prev].passProbability) ? current : prev;
  }, courses[0]);

  const bestData = analysisData[bestCandidateId];
  const totalCost = Object.values(analysisData).reduce((sum, data) => sum + data.estimatedCost, 0);
  
  const bestCourseCode = coursesList.find(c => c.id === bestCandidateId)?.code || bestCandidateId;

  const toggleSelection = (id: string) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(prev => prev.filter(c => c !== id));
    } else {
      setSelectedCourses(prev => [...prev, id]);
    }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentDone(true);
    }, 2000);
  };

  const currentSelectionCost = selectedCourses.reduce((sum, id) => sum + (analysisData[id]?.estimatedCost || 0), 0);

  return (
    <>
      <div className="p-6 rounded-[24px] bg-surface-raised border border-white/[0.04] shadow-none flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-bold text-white flex items-center gap-2 tracking-wide">
              <FileSearch className="text-status-warning" size={20} /> Reval Engine
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Statistical Pass Probability</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-4 bg-surface rounded-full mb-3 border border-white/[0.04]">
              <span className="text-3xl font-black text-status-warning">{(bestData.passProbability * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[15px] text-[#8E8E93] font-bold tracking-tight">
              Best Chance: <span className="text-white font-semibold">{bestCourseCode}</span>
            </p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-3 rounded-2xl bg-surface border border-white/[0.04] flex justify-between items-center text-[15px]">
              <span className="text-[#8E8E93] font-bold text-[11px] uppercase tracking-widest">AI Recommendation</span>
              <span className={`font-bold text-[11px] uppercase tracking-widest ${bestData.recommendation.includes("REVAL") ? "text-status-success" : "text-status-critical"}`}>
                {bestData.recommendation.replace("_", " ")}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-surface border border-white/[0.04] flex justify-between items-center text-[15px]">
              <span className="text-[#8E8E93] font-bold text-[11px] uppercase tracking-widest">Est. Total Cost</span>
              <span className="font-semibold text-white flex items-center tracking-tight">
                <IndianRupee size={14} className="mr-0.5 text-[#8E8E93]"/>{totalCost}
              </span>
            </div>
          </div>


            <button 
              onClick={() => {
                setSelectedCourses([bestCandidateId]);
                setPaymentDone(false);
                setShowApplyModal(true);
              }}
              className="w-full py-3 rounded-full bg-white text-black font-bold text-[13px] tracking-wider uppercase hover:brightness-110 transition-all"
            >
              Apply for Revaluation
            </button>

        </div>
      </div>

      <IOSSheetModal 
        isOpen={showApplyModal} 
        onClose={() => setShowApplyModal(false)} 
        title="Revaluation Portal"
      >
        {!paymentDone ? (
          <div className="space-y-6 pb-6">
            <div className="bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 p-4 rounded-2xl flex gap-3">
              <ShieldCheck className="text-[#FF9F0A] shrink-0" size={24} />
              <p className="text-[13px] text-[#FF9F0A]/90 leading-relaxed">
                By applying for revaluation, you agree to the university ordinance stating that marks may increase, decrease, or remain unchanged.
              </p>
            </div>

            <div>
              <h4 className="text-[15px] font-semibold text-white mb-3">Select Subjects</h4>
              <div className="space-y-2">
                {courses.map(id => {
                  const cCode = coursesList.find(c => c.id === id)?.code || id;
                  const isSelected = selectedCourses.includes(id);
                  const isRecommended = analysisData[id].recommendation.includes("REVAL");
                  return (
                    <div 
                      key={id}
                      onClick={() => toggleSelection(id)}
                      className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors active:scale-[0.98] ${
                        isSelected ? "bg-[#30D158]/10 border border-[#30D158]/30" : "bg-[#2C2C2E] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected ? "bg-[#30D158] border-[#30D158] text-white" : "border-[#8E8E93]/30 text-transparent"
                        }`}>
                          <Check size={14} />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-white">{cCode}</p>
                          {isRecommended && <p className="text-[11px] text-[#30D158] font-bold uppercase tracking-wider">AI Recommended</p>}
                        </div>
                      </div>
                      <span className="text-[15px] text-white flex items-center">
                        <IndianRupee size={14} className="mr-0.5 text-[#8E8E93]" />
                        {analysisData[id].estimatedCost}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#2C2C2E] p-4 rounded-2xl">
              <span className="text-[15px] font-semibold text-white">Total Fees</span>
              <span className="text-[20px] font-bold text-white flex items-center">
                <IndianRupee size={18} className="mr-0.5 text-[#8E8E93]" />
                {currentSelectionCost}
              </span>
            </div>

            <button 
              onClick={handlePay}
              disabled={selectedCourses.length === 0 || processing}
              className={`w-full py-3.5 rounded-xl font-semibold text-[17px] transition-all flex items-center justify-center ${
                selectedCourses.length === 0 ? "bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed" : 
                processing ? "bg-[#0A84FF]/70 text-white" : "bg-[#0A84FF] text-white active:scale-[0.98]"
              }`}
            >
              {processing ? "Processing Payment..." : `Pay ₹${currentSelectionCost} securely`}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="text-[#30D158] mb-4" size={80} />
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Payment Successful</h3>
            <p className="text-[15px] text-[#8E8E93] max-w-sm mb-8">
              Your revaluation request for {selectedCourses.length} subject(s) has been forwarded to the exam cell.
            </p>
            <button 
              onClick={() => setShowApplyModal(false)}
              className="px-8 py-3 rounded-xl bg-[#2C2C2E] text-white font-semibold text-[15px] hover:bg-[#3A3A3C] active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </IOSSheetModal>
    </>
  );
}
