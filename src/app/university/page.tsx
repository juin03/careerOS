import Link from "next/link";
import {
  GraduationCap,
  Users,
  Layers,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getCohort,
  cohortByFamily,
  recurringSkillGaps,
  outcomeFlows,
} from "@/lib/university-analytics";
import { UNIVERSITIES, getUniversity } from "@/lib/career-graph/universities";
import { buildInsights, dataSources } from "@/lib/university-insights";
import { UniversityCharts } from "./university-charts";
import { UniversityPicker } from "./university-picker";
import { getLabourSnapshot } from "@/lib/dosm";
import { pct, rm } from "@/lib/format";
import { Lightbulb, Database } from "lucide-react";

export const metadata = {
  title: "University view · Career OS",
  description:
    "Graduate outcomes, employability, and curriculum-market gaps — the institutional lens on the career graph.",
};

export default async function UniversityPage({
  searchParams,
}: {
  searchParams: Promise<{ uni?: string }>;
}) {
  const params = await searchParams;
  const uni = getUniversity(params.uni ?? "") ?? UNIVERSITIES[0];
  const labour = await getLabourSnapshot();

  // Institution-level aggregates from the field outcomes.
  const totalGrads = uni.fields.reduce((s, f) => s + f.graduates, 0);
  const weightedEmploy =
    uni.fields.reduce((s, f) => s + f.employedWithin6Mo * f.graduates, 0) /
    totalGrads;
  const avgSalary = Math.round(
    uni.fields.reduce((s, f) => s + f.medianStartingSalary * f.graduates, 0) /
      totalGrads,
  );

  // Graph-level signals (shared career graph) for the curriculum-gap section.
  const cohort = getCohort();
  const families = cohortByFamily(cohort);
  const gaps = recurringSkillGaps(cohort);
  const flows = outcomeFlows(cohort);

  // Actionable, per-field insights and the honest data-onboarding story.
  const insights = buildInsights(uni);
  const sources = dataSources();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Institutional view
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Lifelong Outcome Loop
              </h1>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                Track where graduates actually go, how employable each field is,
                and where the curriculum lags the market — long after graduation
                day.
              </p>
            </div>
          </div>
          <UniversityPicker
            current={uni.id}
            options={UNIVERSITIES.map((u) => ({ id: u.id, name: u.name }))}
          />
        </div>

        {/* Institution stats */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            {uni.name} · {uni.location}
          </h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat icon={<Users className="h-5 w-5" />} label="Graduates tracked" value={totalGrads.toLocaleString()} />
            <Stat icon={<Briefcase className="h-5 w-5" />} label="Employed in 6 months" value={pct(weightedEmploy)} />
            <Stat icon={<TrendingUp className="h-5 w-5" />} label="Avg starting salary" value={rm(avgSalary)} />
            <Stat icon={<Layers className="h-5 w-5" />} label="Fields tracked" value={String(uni.fields.length)} />
          </div>
        </div>

        {/* Per-field outcomes table — the institutional core */}
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Outcomes by field of study</h2>
            <p className="text-sm text-muted-foreground">
              Employability and starting salary per programme — where to intervene.
            </p>
          </div>
          <div className="divide-y">
            {uni.fields
              .slice()
              .sort((a, b) => a.employedWithin6Mo - b.employedWithin6Mo)
              .map((f) => {
                const atRisk = f.employedWithin6Mo < 0.78;
                return (
                  <div key={f.field} className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-44 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.field}</span>
                        {atRisk && (
                          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Watch
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {f.graduates} graduates · flows to {f.topFamilies.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${atRisk ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${Math.round(f.employedWithin6Mo * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-sm font-medium">{pct(f.employedWithin6Mo)}</span>
                    </div>
                    <div className="w-28 text-right text-sm text-muted-foreground">
                      {rm(f.medianStartingSalary)}/mo
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Actionable insights — "what to do", not just "what happened" */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Recommended actions
          </h2>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border bg-card p-4"
              >
                <span
                  className={`mt-0.5 inline-flex h-fit shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    ins.severity === "act-now"
                      ? "bg-destructive/10 text-destructive"
                      : ins.severity === "watch"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {ins.severity === "act-now"
                    ? "Act now"
                    : ins.severity === "watch"
                      ? "Watch"
                      : "Strength"}
                </span>
                <div>
                  <p className="text-sm font-medium">{ins.field}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{ins.finding}</p>
                  <p className="mt-1.5 text-sm">
                    <span className="font-medium text-primary">Do: </span>
                    {ins.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* National context, live from DOSM */}
        {labour && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div className="text-sm">
              <span className="font-medium">National benchmark · </span>
              <span className="text-muted-foreground">
                Malaysia unemployment {labour.unemploymentRate}%, participation{" "}
                {labour.participationRate}% (
                {new Date(labour.date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Live · DOSM</span>
          </div>
        )}

        <UniversityCharts families={families} gaps={gaps} flows={flows} />

        {/* Honest data-onboarding story — answers "how do you get UM/USM's data?" */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Database className="h-4 w-4 text-primary" />
            Where this data comes from
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A real university doesn&apos;t start from scratch — most of this data
            already exists. Career OS connects to it.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sources.map((s) => (
              <div key={s.name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge
                    variant={s.status === "live" ? "default" : "outline"}
                    className="text-[10px] capitalize"
                  >
                    {s.status === "live"
                      ? "Live now"
                      : s.status === "method"
                        ? "Existing dataset"
                        : "On integration"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-primary/5 p-5">
          <h2 className="font-semibold">Why this is the same system</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidates navigate this graph forward. Employers read it to find
            people heading their way. Universities read it backward — to see what
            their teaching produced and where to intervene next. Outcome figures
            follow the Ministry of Higher Education&apos;s Graduate Tracer Study
            method; national benchmarks are live from DOSM.
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
