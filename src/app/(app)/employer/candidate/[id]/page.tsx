import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PERSONAS } from "@/lib/career-graph/personas";
import { ROLE_BY_ID } from "@/lib/career-graph/seed-data";
import {
  PortfolioView,
  type PortfolioData,
  type PortfolioExperience,
  type PortfolioAchievement,
} from "@/components/portfolio-view";
import { Button } from "@/components/ui/button";

export default async function CandidatePortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireProfile("employer");

  // Synthetic personas (talent pool samples) render from seed data.
  if (id.startsWith("p_")) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) notFound();
    const portfolio: PortfolioData = {
      id: persona.id,
      fullName: persona.fullName,
      headline: persona.headline,
      location: persona.location,
      university: persona.university,
      roleTitle: ROLE_BY_ID[persona.seedRoleId]?.title ?? null,
      summary: `${persona.headline}. ${persona.skills.slice(0, 3).join(", ")} and more.`,
      skills: persona.skills,
      experience: [],
      achievements: [],
    };
    return <Shell portfolio={portfolio} />;
  }

  // Real candidate — load full portfolio from the DB.
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, headline, location, university, summary, experience, achievements, roles(title), profile_skills(skills(name))",
    )
    .eq("id", id)
    .eq("account_role", "candidate")
    .single();

  if (!data) notFound();

  const portfolio: PortfolioData = {
    id: data.id,
    fullName: data.full_name,
    headline: data.headline,
    location: data.location,
    university: data.university,
    roleTitle: (data.roles as { title: string } | null)?.title ?? null,
    summary: data.summary,
    skills: ((data.profile_skills as { skills: { name: string } | null }[]) ?? [])
      .map((ps) => ps.skills?.name)
      .filter((s): s is string => Boolean(s)),
    experience: (data.experience as PortfolioExperience[] | null) ?? [],
    achievements: (data.achievements as PortfolioAchievement[] | null) ?? [],
  };

  return <Shell portfolio={portfolio} />;
}

function Shell({ portfolio }: { portfolio: PortfolioData }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/employer/talent">
          <ArrowLeft className="h-4 w-4" /> Back to talent
        </Link>
      </Button>
      <PortfolioView p={portfolio} />
    </div>
  );
}
