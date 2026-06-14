import type { University, FieldOutcome } from "@/lib/career-graph/universities";
import { ROLES } from "@/lib/career-graph/seed-data";

// Turns raw outcome figures into concrete, actionable institutional insights —
// "what to do", not just "what happened". This is the difference between a
// dashboard and a decision tool.

export type InsightSeverity = "act-now" | "watch" | "strong";

export interface Insight {
  severity: InsightSeverity;
  field: string;
  finding: string; // what the data shows
  action: string; // the recommended intervention
}

// Skills the market demands most (from the shared career graph) — used to
// suggest curriculum additions for weak fields.
const MARKET_SKILL_DEMAND = (() => {
  const demand = new Map<string, number>();
  for (const r of ROLES) for (const s of r.skills) demand.set(s, (demand.get(s) ?? 0) + 1);
  return Array.from(demand.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
})();

function topMarketSkills(n: number): string[] {
  return MARKET_SKILL_DEMAND.slice(0, n);
}

export function buildInsights(uni: University): Insight[] {
  const insights: Insight[] = [];

  for (const f of uni.fields) {
    if (f.employedWithin6Mo < 0.75) {
      insights.push({
        severity: "act-now",
        field: f.field,
        finding: `Only ${Math.round(f.employedWithin6Mo * 100)}% of ${f.field} graduates are employed within 6 months — well below the institution average.`,
        action: `Add industry-aligned electives and a compulsory internship. Market-hot skills to weave in: ${topMarketSkills(3).join(", ")}.`,
      });
    } else if (f.employedWithin6Mo < 0.82) {
      insights.push({
        severity: "watch",
        field: f.field,
        finding: `${f.field} employability (${Math.round(f.employedWithin6Mo * 100)}%) is soft and trending below market.`,
        action: `Strengthen employer partnerships for ${f.topFamilies.join(" and ")} roles and add a capstone project.`,
      });
    } else if (f.employedWithin6Mo >= 0.9) {
      insights.push({
        severity: "strong",
        field: f.field,
        finding: `${f.field} is a standout — ${Math.round(f.employedWithin6Mo * 100)}% employed, ${rmShort(f.medianStartingSalary)} median start.`,
        action: `Protect capacity and use it as a model: document what works and replicate in weaker programmes.`,
      });
    }

    // Low starting salary relative to the field's destination roles.
    if (f.medianStartingSalary < 3200 && f.employedWithin6Mo >= 0.75) {
      insights.push({
        severity: "watch",
        field: f.field,
        finding: `Graduates are getting hired but starting low (${rmShort(f.medianStartingSalary)}/mo) — a value, not employability, gap.`,
        action: `Add credentials that lift starting pay (certifications, specialisations) and coach on salary negotiation before graduation.`,
      });
    }
  }

  // Order: act-now first, then watch, then strong.
  const rank: Record<InsightSeverity, number> = { "act-now": 0, watch: 1, strong: 2 };
  return insights.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

function rmShort(n: number): string {
  return `RM${n.toLocaleString("en-MY")}`;
}

// How a real university would feed its data in — the honest onboarding story.
export interface DataSource {
  name: string;
  detail: string;
  status: "live" | "method" | "roadmap";
}

export function dataSources(): DataSource[] {
  return [
    {
      name: "Graduate Tracer Study (MOHE)",
      detail:
        "Malaysia's compulsory annual survey (Kajian Pengesanan Graduan) — every public university already submits graduate-outcome data to the Ministry. Career OS ingests that existing dataset; no new collection needed.",
      status: "method",
    },
    {
      name: "University SIS / alumni records",
      detail:
        "A one-time export (or API) of programme enrolment and alumni employment, mapped to the career graph. Standard registry data the institution already holds.",
      status: "roadmap",
    },
    {
      name: "DOSM labour market",
      detail:
        "National employment, unemployment, and income figures pulled live from the Department of Statistics Malaysia open data API for benchmarking.",
      status: "live",
    },
    {
      name: "Career OS platform signals",
      detail:
        "As alumni use Career OS, their real trajectories update outcomes continuously — closing the loop the Tracer Study can't (it stops at ~1 year).",
      status: "roadmap",
    },
  ];
}

export type { FieldOutcome };
