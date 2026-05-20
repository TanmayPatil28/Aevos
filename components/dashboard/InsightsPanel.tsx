"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Insight {
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
}

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="premium-card overflow-hidden group"
        >
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]" style={{ color: insight.color }}>
              <insight.icon size={22} strokeWidth={2.5} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{insight.title}</h4>
          </div>
          <p className="text-sm font-bold text-white leading-relaxed relative z-10 italic">
            {insight.text}
          </p>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 blur-[80px] opacity-[0.15] rounded-full pointer-events-none" style={{ backgroundColor: insight.color }} />
        </motion.div>
      ))}
    </div>
  );
}
