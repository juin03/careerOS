import { ROLES, ROLE_BY_ID, TRANSITIONS } from "@/lib/career-graph/seed-data";
import { PERSONAS, type Persona } from "@/lib/career-graph/personas";

// The university lens reads the SAME graph as candidates and employers, filtered
// to one institution's alumni. For the demo we treat the synthetic personas as a
// cohort and derive outcome analytics from the shared transition data.

export interface FamilyShare {
  family: string;
  count: number;
  share: number;
}

export interface SkillGapStat {
  skill: string;
  demandRoles: number; // how many roles in the graph need it
  cohortHave: number; // how many alumni have it
  gap: number; // demandRoles - cohortHave-derived signal
}

export interface OutcomeFlow {
  from: string;
  to: string;
  share: number;
}

export function cohortByFamily(cohort: Persona[]): FamilyShare[] {
  const counts = new Map<string, number>();
  for (const p of cohort) {
    const fam = ROLE_BY_ID[p.seedRoleId]?.family ?? "Other";
    counts.set(fam, (counts.get(fam) ?? 0) + 1);
  }
  const total = cohort.length || 1;
  return Array.from(counts.entries())
    .map(([family, count]) => ({ family, count, share: count / total }))
    .sort((a, b) => b.count - a.count);
}

// Recurring skill gaps: skills the market (roles) demands most, weighted against
// how many in the cohort already hold them. High demand + low supply = curriculum signal.
export function recurringSkillGaps(cohort: Persona[]): SkillGapStat[] {
  const demand = new Map<string, number>();
  for (const r of ROLES) {
    for (const s of r.skills) demand.set(s, (demand.get(s) ?? 0) + 1);
  }
  const supply = new Map<string, number>();
  for (const p of cohort) {
    for (const s of p.skills) supply.set(s, (supply.get(s) ?? 0) + 1);
  }
  return Array.from(demand.entries())
    .map(([skill, demandRoles]) => {
      const cohortHave = supply.get(skill) ?? 0;
      // Normalise supply to the demand scale so the bar comparison is fair.
      const supplyScaled = (cohortHave / (cohort.length || 1)) * ROLES.length;
      return {
        skill,
        demandRoles,
        cohortHave,
        gap: Math.max(0, demandRoles - supplyScaled),
      };
    })
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 7);
}

// Most common next moves across the cohort's current roles — the outcome flow.
export function outcomeFlows(cohort: Persona[]): OutcomeFlow[] {
  const flows: OutcomeFlow[] = [];
  const cohortRoleIds = new Set(cohort.map((p) => p.seedRoleId));
  for (const t of TRANSITIONS) {
    if (cohortRoleIds.has(t.fromRoleId)) {
      flows.push({
        from: ROLE_BY_ID[t.fromRoleId]?.title ?? t.fromRoleId,
        to: ROLE_BY_ID[t.toRoleId]?.title ?? t.toRoleId,
        share: t.share,
      });
    }
  }
  return flows.sort((a, b) => b.share - a.share).slice(0, 8);
}

export function getCohort(): Persona[] {
  return PERSONAS;
}

export function cohortStats(cohort: Persona[]) {
  const roleSet = new Set(cohort.map((p) => p.seedRoleId));
  const avgSkills =
    cohort.reduce((s, p) => s + p.skills.length, 0) / (cohort.length || 1);
  const employed = cohort.length; // all personas are placed in the demo
  return {
    total: cohort.length,
    distinctRoles: roleSet.size,
    avgSkills: Math.round(avgSkills * 10) / 10,
    placementRate: 1, // synthetic cohort — all placed
    employed,
  };
}
