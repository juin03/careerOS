"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, getSessionUser } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { coachReply } from "@/lib/ai/coach";
import { createClient } from "@/lib/supabase/server";

export interface CoachSendResult {
  reply?: string;
  proposedSkills?: string[];
  error?: string;
}

export async function sendCoachMessage(message: string): Promise<CoachSendResult> {
  const profile = await requireProfile("candidate");
  const text = message.trim();
  if (!text) return { error: "Say something first." };

  const shape = await getCandidateShape(profile);
  const supabase = await createClient();

  // Load recent history for context.
  const { data: history } = await supabase
    .from("coach_messages")
    .select("role, content")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(20);

  const reply = await coachReply(
    {
      roleTitle: shape.roleTitle,
      seedRoleId: shape.seedRoleId,
      skills: shape.skills,
      summary: shape.summary,
      experience: shape.experience.map((e) => ({
        title: e.title,
        org: e.org,
        period: e.period,
      })),
      yearsExperience: shape.yearsExperience,
    },
    (history ?? []).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    text,
  );

  // Persist both turns.
  await supabase.from("coach_messages").insert([
    { profile_id: profile.id, role: "user", content: text },
    { profile_id: profile.id, role: "assistant", content: reply.text },
  ]);

  revalidatePath("/candidate/coach");
  return { reply: reply.text, proposedSkills: reply.proposedSkills };
}

// Apply skills the coach proposed — adds them to the profile (closing the loop).
export async function applyCoachSkills(skills: string[]) {
  const user = await getSessionUser();
  if (!user || !skills.length) return { error: "Nothing to add." };
  const supabase = await createClient();

  for (const name of skills) {
    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .eq("name", name)
      .maybeSingle();
    let skillId = existing?.id;
    if (!skillId) {
      const { data } = await supabase
        .from("skills")
        .insert({ name })
        .select("id")
        .single();
      skillId = data?.id;
    }
    if (skillId) {
      await supabase
        .from("profile_skills")
        .upsert(
          { profile_id: user.id, skill_id: skillId, level: 3 },
          { onConflict: "profile_id,skill_id" },
        );
    }
  }

  // Skills changed → invalidate cached narration so the map updates.
  await supabase.from("narration_cache").delete().eq("profile_id", user.id);

  revalidatePath("/candidate", "layout");
  return { ok: true };
}

export async function clearCoachChat() {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();
  await supabase.from("coach_messages").delete().eq("profile_id", user.id);
  revalidatePath("/candidate/coach");
  return { ok: true };
}
