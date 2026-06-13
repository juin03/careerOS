"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { ROLE_BY_ID } from "@/lib/career-graph/seed-data";

export interface PostJobState {
  error?: string;
}

export async function postJob(
  _prev: PostJobState,
  formData: FormData,
): Promise<PostJobState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const seedRoleId = String(formData.get("roleId") ?? "").trim();
  const salaryMin = Number(formData.get("salaryMin") ?? 0);
  const salaryMax = Number(formData.get("salaryMax") ?? 0);

  if (!title || !seedRoleId) {
    return { error: "Title and role are required." };
  }

  const supabase = await createClient();

  // Resolve seed role id -> db role uuid by title.
  const seedRole = ROLE_BY_ID[seedRoleId];
  let dbRoleId: string | null = null;
  if (seedRole) {
    const { data } = await supabase
      .from("roles")
      .select("id")
      .eq("title", seedRole.title)
      .single();
    dbRoleId = data?.id ?? null;
  }

  // Resolve employer's company.
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("jobs").insert({
    title,
    location: location || null,
    description: description || null,
    role_id: dbRoleId,
    company_id: profile?.company_id ?? null,
    posted_by: user.id,
    salary_min: salaryMin || null,
    salary_max: salaryMax || null,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  redirect("/employer/jobs");
}
