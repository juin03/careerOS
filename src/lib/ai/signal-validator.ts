import { generateJSON, hasAI } from "./provider";

// Validates an employer's "why you" outreach message against the candidate's
// actual trajectory. The whole point of Quiet Signals: generic spam cannot get
// through. AI checks specificity; a deterministic fallback enforces the floor.
export interface SignalValidation {
  passed: boolean;
  reason: string;
  usedAI: boolean;
}

const GENERIC_PHRASES = [
  "great opportunity",
  "exciting opportunity",
  "perfect fit",
  "we are hiring",
  "dear candidate",
  "to whom it may concern",
  "competitive salary",
  "fast-paced environment",
  "dynamic team",
  "i came across your profile",
];

export async function validateSignal(
  whyYou: string,
  candidateContext: {
    roleTitle: string | null;
    skills: string[];
    targetRoleTitle: string;
  },
): Promise<SignalValidation> {
  const text = whyYou.trim();

  // Hard floor — applies regardless of AI.
  if (text.length < 40) {
    return {
      passed: false,
      reason:
        "Too short. Say something specific about this person's trajectory or skills — at least a sentence or two.",
      usedAI: false,
    };
  }
  const lower = text.toLowerCase();
  const genericHits = GENERIC_PHRASES.filter((p) => lower.includes(p));
  if (genericHits.length >= 2) {
    return {
      passed: false,
      reason:
        "This reads like a template. Reference what's actually true about this candidate, not generic hiring language.",
      usedAI: false,
    };
  }

  if (hasAI()) {
    const prompt = `An employer wants to send outreach to a candidate. Outreach must be SPECIFIC to this person — generic recruiter spam must be rejected.

Candidate's current role: ${candidateContext.roleTitle ?? "unknown"}
Candidate's skills: ${candidateContext.skills.join(", ") || "unknown"}
Role being offered: ${candidateContext.targetRoleTitle}

Outreach message:
"""
${text}
"""

Decide if this message is specific and relevant enough to reach the candidate. It PASSES only if it references something concrete about this candidate's skills, trajectory, or fit — not just generic enthusiasm.

Return JSON: { "passed": boolean, "reason": "one short sentence of feedback the employer will see" }`;

    const result = await generateJSON<{ passed: boolean; reason: string }>(prompt, {
      system:
        "You are a strict but fair gatekeeper protecting candidates from spam. Reject generic outreach.",
    });
    if (result) {
      return { passed: result.passed, reason: result.reason, usedAI: true };
    }
  }

  // Deterministic fallback: reward specificity (mentions of skills / role).
  const mentionsSkill = candidateContext.skills.some((s) =>
    lower.includes(s.toLowerCase()),
  );
  const mentionsRole =
    candidateContext.roleTitle &&
    lower.includes(candidateContext.roleTitle.toLowerCase().split(" ")[0]);
  if (mentionsSkill || mentionsRole) {
    return {
      passed: true,
      reason: "Specific enough — references this candidate's actual background.",
      usedAI: false,
    };
  }
  return {
    passed: false,
    reason:
      "Make it specific to this candidate — mention a skill or part of their path that's relevant to the role.",
    usedAI: false,
  };
}
