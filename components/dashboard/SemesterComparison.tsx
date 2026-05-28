"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "../ui/Card";

const MotionCard = motion(Card);

interface ComparisonData {
  semester: string;
  date: string;
  subjects: number;
  credits: number;
  gpa: number;
  cgpa: number;
  delta: number;
  rank: string;
}

export default function SemesterComparison({ data }: { data: ComparisonData[] }) {
  const getRankBadge = (rank: string) => {
    switch (rank) {
      case "1st": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_#eab30833]";
      case "2nd": return "bg-slate-400/10 text-slate-400 border-slate-400/20 shadow-[0_0_15px_#94a3b833]";
      case "3rd": return "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_#f9731633]";
      default: return "bg-surface-container text-on-surface-variant/50 border-outline-variant/10";
    }
  };

  const avgGpa = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.gpa, 0) / data.length).toFixed(2) : "0.00";

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col h-fit group"
    >
      
      <div className="mb-10 relative z-10">
        <h3 className="text-2xl font-black font-headline tracking-tighter text-white">Semester Comparison</h3>
        <p className="text-[11px] text-white/30 font-black mt-2 uppercase tracking-[0.2em]">Cross-Session Analysis</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/[0.05]">
              <th className="pb-4 px-4 whitespace-nowrap">Semester</th>
              <th className="pb-4 px-4 whitespace-nowrap">Date</th>
              <th className="pb-4 px-4 whitespace-nowrap">Subjects</th>
              <th className="pb-4 px-4 whitespace-nowrap">Credits</th>
              <th className="pb-4 px-4 whitespace-nowrap">GPA</th>
              <th className="pb-4 px-4 whitespace-nowrap">CGPA</th>
              <th className="pb-4 px-4 whitespace-nowrap">Variance</th>
              <th className="pb-4 px-4 text-right whitespace-nowrap">Rank Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {data.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group/row hover:bg-white/[0.02] transition-colors duration-300"
                  >
                    <td className="py-6 px-4 font-black text-white italic">{row.semester}</td>
                    <td className="py-6 px-4 text-sm font-bold text-white/40">{row.date}</td>
                    <td className="py-6 px-4 text-sm font-bold text-white/40">{row.subjects}</td>
                    <td className="py-6 px-4 text-sm font-bold text-white/40">{row.credits}</td>
                    <td className="py-6 px-4">
                      <span className="text-sm font-black text-white">{row.gpa.toFixed(2)}</span>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                        {row.cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      {row.delta === 0 ? (
                        <span className="text-white/10 flex items-center justify-start w-fit"><Minus size={14} /></span>
                      ) : (
                        <div className={`flex items-center gap-1.5 text-xs font-black ${row.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {row.delta > 0 ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                          {row.delta > 0 ? `+${row.delta.toFixed(2)}` : row.delta.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border italic ${getRankBadge(row.rank)}`}>
                        {row.rank}
                      </span>
                    </td>
                  </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5">
              <td colSpan={4} className="py-5 px-4 font-bold text-sm text-white">Academic Summary</td>
              <td colSpan={4} className="py-5 px-4 text-right">
                <span className="text-sm font-black text-white tracking-widest uppercase">
                   Across Sessions: <span className="text-primary ml-2">{avgGpa} GPA</span>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </MotionCard>
  );
}
