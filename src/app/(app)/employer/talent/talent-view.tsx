"use client";

import {
  MapPin,
  GraduationCap,
  CheckCircle2,
  CircleDashed,
  EyeOff,
  Route,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PersonAvatar } from "@/components/person-avatar";
import { SignalDialog } from "./signal-dialog";
import { pct } from "@/lib/format";

export interface RankedCandidateDTO {
  id: string;
  anonymized: boolean;
  fullName: string | null;
  headline: string | null;
  location: string | null;
  university: string | null;
  roleTitle: string | null;
  skills: string[];
  findability: "open" | "quiet" | "closed";
  synthetic: boolean;
  seedRoleId: string | null;
  skillCoverage: number;
  matchedSkills: string[];
  missingSkills: string[];
  trajectoryFit: "direct" | "one-step" | "adjacent" | "distant";
  trajectoryNote: string;
  stepsAway: number;
}

const FIT_LABEL: Record<RankedCandidateDTO["trajectoryFit"], string> = {
  direct: "Already in role",
  "one-step": "One move away",
  adjacent: "Two moves away",
  distant: "Different track",
};

const FIT_VARIANT: Record<
  RankedCandidateDTO["trajectoryFit"],
  "default" | "secondary" | "outline"
> = {
  direct: "default",
  "one-step": "default",
  adjacent: "secondary",
  distant: "outline",
};

export function TalentView({
  candidates,
  roles,
  targetRole,
}: {
  candidates: RankedCandidateDTO[];
  roles: { id: string; title: string; family: string }[];
  targetRole: { id: string; title: string };
}) {
  function changeRole(roleId: string) {
    window.location.href = `/employer/talent?role=${roleId}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find talent</h1>
        <p className="mt-1 text-muted-foreground">
          Ranked by trajectory fit — every match has a reason, not a score.
        </p>
      </div>

      {/* Role selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <span className="text-sm font-medium">Hiring for</span>
        <Select value={targetRole.id} onValueChange={changeRole}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title} · {r.family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {candidates.length} candidates, best fit first
        </span>
      </div>

      <div className="space-y-3">
        {candidates.map((c) => (
          <CandidateCard key={c.id} c={c} targetRole={targetRole} />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  c,
  targetRole,
}: {
  c: RankedCandidateDTO;
  targetRole: { id: string; title: string };
}) {
  const displayName = c.anonymized ? "Anonymous candidate" : c.fullName ?? "Candidate";

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          {c.anonymized ? (
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <EyeOff className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <PersonAvatar name={c.fullName} seed={c.id} className="h-11 w-11" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{displayName}</h3>
              {c.anonymized && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <EyeOff className="h-3 w-3" /> Quiet
                </Badge>
              )}
              {c.synthetic && (
                <Badge variant="secondary" className="text-xs">
                  Sample
                </Badge>
              )}
            </div>
            {c.headline && (
              <p className="text-sm text-muted-foreground">{c.headline}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {c.roleTitle && <span>{c.roleTitle}</span>}
              {c.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {c.location}
                </span>
              )}
              {c.university && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {c.university}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant={FIT_VARIANT[c.trajectoryFit]} className="gap-1">
            <Route className="h-3 w-3" />
            {FIT_LABEL[c.trajectoryFit]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {pct(c.skillCoverage)} skill coverage
          </span>
        </div>
      </div>

      {/* The explained "why" — the core differentiator */}
      <div className="mt-3 flex gap-2 rounded-lg bg-muted/50 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="font-medium">Why this match: </span>
          <span className="text-muted-foreground">{c.trajectoryNote}</span>
        </p>
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.matchedSkills.map((s) => (
          <Badge key={s} variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            {s}
          </Badge>
        ))}
        {c.missingSkills.map((s) => (
          <Badge key={s} variant="outline" className="gap-1 border-dashed text-muted-foreground">
            <CircleDashed className="h-3 w-3" />
            {s}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <SignalDialog
          candidateId={c.id}
          candidateName={displayName}
          anonymized={c.anonymized}
          candidateRoleTitle={c.roleTitle}
          candidateSkills={c.skills}
          targetRole={targetRole}
          synthetic={c.synthetic}
        />
      </div>
    </div>
  );
}
