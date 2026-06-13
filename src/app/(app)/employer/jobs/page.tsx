import Link from "next/link";
import { Plus, Briefcase, MapPin, Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rmRange } from "@/lib/format";

export default async function EmployerJobsPage() {
  const profile = await requireProfile("employer");
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, salary_min, salary_max, is_active, created_at, applications(count)")
    .eq("posted_by", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Jobs you&apos;ve posted and how many have applied.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/employer/jobs/new">
            <Plus className="h-4 w-4" /> Post a job
          </Link>
        </Button>
      </div>

      {!jobs?.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No jobs posted yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Post your first role to start receiving applicants.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" /> Post a job
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const count =
              (job.applications as { count: number }[] | null)?.[0]?.count ?? 0;
            return (
              <div key={job.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      {!job.is_active && <Badge variant="outline">Closed</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      )}
                      {job.salary_min && job.salary_max && (
                        <span>{rmRange(job.salary_min, job.salary_max)}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/employer/applicants"
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:border-primary/40"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {count} applicant{count === 1 ? "" : "s"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
