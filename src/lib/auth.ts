import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

// Guards a page: redirects to login if signed out, and to the correct home if
// the account role doesn't match the area being accessed.
export async function requireProfile(
  expected?: "candidate" | "employer",
): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (expected && profile.account_role !== expected) {
    redirect(profile.account_role === "employer" ? "/employer" : "/candidate");
  }
  return profile;
}
