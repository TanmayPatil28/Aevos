import { aiMlRoadmap } from "./ai-ml";

export const roadmaps = {
  "ai-ml": aiMlRoadmap,
};

export type RoadmapId = keyof typeof roadmaps;

export function getRoadmap(id: string) {
  return roadmaps[id as RoadmapId] || null;
}
