"use client";

import { motion } from "framer-motion";
import { PlusCircle, Calendar, Target, Award, Trash2, CheckCircle } from "lucide-react";

interface Activity {
  id: string | number;
  type: "calculation" | "plan" | "target" | "best" | "delete";
  text: string;
  timestamp: string;
}

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "calculation": return { icon: <PlusCircle size={16} />, color: "bg-blue-500", text: "text-blue-400" };
    case "plan": return { icon: <Calendar size={16} />, color: "bg-purple-500", text: "text-purple-400" };
    case "target": return { icon: <Target size={16} />, color: "bg-green-500", text: "text-green-400" };
    case "best": return { icon: <Award size={16} />, color: "bg-yellow-500", text: "text-yellow-400" };
    case "delete": return { icon: <Trash2 size={16} />, color: "bg-red-500", text: "text-red-400" };
    default: return { icon: <CheckCircle size={16} />, color: "bg-surface-container", text: "text-on-surface-variant" };
  }
};

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="premium-card overflow-hidden group"
    >
      <h3 className="text-xl font-black font-headline tracking-tighter text-white mb-8 relative z-10">Neural Timeline</h3>
      
      <div className="relative relative z-10">
        {/* Timeline Line */}
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 'calc(100% - 20px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute left-[11px] top-6 w-0.5 bg-gradient-to-b from-[#4F8EF7]/50 via-[#7C3AED]/30 to-transparent" 
        />

        <div className="space-y-10 relative">
          {activities.length > 0 ? activities.map((item, i) => {
            const config = getActivityIcon(item.type);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 group/item"
              >
                <div className={`relative z-10 w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover/item:scale-125 transition-transform duration-300`}>
                  {config.icon}
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white group-hover/item:text-[#4F8EF7] transition-colors">{item.text}</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.text}`}>
                      {item.type.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/[0.02] py-1 px-3 rounded-full border border-white/[0.05]">
                    {item.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          }) : (
            <p className="text-sm text-white/20 italic text-center py-4 font-bold">No telemetry frames detected.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
