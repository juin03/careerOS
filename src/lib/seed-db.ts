import { createClient } from "@/lib/supabase/server";
import { COMPANIES, JOBS, ROLES } from "@/lib/career-graph/seed-data";

// Idempotently ensure the reference graph (roles, companies, jobs) exists in the
// DB so relational features (applications, job→role tagging) work end-to-end.
//
// The graph ENGINE reads roles/transitions from TypeScript for speed and
// determinism; the DB rows exist so foreign keys and queries resolve. Both share
// the same source data, so they never drift.
//
// Returns a map from seed role-id (e.g. "r_swe") to the DB uuid, used to tag jobs.

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  const supabase = await createClient();

  // Fast path: if the graph is already fully seeded (it is, in production),
  // a single count query lets us skip all the per-row existence checks/inserts.
  // This is what runs on every cold serverless start, so keep it to one query.
  const { count } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) >= ROLES.length && (count ?? 0) >= JOBS.length) {
    seeded = true;
    return;
  }

  // ── Roles ──────────────────────────────────────────────────────────────
  const { data: existingRoles } = await supabase
    .from("roles")
    .select("id, title");
  const roleByTitle = new Map((existingRoles ?? []).map((r) => [r.title, r.id]));
  const roleIdMap = new Map<string, string>(); // seed id -> db uuid

  for (const r of ROLES) {
    const existing = roleByTitle.get(r.title);
    if (existing) {
      roleIdMap.set(r.id, existing);
      continue;
    }
    const { data } = await supabase
      .from("roles")
      .insert({
        title: r.title,
        family: r.family,
        seniority: r.seniority,
        salary_min: r.salaryMin,
        salary_max: r.salaryMax,
        description: r.description,
      })
      .select("id")
      .single();
    if (data) roleIdMap.set(r.id, data.id);
  }

  // ── Companies ──────────────────────────────────────────────────────────
  const { data: existingCompanies } = await supabase
    .from("companies")
    .select("id, name");
  const companyByName = new Map(
    (existingCompanies ?? []).map((c) => [c.name, c.id]),
  );
  const companyIdMap = new Map<string, string>();

  for (const c of COMPANIES) {
    const existing = companyByName.get(c.name);
    if (existing) {
      companyIdMap.set(c.id, existing);
      continue;
    }
    const { data } = await supabase
      .from("companies")
      .insert({
        name: c.name,
        industry: c.industry,
        location: c.location,
        size: c.size,
      })
      .select("id")
      .single();
    if (data) companyIdMap.set(c.id, data.id);
  }

  // ── Jobs ───────────────────────────────────────────────────────────────
  const { data: existingJobs } = await supabase.from("jobs").select("title");
  const haveJob = new Set((existingJobs ?? []).map((j) => j.title));

  const toInsert = JOBS.filter((j) => !haveJob.has(j.title)).map((j) => ({
    company_id: companyIdMap.get(j.companyId) ?? null,
    role_id: roleIdMap.get(j.roleId) ?? null,
    title: j.title,
    location: j.location,
    salary_min: j.salaryMin,
    salary_max: j.salaryMax,
    description: j.description,
    is_active: true,
  }));

  if (toInsert.length) {
    await supabase.from("jobs").insert(toInsert);
  }

  seeded = true;
}
