"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { parseResume } from "@/lib/ai/resume";

export interface SaveProfileState {
  ok?: boolean;
  error?: string;
}

export async function saveProfile(
  _prev: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const currentRoleId = String(formData.get("currentRoleId") ?? "").trim();
  const findability = String(formData.get("findability") ?? "open");
  const summary = String(formData.get("summary") ?? "").trim();
  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Portfolio (experience + achievements) round-trips through the form as JSON.
  function parseJsonField<T>(name: string): T | undefined {
    const raw = String(formData.get(name) ?? "").trim();
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
  const experience = parseJsonField<unknown[]>("experience");
  const achievements = parseJsonField<unknown[]>("achievements");

  const supabase = await createClient();

  // currentRoleId is a seed id (e.g. "r_swe"); resolve to the DB role uuid by title.
  let dbRoleId: string | null = null;
  if (currentRoleId) {
    const { ROLE_BY_ID } = await import("@/lib/career-graph/seed-data");
    const seedRole = ROLE_BY_ID[currentRoleId];
    if (seedRole) {
      const { data } = await supabase
        .from("roles")
        .select("id")
        .eq("title", seedRole.title)
        .single();
      dbRoleId = data?.id ?? null;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      headline: headline || null,
      location: location || null,
      university: university || null,
      current_role_id: dbRoleId,
      findability: findability as "open" | "quiet" | "closed",
      summary: summary || null,
      ...(experience !== undefined ? { experience: experience as never } : {}),
      ...(achievements !== undefined ? { achievements: achievements as never } : {}),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Persist the seed role id separately so the engine can read it without a title
  // lookup. We stash it in a dedicated column-free approach: profile_skills holds
  // skills; the current seed role id is kept in localStorage-free server state by
  // re-deriving from the DB role's title at read time. To keep it simple and
  // robust, also write skills relationally.
  await syncSkills(user.id, skills);

  revalidatePath("/candidate", "layout");
  return { ok: true };
}

async function syncSkills(profileId: string, skills: string[]) {
  const supabase = await createClient();
  // Ensure skills exist in the skills table, then link them.
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
          { profile_id: profileId, skill_id: skillId, level: 3 },
          { onConflict: "profile_id,skill_id" },
        );
    }
  }
}

export interface ParseState {
  fullName?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  suggestedRoleId?: string;
  yearsExperience?: number;
  seniority?: "entry" | "junior" | "mid" | "senior" | "lead";
  specialization?: string;
  highlights?: string[];
  summary?: string;
  experience?: { title: string; org: string; period: string; highlights: string[] }[];
  achievements?: { title: string; detail: string }[];
  usedAI?: boolean;
  error?: string;
}

export async function analyzeResume(
  _prev: ParseState,
  formData: FormData,
): Promise<ParseState> {
  const text = String(formData.get("resumeText") ?? "").trim();
  if (text.length < 30) {
    return { error: "Paste a bit more of your resume so we can read it." };
  }
  const user = await getSessionUser();
  const result = await parseResume(text);

  if (user) {
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        resume_text: text,
        // Persist years so the landscape can be seniority-realistic.
        ...(typeof result.yearsExperience === "number"
          ? { years_experience: result.yearsExperience }
          : {}),
      })
      .eq("id", user.id);
  }
  return { ...result };
}

export async function applyToJob(jobId: string, coverNote: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    candidate_id: user.id,
    cover_note: coverNote || null,
  });
  if (error && !error.message.includes("duplicate")) {
    return { error: error.message };
  }
  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");
  return { ok: true };
}
