"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Target,
  Route,
  Users,
  Navigation,
  Compass,
  MousePointerClick,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { rmRange, months, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

// The actions available on a role, shown in the right-click context menu (and
// reused by the detail panel's menu so both stay in sync).
export type MoveAction = "gap" | "roadmap" | "meet" | "jobs" | "explore";

export const MOVE_ACTIONS: {
  key: MoveAction;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "gap", label: "See your gap & next steps", icon: <Target /> },
  { key: "roadmap", label: "Generate my roadmap", icon: <Route /> },
  { key: "meet", label: "Meet someone on this path", icon: <Users /> },
  { key: "jobs", label: "Find stepping-stone jobs", icon: <Navigation /> },
  { key: "explore", label: "Explore paths from here", icon: <Compass /> },
];

export interface LandscapeMoveDTO {
  roleId: string;
  title: string;
  family: string;
  salaryMin: number;
  salaryMax: number;
  share: number;
  medianMonths: number;
  note: string;
  coverage: number;
  missing: string[];
  have: string[];
  salaryDeltaMin: number;
  salaryDeltaMax: number;
  // Tree position (1 = direct next move, 2 = the move after that).
  depth?: 1 | 2;
  parentRoleId?: string;
  // Seniority realism vs the candidate's experience.
  reachability?: "ready" | "stretch" | "early";
  reachabilityNote?: string;
}

interface CurrentDTO {
  title: string;
  salaryMin: number;
  salaryMax: number;
}

interface PreviousDTO {
  title: string;
  onClick: () => void;
}

// ── Custom nodes ────────────────────────────────────────────────────────────
function CurrentNode({
  data,
}: {
  data: { current: CurrentDTO; hasPrevious?: boolean };
}) {
  return (
    <div className="w-52 rounded-xl border-2 border-primary bg-gradient-to-br from-primary/10 to-card p-4 shadow-md">
      {data.hasPrevious && (
        <Handle type="target" position={Position.Left} className="!bg-primary/60" />
      )}
      <Handle type="source" position={Position.Right} className="!bg-primary" />
      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
        You are here
      </span>
      <div className="mt-2 font-semibold leading-tight">{data.current.title}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {rmRange(data.current.salaryMin, data.current.salaryMax)}
      </div>
    </div>
  );
}

// The role you explored FROM — sits to the left so you can click it to step back.
function PreviousNode({ data }: { data: { previous: PreviousDTO } }) {
  return (
    <button
      onClick={data.previous.onClick}
      className="group w-44 cursor-pointer rounded-xl border border-dashed bg-card/60 p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
    >
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <ArrowLeft className="h-3 w-3" />
        Back to
      </div>
      <div className="mt-1 text-sm font-medium leading-tight group-hover:text-primary">
        {data.previous.title}
      </div>
    </button>
  );
}

function MoveNode({
  data,
}: {
  data: {
    move: LandscapeMoveDTO;
    selected: boolean;
    onSelect: () => void;
    onAction: (m: LandscapeMoveDTO, a: MoveAction) => void;
  };
}) {
  const { move } = data;
  const compact = move.depth === 2;
  const trend =
    move.salaryDeltaMin > 200 ? "up" : move.salaryDeltaMin < -200 ? "down" : "flat";

  // Depth-2 ("then") nodes render small and quiet so the hierarchy reads.
  if (compact) {
    return (
      <ActionMenu move={move} onAction={data.onAction}>
        <button
          onClick={data.onSelect}
          title="Right-click for actions"
          className={cn(
            "group relative w-44 cursor-pointer rounded-lg border bg-card/70 p-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
            data.selected
              ? "border-primary ring-2 ring-primary/40"
              : "border-dashed hover:border-primary/50",
          )}
        >
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
          <span className="pointer-events-none absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-full items-center gap-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
            <MousePointerClick className="h-3 w-3" />
            Right-click for actions
          </span>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            then
          </div>
          <div className="line-clamp-2 min-h-[2.25rem] text-sm font-medium leading-tight">
            {move.title}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {rmRange(move.salaryMin, move.salaryMax)}
          </div>
        </button>
      </ActionMenu>
    );
  }

  return (
    <ActionMenu move={move} onAction={data.onAction}>
      <button
        onClick={data.onSelect}
        title="Right-click for actions"
        className={cn(
          "group relative w-56 cursor-pointer rounded-xl border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          data.selected
            ? "border-primary ring-2 ring-primary/40"
            : "hover:border-primary/50",
        )}
      >
        <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
        <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
        {/* Instant hover hint — the actions live in the right-click menu */}
        <span className="pointer-events-none absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-full items-center gap-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
          <MousePointerClick className="h-3 w-3" />
          Right-click for actions
        </span>
        <div className="flex items-start justify-between gap-2">
          <div className="line-clamp-2 min-h-[2.25rem] font-medium leading-tight">
            {move.title}
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {pct(move.share)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{move.family}</span>
          {move.reachability && move.reachability !== "ready" && (
            <span
              className={cn(
                "rounded px-1 py-px text-[9px] font-semibold uppercase",
                move.reachability === "stretch"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {move.reachability === "stretch" ? "Stretch" : "Long-term"}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-amber-500" />}
          {trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-muted-foreground">
            {rmRange(move.salaryMin, move.salaryMax)}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(move.coverage * 100)}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {pct(move.coverage)} skill match · ~{months(move.medianMonths)}
        </div>
      </button>
    </ActionMenu>
  );
}

// Wraps a role card so right-clicking it opens the action menu. Left-click still
// selects the card (handled by the inner button's onClick).
function ActionMenu({
  move,
  onAction,
  children,
}: {
  move: LandscapeMoveDTO;
  onAction: (m: LandscapeMoveDTO, a: MoveAction) => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel className="truncate">{move.title}</ContextMenuLabel>
        <ContextMenuSeparator />
        {MOVE_ACTIONS.map((a) => (
          <ContextMenuItem key={a.key} onSelect={() => onAction(move, a.key)}>
            {a.icon}
            {a.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

const nodeTypes = { current: CurrentNode, move: MoveNode, previous: PreviousNode };

export function LandscapeMap({
  current,
  moves,
  onSelectMove,
  selectedRoleId,
  previous,
  onAction,
}: {
  current: CurrentDTO;
  moves: LandscapeMoveDTO[];
  onSelectMove: (m: LandscapeMoveDTO) => void;
  selectedRoleId: string | null;
  previous?: PreviousDTO | null;
  onAction: (m: LandscapeMoveDTO, a: MoveAction) => void;
}) {
  // Nodes/edges are derived purely from props — they aren't draggable, so there's
  // no internal graph state to keep. Recompute on selection change via useMemo.
  // Layout columns: [previous] -> current (You) -> depth-1 moves -> depth-2 moves.
  const nodes = useMemo<Node[]>(() => {
    const firstLevel = moves.filter((m) => (m.depth ?? 1) === 1);
    const secondLevel = moves.filter((m) => m.depth === 2);

    // When a "previous" role is shown, shift everything right to make room.
    const SHIFT = previous ? 240 : 0;
    const COL = { previous: 0, current: SHIFT, first: 340 + SHIFT, second: 700 + SHIFT };
    // Row pitch must exceed the tallest card (2-line titles) so cards never
    // touch and every gap reads the same.
    const ROW = 180;
    const currentY = Math.max(0, ((firstLevel.length - 1) * ROW) / 2);

    const ns: Node[] = [
      {
        id: "current",
        type: "current",
        position: {
          x: COL.current,
          y: currentY,
        },
        data: { current, hasPrevious: Boolean(previous) },
        draggable: false,
      },
    ];

    if (previous) {
      ns.push({
        id: "previous",
        type: "previous",
        position: { x: COL.previous, y: currentY + 8 },
        data: { previous },
        draggable: false,
      });
    }

    firstLevel.forEach((m, i) => {
      ns.push({
        id: m.roleId,
        type: "move",
        position: { x: COL.first, y: i * ROW },
        data: {
          move: m,
          selected: selectedRoleId === m.roleId,
          onSelect: () => onSelectMove(m),
          onAction,
        },
        draggable: false,
      });
    });

    // Position each depth-2 node near its parent, stacking when several share one.
    const usedY: Record<number, number> = {};
    secondLevel.forEach((m) => {
      const parentIdx = firstLevel.findIndex((f) => f.roleId === m.parentRoleId);
      const baseY = (parentIdx < 0 ? 0 : parentIdx) * ROW;
      const slot = usedY[baseY] ?? 0;
      usedY[baseY] = slot + 1;
      ns.push({
        id: m.roleId,
        type: "move",
        position: { x: COL.second, y: baseY + slot * 104 - 30 },
        data: {
          move: m,
          selected: selectedRoleId === m.roleId,
          onSelect: () => onSelectMove(m),
          onAction,
        },
        draggable: false,
      });
    });
    return ns;
  }, [current, moves, onSelectMove, selectedRoleId, previous, onAction]);

  const edges = useMemo<Edge[]>(
    () => {
      const es: Edge[] = moves.map((m) => ({
        id: `e-${m.roleId}`,
        source: (m.depth ?? 1) === 1 ? "current" : (m.parentRoleId as string),
        target: m.roleId,
        animated: selectedRoleId === m.roleId,
        style: {
          strokeWidth: 1 + m.share * 6,
          stroke:
            selectedRoleId === m.roleId
              ? "var(--color-primary)"
              : "var(--color-border)",
        },
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
      if (previous) {
        es.push({
          id: "e-previous",
          source: "previous",
          target: "current",
          style: {
            strokeWidth: 2,
            strokeDasharray: "4 4",
            stroke: "var(--color-muted-foreground)",
          },
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }
      return es;
    },
    [moves, selectedRoleId, previous],
  );

  return (
    <div className="h-[520px] w-full rounded-xl border bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background gap={20} className="opacity-50" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
