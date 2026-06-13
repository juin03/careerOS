"use server";

import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { generateRoadmap, type Roadmap } from "@/lib/ai/roadmap";

export interface RoadmapResult {
  roadmap?: Roadmap;
  error?: string;
}

export async function buildRoadmap(input: {
  targetRoleId: string;
  company?: string;
}): Promise<RoadmapResult> {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  if (!shape.seedRoleId) {
    return { error: "Add your current role first to generate a roadmap." };
  }

  const roadmap = await generateRoadmap({
    fromRoleId: shape.seedRoleId,
    toRoleId: input.targetRoleId,
    skills: shape.skills,
    company: input.company?.trim() || undefined,
  });

  if (!roadmap) return { error: "Could not generate a roadmap for that target." };
  return { roadmap };
}
