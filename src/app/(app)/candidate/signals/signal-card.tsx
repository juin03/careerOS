"use client";

import { useTransition } from "react";
import { Building2, Check, X, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { respondToSignal } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SignalCard({
  id,
  whyYou,
  accepted,
  companyName,
  recruiterName,
  createdAt,
}: {
  id: string;
  whyYou: string;
  accepted: boolean | null;
  companyName: string;
  recruiterName: string | null;
  createdAt: string;
}) {
  const [pending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      const res = await respondToSignal(id, accept);
      if (res?.error) toast.error(res.error);
      else toast.success(accept ? "Connected — your profile is now shared." : "Signal declined.");
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{companyName}</div>
            <div className="text-xs text-muted-foreground">
              {accepted ? recruiterName ?? "Recruiter" : "Recruiter hidden until you accept"}
            </div>
          </div>
        </div>
        {accepted === true && (
          <Badge className="gap-1">
            <Check className="h-3 w-3" /> Connected
          </Badge>
        )}
        {accepted === false && (
          <Badge variant="outline" className="gap-1">
            <X className="h-3 w-3" /> Declined
          </Badge>
        )}
        {accepted === null && (
          <Badge variant="secondary" className="gap-1">
            <EyeOff className="h-3 w-3" /> New
          </Badge>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">Why you, specifically</p>
        <p className="mt-1 text-sm">{whyYou}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("en-MY")}
        </span>
        {accepted === null && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => respond(false)}
              disabled={pending}
            >
              Decline
            </Button>
            <Button size="sm" onClick={() => respond(true)} disabled={pending}>
              Accept &amp; reveal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
