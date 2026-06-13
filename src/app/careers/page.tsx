import Link from "next/link";
import { ArrowLeft, Compass, TrendingUp } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLES, TRANSITIONS } from "@/lib/career-graph/seed-data";
import type { Role, RoleFamily } from "@/lib/career-graph/types";
import { rmRange } from "@/lib/format";

export const metadata = {
  title: "Browse all careers · Career OS",
  description:
    "Explore every career path in the Career OS graph — across tech, finance, healthcare, and business.",
};

const SENIORITY_LABEL: Record<number, string> = {
  1: "Entry",
  2: "Junior",
  3: "Mid / Senior",
  4: "Lead",
  5: "Executive",
};

// Count how many onward paths each role has, to hint at how "open" it is.
const OUT_COUNT = new Map<string, number>();
for (const t of TRANSITIONS) {
  OUT_COUNT.set(t.fromRoleId, (OUT_COUNT.get(t.fromRoleId) ?? 0) + 1);
}

export default function CareersPage() {
  // Group roles by family, ordered by seniority within each.
  const byFamily = new Map<RoleFamily, Role[]>();
  for (const r of ROLES) {
    if (!byFamily.has(r.family)) byFamily.set(r.family, []);
    byFamily.get(r.family)!.push(r);
  }
  const families = Array.from(byFamily.entries())
    .map(([family, roles]) => ({
      family,
      roles: roles.sort((a, b) => a.seniority - b.seniority),
    }))
    .sort((a, b) => b.roles.length - a.roles.length);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Browse careers
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

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Every career, mapped
            </h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {ROLES.length} roles across {families.length} fields — tech,
              finance, healthcare, and business. Pick any one to see where it
              leads.
            </p>
          </div>
        </div>

        {families.map(({ family, roles }) => (
          <section key={family}>
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">{family}</h2>
              <span className="text-sm text-muted-foreground">
                {roles.length} role{roles.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const paths = OUT_COUNT.get(role.id) ?? 0;
                return (
                  <Link
                    key={role.id}
                    href={`/candidate/landscape?from=${role.id}`}
                    className="group flex cursor-pointer flex-col rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium leading-tight">{role.title}</h3>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {SENIORITY_LABEL[role.seniority]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {rmRange(role.salaryMin, role.salaryMax)}
                    </p>
                    {paths > 0 && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <TrendingUp className="h-3 w-3" />
                        {paths} onward path{paths === 1 ? "" : "s"} →
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <div className="rounded-xl border bg-primary/5 p-5 text-center">
          <p className="font-medium">See where any of these lead for you</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your profile and the map adapts to your skills and starting
            point.
          </p>
          <Button asChild className="mt-4">
            <Link href="/signup?role=candidate">Map my career</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
