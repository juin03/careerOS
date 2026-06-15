"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Route,
  MessageCircle,
  Users,
  CalendarClock,
  Inbox,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionTab {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

// A slim, underlined tab bar that links between related routes — used to group
// pages that belong to one area (e.g. Map / Roadmaps / Coach) without cluttering
// the sidebar with a tab for each. Active state uses longest-matching-prefix, so
// nested routes (e.g. /meetings/invitations) light up the right tab, not a parent.
export function SectionTabs({
  tabs,
  className,
}: {
  tabs: SectionTab[];
  className?: string;
}) {
  const pathname = usePathname();

  // The active tab is the one whose href is the longest prefix of the path.
  let activeHref: string | null = null;
  let bestLen = -1;
  for (const t of tabs) {
    const matches = pathname === t.href || pathname.startsWith(t.href + "/");
    if (matches && t.href.length > bestLen) {
      bestLen = t.href.length;
      activeHref = t.href;
    }
  }

  return (
    <div className={cn("border-b", className)}>
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.href === activeHref;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Preset: the "Navigate" area — the Landscape Map and the tools that hang off it
// (the roadmap it generates, and the AI coach that guides it).
export function NavigateTabs({ className }: { className?: string }) {
  return (
    <SectionTabs
      className={className}
      tabs={[
        {
          href: "/candidate/landscape",
          label: "Landscape Map",
          icon: <Map className="h-4 w-4" />,
        },
        {
          href: "/candidate/roadmaps",
          label: "My Roadmaps",
          icon: <Route className="h-4 w-4" />,
        },
        {
          href: "/candidate/coach",
          label: "AI Coach",
          icon: <MessageCircle className="h-4 w-4" />,
        },
      ]}
    />
  );
}

// Preset: the "Applications" area — jobs you've applied to, and the Quiet
// Signals (employer outreach) that are the inbound side of the same job hunt.
export function ApplicationsTabs({ className }: { className?: string }) {
  return (
    <SectionTabs
      className={className}
      tabs={[
        {
          href: "/candidate/applications",
          label: "My Applications",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          href: "/candidate/signals",
          label: "Quiet Signals",
          icon: <Inbox className="h-4 w-4" />,
        },
      ]}
    />
  );
}

// Preset: the "Meetings" area — find people on a path to meet, the invitations
// others send you to meet about YOUR path, and the meetings you've booked.
export function MeetingsTabs({ className }: { className?: string }) {
  return (
    <SectionTabs
      className={className}
      tabs={[
        {
          href: "/candidate/meetings",
          label: "Find people",
          icon: <Users className="h-4 w-4" />,
        },
        {
          href: "/candidate/meetings/invitations",
          label: "Invitations",
          icon: <Inbox className="h-4 w-4" />,
        },
        {
          href: "/candidate/sessions",
          label: "My meetings",
          icon: <CalendarClock className="h-4 w-4" />,
        },
      ]}
    />
  );
}
