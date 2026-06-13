import Link from "next/link";
import {
  Map,
  Briefcase,
  ArrowRight,
  Inbox,
  TrendingUp,
  Target,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCandidateShape } from "@/lib/candidate-data";
import { landscapeFrom, getRole } from "@/lib/career-graph/engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatTile } from "@/components/page-header";
import { ProgressRing } from "@/components/progress-ring";
import { rmRange, pct, months } from "@/lib/format";

export default async function CandidateOverview() {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  const supabase = await createClient();

  const [{ count: appCount }, { count: signalCount }] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("candidate_id", profile.id),
    supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .eq("candidate_id", profile.id)
      .is("accepted", null),
  ]);

  const moves = shape.seedRoleId
    ? landscapeFrom(shape.seedRoleId, shape.skills).slice(0, 3)
    : [];
  const current = shape.seedRoleId ? getRole(shape.seedRoleId) : null;

  // Profile strength — a simple, honest completeness signal.
  const strength =
    [
      Boolean(profile.full_name),
      Boolean(profile.headline),
      Boolean(profile.location),
      Boolean(shape.seedRoleId),
      shape.skills.length >= 3,
      shape.skills.length >= 5,
    ].filter(Boolean).length / 6;

  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle={
          current
            ? `Navigating from ${current.title}.`
            : "Finish your profile to map your landscape."
        }
      />

      {!shape.isComplete ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProgressRing value={strength} size={60} />
            <div>
              <p className="font-medium">Complete your profile to unlock the map</p>
              <p className="text-sm text-muted-foreground">
                A fuller profile means sharper paths and better matches.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/onboarding">Continue setup</Link>
          </Button>
        </div>
      ) : (
        /* Hero position card */
        <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ProgressRing value={strength} size={60} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  You are here
                </p>
                <p className="text-xl font-semibold">{current?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {current && rmRange(current.salaryMin, current.salaryMax)} ·{" "}
                  {shape.skills.length} skills
                </p>
              </div>
            </div>
            <Button asChild className="gap-2">
              <Link href="/candidate/landscape">
                Open Landscape Map <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Momentum stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Map className="h-5 w-5" />}
          label="Open paths"
          value={moves.length}
          hint="from here"
          href="/candidate/landscape"
        />
        <StatTile
          icon={<Briefcase className="h-5 w-5" />}
          label="Applications"
          value={appCount ?? 0}
          href="/candidate/applications"
        />
        <StatTile
          icon={<Inbox className="h-5 w-5" />}
          label="New signals"
          value={signalCount ?? 0}
          hint={signalCount ? "needs reply" : undefined}
          href="/candidate/signals"
        />
      </div>

      {/* Top paths */}
      {moves.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Your strongest paths
            </h2>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/candidate/landscape">
                Full map <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 space-y-2.5">
            {moves.map((m, i) => (
              <Link
                key={m.role.id}
                href="/candidate/landscape"
                className="group flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{m.role.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {rmRange(m.role.salaryMin, m.role.salaryMax)} · ~
                      {months(m.transition.medianMonths)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {pct(m.transition.share)}
                  </Badge>
                  <Badge variant="outline">{pct(m.gap.coverage)} fit</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
