import { ROLES, ROLE_BY_ID, TRANSITIONS } from "./seed-data";
import type { Role, Transition } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// The graph engine: pure functions that turn a person's "shape" (current role +
// skills) into a landscape of realistic next moves, skill gaps, and routes.
// Deliberately explainable — every number comes with a reason, no black boxes.
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillGap {
  missing: string[];
  have: string[];
  coverage: number; // 0..1 of the target role's skills the person already has
}

export type Reachability = "ready" | "stretch" | "early";

export interface LandscapeMove {
  role: Role;
  transition: Transition;
  gap: SkillGap;
  salaryDeltaMin: number; // change vs current role's midpoint
  salaryDeltaMax: number;
  // Seniority realism given the candidate's experience.
  reachability: Reachability; // ready = natural next; stretch = ambitious; early = needs more years
  reachabilityNote: string;
}

// Rough years of experience typically expected before stepping INTO a seniority
// level. Used to keep path suggestions honest for early-career people.
const YEARS_FOR_SENIORITY: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 6,
  5: 9,
};

function classifyReachability(
  fromSeniority: number,
  toRole: Role,
  years: number,
): { reachability: Reachability; note: string } {
  const levelJump = toRole.seniority - fromSeniority;
  const yearsExpected = YEARS_FOR_SENIORITY[toRole.seniority] ?? 0;

  // A jump of 2+ seniority levels, or far short of the years usually needed.
  if (levelJump >= 2 || years + 1.5 < yearsExpected) {
    return {
      reachability: "early",
      note: `Usually needs ~${yearsExpected}+ years; a longer-term goal, not a direct next step.`,
    };
  }
  if (levelJump === 1 && years + 0.5 < yearsExpected) {
    return {
      reachability: "stretch",
      note: `An ambitious move — most make it around ${yearsExpected} years in.`,
    };
  }
  return {
    reachability: "ready",
    note: "A realistic next step from where you are now.",
  };
}

export function getRole(id: string | null | undefined): Role | undefined {
  return id ? ROLE_BY_ID[id] : undefined;
}

export function midpoint(role: Role): number {
  return Math.round((role.salaryMin + role.salaryMax) / 2);
}

export function skillGap(have: string[], target: Role): SkillGap {
  const haveSet = new Set(have.map((s) => s.toLowerCase()));
  const matched = target.skills.filter((s) => haveSet.has(s.toLowerCase()));
  const missing = target.skills.filter((s) => !haveSet.has(s.toLowerCase()));
  return {
    have: matched,
    missing,
    coverage: target.skills.length ? matched.length / target.skills.length : 0,
  };
}

// The candidate's landscape: realistic next moves from their current role,
// sorted by how common the move is (share), each annotated with gap + pay delta.
export function landscapeFrom(
  currentRoleId: string,
  skills: string[],
  years = 2, // candidate's years of experience; defaults to mid if unknown
): LandscapeMove[] {
  const current = getRole(currentRoleId);
  if (!current) return [];
  const currentMid = midpoint(current);

  const rank: Record<Reachability, number> = { ready: 0, stretch: 1, early: 2 };

  return TRANSITIONS.filter((t) => t.fromRoleId === currentRoleId)
    .map((t) => {
      const role = getRole(t.toRoleId)!;
      const { reachability, note } = classifyReachability(
        current.seniority,
        role,
        years,
      );
      return {
        role,
        transition: t,
        gap: skillGap(skills, role),
        salaryDeltaMin: role.salaryMin - currentMid,
        salaryDeltaMax: role.salaryMax - currentMid,
        reachability,
        reachabilityNote: note,
      };
    })
    // Realistic next steps first; long-term goals last. Within a tier, by share.
    .sort(
      (a, b) =>
        rank[a.reachability] - rank[b.reachability] ||
        b.transition.share - a.transition.share,
    );
}

// A two-level career tree: current role -> next moves -> the moves after those.
// This is what makes the map read like a roadmap/flowchart rather than a star.
export interface TreeMove extends LandscapeMove {
  depth: 1 | 2;
  parentRoleId: string; // which role this branches from
}

export function landscapeTree(
  currentRoleId: string,
  skills: string[],
  opts: { maxFirst?: number; maxSecond?: number; years?: number } = {},
): TreeMove[] {
  const maxFirst = opts.maxFirst ?? 4;
  const maxSecond = opts.maxSecond ?? 2;
  const years = opts.years ?? 2;

  const first = landscapeFrom(currentRoleId, skills, years).slice(0, maxFirst);
  const seen = new Set<string>([currentRoleId, ...first.map((m) => m.role.id)]);
  const tree: TreeMove[] = first.map((m) => ({
    ...m,
    depth: 1,
    parentRoleId: currentRoleId,
  }));

  for (const m of first) {
    // From the next role, the candidate would have ~that role's expected years.
    const second = landscapeFrom(m.role.id, skills, years + 2)
      .filter((s) => !seen.has(s.role.id)) // avoid cycles / dupes across branches
      .slice(0, maxSecond);
    for (const s of second) {
      seen.add(s.role.id);
      tree.push({ ...s, depth: 2, parentRoleId: m.role.id });
    }
  }

  return tree;
}

// GPS routing: shortest realistic path (by hops, then by combined share) from a
// current role to a chosen destination. Returns the ordered list of roles, or
// null if no path exists in the graph.
export interface Route {
  roles: Role[];
  transitions: Transition[];
  totalMonths: number;
}

export function routeTo(
  fromRoleId: string,
  toRoleId: string,
): Route | null {
  if (fromRoleId === toRoleId) {
    const r = getRole(fromRoleId);
    return r ? { roles: [r], transitions: [], totalMonths: 0 } : null;
  }

  // BFS for fewest hops; among equal-length, prefer higher cumulative share.
  const adj = new Map<string, Transition[]>();
  for (const t of TRANSITIONS) {
    if (!adj.has(t.fromRoleId)) adj.set(t.fromRoleId, []);
    adj.get(t.fromRoleId)!.push(t);
  }

  interface Node {
    roleId: string;
    path: Transition[];
    score: number; // sum of shares (higher = more common route)
  }

  const queue: Node[] = [{ roleId: fromRoleId, path: [], score: 0 }];
  let best: Node | null = null;
  const visitedDepth = new Map<string, number>();

  while (queue.length) {
    const node = queue.shift()!;
    if (node.roleId === toRoleId) {
      if (
        !best ||
        node.path.length < best.path.length ||
        (node.path.length === best.path.length && node.score > best.score)
      ) {
        best = node;
      }
      continue;
    }
    if (node.path.length >= 4) continue; // cap depth — careers aren't infinite hops
    const prevDepth = visitedDepth.get(node.roleId);
    if (prevDepth !== undefined && prevDepth < node.path.length) continue;
    visitedDepth.set(node.roleId, node.path.length);

    for (const t of adj.get(node.roleId) ?? []) {
      if (node.path.some((p) => p.toRoleId === t.toRoleId)) continue; // no cycles
      queue.push({
        roleId: t.toRoleId,
        path: [...node.path, t],
        score: node.score + t.share,
      });
    }
  }

  if (!best) return null;
  const roles = [getRole(fromRoleId)!];
  for (const t of best.path) roles.push(getRole(t.toRoleId)!);
  return {
    roles,
    transitions: best.path,
    totalMonths: best.path.reduce((s, t) => s + t.medianMonths, 0),
  };
}

// Employer-side match: how well a candidate's trajectory fits a target role.
// Returns an explainable breakdown — NOT a single opaque percentage.
export interface MatchReason {
  skillCoverage: number; // 0..1
  matchedSkills: string[];
  missingSkills: string[];
  trajectoryFit: "direct" | "one-step" | "adjacent" | "distant";
  trajectoryNote: string;
  stepsAway: number;
}

export function explainMatch(
  candidateRoleId: string | null,
  candidateSkills: string[],
  targetRoleId: string,
): MatchReason {
  const target = getRole(targetRoleId)!;
  const gap = skillGap(candidateSkills, target);

  let stepsAway = 99;
  let trajectoryFit: MatchReason["trajectoryFit"] = "distant";
  let trajectoryNote = "No common path from their background to this role.";

  if (candidateRoleId) {
    if (candidateRoleId === targetRoleId) {
      stepsAway = 0;
      trajectoryFit = "direct";
      trajectoryNote = "Already doing this exact role.";
    } else {
      const route = routeTo(candidateRoleId, targetRoleId);
      if (route) {
        stepsAway = route.transitions.length;
        if (stepsAway === 1) {
          trajectoryFit = "one-step";
          const t = route.transitions[0];
          trajectoryNote = `One realistic move away — ${Math.round(
            t.share * 100,
          )}% of people in their role make this jump, typically in ${t.medianMonths} months.`;
        } else if (stepsAway === 2) {
          trajectoryFit = "adjacent";
          trajectoryNote = `Two moves away via ${route.roles[1].title}. A coherent direction, not a stretch.`;
        } else {
          trajectoryFit = "distant";
          trajectoryNote = `${stepsAway} moves away — possible, but not a natural next step.`;
        }
      }
    }
  }

  return {
    skillCoverage: gap.coverage,
    matchedSkills: gap.have,
    missingSkills: gap.missing,
    trajectoryFit,
    trajectoryNote,
    stepsAway,
  };
}

// A rough ordering signal for ranking candidates (employer view). Combines
// skill coverage and trajectory closeness. Never shown as a naked score —
// always paired with explainMatch's reasons.
export function matchRank(reason: MatchReason): number {
  const stepScore =
    reason.stepsAway === 0
      ? 1
      : reason.stepsAway === 1
        ? 0.8
        : reason.stepsAway === 2
          ? 0.55
          : 0.2;
  return 0.6 * reason.skillCoverage + 0.4 * stepScore;
}

export { ROLES, TRANSITIONS };
