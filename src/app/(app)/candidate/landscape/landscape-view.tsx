"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  CircleDashed,
  ChevronRight,
  Home,
  MousePointerClick,
} from "lucide-react";
import {
  LandscapeMap,
  type LandscapeMoveDTO,
  type MoveAction,
  MOVE_ACTIONS,
} from "@/components/landscape-map";
import { RoadmapDialog } from "./roadmap-dialog";
import { NavigateTabs } from "@/components/section-tabs";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { rmRange, rmDelta, months, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Crumb {
  roleId: string;
  title: string;
}

export function LandscapeView({
  current,
  moves,
  narration,
  exploring,
  rootRoleId,
  trail,
}: {
  current: { title: string; salaryMin: number; salaryMax: number };
  moves: LandscapeMoveDTO[];
  narration: React.ReactNode;
  exploring: boolean;
  rootRoleId: string;
  trail: Crumb[];
}) {
  const [selected, setSelected] = useState<LandscapeMoveDTO | null>(
    moves[0] ?? null,
  );
  // The move whose roadmap dialog is open (driven from the context menu).
  const [roadmapMove, setRoadmapMove] = useState<LandscapeMoveDTO | null>(null);
  const router = useRouter();

  // The full path of roots the user walked, ending at where they are now.
  const crumbs: Crumb[] = [...trail, { roleId: rootRoleId, title: current.title }];
  const trailIds = trail.map((c) => c.roleId);

  // A crumb links to itself as the new root, with everything before it as the
  // new trail — so stepping back to any ancestor is one click.
  function crumbHref(index: number): string {
    const newTrail = crumbs.slice(0, index).map((c) => c.roleId);
    if (index === 0 && newTrail.length === 0) return "/candidate/landscape";
    return `/candidate/landscape?from=${crumbs[index].roleId}&trail=${newTrail.join(",")}`;
  }

  // One handler for every role action — wired to the right-click menu on the map
  // cards and on the detail panel. Navigation actions route; roadmap opens the
  // controlled dialog.
  function handleAction(move: LandscapeMoveDTO, action: MoveAction) {
    switch (action) {
      case "gap":
        router.push(`/candidate/path/${move.roleId}`);
        break;
      case "meet":
        router.push(`/candidate/meetings?role=${move.roleId}`);
        break;
      case "jobs":
        router.push(`/candidate/jobs?target=${move.roleId}`);
        break;
      case "explore": {
        const exploreTrail = [...trailIds, rootRoleId].join(",");
        router.push(
          `/candidate/landscape?from=${move.roleId}&trail=${exploreTrail}`,
        );
        break;
      }
      case "roadmap":
        setRoadmapMove(move);
        break;
    }
  }

  // The role the user explored FROM (shown as a clickable box on the map so they
  // can step straight back to it).
  const prevIndex = crumbs.length - 2;
  const previous =
    prevIndex >= 0
      ? {
          title: crumbs[prevIndex].title,
          onClick: () => router.push(crumbHref(prevIndex)),
        }
      : null;

  // Defensive: a role at the very top of a track may have no further moves.
  if (moves.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <NavigateTabs className="-mx-4 px-4 sm:-mx-6 sm:px-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Your landscape</h1>
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="font-medium">
            You&apos;re at the top of this track — {current.title}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            From here, growth is usually about scope and impact rather than a
            named next role. Explore lateral moves in the Jobs tab, or refine
            your profile to surface more directions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <NavigateTabs className="-mx-4 px-4 sm:-mx-6 sm:px-6" />

      {/* Breadcrumb trail — step back to any role you explored through */}
      {crumbs.length > 1 && (
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={`${c.roleId}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground">{c.title}</span>
                ) : (
                  <Link
                    href={crumbHref(i)}
                    className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {i === 0 && <Home className="h-3.5 w-3.5" />}
                    {c.title}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {exploring ? `Exploring from ${current.title}` : "Your landscape"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Where people went next from{" "}
            <span className="font-medium text-foreground">{current.title}</span>.
            Pick a path{exploring ? "" : " — or explore from any role"}.
          </p>
        </div>
      </div>

      {/* AI narration — streamed in via Suspense (see page.tsx) */}
      {narration}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* The map */}
        <div>
          <LandscapeMap
            current={current}
            moves={moves}
            onSelectMove={setSelected}
            selectedRoleId={selected?.roleId ?? null}
            previous={previous}
            onAction={handleAction}
          />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            Click a role to see details · right-click for actions. Thicker line =
            more people took it.
          </p>
        </div>

        {/* Detail panel — matches the map height; right-click it for actions */}
        <div className="lg:h-[520px]">
          {selected ? (
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="h-full">
                  <MoveDetail move={selected} currentTitle={current.title} />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel className="truncate">
                  {selected.title}
                </ContextMenuLabel>
                <ContextMenuSeparator />
                {MOVE_ACTIONS.map((a) => (
                  <ContextMenuItem
                    key={a.key}
                    onSelect={() => handleAction(selected, a.key)}
                  >
                    {a.icon}
                    {a.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border p-6 text-center text-sm text-muted-foreground">
              Select a path on the map to see its details.
            </div>
          )}
        </div>
      </div>

      {/* Controlled roadmap dialog — opened from a role's action menu */}
      {roadmapMove && (
        <RoadmapDialog
          open
          onOpenChange={(o) => {
            if (!o) setRoadmapMove(null);
          }}
          hideTrigger
          targetRoleId={roadmapMove.roleId}
          targetTitle={roadmapMove.title}
          fromTitle={current.title}
        />
      )}
    </div>
  );
}

function MoveDetail({
  move,
  currentTitle,
}: {
  move: LandscapeMoveDTO;
  currentTitle: string;
}) {
  const payUp = move.salaryDeltaMin >= 0;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div>
          <Badge variant="secondary">{move.family}</Badge>
          <h2 className="mt-2 text-lg font-semibold">{move.title}</h2>
          <p className="text-sm text-muted-foreground">
            {rmRange(move.salaryMin, move.salaryMax)} / month
          </p>
        </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Target className="h-4 w-4" />}
          label="Take this path"
          value={pct(move.share)}
          sub="of people in your role"
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Typical time"
          value={`~${months(move.medianMonths)}`}
          sub="median to move"
        />
        <Stat
          icon={payUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          label="Pay change"
          value={rmDelta(move.salaryDeltaMin)}
          sub="vs your current midpoint"
        />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Skill match"
          value={pct(move.coverage)}
          sub="of what's needed"
        />
      </div>

      {/* Reachability — honest about seniority vs. the candidate's experience */}
      {move.reachability && move.reachability !== "ready" && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            move.reachability === "stretch"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "bg-muted/60",
          )}
        >
          <p className="font-medium">
            {move.reachability === "stretch"
              ? "Ambitious move"
              : "Longer-term goal"}
          </p>
          <p className="mt-1 text-muted-foreground">{move.reachabilityNote}</p>
        </div>
      )}

      {/* Trade-off note */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="font-medium">The honest trade-off</p>
        <p className="mt-1 text-muted-foreground">{move.note}</p>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        {move.have.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              You already have
            </p>
            <div className="flex flex-wrap gap-1.5">
              {move.have.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {move.missing.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              The gap to close
            </p>
            <div className="flex flex-wrap gap-1.5">
              {move.missing.map((s) => (
                <Badge key={s} variant="outline" className="gap-1 border-dashed">
                  <CircleDashed className="h-3 w-3" />
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Pinned footer — actions live in the right-click menu now */}
      <div className="flex items-center justify-between gap-2 border-t bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span className="truncate">
          {currentTitle} → {move.title}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
          <MousePointerClick className="h-3.5 w-3.5" />
          Right-click for actions
        </span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
