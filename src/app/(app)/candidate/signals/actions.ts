"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function respondToSignal(signalId: string, accept: boolean) {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("signals")
    .update({ accepted: accept })
    .eq("id", signalId)
    .eq("candidate_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/candidate/signals");
  return { ok: true };
}
