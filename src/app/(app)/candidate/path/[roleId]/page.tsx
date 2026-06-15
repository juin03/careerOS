import { redirect, notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { getJobs } from "@/lib/jobs-data";
import {
  routeTo,
  skillGap,
  explainMatch,
  getRole,
  midpoint,
} from "@/lib/career-graph/engine";
import { getExpertsForRole } from "@/lib/experts-data";
import { GapHubView, type GapHubData } from "./gap-hub-view";

// ─────────────────────────────────────────────────────────────────────────────
// The Gap Hub — the single screen both entries converge on:
//   • Path → Job: pick a path on the Landscape Map  → here
//   • Job → Path: pick a job you want                → here (?job=<id>)
// It answers ONE question — "what's the difference between you and this target?"
// — then branches into the four actions: find jobs · roadmap · talk to an
// expert · apply.
// ─────────────────────────────────────────────────────────────────────────────

export default async function GapHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { roleId } = await params;
  const { job: jobId } = await searchParams;

  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  if (!shape.seedRoleId) redirect("/onboarding");

  const target = getRole(roleId);
  if (!target) notFound();

  const current = getRole(shape.seedRoleId) ?? null;
  const route = routeTo(shape.seedRoleId, roleId);
  const gap = skillGap(shape.skills, target);
  const match = explainMatch(shape.seedRoleId, shape.skills, roleId);

  // The path strip: each role on the route, annotated with the transition that
  // leads INTO it (the hero "X% made this in ~Ym" stat lives here).
  const pathHops =
    route?.roles.map((r, i) => {
      const t = i > 0 ? route.transitions[i - 1] : null;
      return {
        roleId: r.id,
        title: r.title,
        isCurrent: i === 0,
        isTarget: r.id === roleId,
        share: t?.share ?? null,
        medianMonths: t?.medianMonths ?? null,
        note: t?.note ?? null,
      };
    }) ?? null;

  // Optional job context (Job → Path entry).
  let job: GapHubData["job"] = null;
  if (jobId) {
    const found = (await getJobs()).find((j) => j.id === jobId);
    if (found) {
      job = {
        id: found.id,
        title: found.title,
        companyName: found.companyName,
      };
    }
  }

  const experts = getExpertsForRole(roleId).slice(0, 3);

  const data: GapHubData = {
    currentRoleTitle: shape.roleTitle,
    current: current
      ? { title: current.title, midpoint: midpoint(current) }
      : null,
    target: {
      roleId: target.id,
      title: target.title,
      family: target.family,
      salaryMin: target.salaryMin,
      salaryMax: target.salaryMax,
      midpoint: midpoint(target),
      description: target.description,
    },
    coverage: gap.coverage,
    have: gap.have,
    missing: gap.missing,
    path: pathHops,
    totalMonths: route?.totalMonths ?? null,
    reachable: Boolean(route),
    trajectoryFit: match.trajectoryFit,
    trajectoryNote: match.trajectoryNote,
    stepsAway: match.stepsAway,
    experts,
    job,
  };

  return <GapHubView data={data} />;
}
