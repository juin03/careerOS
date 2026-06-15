import Link from "next/link";
import { Star, ArrowRight, MapPin, GraduationCap } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRole } from "@/lib/career-graph/engine";
import { getExpertsForRole, getAllExperts, type Expert } from "@/lib/experts-data";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/back-button";
import { PageHeader } from "@/components/page-header";
import { MeetingsTabs } from "@/components/section-tabs";

// Browse people on a given path you can meet. They aren't necessarily "experts"
// — they're people who currently work in (or moved through) the role, happy to
// share what the path is really like. Reached from the Gap Hub (?role=).
export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireProfile("candidate");
  const { role: roleId } = await searchParams;

  const role = roleId ? getRole(roleId) : null;
  const experts: Expert[] = role ? getExpertsForRole(role.id) : getAllExperts();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <MeetingsTabs className="-mx-4 px-4 sm:-mx-6 sm:px-6" />
      <PageHeader
        title={role ? `Meet someone on the ${role.title} path` : "Find people to meet"}
        subtitle={
          role
            ? "People who work in — or moved through — this role. Book a meeting to understand what the path is really like."
            : "Book a 1:1 with someone who's actually walked the path, to understand it before you commit."
        }
      />

      {role && (
        <BackButton
          label={`Back to your gap for ${role.title}`}
          fallbackHref={`/candidate/path/${role.id}`}
        />
      )}

      {experts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="font-medium">No one listed for this path yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            As people in this field join, they&apos;ll appear here to meet.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {experts.map((e) => (
            <Link
              key={e.id}
              href={`/candidate/meetings/${e.id}${role ? `?role=${role.id}` : ""}`}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/30"
            >
              <div className="flex items-start gap-3">
                <PersonAvatar name={e.fullName} seed={e.id} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{e.fullName}</span>
                    {e.relation === "moved-through" && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        moved beyond
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {e.roleTitle}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {e.rating}
                    </span>
                    <span>·</span>
                    <span>{e.yearsInField} yrs in field</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                  </div>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{e.bio}</p>
              <div className="mt-auto flex items-center justify-between">
                {e.offersFreeIntro ? (
                  <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400">
                    Free 15-min intro
                  </Badge>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {e.university}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View &amp; book
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
