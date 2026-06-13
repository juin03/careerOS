import { generateJSON, hasAI } from "./provider";
import { ROLES, SKILLS } from "@/lib/career-graph/seed-data";

export interface ResumeParse {
  fullName?: string;
  headline?: string;
  location?: string;
  skills: string[];
  suggestedRoleId?: string;
  usedAI: boolean;
}

// Parse a pasted resume into structured profile fields. Uses Gemini when a key
// is configured; otherwise falls back to a deterministic keyword extractor so
// the prototype always produces a sensible result.
export async function parseResume(text: string): Promise<ResumeParse> {
  if (hasAI()) {
    const roleList = ROLES.map((r) => `${r.id}: ${r.title}`).join(", ");
    const prompt = `You are parsing a candidate's resume for a Malaysian careers platform.
Extract structured data. Choose the single best matching current role id from this fixed list:
${roleList}

Known skill vocabulary (prefer these when present): ${SKILLS.join(", ")}.

Resume:
"""
${text.slice(0, 6000)}
"""

Return JSON with keys:
- fullName (string or null)
- headline (a short one-line summary, e.g. "Fresh CS graduate, Universiti Malaya")
- location (city in Malaysia or null)
- skills (array of skill strings, prefer the known vocabulary, max 10)
- suggestedRoleId (one id from the list that best fits their current level)`;

    const parsed = await generateJSON<{
      fullName?: string;
      headline?: string;
      location?: string;
      skills?: string[];
      suggestedRoleId?: string;
    }>(prompt, {
      system:
        "You extract clean, conservative structured data. Never invent skills not implied by the text.",
    });

    if (parsed) {
      const validRole = ROLES.find((r) => r.id === parsed.suggestedRoleId);
      return {
        fullName: parsed.fullName ?? undefined,
        headline: parsed.headline ?? undefined,
        location: parsed.location ?? undefined,
        skills: (parsed.skills ?? []).slice(0, 10),
        suggestedRoleId: validRole?.id,
        usedAI: true,
      };
    }
  }

  return { ...heuristicParse(text), usedAI: false };
}

// Deterministic fallback: scan for known skills and infer a likely role.
function heuristicParse(text: string): Omit<ResumeParse, "usedAI"> {
  const lower = text.toLowerCase();
  const skills = SKILLS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 10);

  // Infer role by keyword signals, defaulting to graduate SWE.
  let suggestedRoleId = "r_grad_swe";
  const signals: Array<[string[], string]> = [
    [["senior", "lead", "architect"], "r_senior_swe"],
    [["data scientist", "machine learning", "ml "], "r_data_scientist"],
    [["data analyst", "analytics", "dashboard"], "r_data_analyst"],
    [["product manager", "roadmap", "stakeholder"], "r_product_manager"],
    [["designer", "figma", "ux"], "r_ux_designer"],
    [["devops", "kubernetes", "terraform"], "r_devops"],
    [["marketing", "seo", "campaign"], "r_marketing_exec"],
    [["software engineer", "developer", "react", "node"], "r_swe"],
  ];
  for (const [keys, role] of signals) {
    if (keys.some((k) => lower.includes(k))) {
      suggestedRoleId = role;
      break;
    }
  }

  // Try to grab a name from the first non-empty line.
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l.length < 50 && /^[A-Za-z .'-]+$/.test(l));

  const malaysianCities = [
    "Kuala Lumpur",
    "Petaling Jaya",
    "Cyberjaya",
    "Penang",
    "Johor Bahru",
    "Shah Alam",
    "Subang",
  ];
  const location = malaysianCities.find((c) =>
    lower.includes(c.toLowerCase()),
  );

  return {
    fullName: firstLine,
    headline: undefined,
    location,
    skills,
    suggestedRoleId,
  };
}
