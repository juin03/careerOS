"use client";

import { useMounted } from "@/lib/use-mounted";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pct } from "@/lib/format";

interface FamilyShare {
  family: string;
  count: number;
  share: number;
}
interface SkillGapStat {
  skill: string;
  demandRoles: number;
  cohortHave: number;
  gap: number;
}
interface OutcomeFlow {
  from: string;
  to: string;
  share: number;
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];

export function UniversityCharts({
  families,
  gaps,
  flows,
}: {
  families: FamilyShare[];
  gaps: SkillGapStat[];
  flows: OutcomeFlow[];
}) {
  // Recharts needs a measured container; only render after mount to avoid
  // zero-size warnings during prerender and any hydration flicker.
  const mounted = useMounted();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Where graduates went */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Where graduates went</h2>
        <p className="text-sm text-muted-foreground">
          Distribution of alumni across role families.
        </p>
        <div className="mt-4 h-64">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={families}
                dataKey="count"
                nameKey="family"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
              >
                {families.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(v) => <span className="text-muted-foreground">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recurring skill gaps */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Recurring skill gaps</h2>
        <p className="text-sm text-muted-foreground">
          High market demand, low cohort supply — where curriculum lags.
        </p>
        <div className="mt-4 h-64">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gaps} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="skill"
                width={90}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="gap"
                name="Gap signal"
                fill="var(--color-primary)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Outcome flows */}
      <div className="rounded-xl border bg-card p-5 lg:col-span-2">
        <h2 className="font-semibold">Most common next moves</h2>
        <p className="text-sm text-muted-foreground">
          The transitions alumni make most — the live outcome loop.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {flows.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{f.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{f.to}</span>
              </div>
              <Badge variant="secondary">{pct(f.share)}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
