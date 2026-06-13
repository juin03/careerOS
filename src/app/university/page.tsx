import Link from "next/link";
import { GraduationCap, Users, Layers, TrendingUp, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getCohort,
  cohortByFamily,
  recurringSkillGaps,
  outcomeFlows,
  cohortStats,
} from "@/lib/university-analytics";
import { UniversityCharts } from "./university-charts";
import { pct } from "@/lib/format";

export const metadata = {
  title: "University view · Career OS",
  description: "Where graduates actually went — the third lens on the career graph.",
};

export default function UniversityPage() {
  const cohort = getCohort();
  const stats = cohortStats(cohort);
  const families = cohortByFamily(cohort);
  const gaps = recurringSkillGaps(cohort);
  const flows = outcomeFlows(cohort);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <Badge variant="secondary" className="hidden sm:inline-flex">
            University view · demo
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
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Lifelong Outcome Loop
            </h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              The same career graph, filtered to one institution&apos;s alumni.
              See where graduates actually went, which skill gaps recur, and where
              the curriculum lags the market — long after graduation day.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat
            icon={<Users className="h-5 w-5" />}
            label="Alumni tracked"
            value={String(stats.total)}
          />
          <Stat
            icon={<Layers className="h-5 w-5" />}
            label="Distinct roles"
            value={String(stats.distinctRoles)}
          />
          <Stat
            icon={<TrendingUp className="h-5 w-5" />}
            label="Placement rate"
            value={pct(stats.placementRate)}
          />
          <Stat
            icon={<GraduationCap className="h-5 w-5" />}
            label="Avg skills / grad"
            value={String(stats.avgSkills)}
          />
        </div>

        <UniversityCharts families={families} gaps={gaps} flows={flows} />

        <div className="rounded-xl border bg-primary/5 p-5">
          <h2 className="font-semibold">Why this is the same system</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidates navigate this graph forward. Employers read it to find
            people heading their way. Universities read it backward — to see what
            their teaching produced and where to intervene next. One data model,
            three honest lenses.
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
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
