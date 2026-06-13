import { requireProfile } from "@/lib/auth";
import { getTalentPool, rankAgainst } from "@/lib/talent-data";
import { ROLES } from "@/lib/career-graph/seed-data";
import { TalentView, type RankedCandidateDTO } from "./talent-view";

export default async function TalentPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  await requireProfile("employer");

  const targetRoleId = params.role || ROLES.find((r) => r.seniority >= 2)!.id;
  const target = ROLES.find((r) => r.id === targetRoleId) ?? ROLES[0];

  const pool = await getTalentPool();
  const ranked = rankAgainst(pool, target.id);

  const dtos: RankedCandidateDTO[] = ranked.map((c) => ({
    id: c.id,
    // Quiet candidates are anonymized until they accept a signal.
    anonymized: c.findability === "quiet",
    fullName: c.findability === "quiet" ? null : c.fullName,
    headline: c.headline,
    location: c.location,
    university: c.findability === "quiet" ? null : c.university,
    roleTitle: c.roleTitle,
    skills: c.skills,
    findability: c.findability,
    synthetic: c.synthetic,
    seedRoleId: c.seedRoleId,
    skillCoverage: c.match.skillCoverage,
    matchedSkills: c.match.matchedSkills,
    missingSkills: c.match.missingSkills,
    trajectoryFit: c.match.trajectoryFit,
    trajectoryNote: c.match.trajectoryNote,
    stepsAway: c.match.stepsAway,
  }));

  return (
    <TalentView
      candidates={dtos}
      roles={ROLES.map((r) => ({ id: r.id, title: r.title, family: r.family }))}
      targetRole={{ id: target.id, title: target.title }}
    />
  );
}
