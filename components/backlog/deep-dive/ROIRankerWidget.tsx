import { Target, ChevronRight } from "lucide-react";
import { CourseState, SemesterHistoryEntry } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";

export default function ROIRankerWidget({ 
  courses, 
  history,
  onSelectCourse
}: { 
  courses: CourseState[], 
  history: SemesterHistoryEntry[],
  onSelectCourse?: (courseId: string) => void
}) {
  const roiRanking = BacklogEngine.calculateCGPARoi(courses, history);

  return (
    <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
            <Target className="text-[#30D158]" size={20} /> ROI Ranker
          </h3>
          <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Dead Credit Yield Analysis</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-2">
        {roiRanking.map((item, index) => {
          const c = courses.find(course => course.id === item.courseId);
          if (!c) return null;
          return (
            <div 
              key={item.courseId} 
              onClick={() => onSelectCourse && onSelectCourse(item.courseId)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#2C2C2E] cursor-pointer hover:bg-[#3A3A3C] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-bold ${
                  index === 0 ? "bg-[#30D158]/20 text-[#30D158]" : "bg-[#3A3A3C] text-[#8E8E93]"
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-[17px] font-semibold text-white tracking-tight leading-none">{c.code}</h4>
                  <p className="text-[13px] text-[#8E8E93] truncate max-w-[120px] mt-1">{c.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[15px] font-bold text-[#30D158]">+{item.cgpaBoost.toFixed(3)}</div>
                  <div className="text-[11px] text-[#8E8E93] uppercase tracking-wide font-semibold mt-0.5">Yield</div>
                </div>
                <ChevronRight size={18} className="text-[#8E8E93]" />
              </div>
            </div>
          );
        })}
        {roiRanking.length === 0 && (
          <div className="text-center text-[#8E8E93] text-[15px] mt-10">No backlogs to rank.</div>
        )}
      </div>
    </div>
  );
}
