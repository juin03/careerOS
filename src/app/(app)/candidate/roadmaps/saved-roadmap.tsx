"use client";

import { useState, useTransition } from "react";
import { Route, Clock, Building2, Check, Circle, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { toggleRoadmapStep, deleteRoadmap } from "@/app/(app)/candidate/landscape/roadmap-action";
import { Button } from "@/components/ui/button";
import { months } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  detail: string;
  skills: string[];
  resource?: string;
}
interface Phase {
  name: string;
  goal: string;
  steps: Step[];
}
export interface SavedRoadmapData {
  id: string;
  title: string | null;
  jobTitle: string | null;
  fromRole: string;
  toRole: string;
  company: string | null;
  summary: string | null;
  totalMonths: number | null;
  phases: Phase[];
  doneSteps: string[];
}

export function SavedRoadmap({ roadmap }: { roadmap: SavedRoadmapData }) {
  const [done, setDone] = useState<Set<string>>(new Set(roadmap.doneSteps));
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const totalSteps = roadmap.phases.reduce((s, p) => s + p.steps.length, 0);
  const progress = totalSteps ? done.size / totalSteps : 0;

  function toggle(key: string) {
    const next = new Set(done);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDone(next); // optimistic
    startTransition(async () => {
      const res = await toggleRoadmapStep(roadmap.id, key);
      if (res?.error) {
        toast.error(res.error);
        setDone(new Set(done)); // revert
      }
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteRoadmap(roadmap.id);
      toast.success("Roadmap removed.");
    });
  }

  return (
    <div className="rounded-xl border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Route className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">
              {roadmap.title ?? `${roadmap.fromRole} → ${roadmap.toRole}`}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {roadmap.fromRole} → {roadmap.toRole}
              </span>
              {roadmap.totalMonths && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{months(roadmap.totalMonths)}
                </span>
              )}
              {roadmap.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {roadmap.company}
                </span>
              )}
              <span>
                {done.size}/{totalSteps} done
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-muted sm:block">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-5 border-t p-5">
          {roadmap.summary && (
            <p className="text-sm text-muted-foreground">{roadmap.summary}</p>
          )}
          {roadmap.phases.map((phase, pi) => (
            <div key={pi}>
              <p className="text-sm font-semibold">{phase.name}</p>
              <p className="text-xs text-muted-foreground">{phase.goal}</p>
              <div className="mt-2 space-y-2">
                {phase.steps.map((step, si) => {
                  const key = `${pi}:${si}`;
                  const isDone = done.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                        isDone ? "border-primary/40 bg-primary/5" : "hover:border-primary/30",
                      )}
                    >
                      {isDone ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <p className={cn("text-sm font-medium", isDone && "line-through opacity-70")}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                        {step.skills.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {step.skills.map((s) => (
                              <span
                                key={s}
                                className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={remove}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove roadmap
          </Button>
        </div>
      )}
    </div>
  );
}
