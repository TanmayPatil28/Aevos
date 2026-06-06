import { useState, useEffect } from "react";
import { History, TrendingUp, Loader2 } from "lucide-react";
import { CourseState, SemesterHistoryEntry } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";

export default function TimeTravelSimulatorWidget({ 
  course, 
  courses, 
  history,
  currentCgpa,
  targetGrade,
  setTargetGrade
}: { 
  course: CourseState;
  courses: CourseState[];
  history: SemesterHistoryEntry[];
  currentCgpa: number;
  targetGrade: string;
  setTargetGrade: (grade: string) => void;
}) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [displayedCgpa, setDisplayedCgpa] = useState<number | null>(null);
  
  const hypotheticalCgpa = BacklogEngine.calculateTimeTravelCGPA(course, targetGrade, history, courses);
  const boost = (hypotheticalCgpa - currentCgpa).toFixed(3);

  const gradeOptions = ["O", "A+", "A", "B+", "B", "C", "P"];

  // Initialize display value
  useEffect(() => {
    if (displayedCgpa === null) {
      setDisplayedCgpa(hypotheticalCgpa);
    }
  }, [hypotheticalCgpa, displayedCgpa]);

  const handleGradeSelect = (g: string) => {
    if (g === targetGrade) return;
    
    setIsCalculating(true);
    setTargetGrade(g);
    
    // Simulate complex calculation time
    setTimeout(() => {
      // The parent will pass down the new targetGrade, which updates hypotheticalCgpa
      setIsCalculating(false);
    }, 1200);
  };

  // Sync display value when not calculating
  useEffect(() => {
    if (!isCalculating) {
      setDisplayedCgpa(hypotheticalCgpa);
    }
  }, [isCalculating, hypotheticalCgpa]);

  return (
    <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
            <History className="text-[#0A84FF]" size={20} /> Time-Travel Simulator
          </h3>
          <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Retroactive Injection: {course.code}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div>
          <label className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2 block ml-1">Target Grade</label>
          <div className="flex bg-[#2C2C2E] p-1 rounded-2xl overflow-x-auto no-scrollbar relative">
            {gradeOptions.map(g => (
              <button
                key={g}
                onClick={() => handleGradeSelect(g)}
                disabled={isCalculating}
                className={`flex-1 min-w-[40px] py-2 rounded-xl text-[15px] font-semibold transition-all ${
                  targetGrade === g 
                  ? "bg-[#3A3A3C] text-white shadow-sm" 
                  : "text-[#8E8E93] hover:text-white"
                } ${isCalculating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#2C2C2E]">
            <div className="text-[13px] text-[#8E8E93] font-semibold uppercase tracking-wide mb-1">Current</div>
            <div className="text-[22px] font-bold text-white font-mono tracking-tight">{currentCgpa > 0 ? currentCgpa.toFixed(2) : "0.00"}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#2C2C2E] relative overflow-hidden">
            <div className="text-[13px] text-[#8E8E93] font-semibold uppercase tracking-wide mb-1">Simulated</div>
            
            {isCalculating ? (
              <div className="flex items-center gap-2 h-[33px]">
                <Loader2 className="animate-spin text-[#0A84FF]" size={18} />
                <span className="text-[13px] text-[#0A84FF] font-semibold tracking-tight animate-pulse">Running Simulation...</span>
              </div>
            ) : (
              <div className="text-[22px] font-bold text-white font-mono tracking-tight flex items-center gap-2 h-[33px]">
                {displayedCgpa?.toFixed(2) || "0.00"}
                <span className="text-[13px] font-bold text-[#30D158] flex items-center gap-0.5">
                  <TrendingUp size={14} strokeWidth={3} /> +{boost}
                </span>
              </div>
            )}
            
            {/* Cool scanning effect during calculation */}
            {isCalculating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0A84FF]/10 to-transparent w-[200%] animate-[slide_1.5s_ease-in-out_infinite]" style={{
                animation: 'slide 1.5s ease-in-out infinite'
              }}>
                <style jsx>{`
                  @keyframes slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(50%); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
