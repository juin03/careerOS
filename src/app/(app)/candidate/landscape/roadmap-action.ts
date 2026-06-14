"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { getSessionUser } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { generateRoadmap, type Roadmap } from "@/lib/ai/roadmap";
import { createClient } from "@/lib/supabase/server";

export interface RoadmapResult {
  roadmap?: Roadmap;
  roadmapId?: string;
  error?: string;
}

export async function buildRoadmap(input: {
  targetRoleId: string;
  company?: string;
  jobId?: string;
  jobTitle?: string;
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
    experience: shape.experience,
    achievements: shape.achievements,
  });

  if (!roadmap) return { error: "Could not generate a roadmap for that target." };

  // Title: job-specific if generated from a listing, else role-to-role.
  const title = input.jobTitle
    ? `Path to ${input.jobTitle}${input.company ? ` @ ${input.company}` : ""}`
    : `${roadmap.fromRole} → ${roadmap.toRole}`;

  // Persist it so it becomes a living, trackable plan.
  const supabase = await createClient();
  const { data } = await supabase
    .from("roadmaps")
    .insert({
      profile_id: profile.id,
      title,
      job_id: input.jobId ?? null,
      job_title: input.jobTitle ?? null,
      from_role: roadmap.fromRole,
      to_role: roadmap.toRole,
      to_role_id: input.targetRoleId,
      company: roadmap.company ?? null,
      summary: roadmap.summary,
      total_months: roadmap.totalMonthsEstimate,
      phases: roadmap.phases as never,
      used_ai: roadmap.usedAI,
    })
    .select("id")
    .single();

  revalidatePath("/candidate/roadmaps");
  return { roadmap, roadmapId: data?.id };
}

// Toggle a step done/undone on a saved roadmap (the tracking feature).
export async function toggleRoadmapStep(roadmapId: string, stepKey: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();

  const { data: rm } = await supabase
    .from("roadmaps")
    .select("done_steps")
    .eq("id", roadmapId)
    .eq("profile_id", user.id)
    .single();
  if (!rm) return { error: "Roadmap not found." };

  const done = new Set((rm.done_steps as string[]) ?? []);
  if (done.has(stepKey)) done.delete(stepKey);
  else done.add(stepKey);

  await supabase
    .from("roadmaps")
    .update({ done_steps: Array.from(done) as never })
    .eq("id", roadmapId)
    .eq("profile_id", user.id);

  revalidatePath("/candidate/roadmaps");
  return { ok: true, done: Array.from(done) };
}

export async function deleteRoadmap(roadmapId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();
  await supabase
    .from("roadmaps")
    .delete()
    .eq("id", roadmapId)
    .eq("profile_id", user.id);
  revalidatePath("/candidate/roadmaps");
  return { ok: true };
}
