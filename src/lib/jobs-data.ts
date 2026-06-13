import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/career-graph/seed-data";

const SEED_ID_BY_TITLE = new Map(ROLES.map((r) => [r.title, r.id]));

export interface JobRow {
  id: string;
  title: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  companyName: string | null;
  companyIndustry: string | null;
  roleTitle: string | null;
  seedRoleId: string | null;
}

export async function getJobs(): Promise<JobRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select(
      "id, title, location, salary_min, salary_max, description, is_active, companies(name, industry), roles(title)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((j) => {
    const roleTitle = (j.roles as { title: string } | null)?.title ?? null;
    return {
      id: j.id,
      title: j.title,
      location: j.location,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      description: j.description,
      companyName: (j.companies as { name: string } | null)?.name ?? null,
      companyIndustry:
        (j.companies as { industry: string } | null)?.industry ?? null,
      roleTitle,
      seedRoleId: roleTitle ? (SEED_ID_BY_TITLE.get(roleTitle) ?? null) : null,
    };
  });
}

export async function getAppliedJobIds(candidateId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("job_id")
    .eq("candidate_id", candidateId);
  return new Set((data ?? []).map((a) => a.job_id));
}
