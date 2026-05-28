import { getRoadmap } from "@/lib/career/roadmaps";
import { notFound } from "next/navigation";
import SkillTreeClient from "@/components/os/career/SkillTreeClient";

export default function CareerRoadmapPage({ params }: { params: { roadmapId: string } }) {
  const roadmap = getRoadmap(params.roadmapId);

  if (!roadmap) {
    notFound();
  }

  return (
    <div className="w-full h-full flex flex-col">
      <SkillTreeClient roadmap={roadmap} />
    </div>
  );
}
