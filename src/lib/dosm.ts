// Real Malaysian labour-market data from the Department of Statistics Malaysia
// (DOSM) open API — https://api.data.gov.my/opendosm. No auth required.
//
// This grounds Career OS in genuine government data: the career-trajectory graph
// is curated (no public source publishes transitions), but national/state labour
// context and household income come straight from DOSM, clearly attributed.

const BASE = "https://api.data.gov.my/opendosm/";

// Next.js fetch cache: revalidate daily — this is slow-moving official data.
const REVALIDATE_SECONDS = 60 * 60 * 24;

async function dosm<T>(id: string, params: Record<string, string> = {}): Promise<T[]> {
  const qs = new URLSearchParams({ id, ...params }).toString();
  try {
    const res = await fetch(`${BASE}?${qs}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

export interface LabourSnapshot {
  date: string;
  labourForce: number; // thousands
  employed: number;
  unemployed: number;
  participationRate: number; // %
  unemploymentRate: number; // %
  source: string;
}

interface LfsMonthRow {
  date: string;
  lf: number;
  lf_employed: number;
  lf_unemployed: number;
  p_rate: number;
  u_rate: number;
}

// Latest national labour-force snapshot (real, monthly).
export async function getLabourSnapshot(): Promise<LabourSnapshot | null> {
  const rows = await dosm<LfsMonthRow>("lfs_month", { sort: "-date", limit: "1" });
  const r = rows[0];
  if (!r) return null;
  return {
    date: r.date,
    labourForce: r.lf,
    employed: r.lf_employed,
    unemployed: r.lf_unemployed,
    participationRate: r.p_rate,
    unemploymentRate: r.u_rate,
    source: "Department of Statistics Malaysia (DOSM), Labour Force Survey",
  };
}

// A short trend of the unemployment rate (for a small sparkline / context).
export async function getUnemploymentTrend(months = 12): Promise<
  { date: string; rate: number }[]
> {
  const rows = await dosm<LfsMonthRow>("lfs_month", {
    sort: "-date",
    limit: String(months),
  });
  return rows
    .map((r) => ({ date: r.date, rate: r.u_rate }))
    .reverse();
}

export interface StateIncome {
  state: string;
  medianIncome: number; // RM/month household
  source: string;
}

interface HiesStateRow {
  date: string;
  state: string;
  income_median: number;
}

// Latest median household income by state (real, from DOSM HIES).
export async function getStateIncomes(): Promise<StateIncome[]> {
  const rows = await dosm<HiesStateRow>("hies_state", { sort: "-date" });
  if (!rows.length) return [];
  // Keep only the most recent year's records.
  const latestDate = rows[0]?.date;
  return rows
    .filter((r) => r.date === latestDate && r.state && r.state !== "Malaysia")
    .map((r) => ({
      state: r.state,
      medianIncome: r.income_median,
      source: "DOSM, Household Income & Expenditure Survey",
    }))
    .sort((a, b) => b.medianIncome - a.medianIncome);
}
