"use client";

import { RoadmapNodeData } from "@/lib/career/roadmaps/ai-ml";
import { CheckCircle2, Circle, ExternalLink, PlayCircle, BookOpen, Presentation, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

export default function RoadmapNodeContent({ roadmapId, nodeData }: { roadmapId: string, nodeData: RoadmapNodeData }) {
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // In a real implementation, we would fetch the user's progress for this node via API
  // For MVP v1 without a working DB connection, we'll use local state to simulate.
  
  const toggleMilestone = async (milestoneId: string) => {
    const isCompleted = !completedMilestones[milestoneId];
    setCompletedMilestones(prev => ({ ...prev, [milestoneId]: isCompleted }));

    // Mock API call since DB is down
    // await fetch('/api/career/progress', {
    //   method: 'POST',
    //   body: JSON.stringify({ roadmapId, nodeId: nodeData.id, milestoneId, completed: isCompleted })
    // });
  };

  const getIconForResource = (type: string) => {
    switch(type) {
      case 'video': return <PlayCircle className="w-4 h-4 text-rose-400" />;
      case 'article': return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'course': return <Presentation className="w-4 h-4 text-emerald-400" />;
      case 'project': return <Trophy className="w-4 h-4 text-amber-400" />;
      default: return <ExternalLink className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-300">
      
      {/* Overview section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            nodeData.category === 'golden' ? "bg-indigo-500/20 text-indigo-400" :
            nodeData.category === 'alternative' ? "bg-slate-500/20 text-slate-400" :
            "bg-amber-500/20 text-amber-400"
          )}>
            {nodeData.category === 'golden' ? 'Golden Path' : nodeData.category}
          </span>
          {nodeData.difficulty && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {nodeData.difficulty}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{nodeData.description}</p>
      </div>

      {/* Strict Milestones Checklist */}
      {nodeData.milestones && nodeData.milestones.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-3">Strict Milestones</h3>
          <div className="flex flex-col gap-3">
            {nodeData.milestones.map(m => {
              const isDone = completedMilestones[m.id];
              return (
                <button 
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className="flex items-start gap-3 text-left group"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </div>
                  <span className={clsx("text-sm transition-colors", isDone ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-white")}>
                    {m.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Resources */}
      {nodeData.resources && nodeData.resources.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Curated Resources</h3>
          <div className="flex flex-col gap-2">
            {nodeData.resources.map(r => (
              <a 
                key={r.id} 
                href={r.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors border border-slate-800/50 hover:border-slate-700 group"
              >
                <div className="flex items-center gap-3">
                  {getIconForResource(r.type)}
                  <span className="text-sm font-medium group-hover:text-indigo-300 transition-colors">{r.title}</span>
                </div>
                {r.isBest && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    Best
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
