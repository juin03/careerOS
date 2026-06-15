import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { landscapeTree, getRole } from "@/lib/career-graph/engine";
import { LandscapeView } from "./landscape-view";
import { LandscapeNarration, NarrationSkeleton } from "./narration";
import type { LandscapeMoveDTO } from "@/components/landscape-map";

export default async function LandscapePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; trail?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);

  if (!shape.seedRoleId) redirect("/onboarding");

  // Re-rooting: the user can explore the tree from any role via ?from=<roleId>.
  // Falls back to their actual current role.
  const exploring = Boolean(params.from && params.from !== shape.seedRoleId);
  const rootRoleId =
    params.from && getRole(params.from) ? params.from : shape.seedRoleId;

  // The breadcrumb trail: the ordered ancestors the user explored through to
  // reach this root, so they can step back to any of them (not just home).
  const trail = (params.trail ? params.trail.split(",") : [])
    .map((id) => id.trim())
    .filter((id) => getRole(id) && id !== rootRoleId)
    .map((id) => ({ roleId: id, title: getRole(id)!.title }));

  const current = getRole(rootRoleId)!;
  // The map (tree) is instant pure-engine data; the AI narration streams in
  // separately via Suspense so the page is interactive immediately.
  const tree = landscapeTree(rootRoleId, shape.skills, {
    years: shape.yearsExperience,
  });

  const moveDTOs: LandscapeMoveDTO[] = tree.map((m) => ({
    roleId: m.role.id,
    title: m.role.title,
    family: m.role.family,
    salaryMin: m.role.salaryMin,
    salaryMax: m.role.salaryMax,
    share: m.transition.share,
    medianMonths: m.transition.medianMonths,
    note: m.transition.note,
    coverage: m.gap.coverage,
    missing: m.gap.missing,
    have: m.gap.have,
    salaryDeltaMin: m.salaryDeltaMin,
    salaryDeltaMax: m.salaryDeltaMax,
    depth: m.depth,
    parentRoleId: m.parentRoleId,
    reachability: m.reachability,
    reachabilityNote: m.reachabilityNote,
  }));

  return (
    <LandscapeView
      current={{
        title: current.title,
        salaryMin: current.salaryMin,
        salaryMax: current.salaryMax,
      }}
      moves={moveDTOs}
      exploring={exploring}
      rootRoleId={rootRoleId}
      trail={trail}
      narration={
        <Suspense key="landscape-narration" fallback={<NarrationSkeleton />}>
          <LandscapeNarration
            rootRoleId={rootRoleId}
            roleTitle={current.title}
            skills={shape.skills}
          />
        </Suspense>
      }
    />
  );
}
