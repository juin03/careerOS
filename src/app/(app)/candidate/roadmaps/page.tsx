import Link from "next/link";
import { Route, Map } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SavedRoadmap, type SavedRoadmapData } from "./saved-roadmap";

export default async function RoadmapsPage() {
  const profile = await requireProfile("candidate");
  const supabase = await createClient();

  const { data } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const roadmaps: SavedRoadmapData[] = (data ?? []).map((r) => ({
    id: r.id,
    fromRole: r.from_role,
    toRole: r.to_role,
    company: r.company,
    summary: r.summary,
    totalMonths: r.total_months,
    phases: (r.phases as unknown as SavedRoadmapData["phases"]) ?? [],
    doneSteps: (r.done_steps as string[]) ?? [],
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="My roadmaps"
        subtitle="Saved plans toward your target roles. Check off steps as you go."
        action={
          <Button asChild variant="outline" className="gap-2">
            <Link href="/candidate/landscape">
              <Map className="h-4 w-4" /> Landscape
            </Link>
          </Button>
        }
      />

      {roadmaps.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Route className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No saved roadmaps yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a path on the Landscape Map and generate a roadmap — it&apos;ll
            be saved here to track.
          </p>
          <Button asChild className="mt-4">
            <Link href="/candidate/landscape">Open Landscape Map</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.map((r) => (
            <SavedRoadmap key={r.id} roadmap={r} />
          ))}
        </div>
      )}
    </div>
  );
}
