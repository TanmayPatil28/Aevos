import { Handle, Position, NodeProps } from '@xyflow/react';
import { RoadmapNodeData } from '@/lib/career/roadmaps/ai-ml';
import { clsx } from 'clsx';
import { CheckCircle2, Clock } from 'lucide-react';

// Common Node Wrapper
const BaseNode = ({ data, selected, children, className, isCompleted }: { data: RoadmapNodeData, selected: boolean, children: React.ReactNode, className: string, isCompleted?: boolean }) => {
  return (
    <div className={clsx(
      "px-5 py-4 rounded-xl shadow-lg border-2 transition-all min-w-[200px] max-w-[250px] relative",
      className,
      selected && "ring-4 ring-offset-2 ring-offset-slate-950",
      isCompleted ? "opacity-90" : "opacity-100"
    )}>
      {isCompleted && (
        <div className="absolute -top-3 -right-3 bg-emerald-500 rounded-full p-1 shadow-lg text-white">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-none" />
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center justify-between">
          <span>{data.category}</span>
          {data.estHours && (
            <span className="flex items-center gap-1 normal-case"><Clock className="w-3 h-3" /> {data.estHours}h</span>
          )}
        </div>
        <div className="font-bold text-base leading-tight">{data.label}</div>
        {data.difficulty && (
          <div className="text-[10px] mt-1 opacity-60 bg-black/20 self-start px-2 py-0.5 rounded-full">
            {data.difficulty}
          </div>
        )}
      </div>
      {children}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-none" />
    </div>
  );
};

export function GoldenNode({ data, selected }: NodeProps<import("@/lib/career/roadmaps/ai-ml").CareerNode>) {
  // Using an injected property if we enhance the data, but for now we assume it's passed or tracked globally
  // We'll manage completion state via CSS variables or a wrapper if needed.
  return (
    <BaseNode 
      data={data} 
      selected={selected} 
      className="bg-indigo-900/80 border-indigo-500 text-indigo-50 shadow-indigo-900/50 hover:bg-indigo-800/90 hover:border-indigo-400"
    >
      <></>
    </BaseNode>
  );
}

export function AlternativeNode({ data, selected }: NodeProps<import("@/lib/career/roadmaps/ai-ml").CareerNode>) {
  return (
    <BaseNode 
      data={data} 
      selected={selected} 
      className="bg-slate-800/80 border-slate-600 text-slate-200 border-dashed hover:bg-slate-700/90"
    >
      <></>
    </BaseNode>
  );
}

export function BonusNode({ data, selected }: NodeProps<import("@/lib/career/roadmaps/ai-ml").CareerNode>) {
  return (
    <BaseNode 
      data={data} 
      selected={selected} 
      className="bg-amber-900/30 border-amber-500/50 text-amber-100 hover:bg-amber-900/50 hover:border-amber-400"
    >
      <></>
    </BaseNode>
  );
}

export const nodeTypes = {
  golden: GoldenNode,
  alternative: AlternativeNode,
  bonus: BonusNode,
};
