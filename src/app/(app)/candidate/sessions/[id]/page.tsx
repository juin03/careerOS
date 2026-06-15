"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Mic,
  MessageSquare,
  NotebookPen,
  Target,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useMounted } from "@/lib/use-mounted";
import { getSession } from "@/lib/mock-sessions";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Path-understanding prompts — about what the role/path is REALLY like, not a
// skills drill. Seeded from the role title so they feel specific.
function pathPrompts(roleTitle: string | null): string[] {
  const r = roleTitle ?? "this role";
  return [
    `What does a normal week as a ${r} actually look like?`,
    `How did you get into this — what was the real path, not the tidy version?`,
    `What surprised you most after moving into ${r}?`,
    `What do you wish you'd known before making this move?`,
    `Is this a good fit for someone in my position right now?`,
    `What's the part of the job nobody talks about?`,
  ];
}

export default function MeetingRoomPage() {
  const mounted = useMounted();
  const params = useParams<{ id: string }>();
  const session = mounted ? getSession(params.id) : null;
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function copyPrompt(p: string) {
    navigator.clipboard?.writeText(p);
    setCopied(p);
    setNotes((n) => (n ? `${n}\n- ${p}` : `- ${p}`));
    toast.success("Added to your notes");
    setTimeout(() => setCopied(null), 1500);
  }

  if (mounted && !session) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="font-medium">Session not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been removed.
          </p>
          <Button asChild className="mt-4">
            <Link href="/candidate/sessions">Back to my sessions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const roleTitle = session?.roleTitle ?? null;
  const prompts = pathPrompts(roleTitle);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/candidate/sessions">
          <ArrowLeft className="h-3.5 w-3.5" />
          My sessions
        </Link>
      </Button>

      {/* Header */}
      {session && (
        <div className="flex flex-wrap items-center gap-3">
          <PersonAvatar name={session.expertName} seed={session.expertId} className="h-12 w-12" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{session.expertName}</h1>
            <p className="text-sm text-muted-foreground">{session.expertRole}</p>
          </div>
          {session.roleTitle && (
            <Badge variant="secondary" className="gap-1">
              <Target className="h-3 w-3" />
              {session.roleTitle} path
            </Badge>
          )}
          {session.status === "upcoming" && <Badge>{session.slot}</Badge>}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* The call space (video/voice wires up later) */}
        <div className="space-y-4">
          <div className="relative flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border bg-gradient-to-br from-muted/60 to-muted/20">
            <div className="flex gap-4">
              {session && (
                <PersonAvatar
                  name={session.expertName}
                  seed={session.expertId}
                  className="h-20 w-20 ring-2 ring-background"
                />
              )}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary ring-2 ring-background">
                You
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your conversation space
            </p>
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              Video &amp; voice coming soon
            </Badge>
            <div className="absolute bottom-3 flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5" disabled>
                <Mic className="h-4 w-4" />
                Mic
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5" disabled>
                <Video className="h-4 w-4" />
                Camera
              </Button>
            </div>
          </div>

          {/* What you wanted to understand */}
          {session?.topic && (
            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary" />
                What you want to understand
              </h2>
              <p className="text-sm text-muted-foreground">{session.topic}</p>
            </div>
          )}
        </div>

        {/* Side: questions + notes */}
        <div className="space-y-4">
          {/* Suggested path-understanding questions */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-primary" />
              Questions worth asking
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              About what the path is really like — tap to add to your notes.
            </p>
            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => copyPrompt(p)}
                  className="flex w-full items-start gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  {copied === p ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Notes scratchpad */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <NotebookPen className="h-4 w-4 text-primary" />
              Your notes
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Jot what you learn about the path here…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
