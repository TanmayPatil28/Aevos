import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import SkillTreeClient from "@/components/os/career/SkillTreeClient";

export default async function DynamicRoadmapPage({ params }: { params: { id: string } }) {
  const dynamicRoadmap = await prisma.dynamicRoadmap.findUnique({
    where: { id: params.id }
  });

  if (!dynamicRoadmap) {
    notFound();
  }

  // Convert Prisma Json values back to the types expected by ReactFlow
  const roadmapData = {
    id: dynamicRoadmap.id,
    title: `AI Roadmap: ${dynamicRoadmap.targetRole}`,
    nodes: (dynamicRoadmap.nodes as any[]).map(n => ({
      ...n,
      position: { x: Number(n.position?.x) || 0, y: Number(n.position?.y) || 0 }
    })),
    edges: dynamicRoadmap.edges as any[]
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          {roadmapData.title}
        </h1>
        <p className="text-slate-400">
          Hyper-personalized skill path generated dynamically using Gemini 2.5.
        </p>
      </div>
      <SkillTreeClient roadmap={roadmapData} />
    </div>
  );
}
