"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const accountRole = String(formData.get("accountRole") ?? "candidate");

  if (!email || !password || !fullName) {
    return { error: "Please fill in your name, email, and password." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, account_role: accountRole },
    },
  });

  if (error) return { error: error.message };

  // Ensure a session exists even if email confirmation is on (demo convenience).
  await supabase.auth.signInWithPassword({ email, password });

  redirect(accountRole === "employer" ? "/employer" : "/onboarding");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let dest = "/candidate";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_role")
      .eq("id", user.id)
      .single();
    dest = profile?.account_role === "employer" ? "/employer" : "/candidate";
  }
  redirect(dest);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
