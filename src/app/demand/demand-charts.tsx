"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMounted } from "@/lib/use-mounted";

interface SkillDemand {
  skill: string;
  count: number;
  share: number;
}
interface RegionDemand {
  region: string;
  openings: number;
  topSkills: SkillDemand[];
  topRoleFamily: string;
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

export function DemandCharts({
  regions,
  nationalTopSkills,
}: {
  regions: RegionDemand[];
  nationalTopSkills: SkillDemand[];
}) {
  const mounted = useMounted();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* National top skills */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Most in-demand skills, nationally</h2>
        <p className="text-sm text-muted-foreground">
          Across all tracked openings.
        </p>
        <div className="mt-4 h-72">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={nationalTopSkills}
                layout="vertical"
                margin={{ left: 10, right: 16 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={100}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Openings" radius={[0, 4, 4, 0]}>
                  {nationalTopSkills.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Openings by region */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Openings by region</h2>
        <p className="text-sm text-muted-foreground">
          Where the hiring is concentrated.
        </p>
        <div className="mt-4 h-72">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regions} margin={{ left: 0, right: 16, bottom: 40 }}>
                <XAxis
                  dataKey="region"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} contentStyle={tooltipStyle} />
                <Bar dataKey="openings" name="Openings" radius={[4, 4, 0, 0]}>
                  {regions.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
