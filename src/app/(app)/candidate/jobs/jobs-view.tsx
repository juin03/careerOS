"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Navigation,
  X,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyDialog } from "./apply-dialog";
import { rmRange, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface JobDTO {
  id: string;
  title: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  companyName: string | null;
  companyIndustry: string | null;
  roleTitle: string | null;
  seedRoleId: string | null;
  applied: boolean;
  stepRank: "next-step" | "on-path" | "destination" | "off-path";
  skillCoverage: number | null;
}

interface TargetInfo {
  roleId: string;
  title: string;
  nextStepTitle: string | null;
  totalMonths: number | null;
  reachable: boolean;
}

export function JobsView({
  jobs,
  target,
  query,
}: {
  jobs: JobDTO[];
  target: TargetInfo | null;
  query: string;
}) {
  const [q, setQ] = useState(query);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(t) ||
        j.companyName?.toLowerCase().includes(t) ||
        j.location?.toLowerCase().includes(t) ||
        j.description?.toLowerCase().includes(t),
    );
  }, [jobs, q]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-1 text-muted-foreground">
          {target
            ? "Routed toward your destination — stepping stones first."
            : "Ranked by how well each fits your trajectory and skills."}
        </p>
      </div>

      {/* GPS banner */}
      {target && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">
                Navigating to {target.title}
              </p>
              <p className="text-muted-foreground">
                {target.reachable ? (
                  <>
                    {target.nextStepTitle ? (
                      <>
                        Your best next move is{" "}
                        <span className="font-medium text-foreground">
                          {target.nextStepTitle}
                        </span>
                        . These roles get you on the road.
                      </>
                    ) : (
                      "You're ready to apply directly."
                    )}
                  </>
                ) : (
                  "No common path from your current role — but explore these adjacent roles."
                )}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/candidate/jobs">
              <X className="h-3.5 w-3.5" />
              Clear route
            </Link>
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, company, or location…"
          className="pl-9"
        />
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No jobs match your search.
          </p>
        )}
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} routing={Boolean(target)} />
        ))}
      </div>
    </div>
  );
}

function JobCard({
  job,
  routing,
}: {
  job: JobDTO;
  routing: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-colors",
        routing && job.stepRank === "next-step" && "border-primary/50 ring-1 ring-primary/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{job.title}</h3>
            {routing && job.stepRank === "next-step" && (
              <Badge className="gap-1">
                <Navigation className="h-3 w-3" />
                Best next step
              </Badge>
            )}
            {routing && job.stepRank === "destination" && (
              <Badge variant="secondary" className="gap-1">
                Destination
              </Badge>
            )}
            {routing && job.stepRank === "on-path" && (
              <Badge variant="outline">On your path</Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {job.companyName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {job.companyName}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {job.salaryMin && job.salaryMax && (
            <div className="font-medium">
              {rmRange(job.salaryMin, job.salaryMax)}
            </div>
          )}
          {job.skillCoverage !== null && (
            <Badge variant="outline" className="mt-1 gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              {pct(job.skillCoverage)} skill fit
            </Badge>
          )}
        </div>
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {job.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {job.roleTitle ?? "Role"}
        </span>
        {job.applied ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Applied
          </Badge>
        ) : (
          <ApplyDialog
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.companyName}
          />
        )}
      </div>
    </div>
  );
}
