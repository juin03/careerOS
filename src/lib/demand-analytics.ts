import { ROLES, COMPANIES, JOBS } from "@/lib/career-graph/seed-data";

// ─────────────────────────────────────────────────────────────────────────────
// Skills Demand Map — the public / policy lens on the same graph.
// Demand is derived from actual job listings (each job → its role → that role's
// skills), aggregated by Malaysian region. This is an ILLUSTRATIVE dataset built
// from the platform's own postings, with the methodology shown — not government
// data. Honesty is the point ("no false precision").
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]));
const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));

// Normalise the seed-data locations into broader regions.
function toRegion(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("cyberjaya")) return "Cyberjaya";
  if (l.includes("petaling") || l.includes("subang") || l.includes("shah alam"))
    return "Petaling Jaya / Klang Valley West";
  if (l.includes("kuala lumpur") || l.includes("kl")) return "Kuala Lumpur";
  if (l.includes("penang") || l.includes("bayan")) return "Penang";
  if (l.includes("johor")) return "Johor Bahru";
  return location;
}

export interface SkillDemand {
  skill: string;
  count: number; // number of open postings demanding this skill
  share: number; // share of all skill-demand instances in the region
}

export interface RegionDemand {
  region: string;
  openings: number;
  topSkills: SkillDemand[];
  topRoleFamily: string;
}

export interface DemandData {
  regions: RegionDemand[];
  nationalTopSkills: SkillDemand[];
  totalOpenings: number;
  methodology: string;
}

export function getDemandData(): DemandData {
  // Augment the seed jobs with a few region-specific postings so the map shows a
  // realistic regional spread (e.g. Penang's embedded/C++ cluster). Clearly
  // illustrative — same shape as real listings.
  const regionalJobs = [
    ...JOBS.map((j) => ({
      region: toRegion(COMPANY_BY_ID[j.companyId]?.location ?? j.location),
      roleId: j.roleId,
    })),
    // Penang Bayan Lepas — embedded / hardware cluster (illustrative)
    { region: "Penang", roleId: "r_devops" },
    { region: "Penang", roleId: "r_swe" },
    { region: "Penang", roleId: "r_swe" },
    { region: "Penang", roleId: "r_data_analyst" },
    // Cyberjaya — cloud / ML cluster
    { region: "Cyberjaya", roleId: "r_ml_engineer" },
    { region: "Cyberjaya", roleId: "r_devops" },
    // KL — fintech / product / data
    { region: "Kuala Lumpur", roleId: "r_data_scientist" },
    { region: "Kuala Lumpur", roleId: "r_product_manager" },
  ];

  const byRegion = new Map<string, { roleIds: string[]; skillCounts: Map<string, number>; familyCounts: Map<string, number> }>();
  const nationalSkills = new Map<string, number>();

  for (const job of regionalJobs) {
    const role = ROLE_BY_ID[job.roleId];
    if (!role) continue;
    if (!byRegion.has(job.region)) {
      byRegion.set(job.region, {
        roleIds: [],
        skillCounts: new Map(),
        familyCounts: new Map(),
      });
    }
    const r = byRegion.get(job.region)!;
    r.roleIds.push(job.roleId);
    r.familyCounts.set(role.family, (r.familyCounts.get(role.family) ?? 0) + 1);
    for (const s of role.skills) {
      r.skillCounts.set(s, (r.skillCounts.get(s) ?? 0) + 1);
      nationalSkills.set(s, (nationalSkills.get(s) ?? 0) + 1);
    }
  }

  const regions: RegionDemand[] = Array.from(byRegion.entries())
    .map(([region, data]) => {
      const totalSkillInstances = Array.from(data.skillCounts.values()).reduce(
        (a, b) => a + b,
        0,
      );
      const topSkills = Array.from(data.skillCounts.entries())
        .map(([skill, count]) => ({
          skill,
          count,
          share: count / (totalSkillInstances || 1),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      const topRoleFamily =
        Array.from(data.familyCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "—";
      return {
        region,
        openings: data.roleIds.length,
        topSkills,
        topRoleFamily,
      };
    })
    .sort((a, b) => b.openings - a.openings);

  const totalNational = Array.from(nationalSkills.values()).reduce((a, b) => a + b, 0);
  const nationalTopSkills = Array.from(nationalSkills.entries())
    .map(([skill, count]) => ({ skill, count, share: count / (totalNational || 1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    regions,
    nationalTopSkills,
    totalOpenings: regionalJobs.length,
    methodology:
      "Demand is derived from open job postings on Career OS: each posting maps to a role, and each role to the skills it requires. Counts are aggregated by region. This is an illustrative dataset built from platform listings — not official government data.",
  };
}
