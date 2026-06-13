import { requireProfile } from "@/lib/auth";
import { ROLES } from "@/lib/career-graph/seed-data";
import { PostJobForm } from "./post-job-form";

export default async function NewJobPage() {
  await requireProfile("employer");
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Post a job</h1>
        <p className="mt-1 text-muted-foreground">
          Tie it to a role in the graph so the right candidates surface.
        </p>
      </div>
      <PostJobForm
        roles={ROLES.map((r) => ({
          id: r.id,
          title: r.title,
          family: r.family,
          salaryMin: r.salaryMin,
          salaryMax: r.salaryMax,
        }))}
      />
    </div>
  );
}
