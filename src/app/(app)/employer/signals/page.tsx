import Link from "next/link";
import { Send, Check, X, Clock, ShieldCheck } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BUDGET = 5;

export default async function SentSignalsPage() {
  const profile = await requireProfile("employer");
  const supabase = await createClient();

  const { data: signals } = await supabase
    .from("signals")
    .select(
      "id, why_you, accepted, created_at, candidate:profiles!signals_candidate_id_fkey(full_name)",
    )
    .eq("employer_id", profile.id)
    .order("created_at", { ascending: false });

  const used = signals?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sent signals</h1>
          <p className="mt-1 text-muted-foreground">
            Your outreach. Each one passed the specificity check.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/employer/talent">
            <Send className="h-4 w-4" /> Find talent
          </Link>
        </Button>
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-medium">Signal budget</span>
          <span className="text-muted-foreground">
            Scarcity keeps outreach honest
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: BUDGET }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-6 rounded-full ${
                i < used ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {BUDGET - used} left
          </span>
        </div>
      </div>

      {!signals?.length ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Send className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No signals sent yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find a candidate whose trajectory fits and reach out specifically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((s) => {
            const cand = s.candidate as { full_name: string | null } | null;
            return (
              <div key={s.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {cand?.full_name ?? "Candidate"}
                  </span>
                  {s.accepted === true && (
                    <Badge className="gap-1">
                      <Check className="h-3 w-3" /> Accepted
                    </Badge>
                  )}
                  {s.accepted === false && (
                    <Badge variant="outline" className="gap-1">
                      <X className="h-3 w-3" /> Declined
                    </Badge>
                  )}
                  {s.accepted === null && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
                <p className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {s.why_you}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
