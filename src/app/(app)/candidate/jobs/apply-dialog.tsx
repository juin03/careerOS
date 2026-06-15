"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { applyToJob } from "@/app/(app)/candidate/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ApplyDialog({
  jobId,
  jobTitle,
  companyName,
  coverage,
}: {
  jobId: string;
  jobTitle: string;
  companyName: string | null;
  // Optional honest-readiness signal (0..1). When present, the dialog frames the
  // application around how ready you are — never a hard gate, just honesty.
  coverage?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await applyToJob(jobId, note);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Application sent.");
        setOpen(false);
        setNote("");
      }
    });
  }

  const readiness =
    coverage == null
      ? null
      : coverage >= 0.8
        ? {
            pct: Math.round(coverage * 100),
            line: "You're a strong match — apply with confidence.",
            tone: "text-emerald-600 dark:text-emerald-400",
          }
        : coverage >= 0.5
          ? {
              pct: Math.round(coverage * 100),
              line: "You're within reach. Lead with where you're heading, not just what you have.",
              tone: "text-primary",
            }
          : {
              pct: Math.round(coverage * 100),
              line: "It's a stretch — but a clear story about your direction can still land. No harm in trying.",
              tone: "text-amber-600 dark:text-amber-400",
            };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Apply</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            {companyName ? `at ${companyName}. ` : ""}Add a short note on why this
            role fits where you&apos;re heading.
          </DialogDescription>
        </DialogHeader>
        {readiness && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <span className={`font-medium ${readiness.tone}`}>
              {readiness.pct}% ready
            </span>{" "}
            <span className="text-muted-foreground">— {readiness.line}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="note">Cover note (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="I'm aiming toward product, and this role builds the data skills I need…"
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending} className="gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
