"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  CircleDashed,
  Navigation,
  Info,
  RotateCcw,
  Compass,
} from "lucide-react";
import {
  LandscapeMap,
  type LandscapeMoveDTO,
} from "@/components/landscape-map";
import { RoadmapDialog } from "./roadmap-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rmRange, rmDelta, months, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LandscapeView({
  current,
  moves,
  narration,
  exploring,
  homeRoleTitle,
}: {
  current: { title: string; salaryMin: number; salaryMax: number };
  moves: LandscapeMoveDTO[];
  narration: React.ReactNode;
  exploring: boolean;
  homeRoleTitle: string;
}) {
  const [selected, setSelected] = useState<LandscapeMoveDTO | null>(
    moves[0] ?? null,
  );

  // Defensive: a role at the very top of a track may have no further moves.
  if (moves.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
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
        {exploring && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/candidate/landscape">
              <RotateCcw className="h-3.5 w-3.5" />
              Back to {homeRoleTitle}
            </Link>
          </Button>
        )}
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
          />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Thicker line = more people took it. Click a role to explore.
          </p>
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {selected ? (
            <MoveDetail move={selected} currentTitle={current.title} />
          ) : (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              Select a path on the map to see its details.
            </div>
          )}
        </div>
      </div>
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
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <Badge variant="secondary">{move.family}</Badge>
        <h2 className="mt-2 text-lg font-semibold">{move.title}</h2>
        <p className="text-sm text-muted-foreground">{rmRange(move.salaryMin, move.salaryMax)} / month</p>
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

      <div className="space-y-2">
        <RoadmapDialog
          targetRoleId={move.roleId}
          targetTitle={move.title}
          fromTitle={currentTitle}
        />
        <Button asChild className="w-full gap-2">
          <Link href={`/candidate/jobs?target=${move.roleId}`}>
            <Navigation className="h-4 w-4" />
            Find stepping-stone jobs
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full gap-2">
          <Link href={`/candidate/landscape?from=${move.roleId}`}>
            <Compass className="h-4 w-4" />
            Explore paths from here
          </Link>
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        From {currentTitle} → {move.title}
      </p>
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
