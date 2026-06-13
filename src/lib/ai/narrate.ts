import { generateText, hasAI } from "./provider";
import type { LandscapeMove } from "@/lib/career-graph/engine";
import { pct, rmRange, months } from "@/lib/format";

// Generates an uncertainty-calibrated, human-language summary of a candidate's
// landscape. Falls back to a templated narration when no AI key is present.
// The brief is explicit: speak human, state uncertainty, no false precision.
export async function narrateLandscape(
  roleTitle: string,
  moves: LandscapeMove[],
): Promise<{ text: string; usedAI: boolean }> {
  if (!moves.length) {
    return {
      text: "We don't yet have enough on your current role to map the paths ahead. Add your role and skills to see the landscape.",
      usedAI: false,
    };
  }

  if (hasAI()) {
    const summary = moves
      .map(
        (m) =>
          `- ${m.role.title}: ${pct(m.transition.share)} of people take this, ~${months(
            m.transition.medianMonths,
          )}, pay ${rmRange(m.role.salaryMin, m.role.salaryMax)}, you already have ${pct(
            m.gap.coverage,
          )} of the skills (missing: ${m.gap.missing.join(", ") || "none"}). Trade-off: ${m.transition.note}`,
      )
      .join("\n");

    const prompt = `A candidate currently works as "${roleTitle}". Here are their realistic next moves with data:
${summary}

Write 2-3 short sentences that orient them to their landscape. Rules:
- Speak like a thoughtful mentor, plain language, no hype.
- This is navigation, not prediction — never say what they "will" become.
- State uncertainty honestly. Mention there are several real options.
- Do NOT output a score or percentage as a verdict. Reference trade-offs, not rankings.
- Keep it under 60 words.`;

    const text = await generateText(prompt, {
      system:
        "You are a careers navigator. You help people see options and trade-offs. You never predict or pressure.",
    });
    if (text) return { text, usedAI: true };
  }

  // Deterministic fallback.
  const top = moves[0];
  const count = moves.length;
  const text = `From ${roleTitle}, there isn't one answer — there are ${count} realistic directions. The most common is ${top.role.title} (${pct(
    top.transition.share,
  )} of people, ~${months(top.transition.medianMonths)}), but each path trades off differently on pay, time, and the skills you'd need to build. Explore them below and pick the road that fits you.`;
  return { text, usedAI: false };
}
