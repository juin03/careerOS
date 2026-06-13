import Link from "next/link";
import { MapPin, Download, TrendingUp, Briefcase, Info, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDemandData } from "@/lib/demand-analytics";
import { DemandCharts } from "./demand-charts";
import { pct } from "@/lib/format";

export const metadata = {
  title: "Skills Demand Map · Career OS",
  description:
    "Where skills are in demand across Malaysia — derived from live job postings. Open data for universities, policymakers, and the public.",
};

export default function DemandPage() {
  const data = getDemandData();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Skills Demand Map
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
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Skills Demand Map
              </h1>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                Where skills are in demand across Malaysia — so graduates,
                universities, and policymakers can see what the market actually
                needs, region by region.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <a href="/demand/export" download>
              <Download className="h-4 w-4" /> Download dataset (CSV)
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-semibold">{data.totalOpenings}</div>
            <div className="text-sm text-muted-foreground">Openings analysed</div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-semibold">{data.regions.length}</div>
            <div className="text-sm text-muted-foreground">Regions tracked</div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-semibold">
              {data.nationalTopSkills[0]?.skill ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">Most-demanded skill</div>
          </div>
        </div>

        <DemandCharts
          regions={data.regions}
          nationalTopSkills={data.nationalTopSkills}
        />

        {/* Region breakdown */}
        <div>
          <h2 className="mb-3 font-semibold">Demand by region</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.regions.map((r) => (
              <div key={r.region} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{r.region}</h3>
                  <Badge variant="secondary">{r.openings} openings</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Strongest in {r.topRoleFamily}
                </p>
                <div className="mt-3 space-y-1.5">
                  {r.topSkills.map((s) => (
                    <div key={s.skill} className="flex items-center gap-2">
                      <span className="w-28 shrink-0 text-sm">{s.skill}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round(s.share * 100)}%` }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
                        {pct(s.share)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology — honesty */}
        <div className="flex gap-2 rounded-xl border bg-muted/40 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">How this is measured</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.methodology}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
