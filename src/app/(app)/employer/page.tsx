import Link from "next/link";
import { Users, Briefcase, Inbox, ArrowRight, Plus, Send, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTalentPool } from "@/lib/talent-data";
import { Button } from "@/components/ui/button";
import { PageHeader, StatTile } from "@/components/page-header";

export default async function EmployerOverview() {
  const profile = await requireProfile("employer");
  const supabase = await createClient();

  const [{ count: jobCount }, { count: applicantCount }, { count: signalCount }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("posted_by", profile.id),
      supabase
        .from("applications")
        .select("*, jobs!inner(posted_by)", { count: "exact", head: true })
        .eq("jobs.posted_by", profile.id),
      supabase
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", profile.id),
    ]);

  const pool = await getTalentPool();
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title={`Welcome${firstName ? `, ${firstName}` : ""}`}
        subtitle="Find people by where they're heading — not just where they've been."
        action={
          <Button asChild className="gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" /> Post a job
            </Link>
          </Button>
        }
      />

      {/* Hero: talent graph CTA */}
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {pool.length} candidates
              </p>
              <p className="text-sm text-muted-foreground">
                Ranked by trajectory fit, with a reason for every match.
              </p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/employer/talent">
              Find talent <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Briefcase className="h-5 w-5" />}
          label="Active jobs"
          value={jobCount ?? 0}
          href="/employer/jobs"
        />
        <StatTile
          icon={<Inbox className="h-5 w-5" />}
          label="Applicants"
          value={applicantCount ?? 0}
          href="/employer/applicants"
        />
        <StatTile
          icon={<Send className="h-5 w-5" />}
          label="Signals sent"
          value={signalCount ?? 0}
          hint={`${5 - (signalCount ?? 0)} left`}
          href="/employer/signals"
        />
      </div>

      {/* How matching works — quiet explainer */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Explainer
          icon={<Sparkles className="h-4 w-4" />}
          title="Trajectory fit"
          body="Ranked by where they're heading, not keyword overlap."
        />
        <Explainer
          icon={<Inbox className="h-4 w-4" />}
          title="Explained matches"
          body="Every candidate comes with a plain-language reason."
        />
        <Explainer
          icon={<Send className="h-4 w-4" />}
          title="Quiet Signals"
          body="Specific outreach only — generic spam is blocked."
        />
      </div>
    </div>
  );
}

function Explainer({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-2.5 text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
