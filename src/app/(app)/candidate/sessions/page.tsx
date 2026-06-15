"use client";

import Link from "next/link";
import { CalendarClock, ArrowRight, Video, Inbox } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";
import { listSessions } from "@/lib/mock-sessions";
import { PersonAvatar } from "@/components/person-avatar";
import { MeetingsTabs } from "@/components/section-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SessionsPage() {
  const mounted = useMounted();
  const sessions = mounted ? listSessions() : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <MeetingsTabs className="-mx-4 px-4 sm:-mx-6 sm:px-6" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My meetings</h1>
        <p className="mt-1 text-muted-foreground">
          Meetings with people who&apos;ve walked the paths you&apos;re exploring.
        </p>
      </div>

      {!mounted ? null : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No meetings booked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find a path on your map, then book someone who&apos;s walked it.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/candidate/meetings">
              Find someone to meet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/candidate/sessions/${s.id}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30"
            >
              <PersonAvatar name={s.expertName} seed={s.expertId} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.expertName}</span>
                  {s.status === "upcoming" && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {s.slot}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {s.roleTitle ? `On the ${s.roleTitle} path` : s.expertRole}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="gap-1.5">
                <Video className="h-4 w-4" />
                Open
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
