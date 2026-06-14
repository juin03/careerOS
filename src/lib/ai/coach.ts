import { generateText, generateJSON, hasAI } from "./provider";
import { landscapeFrom, getRole } from "@/lib/career-graph/engine";
import { ROLES } from "@/lib/career-graph/seed-data";
import { rmRange, pct, months } from "@/lib/format";

// The AI Career Coach (Candidates · Module 03). Answers grounded in the user's
// actual position on the career graph + portfolio, never a generic chatbot. It
// can also propose a profile update (add skills, change target) which the UI
// applies and persists — closing the loop.

export interface CoachContext {
  roleTitle: string | null;
  seedRoleId: string | null;
  skills: string[];
  summary: string | null;
  experience: { title: string; org: string; period: string }[];
}

export interface CoachReply {
  text: string;
  // An optional, structured profile update the user can accept.
  proposedSkills?: string[]; // new skills to add
  usedAI: boolean;
}

function contextBlock(ctx: CoachContext): string {
  const moves =
    ctx.seedRoleId &&
    landscapeFrom(ctx.seedRoleId, ctx.skills)
      .slice(0, 5)
      .map(
        (m) =>
          `${m.role.title} (${pct(m.transition.share)} take it, ~${months(
            m.transition.medianMonths,
          )}, ${rmRange(m.role.salaryMin, m.role.salaryMax)}, ${pct(m.gap.coverage)} skill match; missing: ${m.gap.missing.join(", ") || "none"})`,
      )
      .join("\n");

  return `The person you're coaching:
- Current role: ${ctx.roleTitle ?? "not set"}
- Skills: ${ctx.skills.join(", ") || "none listed"}
- Summary: ${ctx.summary ?? "n/a"}
- Recent experience: ${ctx.experience.map((e) => `${e.title} at ${e.org}`).join("; ") || "n/a"}
${moves ? `\nRealistic next moves from the career graph:\n${moves}` : ""}`;
}

export async function coachReply(
  ctx: CoachContext,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
): Promise<CoachReply> {
  if (!hasAI()) {
    return {
      text: "The AI coach needs the AI service configured. In the meantime, explore your Landscape Map to see your realistic next moves and their trade-offs.",
      usedAI: false,
    };
  }

  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Them" : "You"}: ${m.content}`)
    .join("\n");

  const prompt = `${contextBlock(ctx)}

${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ""}
Their message: "${userMessage}"

Reply as their career coach. Rules:
- Ground every point in their actual position and the graph data above. Be specific.
- Navigation, not prediction — present the LANDSCAPE of realistic options, not a
  single verdict. When they ask "what next", give 2-3 genuine paths with the
  honest trade-off of each (pay, time, effort, risk), then note which fits their
  current shape best — but leave the choice to them. Never collapse to one answer.
- Be warm and practical. No corporate fluff.
- Format for readability: use **bold** for key terms/roles, and a short bullet
  list when comparing options or listing steps. Keep it tight (under ~150 words).
- If they mention a skill they have that isn't listed, you may suggest adding it.`;

  const text =
    (await generateText(prompt, {
      system:
        "You are a senior career mentor who has watched this person's field for decades. You are honest, specific, and never generic. You show people the range of paths open to them and the trade-offs of each — you never reduce a career to one 'correct' move. You empower; you don't pressure. You write in clean markdown (bold, bullet lists) so replies are easy to scan.",
      strong: true,
      maxTokens: 2000,
    })) ?? "I couldn't generate a reply just now — try rephrasing?";

  // Separately, detect any skills worth adding (kept simple + optional).
  let proposedSkills: string[] | undefined;
  const detected = await generateJSON<{ skills: string[] }>(
    `From this message, list any concrete professional skills the person says they HAVE or have learned, that should be added to their profile. Only real skills they claim, max 5. Message: "${userMessage}". Known skills already on profile: ${ctx.skills.join(", ")}. Return {"skills": []} with only NEW ones not already listed.`,
    { maxTokens: 1000 },
  );
  if (detected?.skills?.length) {
    const known = new Set(ctx.skills.map((s) => s.toLowerCase()));
    proposedSkills = detected.skills
      .filter((s) => s && !known.has(s.toLowerCase()))
      .slice(0, 5);
    if (proposedSkills.length === 0) proposedSkills = undefined;
  }

  return { text, proposedSkills, usedAI: true };
}

// Suggested opening prompts, tailored to whether they have a role yet.
export function suggestedPrompts(ctx: CoachContext): string[] {
  const top = ctx.seedRoleId ? landscapeFrom(ctx.seedRoleId, ctx.skills)[0] : null;
  const prompts = [
    "What should my next move be, and why?",
    "What's the highest-leverage skill for me to build right now?",
  ];
  if (top) prompts.push(`Is ${top.role.title} a good fit for me?`);
  prompts.push("I just learned a new skill — help me update my profile.");
  return prompts;
}

export { ROLES, getRole };
