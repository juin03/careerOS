import { Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SignalCard } from "./signal-card";

export default async function CandidateSignalsPage() {
  const profile = await requireProfile("candidate");
  const supabase = await createClient();

  const { data: signals } = await supabase
    .from("signals")
    .select(
      "id, why_you, accepted, created_at, job_id, employer:profiles!signals_employer_id_fkey(full_name, company_id, companies(name))",
    )
    .eq("candidate_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quiet Signals</h1>
        <p className="mt-1 text-muted-foreground">
          Vetted outreach only. Each had to say why you — you reveal yourself only
          if you accept.
        </p>
      </div>

      {!signals?.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No signals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When an employer sends a specific, relevant reason to connect,
            it&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((s) => {
            const employer = s.employer as {
              full_name: string | null;
              companies: { name: string } | null;
            } | null;
            return (
              <SignalCard
                key={s.id}
                id={s.id}
                whyYou={s.why_you}
                accepted={s.accepted}
                companyName={employer?.companies?.name ?? "An employer"}
                recruiterName={employer?.full_name ?? null}
                createdAt={s.created_at}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
