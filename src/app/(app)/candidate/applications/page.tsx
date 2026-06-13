import Link from "next/link";
import { Briefcase, MapPin, Building2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rmRange } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied",
  reviewing: "Under review",
  interview: "Interview",
  offer: "Offer",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  applied: "secondary",
  reviewing: "default",
  interview: "default",
  offer: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

export default async function ApplicationsPage() {
  const profile = await requireProfile("candidate");
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("applications")
    .select(
      "id, status, cover_note, created_at, jobs(title, location, salary_min, salary_max, companies(name))",
    )
    .eq("candidate_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-muted-foreground">
          Track where each application stands.
        </p>
      </div>

      {!apps?.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse jobs that fit your trajectory and apply.
          </p>
          <Button asChild className="mt-4">
            <Link href="/candidate/jobs">Browse jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const job = app.jobs as {
              title: string;
              location: string | null;
              salary_min: number | null;
              salary_max: number | null;
              companies: { name: string } | null;
            } | null;
            return (
              <div key={app.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{job?.title ?? "Job"}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {job?.companies?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.companies.name}
                        </span>
                      )}
                      {job?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      )}
                      {job?.salary_min && job?.salary_max && (
                        <span>{rmRange(job.salary_min, job.salary_max)}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </Badge>
                </div>
                {app.cover_note && (
                  <p className="mt-3 border-l-2 pl-3 text-sm text-muted-foreground">
                    {app.cover_note}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Applied {new Date(app.created_at).toLocaleDateString("en-MY")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
