"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  Route,
  Sparkles,
  CheckCircle2,
  Circle,
  Building2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { buildRoadmap } from "./roadmap-action";
import type { Roadmap } from "@/lib/ai/roadmap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { months } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RoadmapDialog({
  targetRoleId,
  targetTitle,
  fromTitle,
  jobId,
  jobTitle,
  jobCompany,
  triggerLabel = "Generate my roadmap",
  triggerVariant = "outline",
  triggerClassName = "w-full",
  triggerSize = "default",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: {
  targetRoleId: string;
  targetTitle: string;
  fromTitle: string;
  // When launched from a job listing, the roadmap is titled + tied to that job.
  jobId?: string;
  jobTitle?: string;
  jobCompany?: string;
  triggerLabel?: string;
  triggerVariant?: "outline" | "default" | "ghost" | "secondary";
  triggerClassName?: string;
  triggerSize?: "sm" | "default";
  // Controlled mode: drive open state externally (e.g. from a context menu) and
  // optionally hide the built-in trigger button.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [company, setCompany] = useState(jobCompany ?? "");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [pending, startTransition] = useTransition();

  function setOpen(o: boolean) {
    if (controlledOnOpenChange) controlledOnOpenChange(o);
    else setUncontrolledOpen(o);
    if (!o) setRoadmap(null);
  }

  function generate() {
    startTransition(async () => {
      const res = await buildRoadmap({
        targetRoleId,
        company,
        jobId,
        jobTitle,
      });
      if (res.error) toast.error(res.error);
      else if (res.roadmap) setRoadmap(res.roadmap);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn(triggerClassName, "gap-2")}
          >
            <Route className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            {jobTitle ? `Path to ${jobTitle}` : `Roadmap to ${targetTitle}`}
          </DialogTitle>
          <DialogDescription>
            {jobTitle
              ? `A personalised plan to land this ${targetTitle} role, from ${fromTitle}.`
              : `A personalised plan from ${fromTitle}, built around your skill gap.`}
          </DialogDescription>
        </DialogHeader>

        {!roadmap ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Targeting a specific company? (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Grab, Maybank, a fintech startup…"
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll tailor the plan to what that kind of employer values.
              </p>
            </div>
            <Button onClick={generate} disabled={pending} className="w-full gap-2">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {pending ? "Building your roadmap…" : "Generate roadmap"}
            </Button>
          </div>
        ) : (
          <RoadmapView roadmap={roadmap} onRegenerate={() => setRoadmap(null)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RoadmapView({
  roadmap,
  onRegenerate,
}: {
  roadmap: Roadmap;
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex gap-2 rounded-lg bg-primary/5 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm leading-relaxed">{roadmap.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~{months(roadmap.totalMonthsEstimate)} total
            </span>
            {roadmap.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Tailored for {roadmap.company}
              </span>
            )}
            <span>{roadmap.usedAI ? "Generated by AI" : "Structured plan"}</span>
          </div>
        </div>
      </div>

      {/* Phases — roadmap.sh style vertical track */}
      <div className="relative space-y-6 pl-6">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
        {roadmap.phases.map((phase, pi) => (
          <div key={pi} className="relative">
            <div className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-background" />
            <div>
              <h3 className="text-sm font-semibold">{phase.name}</h3>
              <p className="text-xs text-muted-foreground">{phase.goal}</p>
            </div>
            <div className="mt-3 space-y-2">
              {phase.steps.map((step, si) => (
                <div key={si} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start gap-2">
                    <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.detail}
                      </p>
                      {step.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {step.skills.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {step.resource && (
                        <p className="mt-1.5 text-[11px] italic text-muted-foreground">
                          → {step.resource}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={onRegenerate} className="w-full">
        Generate a different roadmap
      </Button>
    </div>
  );
}
