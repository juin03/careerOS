"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { sendSignal } from "./actions";
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

export function SignalDialog({
  candidateId,
  candidateName,
  anonymized,
  candidateRoleTitle,
  candidateSkills,
  targetRole,
  synthetic,
}: {
  candidateId: string;
  candidateName: string;
  anonymized: boolean;
  candidateRoleTitle: string | null;
  candidateSkills: string[];
  targetRole: { id: string; title: string };
  synthetic: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "rejected" | "passed";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setFeedback(null);
    startTransition(async () => {
      const res = await sendSignal({
        candidateId,
        whyYou: why,
        candidateRoleTitle,
        candidateSkills,
        targetRoleId: targetRole.id,
        synthetic,
      });
      if (res.error) {
        toast.error(res.error);
      } else if (res.rejected) {
        setFeedback({ type: "rejected", text: res.reason ?? "Make it more specific." });
      } else if (res.ok) {
        toast.success(
          `Signal sent to ${anonymized ? "the candidate" : candidateName}.`,
        );
        setOpen(false);
        setWhy("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          Send signal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reach out — specifically</DialogTitle>
          <DialogDescription>
            For the <span className="font-medium">{targetRole.title}</span> role.
            Say exactly why <em>this</em> person fits. Generic outreach is blocked
            before it ever reaches them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="why">Why you, specifically</Label>
          <Textarea
            id="why"
            value={why}
            onChange={(e) => {
              setWhy(e.target.value);
              setFeedback(null);
            }}
            rows={4}
            placeholder={`e.g. Your ${candidateSkills[0] ?? "background"} and move toward ${targetRole.title} is exactly the shape we need on our payments team…`}
          />
          <p className="text-xs text-muted-foreground">
            {why.length} characters · be concrete about their skills or trajectory
          </p>
        </div>

        {feedback?.type === "rejected" && (
          <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Blocked as too generic</p>
              <p className="text-muted-foreground">{feedback.text}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Every signal is checked for specificity before delivery.
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={pending || why.trim().length < 10} className="gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {pending ? "Checking…" : "Send signal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
