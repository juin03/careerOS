import { Inbox, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/career-graph/seed-data";
import { explainMatch } from "@/lib/career-graph/engine";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { pct } from "@/lib/format";

const SEED_ID_BY_TITLE = new Map(ROLES.map((r) => [r.title, r.id]));

export default async function ApplicantsPage() {
  const profile = await requireProfile("employer");
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "id, status, cover_note, created_at, jobs!inner(title, posted_by, roles(title)), candidate:profiles!applications_candidate_id_fkey(id, full_name, headline, location, roles(title), profile_skills(skills(name)))",
    )
    .eq("jobs.posted_by", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applicants</h1>
        <p className="mt-1 text-muted-foreground">
          Everyone who applied — with an explained read on their fit.
        </p>
      </div>

      {!apps?.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No applicants yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When candidates apply to your jobs, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const job = app.jobs as {
              title: string;
              roles: { title: string } | null;
            } | null;
            const cand = app.candidate as {
              full_name: string | null;
              headline: string | null;
              location: string | null;
              roles: { title: string } | null;
              profile_skills: { skills: { name: string } | null }[];
            } | null;

            const candRoleTitle = cand?.roles?.title ?? null;
            const candSeedRole = candRoleTitle
              ? (SEED_ID_BY_TITLE.get(candRoleTitle) ?? null)
              : null;
            const skills = (cand?.profile_skills ?? [])
              .map((ps) => ps.skills?.name)
              .filter((s): s is string => Boolean(s));
            const targetSeedRole = job?.roles?.title
              ? SEED_ID_BY_TITLE.get(job.roles.title)
              : null;

            const match = targetSeedRole
              ? explainMatch(candSeedRole, skills, targetSeedRole)
              : null;

            return (
              <div key={app.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <PersonAvatar name={cand?.full_name} seed={cand?.full_name ?? undefined} />
                    <div>
                      <h3 className="font-semibold">
                        {cand?.full_name ?? "Candidate"}
                      </h3>
                      {cand?.headline && (
                        <p className="text-sm text-muted-foreground">
                          {cand.headline}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span>Applied to {job?.title}</span>
                        {cand?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cand.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {match && (
                    <Badge variant="outline">
                      {pct(match.skillCoverage)} skill fit
                    </Badge>
                  )}
                </div>

                {match && (
                  <div className="mt-3 flex gap-2 rounded-lg bg-muted/50 p-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm">
                      <span className="font-medium">Fit read: </span>
                      <span className="text-muted-foreground">
                        {match.trajectoryNote}
                      </span>
                    </p>
                  </div>
                )}

                {match && match.matchedSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.matchedSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {app.cover_note && (
                  <p className="mt-3 border-l-2 pl-3 text-sm text-muted-foreground">
                    {app.cover_note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
