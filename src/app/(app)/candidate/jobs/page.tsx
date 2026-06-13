import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { getJobs, getAppliedJobIds } from "@/lib/jobs-data";
import { routeTo, getRole, explainMatch } from "@/lib/career-graph/engine";
import { JobsView, type JobDTO } from "./jobs-view";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string; q?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  const jobs = await getJobs();
  const applied = await getAppliedJobIds(profile.id);

  const targetRole = params.target ? getRole(params.target) : null;

  // GPS routing: if a destination is chosen, compute the path and rank jobs by
  // how well each is a stepping stone toward it.
  const route =
    targetRole && shape.seedRoleId
      ? routeTo(shape.seedRoleId, targetRole.id)
      : null;

  const routeRoleIds = new Set(route?.roles.map((r) => r.id) ?? []);

  const jobDTOs: JobDTO[] = jobs.map((j) => {
    // Relevance: is this job's role on the path to the target?
    let stepRank: "next-step" | "on-path" | "destination" | "off-path" = "off-path";
    if (targetRole && j.seedRoleId) {
      if (j.seedRoleId === targetRole.id) stepRank = "destination";
      else if (route && route.roles.length > 1 && j.seedRoleId === route.roles[1].id)
        stepRank = "next-step";
      else if (routeRoleIds.has(j.seedRoleId)) stepRank = "on-path";
    }

    // Skill/trajectory fit for the badge.
    const match = j.seedRoleId
      ? explainMatch(shape.seedRoleId, shape.skills, j.seedRoleId)
      : null;

    return {
      id: j.id,
      title: j.title,
      location: j.location,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      description: j.description,
      companyName: j.companyName,
      companyIndustry: j.companyIndustry,
      roleTitle: j.roleTitle,
      seedRoleId: j.seedRoleId,
      applied: applied.has(j.id),
      stepRank,
      skillCoverage: match?.skillCoverage ?? null,
    };
  });

  // Sort: when routing, stepping stones first; otherwise by skill coverage.
  const order = { "next-step": 0, destination: 1, "on-path": 2, "off-path": 3 };
  jobDTOs.sort((a, b) => {
    if (targetRole) {
      const d = order[a.stepRank] - order[b.stepRank];
      if (d !== 0) return d;
    }
    return (b.skillCoverage ?? 0) - (a.skillCoverage ?? 0);
  });

  return (
    <JobsView
      jobs={jobDTOs}
      target={
        targetRole
          ? {
              roleId: targetRole.id,
              title: targetRole.title,
              nextStepTitle:
                route && route.roles.length > 1 ? route.roles[1].title : null,
              totalMonths: route?.totalMonths ?? null,
              reachable: Boolean(route),
            }
          : null
      }
      query={params.q ?? ""}
    />
  );
}
