"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Card from "../ui/Card";

const MotionCard = motion(Card);

interface Insight {
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
}

const InsightsPanel = memo(function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {insights.map((insight, i) => (
        <MotionCard
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="overflow-hidden group"
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
        </MotionCard>
      ))}
    </div>
  );
});

export default InsightsPanel;
