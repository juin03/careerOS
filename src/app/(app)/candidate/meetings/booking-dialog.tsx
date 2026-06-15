"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addSession, mockSlots } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

// Book a 1:1 with an in-field expert to UNDERSTAND a career path — not a skill
// drill. The prep prompt and suggested topics are framed around "what's it
// really like", which is the human value the roadmap/AI can't give.
export function BookingDialog({
  expertId,
  expertName,
  expertRole,
  roleId,
  roleTitle,
  suggestedTopics,
  triggerLabel = "Book a conversation",
  triggerVariant = "default",
  triggerClassName,
}: {
  expertId: string;
  expertName: string;
  expertRole: string | null;
  roleId?: string | null;
  roleTitle?: string | null;
  suggestedTopics: string[];
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const slots = mockSlots();
  const [slot, setSlot] = useState(slots[0]);
  const [topic, setTopic] = useState("");

  function confirm() {
    const session = addSession({
      expertId,
      expertName,
      expertRole,
      roleId: roleId ?? null,
      roleTitle: roleTitle ?? null,
      slot,
      topic: topic.trim() || "Understand what this path is really like",
    });
    toast.success(`Booked with ${expertName.split(" ")[0]}.`);
    setOpen(false);
    router.push(`/candidate/sessions/${session.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={cn("gap-2", triggerClassName)}>
          <CalendarClock className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book time with {expertName}</DialogTitle>
          <DialogDescription>
            {expertRole ? `${expertRole}. ` : ""}A 1:1 to understand what this path
            is really like — not a skills test.
          </DialogDescription>
        </DialogHeader>

        {/* Slot picker */}
        <div className="space-y-2">
          <Label>Pick a time</Label>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={cn(
                  "rounded-lg border p-2.5 text-left text-sm transition-colors",
                  slot === s
                    ? "border-primary bg-primary/5 font-medium"
                    : "hover:bg-accent/50",
                )}
              >
                {slot === s && (
                  <Check className="mr-1 inline h-3.5 w-3.5 text-primary" />
                )}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* What you want to understand */}
        <div className="space-y-2">
          <Label htmlFor="topic">What do you want to understand?</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="e.g. What a normal week is really like, and whether the move is worth it for someone in my position."
          />
          <div className="flex flex-wrap gap-1.5">
            {suggestedTopics.slice(0, 3).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={confirm} className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
