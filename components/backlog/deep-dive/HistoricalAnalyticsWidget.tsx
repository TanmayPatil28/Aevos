import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BookOpen } from "lucide-react";
import { HistoricalAnalyticsEngine } from "@/lib/backlog-intelligence/historical";
import { CourseState } from "@/stores/usmStore";

// Authentic iOS system colors for charts (Blue, Orange, Green, Purple)
const COLORS = ["#0A84FF", "#FF9F0A", "#30D158", "#5E5CE6"]; 

export default function HistoricalAnalyticsWidget({ course }: { course: CourseState }) {
  const topics = HistoricalAnalyticsEngine.generateTopics(course.name);

  return (
    <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
            <BookOpen className="text-[#5E5CE6]" size={20} /> Syllabus Weightage
          </h3>
          <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Historical Exam Pattern</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="w-1/2 h-full min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topics}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                paddingAngle={2}
                dataKey="weightage"
                stroke="none"
                cornerRadius={6}
              >
                {topics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#2C2C2E", border: "none", borderRadius: "14px", color: "#fff", padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                itemStyle={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}
                formatter={(value: number) => [`${value}%`, "Weightage"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2 flex flex-col justify-center space-y-3">
          {topics.map((topic, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <div>
                <p className="text-[15px] font-semibold text-white leading-tight truncate max-w-[140px] tracking-tight" title={topic.name}>{topic.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-[13px] text-[#8E8E93] font-medium">{topic.weightage}%</p>
                  <span className="text-[10px] text-[#8E8E93]">•</span>
                  <p className={`text-[13px] font-semibold ${
                    topic.difficulty === "HARD" ? "text-[#FF453A]" :
                    topic.difficulty === "MEDIUM" ? "text-[#FF9F0A]" : "text-[#30D158]"
                  }`}>{topic.difficulty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
