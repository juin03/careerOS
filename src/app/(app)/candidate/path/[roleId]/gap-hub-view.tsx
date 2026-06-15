"use client";

import Link from "next/link";
import {
  Target,
  Clock,
  CheckCircle2,
  CircleDashed,
  Navigation,
  MessageCircle,
  Briefcase,
  ArrowRight,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapDialog } from "@/app/(app)/candidate/landscape/roadmap-dialog";
import { ApplyDialog } from "@/app/(app)/candidate/jobs/apply-dialog";
import type { Expert } from "@/lib/experts-data";
import { rmRange, rmDelta, months, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface GapHubData {
  currentRoleTitle: string | null;
  current: { title: string; midpoint: number } | null;
  target: {
    roleId: string;
    title: string;
    family: string;
    salaryMin: number;
    salaryMax: number;
    midpoint: number;
    description: string;
  };
  coverage: number;
  have: string[];
  missing: string[];
  path:
    | {
        roleId: string;
        title: string;
        isCurrent: boolean;
        isTarget: boolean;
        share: number | null;
        medianMonths: number | null;
        note: string | null;
      }[]
    | null;
  totalMonths: number | null;
  reachable: boolean;
  trajectoryFit: "direct" | "one-step" | "adjacent" | "distant";
  trajectoryNote: string;
  stepsAway: number;
  experts: Expert[];
  job: { id: string; title: string; companyName: string | null } | null;
}

function readiness(coverage: number): { label: string; tone: string } {
  if (coverage >= 0.8)
    return { label: "Strong match", tone: "text-emerald-600 dark:text-emerald-400" };
  if (coverage >= 0.5)
    return { label: "Within reach", tone: "text-primary" };
  return { label: "A real stretch", tone: "text-amber-600 dark:text-amber-400" };
}

export function GapHubView({ data }: { data: GapHubData }) {
  const r = readiness(data.coverage);
  const payDelta = data.current ? data.target.midpoint - data.current.midpoint : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Header: the framing — you vs the target */}
      <div>
        {data.job && (
          <Badge variant="secondary" className="mb-2 gap-1">
            <Briefcase className="h-3 w-3" />
            For the job: {data.job.title}
            {data.job.companyName ? ` · ${data.job.companyName}` : ""}
          </Badge>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          You vs. {data.target.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {data.currentRoleTitle ? (
            <>
              From{" "}
              <span className="font-medium text-foreground">
                {data.currentRoleTitle}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {data.target.title}
              </span>{" "}
              — here&apos;s the honest difference, and what you can do about it.
            </>
          ) : (
            <>Here&apos;s the honest difference between you and this role.</>
          )}
        </p>
      </div>

      {/* The gap at a glance: readiness ring + key stats */}
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={data.coverage} size={84} stroke={7} />
          <div>
            <div className={cn("text-lg font-semibold", r.tone)}>{r.label}</div>
            <div className="text-sm text-muted-foreground">
              You have {pct(data.coverage)} of what this role needs
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:border-l sm:pl-5">
          <Stat
            icon={<Target className="h-4 w-4" />}
            label="Pay"
            value={rmRange(data.target.salaryMin, data.target.salaryMax)}
            sub={
              data.current
                ? `${rmDelta(payDelta)} vs now`
                : "per month"
            }
          />
          <Stat
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={data.totalMonths ? `~${months(data.totalMonths)}` : "—"}
            sub={data.reachable ? "to get there" : "no direct path"}
          />
          <Stat
            icon={<TrendingUp className="h-4 w-4" />}
            label="Distance"
            value={
              data.stepsAway === 0
                ? "You're here"
                : data.stepsAway === 1
                  ? "1 move"
                  : data.stepsAway >= 99
                    ? "Far"
                    : `${data.stepsAway} moves`
            }
            sub={data.trajectoryFit}
          />
        </div>
      </div>

      {/* The path strip — the route, with the edge stat as the hero */}
      {data.path && data.path.length > 1 && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Navigation className="h-4 w-4 text-primary" />
            The path people actually took
          </h2>
          <div className="flex flex-wrap items-stretch gap-2">
            {data.path.map((hop, i) => (
              <div key={hop.roleId} className="flex items-stretch gap-2">
                {i > 0 && (
                  <div className="flex flex-col items-center justify-center px-1 text-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {hop.share != null && (
                      <span className="mt-1 text-[10px] font-medium text-primary">
                        {pct(hop.share)}
                      </span>
                    )}
                    {hop.medianMonths != null && (
                      <span className="text-[10px] text-muted-foreground">
                        ~{months(hop.medianMonths)}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "flex min-w-[120px] flex-col justify-center rounded-lg border p-2.5 text-sm",
                    hop.isTarget
                      ? "border-primary bg-primary/5 font-medium"
                      : hop.isCurrent
                        ? "bg-muted/60"
                        : "bg-background",
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {hop.isCurrent ? "You are here" : hop.isTarget ? "Target" : "Step"}
                  </span>
                  {hop.title}
                </div>
              </div>
            ))}
          </div>
          {/* The single most-travelled hop, called out in human language */}
          {(() => {
            const heroHop = data.path.find((h) => h.note && h.share != null);
            return heroHop ? (
              <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pct(heroHop.share!)} of people
                </span>{" "}
                made the {heroHop.title} move
                {heroHop.medianMonths
                  ? ` in about ${months(heroHop.medianMonths)}`
                  : ""}
                . {heroHop.note}
              </p>
            ) : null;
          })()}
        </div>
      )}

      {/* The skill difference: have vs gap */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-2 text-sm font-medium">What you already bring</h3>
          {data.have.length ? (
            <div className="flex flex-wrap gap-1.5">
              {data.have.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              None of this role&apos;s core skills are on your profile yet.
            </p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-2 text-sm font-medium">The gap to close</h3>
          {data.missing.length ? (
            <div className="flex flex-wrap gap-1.5">
              {data.missing.map((s) => (
                <Badge key={s} variant="outline" className="gap-1 border-dashed">
                  <CircleDashed className="h-3 w-3" />
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You already cover every core skill — this is about experience now.
            </p>
          )}
        </div>
      </div>

      {/* The honest trajectory note */}
      <div className="rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium">The honest read</p>
        <p className="mt-1 text-muted-foreground">{data.trajectoryNote}</p>
      </div>

      {/* THE FOUR BRANCHES — decide what to do about the gap */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          What do you want to do about it?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Roadmap — ask AI how to reach the level */}
          <BranchCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Show me how to get there"
            desc="An AI-generated, step-by-step roadmap around your exact gap."
          >
            <RoadmapDialog
              targetRoleId={data.target.roleId}
              targetTitle={data.target.title}
              fromTitle={data.currentRoleTitle ?? "your current role"}
              jobId={data.job?.id}
              jobTitle={data.job?.title}
              jobCompany={data.job?.companyName ?? undefined}
              triggerLabel="Generate roadmap"
              triggerVariant="default"
            />
          </BranchCard>

          {/* Meet someone on this path — understand it from a real person */}
          <BranchCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="Talk to someone who's there"
            desc="Book a meeting with someone on this path to understand what it's really like."
          >
            <Button asChild variant="default" className="gap-2">
              <Link href={`/candidate/meetings?role=${data.target.roleId}`}>
                Find someone to meet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </BranchCard>

          {/* Find jobs on this path */}
          <BranchCard
            icon={<Briefcase className="h-5 w-5" />}
            title="Find jobs on this path"
            desc="Real openings at the destination and its stepping stones."
          >
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/candidate/jobs?target=${data.target.roleId}`}>
                <Navigation className="h-4 w-4" />
                Browse matching jobs
              </Link>
            </Button>
          </BranchCard>

          {/* Apply — only meaningful when we arrived from a job */}
          <BranchCard
            icon={<Target className="h-5 w-5" />}
            title={data.job ? "Apply for this job" : "Ready to apply?"}
            desc={
              data.coverage >= 0.5
                ? "You're within reach — a strong, honest application beats a perfect one."
                : "It's a stretch, but a clear story about your direction can still land."
            }
          >
            {data.job ? (
              <ApplyDialog
                jobId={data.job.id}
                jobTitle={data.job.title}
                companyName={data.job.companyName}
                coverage={data.coverage}
              />
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/candidate/jobs?target=${data.target.roleId}`}>
                  Find a job to apply
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </BranchCard>
        </div>
      </div>

      {/* Experts preview — who you could talk to about this path */}
      {data.experts.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4 text-primary" />
              People who&apos;ve walked this path
            </h2>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href={`/candidate/meetings?role=${data.target.roleId}`}>
                See all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.experts.map((e) => (
              <Link
                key={e.id}
                href={`/candidate/meetings/${e.id}?role=${data.target.roleId}`}
                className="group rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="flex items-center gap-2.5">
                  <PersonAvatar name={e.fullName} seed={e.id} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{e.fullName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.roleTitle}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {e.rating}
                  </span>
                  <span>·</span>
                  <span>{e.yearsInField} yrs</span>
                  {e.offersFreeIntro && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Free intro
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function BranchCard({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}
