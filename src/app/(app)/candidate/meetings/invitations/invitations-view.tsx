"use client";

import { useReducer } from "react";
import { Check, X, Inbox, CalendarClock, Target, Clock } from "lucide-react";
import { toast } from "sonner";
import { useMounted } from "@/lib/use-mounted";
import {
  listInvitations,
  setInvitationStatus,
  type MockInvitation,
} from "@/lib/mock-invitations";
import { MeetingsTabs } from "@/components/section-tabs";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Requests from people who want to meet YOU about the path you're on. Accept to
// confirm, or decline. (Mock, localStorage — see mock-invitations.ts.)
export function InvitationsView({ aboutPath }: { aboutPath: string | null }) {
  const mounted = useMounted();
  const [, refresh] = useReducer((x: number) => x + 1, 0);

  // Re-read from the store each render; calling `refresh` after an accept/decline
  // forces a re-read without an effect.
  const all = mounted ? listInvitations(aboutPath) : [];
  const visible = all.filter((i) => i.status !== "declined");
  const pendingCount = visible.filter((i) => i.status === "pending").length;

  function act(inv: MockInvitation, status: "accepted" | "declined") {
    setInvitationStatus(inv.id, status);
    refresh();
    if (status === "accepted") {
      toast.success(`Accepted — ${inv.requesterName.split(" ")[0]} will be notified.`);
    } else {
      toast(`Declined ${inv.requesterName.split(" ")[0]}'s request.`);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <MeetingsTabs className="-mx-4 px-4 sm:-mx-6 sm:px-6" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
        <p className="mt-1 text-muted-foreground">
          People asking to meet you about{" "}
          {aboutPath ? (
            <span className="font-medium text-foreground">your {aboutPath} path</span>
          ) : (
            "your path"
          )}
          . Accept the ones worth your time.
        </p>
      </div>

      {!mounted ? null : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No invitations right now</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When someone wants to learn about your path, their request lands here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {pendingCount} pending request{pendingCount === 1 ? "" : "s"}
            </p>
          )}
          {visible.map((inv) => {
            const accepted = inv.status === "accepted";
            return (
              <div
                key={inv.id}
                className={
                  "rounded-xl border bg-card p-5 transition-colors " +
                  (accepted ? "border-emerald-500/40" : "")
                }
              >
                <div className="flex items-start gap-3">
                  <PersonAvatar
                    name={inv.requesterName}
                    seed={inv.id}
                    className="h-11 w-11"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{inv.requesterName}</span>
                      <Badge variant="secondary" className="gap-1">
                        <Target className="h-3 w-3" />
                        {inv.aboutPath}
                      </Badge>
                      {accepted && (
                        <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {inv.requesterHeadline}
                    </p>
                  </div>
                </div>

                <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                  &ldquo;{inv.message}&rdquo;
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Suggested: {inv.proposedSlot}
                  </span>
                  {accepted ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CalendarClock className="h-4 w-4" />
                      Meeting confirmed
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => act(inv, "declined")}
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => act(inv, "accepted")}
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
