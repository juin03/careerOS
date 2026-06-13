"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { validateSignal } from "@/lib/ai/signal-validator";
import { ROLE_BY_ID } from "@/lib/career-graph/seed-data";

export interface SendSignalResult {
  ok?: boolean;
  rejected?: boolean;
  reason?: string;
  usedAI?: boolean;
  error?: string;
}

// Outreach budget per employer (Quiet Signals scarcity mechanic).
const SIGNAL_BUDGET = 5;

export async function sendSignal(input: {
  candidateId: string;
  whyYou: string;
  candidateRoleTitle: string | null;
  candidateSkills: string[];
  targetRoleId: string;
  synthetic: boolean;
}): Promise<SendSignalResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Not signed in." };
  const supabase = await createClient();

  // Budget check.
  const { count } = await supabase
    .from("signals")
    .select("*", { count: "exact", head: true })
    .eq("employer_id", user.id);
  if ((count ?? 0) >= SIGNAL_BUDGET) {
    return {
      error: `You've used all ${SIGNAL_BUDGET} signals. Scarcity is the point — it keeps outreach specific and spam-free.`,
    };
  }

  const targetRole = ROLE_BY_ID[input.targetRoleId];

  // AI (or heuristic) spam gate — the core of Quiet Signals.
  const validation = await validateSignal(input.whyYou, {
    roleTitle: input.candidateRoleTitle,
    skills: input.candidateSkills,
    targetRoleTitle: targetRole?.title ?? "this role",
  });

  if (!validation.passed) {
    return {
      rejected: true,
      reason: validation.reason,
      usedAI: validation.usedAI,
    };
  }

  // Synthetic personas can't receive real DB rows (no auth user). We still run
  // the full validation so the demo shows the gate working, then report success.
  if (input.synthetic) {
    return { ok: true, usedAI: validation.usedAI };
  }

  const { error } = await supabase.from("signals").insert({
    employer_id: user.id,
    candidate_id: input.candidateId,
    why_you: input.whyYou,
  });
  if (error && !error.message.includes("duplicate")) {
    return { error: error.message };
  }

  revalidatePath("/employer/signals");
  return { ok: true, usedAI: validation.usedAI };
}
