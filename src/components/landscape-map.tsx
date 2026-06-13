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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { rmRange, months, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

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
}

interface CurrentDTO {
  title: string;
  salaryMin: number;
  salaryMax: number;
}

// ── Custom nodes ────────────────────────────────────────────────────────────
function CurrentNode({ data }: { data: { current: CurrentDTO } }) {
  return (
    <div className="w-52 rounded-xl border-2 border-primary bg-gradient-to-br from-primary/10 to-card p-4 shadow-md">
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

function MoveNode({
  data,
}: {
  data: { move: LandscapeMoveDTO; selected: boolean; onSelect: () => void };
}) {
  const { move } = data;
  const trend =
    move.salaryDeltaMin > 200 ? "up" : move.salaryDeltaMin < -200 ? "down" : "flat";
  return (
    <button
      onClick={data.onSelect}
      className={cn(
        "w-56 cursor-pointer rounded-xl border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        data.selected
          ? "border-primary ring-2 ring-primary/40"
          : "hover:border-primary/50",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium leading-tight">{move.title}</div>
        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {pct(move.share)}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{move.family}</div>
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
  );
}

const nodeTypes = { current: CurrentNode, move: MoveNode };

export function LandscapeMap({
  current,
  moves,
  onSelectMove,
  selectedRoleId,
}: {
  current: CurrentDTO;
  moves: LandscapeMoveDTO[];
  onSelectMove: (m: LandscapeMoveDTO) => void;
  selectedRoleId: string | null;
}) {
  // Nodes/edges are derived purely from props — they aren't draggable, so there's
  // no internal graph state to keep. Recompute on selection change via useMemo.
  const nodes = useMemo<Node[]>(() => {
    const ns: Node[] = [
      {
        id: "current",
        type: "current",
        position: { x: 0, y: Math.max(0, (moves.length - 1) * 60) },
        data: { current },
        draggable: false,
      },
    ];
    moves.forEach((m, i) => {
      ns.push({
        id: m.roleId,
        type: "move",
        position: { x: 360, y: i * 120 },
        data: {
          move: m,
          selected: selectedRoleId === m.roleId,
          onSelect: () => onSelectMove(m),
        },
        draggable: false,
      });
    });
    return ns;
  }, [current, moves, onSelectMove, selectedRoleId]);

  const edges = useMemo<Edge[]>(
    () =>
      moves.map((m) => ({
        id: `e-${m.roleId}`,
        source: "current",
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
      })),
    [moves, selectedRoleId],
  );

  return (
    <div className="h-[440px] w-full rounded-xl border bg-muted/20">
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
