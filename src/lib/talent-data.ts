import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/career-graph/seed-data";
import { PERSONAS } from "@/lib/career-graph/personas";
import { explainMatch, matchRank, type MatchReason } from "@/lib/career-graph/engine";

const SEED_ID_BY_TITLE = new Map(ROLES.map((r) => [r.title, r.id]));

export interface TalentCandidate {
  id: string;
  fullName: string; // hidden upstream when anonymized
  headline: string | null;
  location: string | null;
  university: string | null;
  seedRoleId: string | null;
  roleTitle: string | null;
  skills: string[];
  findability: "open" | "quiet" | "closed";
  synthetic: boolean;
}

// All discoverable candidates: real signed-up candidates + synthetic personas.
// Closed-findability candidates are excluded entirely.
export async function getTalentPool(): Promise<TalentCandidate[]> {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, full_name, headline, location, university, findability, roles(title), profile_skills(skills(name))",
    )
    .eq("account_role", "candidate")
    .neq("findability", "closed");

  const real: TalentCandidate[] = (profiles ?? []).map((p) => {
    const roleTitle = (p.roles as { title: string } | null)?.title ?? null;
    const skills = ((p.profile_skills as { skills: { name: string } | null }[]) ?? [])
      .map((ps) => ps.skills?.name)
      .filter((s): s is string => Boolean(s));
    return {
      id: p.id,
      fullName: p.full_name ?? "Candidate",
      headline: p.headline,
      location: p.location,
      university: p.university,
      seedRoleId: roleTitle ? (SEED_ID_BY_TITLE.get(roleTitle) ?? null) : null,
      roleTitle,
      skills,
      findability: p.findability as "open" | "quiet" | "closed",
      synthetic: false,
    };
  });

  const synthetic: TalentCandidate[] = PERSONAS.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    headline: p.headline,
    location: p.location,
    university: p.university,
    seedRoleId: p.seedRoleId,
    roleTitle: ROLES.find((r) => r.id === p.seedRoleId)?.title ?? null,
    skills: p.skills,
    findability: p.findability,
    synthetic: true,
  }));

  // Real candidates first (more valuable to the demo), then personas.
  return [...real.filter((r) => r.seedRoleId), ...synthetic];
}

export interface RankedCandidate extends TalentCandidate {
  match: MatchReason;
  rank: number;
}

export function rankAgainst(
  pool: TalentCandidate[],
  targetSeedRoleId: string,
): RankedCandidate[] {
  return pool
    .map((c) => {
      const match = explainMatch(c.seedRoleId, c.skills, targetSeedRoleId);
      return { ...c, match, rank: matchRank(match) };
    })
    .sort((a, b) => b.rank - a.rank);
}
