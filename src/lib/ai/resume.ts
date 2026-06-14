import { generateJSON, hasAI } from "./provider";
import { ROLES, SKILLS } from "@/lib/career-graph/seed-data";

export interface ExperienceItem {
  title: string;
  org: string;
  period: string;
  highlights: string[];
}

export interface AchievementItem {
  title: string;
  detail: string;
}

export interface ResumeParse {
  fullName?: string;
  headline?: string;
  location?: string;
  skills: string[];
  suggestedRoleId?: string;
  // Richer signals for senior / specialised profiles.
  yearsExperience?: number;
  seniority?: "entry" | "junior" | "mid" | "senior" | "lead";
  specialization?: string; // e.g. "Applied AI / LLM engineering"
  highlights?: string[]; // standout achievements pulled from the resume
  // Living Portfolio: structured experience + achievements for employers to see.
  summary?: string;
  experience?: ExperienceItem[];
  achievements?: AchievementItem[];
  usedAI: boolean;
}

// Parse a pasted resume into structured profile fields. Uses Azure OpenAI when a
// key is configured; otherwise falls back to a deterministic extractor so the
// prototype always produces a sensible result.
export async function parseResume(text: string): Promise<ResumeParse> {
  if (hasAI()) {
    const roleList = ROLES.map(
      (r) => `${r.id}: ${r.title} (seniority ${r.seniority}/5, ${r.family})`,
    ).join("\n");

    const prompt = `You are parsing a candidate's resume for a Malaysian careers platform. Be precise and generous in recognising real expertise — many candidates are more senior or specialised than a quick read suggests.

Pick the single best-fitting CURRENT role id from this list. Match on BOTH the work described and the seniority implied by scope and impact (don't under-level a strong person):
${roleList}

Seniority guidance: count internships and concurrent study realistically. Someone in a real engineering role now (even ~1 year, with strong internships and production ownership) is at least "junior", often "mid" if they own systems end-to-end. Title the headline by their CURRENT role and niche, e.g. "AI Engineer building production LLM agents on AWS".

Known skill vocabulary (prefer these spellings when the skill is present): ${SKILLS.join(", ")}.
But ALSO include notable real skills/technologies the candidate clearly has even if not in that list (e.g. specific cloud services, frameworks, tools).

Resume:
"""
${text.slice(0, 9000)}
"""

Return JSON:
- fullName (string or null)
- headline (one specific line capturing who they are now, e.g. "AI Engineer building LLM agents on AWS, 1 yr + strong internships")
- location (Malaysian city or null)
- skills (array, up to 14, most relevant first — mix known vocab + their standout real technologies)
- suggestedRoleId (one id from the list; pick the role that matches their CURRENT level, not entry-level if they're clearly beyond it)
- yearsExperience (approximate number of years of professional/intern experience, or null)
- seniority (one of: entry, junior, mid, senior, lead)
- specialization (a short phrase for their niche, e.g. "Applied AI / LLM engineering", or null)
- highlights (up to 3 short, concrete standout achievements from the resume)
- summary (2-3 sentence professional summary in third person, for an employer-facing portfolio)
- experience (array of roles, most recent first, each: { "title", "org", "period", "highlights": [up to 3 concrete bullet points] })
- achievements (array of standout wins beyond day jobs — awards, hackathons, competitions, leadership — each: { "title", "detail" })`;

    const parsed = await generateJSON<{
      fullName?: string;
      headline?: string;
      location?: string;
      skills?: string[];
      suggestedRoleId?: string;
      yearsExperience?: number | null;
      seniority?: ResumeParse["seniority"];
      specialization?: string | null;
      highlights?: string[];
      summary?: string | null;
      experience?: ExperienceItem[];
      achievements?: AchievementItem[];
    }>(prompt, {
      system:
        "You extract clean, accurate structured data from resumes. You recognise senior and specialised experience accurately and never under-level a strong candidate. You never invent experience that isn't there.",
      strong: true, // use the stronger model — parsing quality matters for the demo
      maxTokens: 6000,
    });

    if (parsed) {
      const validRole = ROLES.find((r) => r.id === parsed.suggestedRoleId);
      return {
        fullName: parsed.fullName ?? undefined,
        headline: parsed.headline ?? undefined,
        location: parsed.location ?? undefined,
        skills: (parsed.skills ?? []).slice(0, 14),
        suggestedRoleId: validRole?.id,
        yearsExperience: parsed.yearsExperience ?? undefined,
        seniority: parsed.seniority,
        specialization: parsed.specialization ?? undefined,
        highlights: (parsed.highlights ?? []).slice(0, 3),
        summary: parsed.summary ?? undefined,
        experience: (parsed.experience ?? []).slice(0, 6),
        achievements: (parsed.achievements ?? []).slice(0, 6),
        usedAI: true,
      };
    }
  }

  return { ...heuristicParse(text), usedAI: false };
}

// Deterministic fallback: scan for known skills and infer a likely role + level.
function heuristicParse(text: string): Omit<ResumeParse, "usedAI"> {
  const lower = text.toLowerCase();
  const skills = SKILLS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 14);

  // Estimate years from "YYYY – Present" / "X years" patterns.
  let yearsExperience: number | undefined;
  const yearsMatch = lower.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) yearsExperience = Number(yearsMatch[1]);

  // Infer role + seniority by keyword signals.
  let suggestedRoleId = "r_grad_swe";
  let seniority: ResumeParse["seniority"] = "entry";
  const signals: Array<[string[], string, ResumeParse["seniority"]]> = [
    [["ai engineer", "llm", "langchain", "langgraph", "bedrock", "rag", "ai agent"], "r_ai_engineer", "junior"],
    [["machine learning engineer", "ml engineer", "mlops", "model training", "fine-tun"], "r_ml_engineer", "mid"],
    [["principal", "staff engineer"], "r_principal_eng", "lead"],
    [["engineering manager", "team lead"], "r_eng_manager", "lead"],
    [["data scientist"], "r_data_scientist", "mid"],
    [["data analyst", "analytics", "dashboard"], "r_data_analyst", "junior"],
    [["product manager", "roadmap"], "r_product_manager", "mid"],
    [["designer", "figma", "ux"], "r_ux_designer", "junior"],
    [["devops", "kubernetes", "terraform", "platform engineer"], "r_devops", "mid"],
    // Non-tech tracks
    [["audit", "acca", "external audit"], "r_audit_assoc", "entry"],
    [["accountant", "bookkeeping", "general ledger", "financial reporting"], "r_accountant", "junior"],
    [["financial analyst", "fp&a", "financial modelling", "forecasting"], "r_financial_analyst", "junior"],
    [["finance manager", "head of finance"], "r_finance_manager", "senior"],
    [["staff nurse", "registered nurse", "nursing"], "r_staff_nurse", "entry"],
    [["icu nurse", "specialist nurse", "theatre nurse"], "r_specialist_nurse", "mid"],
    [["pharmacist", "pharmacy"], "r_clinical_pharmacist", "junior"],
    [["account manager", "key account"], "r_account_manager", "mid"],
    [["sales executive", "sales rep", "business development"], "r_sales_exec", "entry"],
    [["human resources", "hr executive", "recruitment", "talent acquisition"], "r_hr_exec", "entry"],
    [["operations manager", "ops manager"], "r_operations_manager", "senior"],
    [["marketing", "seo", "campaign"], "r_marketing_exec", "entry"],
    [["senior software", "senior engineer", "architect"], "r_senior_swe", "senior"],
    [["software engineer", "developer", "react", "node"], "r_swe", "junior"],
  ];
  for (const [keys, role, level] of signals) {
    if (keys.some((k) => lower.includes(k))) {
      suggestedRoleId = role;
      seniority = level;
      break;
    }
  }

  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l.length < 50 && /^[A-Za-z .'-]+$/.test(l));

  const malaysianCities = [
    "Kuala Lumpur",
    "Petaling Jaya",
    "Cyberjaya",
    "Penang",
    "George Town",
    "Bayan Lepas",
    "Johor Bahru",
    "Shah Alam",
    "Subang",
  ];
  const location = malaysianCities.find((c) => lower.includes(c.toLowerCase()));

  return {
    fullName: firstLine,
    headline: undefined,
    location,
    skills,
    suggestedRoleId,
    yearsExperience,
    seniority,
    specialization: undefined,
    highlights: [],
  };
}
