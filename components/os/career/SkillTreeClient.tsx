"use client";

import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes, CareerNode } from './CareerNodes';
import { useUIStore } from '@/stores/os/uiStore';

interface SkillTreeClientProps {
  roadmap: {
    id: string;
    title: string;
    nodes: any[];
    edges: any[];
  }
}

export default function SkillTreeClient({ roadmap }: SkillTreeClientProps) {
  const [nodes, setNodes] = useState<CareerNode[]>(roadmap.nodes);
  const [edges, setEdges] = useState(roadmap.edges);
  const { openInspector } = useUIStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds) as CareerNode[]),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      openInspector({
        type: "ROADMAP_NODE",
        id: node.id,
        data: {
          roadmapId: roadmap.id,
          nodeData: node.data
        }
      });
    },
    [openInspector, roadmap.id]
  );

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white mb-1">{roadmap.title} Roadmap</h1>
        <p className="text-slate-400 text-sm">Interactive Golden Path</p>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-950"
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={24} size={2} />
        <Controls 
          className="bg-slate-900 border-slate-800 fill-slate-300"
          position="bottom-left"
        />
      </ReactFlow>
    </div>
  );
}
