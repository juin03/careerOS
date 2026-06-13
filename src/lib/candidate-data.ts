import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/career-graph/seed-data";
import type { Profile } from "@/lib/auth";

// Bridges DB profile rows to the graph engine, which speaks in seed role-ids.
// The DB stores roles by title; we map the title back to its seed id.
const SEED_ID_BY_TITLE = new Map(ROLES.map((r) => [r.title, r.id]));

export interface CandidateShape {
  profile: Profile;
  seedRoleId: string | null; // engine-friendly id, e.g. "r_swe"
  roleTitle: string | null;
  skills: string[];
  isComplete: boolean;
}

export async function getCandidateShape(
  profile: Profile,
): Promise<CandidateShape> {
  const supabase = await createClient();

  let roleTitle: string | null = null;
  let seedRoleId: string | null = null;
  if (profile.current_role_id) {
    const { data: role } = await supabase
      .from("roles")
      .select("title")
      .eq("id", profile.current_role_id)
      .single();
    roleTitle = role?.title ?? null;
    seedRoleId = roleTitle ? (SEED_ID_BY_TITLE.get(roleTitle) ?? null) : null;
  }

  const { data: skillRows } = await supabase
    .from("profile_skills")
    .select("skills(name)")
    .eq("profile_id", profile.id);

  const skills = (skillRows ?? [])
    .map((r) => (r.skills as { name: string } | null)?.name)
    .filter((s): s is string => Boolean(s));

  return {
    profile,
    seedRoleId,
    roleTitle,
    skills,
    isComplete: Boolean(seedRoleId && skills.length > 0),
  };
}
