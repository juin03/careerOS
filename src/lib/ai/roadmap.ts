import { generateJSON, hasAI } from "./provider";
import { getRole, skillGap, routeTo } from "@/lib/career-graph/engine";
import { rmRange } from "@/lib/format";

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic, personalised career roadmap — roadmap.sh, but targeted at the user's
// actual gap and a specific destination role (and optionally a company).
// Uses the stronger model; falls back to a structured deterministic plan.
// ─────────────────────────────────────────────────────────────────────────────

export interface RoadmapStep {
  title: string; // e.g. "Learn system design fundamentals"
  detail: string; // one or two sentences, concrete
  skills: string[]; // skills this step builds
  resource?: string; // a concrete suggestion (course type, project, etc.)
}

export interface RoadmapPhase {
  name: string; // e.g. "Months 0–3: Foundations"
  goal: string; // the outcome of this phase
  steps: RoadmapStep[];
}

export interface Roadmap {
  fromRole: string;
  toRole: string;
  company?: string;
  summary: string; // 1-2 sentence orientation, navigation not prediction
  totalMonthsEstimate: number;
  phases: RoadmapPhase[];
  usedAI: boolean;
}

export async function generateRoadmap(input: {
  fromRoleId: string;
  toRoleId: string;
  skills: string[];
  company?: string;
}): Promise<Roadmap | null> {
  const from = getRole(input.fromRoleId);
  const to = getRole(input.toRoleId);
  if (!from || !to) return null;

  const gap = skillGap(input.skills, to);
  const route = routeTo(input.fromRoleId, input.toRoleId);
  const viaRoles = route?.roles.map((r) => r.title).join(" → ") ?? `${from.title} → ${to.title}`;
  const months = route?.totalMonths ?? 24;

  if (hasAI()) {
    const companyLine = input.company
      ? `The user is specifically targeting a role at ${input.company}. Tailor advice to what that kind of employer values.`
      : "";

    const prompt = `Create a personalised career roadmap.

Current role: ${from.title} (${from.family})
Target role: ${to.title} (${to.family}), pay ${rmRange(to.salaryMin, to.salaryMax)}/month
Likely path through the graph: ${viaRoles}
Skills the user ALREADY has: ${input.skills.join(", ") || "none listed"}
Skills the target needs that they're MISSING: ${gap.missing.join(", ") || "none — mostly experience"}
Typical time to make this move: about ${months} months.
${companyLine}

Produce a phased roadmap (like roadmap.sh, but specific to THIS person's gap).
Rules:
- This is navigation, not prediction. Be honest about effort and uncertainty.
- 3 to 4 phases, ordered by time. Each phase has a clear goal and 2-4 concrete steps.
- Each step is actionable (a skill to build, a project to ship, a milestone to hit),
  names the skills it builds, and suggests a concrete resource type (not a fake URL).
- Prioritise closing the MISSING skills first; don't pad with things they already have.
- Keep language plain and motivating, not corporate.

Return JSON exactly:
{
  "summary": "1-2 sentences orienting them",
  "totalMonthsEstimate": <number>,
  "phases": [
    { "name": "Months 0-3: ...", "goal": "...", "steps": [
      { "title": "...", "detail": "...", "skills": ["..."], "resource": "..." }
    ]}
  ]
}`;

    const parsed = await generateJSON<{
      summary: string;
      totalMonthsEstimate: number;
      phases: RoadmapPhase[];
    }>(prompt, {
      system:
        "You are a senior career mentor who builds concrete, honest, personalised roadmaps. You never overpromise.",
      strong: true,
      maxTokens: 5000,
    });

    if (parsed?.phases?.length) {
      return {
        fromRole: from.title,
        toRole: to.title,
        company: input.company,
        summary: parsed.summary,
        totalMonthsEstimate: parsed.totalMonthsEstimate || months,
        phases: parsed.phases,
        usedAI: true,
      };
    }
  }

  // Deterministic fallback: build phases from the missing skills.
  return {
    fromRole: from.title,
    toRole: to.title,
    company: input.company,
    summary: `A realistic path from ${from.title} to ${to.title} takes about ${months} months. Close the skill gaps below in order, shipping real work at each step.`,
    totalMonthsEstimate: months,
    phases: buildFallbackPhases(gap.missing, to.title),
    usedAI: false,
  };
}

function buildFallbackPhases(missing: string[], toTitle: string): RoadmapPhase[] {
  const chunks: string[][] = [];
  const list = missing.length ? missing : ["Depth in your current role"];
  for (let i = 0; i < list.length; i += 2) chunks.push(list.slice(i, i + 2));

  const phaseNames = [
    "Months 0–3: Foundations",
    "Months 3–9: Build & apply",
    "Months 9–18: Step up",
    "Months 18+: Make the move",
  ];

  const phases: RoadmapPhase[] = chunks.slice(0, 3).map((skills, i) => ({
    name: phaseNames[i] ?? `Phase ${i + 1}`,
    goal:
      i === 0
        ? "Close the most critical gaps and start applying them in real work."
        : "Deepen and demonstrate the skills employers will look for.",
    steps: skills.map((s) => ({
      title: `Build ${s}`,
      detail: `Develop ${s} through deliberate practice and a project that uses it end-to-end.`,
      skills: [s],
      resource: "A focused online course plus one portfolio project applying it.",
    })),
  }));

  phases.push({
    name: phaseNames[3],
    goal: `Position yourself for ${toTitle} roles.`,
    steps: [
      {
        title: "Ship a portfolio piece that proves the move",
        detail: `Build something that demonstrates you can already do the ${toTitle} job, not just learn it.`,
        skills: [],
        resource: "A public project or write-up showcasing the target-role skills.",
      },
      {
        title: "Apply via stepping-stone roles",
        detail: "Use the Jobs tab routed to this target to find roles on the path.",
        skills: [],
        resource: "Career OS Jobs → routed to your destination.",
      },
    ],
  });

  return phases;
}
