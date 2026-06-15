import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  GraduationCap,
  Clock,
  MessageSquare,
  Quote,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRole } from "@/lib/career-graph/engine";
import {
  getExpertsForRole,
  getExpertById,
  type Expert,
} from "@/lib/experts-data";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/back-button";
import { BookingDialog } from "../booking-dialog";

const MOCK_REVIEWS = [
  "Honest and specific — gave me the real picture, not a recruiter pitch.",
  "Helped me see the day-to-day before I committed. Worth every minute.",
  "Answered the questions I didn't even know to ask about this path.",
];

export default async function ExpertProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  await requireProfile("candidate");
  const { id } = await params;
  const { role: roleId } = await searchParams;

  const role = roleId ? getRole(roleId) : null;
  // Prefer the role-contextual expert (better-framed topics) when we have a path.
  const expert: Expert | null = role
    ? (getExpertsForRole(role.id).find((e) => e.id === id) ?? getExpertById(id))
    : getExpertById(id);

  if (!expert) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <BackButton
        label="Back to people"
        fallbackHref={role ? `/candidate/meetings?role=${role.id}` : "/candidate/meetings"}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-start">
        <PersonAvatar name={expert.fullName} seed={expert.id} className="h-16 w-16" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{expert.fullName}</h1>
          <p className="text-muted-foreground">{expert.roleTitle}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {expert.rating} · {expert.sessionsHeld} sessions
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {expert.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~{expert.responseHours}h reply
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{expert.yearsInField} yrs in field</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              {expert.university}
            </span>
            {expert.offersFreeIntro && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Free 15-min intro
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-2 text-sm font-medium">About</h2>
        <p className="text-sm text-muted-foreground">{expert.bio}</p>
      </div>

      {/* What they can help you understand — the PATH, not skills */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-primary" />
          What I can help you understand
        </h2>
        <ul className="space-y-2">
          {expert.topics.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          This is a conversation about the path — what it&apos;s really like and how to
          decide. For the skills and the step-by-step plan, use your roadmap.
        </p>
      </div>

      {/* Reviews */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-medium">What others said</h2>
        <div className="space-y-3">
          {MOCK_REVIEWS.slice(0, 2 + (expert.sessionsHeld % 2)).map((r, i) => (
            <div key={i} className="flex gap-2 text-sm text-muted-foreground">
              <Quote className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <p>{r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky-ish booking CTA */}
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {role
            ? `Understand the ${role.title} path from someone who's lived it.`
            : "Book a 1:1 to understand this path before you commit."}
        </p>
        <BookingDialog
          expertId={expert.id}
          expertName={expert.fullName}
          expertRole={expert.roleTitle}
          roleId={role?.id ?? null}
          roleTitle={role?.title ?? null}
          suggestedTopics={expert.topics}
          triggerLabel={
            expert.offersFreeIntro ? "Book a free intro" : "Book a conversation"
          }
        />
      </div>
    </div>
  );
}
