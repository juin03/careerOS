import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { landscapeFrom, landscapeTree, getRole } from "@/lib/career-graph/engine";
import { narrateLandscape } from "@/lib/ai/narrate";
import { LandscapeView } from "./landscape-view";
import type { LandscapeMoveDTO } from "@/components/landscape-map";

export default async function LandscapePage() {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);

  if (!shape.seedRoleId) redirect("/onboarding");

  const current = getRole(shape.seedRoleId)!;
  // Narration reads the direct next moves; the map shows the two-level tree.
  const directMoves = landscapeFrom(shape.seedRoleId, shape.skills);
  const tree = landscapeTree(shape.seedRoleId, shape.skills);
  const narration = await narrateLandscape(current.title, directMoves);

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
  }));

  return (
    <LandscapeView
      current={{
        title: current.title,
        salaryMin: current.salaryMin,
        salaryMax: current.salaryMax,
      }}
      moves={moveDTOs}
      narration={narration.text}
      usedAI={narration.usedAI}
    />
  );
}
