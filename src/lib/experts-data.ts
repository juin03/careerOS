import { PERSONAS } from "@/lib/career-graph/personas";
import { ROLE_BY_ID, TRANSITIONS } from "@/lib/career-graph/seed-data";
import { getRole } from "@/lib/career-graph/engine";

// ─────────────────────────────────────────────────────────────────────────────
// In-field experts — people who already work in (or have moved through) a role,
// available to BOOK for a conversation about the career PATH itself: what the
// role is really like, how they got there, whether it's right for you.
//
// NOT a skill drill — the roadmap/AI handles skills. The expert is the human
// "what's it actually like" layer. Mock for now, drawn from the synthetic
// personas (each carries a real seedRoleId), so the feature is demoable before
// real experts sign up. A real `account_role = 'expert'` can replace this later.
// ─────────────────────────────────────────────────────────────────────────────

export interface Expert {
  id: string;
  fullName: string;
  headline: string;
  location: string;
  university: string;
  seedRoleId: string;
  roleTitle: string | null;
  skills: string[];
  // Mock, deterministic metadata so each expert feels like a distinct person.
  yearsInField: number;
  topics: string[]; // what they can help you UNDERSTAND about the path
  rating: number; // 4.x
  sessionsHeld: number;
  responseHours: number;
  offersFreeIntro: boolean; // a free 15-min intro — connection, not paywalled
  bio: string;
  // How this expert relates to the target role the candidate is looking at.
  relation: "in-role" | "moved-through";
}

// A tiny deterministic hash so mock numbers are stable per expert.
function seed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function buildTopics(roleTitle: string, fromTitle: string | null): string[] {
  const topics = [
    `What a typical week as a ${roleTitle} actually looks like`,
    `Whether ${roleTitle} is the right move for someone like you`,
    `What surprised me most after moving into ${roleTitle}`,
    `The day-to-day reality vs. the job description`,
  ];
  if (fromTitle) {
    topics.unshift(`How I moved from ${fromTitle} into ${roleTitle}`);
  }
  return topics;
}

function enrich(
  personaId: string,
  relation: Expert["relation"],
  fromTitle: string | null,
): Expert | null {
  const p = PERSONAS.find((x) => x.id === personaId);
  if (!p) return null;
  const role = ROLE_BY_ID[p.seedRoleId];
  const roleTitle = role?.title ?? null;
  const h = seed(p.id);

  return {
    id: p.id,
    fullName: p.fullName,
    headline: p.headline,
    location: p.location,
    university: p.university,
    seedRoleId: p.seedRoleId,
    roleTitle,
    skills: p.skills,
    yearsInField: 3 + (h % 8), // 3–10 years
    topics: buildTopics(roleTitle ?? "this role", fromTitle),
    rating: Number((4.5 + (h % 5) / 10).toFixed(1)), // 4.5–4.9
    sessionsHeld: 8 + (h % 120), // 8–127
    responseHours: 1 + (h % 12), // 1–12h
    offersFreeIntro: h % 3 !== 0, // ~2/3 offer a free intro
    bio: `${roleTitle ?? "An experienced professional"} based in ${p.location}. ${p.headline}. Happy to share the unfiltered version of this path — the good, the hard, and what I wish I'd known.`,
    relation,
  };
}

// Experts relevant to a target role: people who currently hold it ("in-role")
// plus people who moved one step beyond it ("moved-through"), so they can speak
// to where the path leads. Sorted by relevance then rating.
export function getExpertsForRole(targetRoleId: string): Expert[] {
  const target = getRole(targetRoleId);
  if (!target) return [];

  // Who, in the graph, moves INTO this role? Used to label "how I got here".
  const inboundFrom = TRANSITIONS.filter((t) => t.toRoleId === targetRoleId).map(
    (t) => t.fromRoleId,
  );
  const fromTitleFor = (roleId: string): string | null => {
    // If this persona's role is a known origin of the target, name that origin.
    const match = inboundFrom.find((f) => f === roleId);
    return match ? (ROLE_BY_ID[match]?.title ?? null) : null;
  };

  const inRole = PERSONAS.filter((p) => p.seedRoleId === targetRoleId).map((p) =>
    enrich(p.id, "in-role", fromTitleFor(p.seedRoleId)),
  );

  // People one realistic step BEYOND the target — they've lived the path forward.
  const beyondRoleIds = new Set(
    TRANSITIONS.filter((t) => t.fromRoleId === targetRoleId).map((t) => t.toRoleId),
  );
  const movedThrough = PERSONAS.filter((p) => beyondRoleIds.has(p.seedRoleId)).map(
    (p) => enrich(p.id, "moved-through", target.title),
  );

  return [...inRole, ...movedThrough]
    .filter((e): e is Expert => e !== null)
    .sort((a, b) => {
      if (a.relation !== b.relation) return a.relation === "in-role" ? -1 : 1;
      return b.rating - a.rating;
    });
}

export function getExpertById(id: string): Expert | null {
  const p = PERSONAS.find((x) => x.id === id);
  if (!p) return null;
  return enrich(p.id, "in-role", null);
}

// All experts (for a browse page), de-duplicated, best-rated first.
export function getAllExperts(): Expert[] {
  return PERSONAS.map((p) => enrich(p.id, "in-role", null))
    .filter((e): e is Expert => e !== null)
    .sort((a, b) => b.rating - a.rating);
}
