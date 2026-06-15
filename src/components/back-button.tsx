"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Goes back in history (so it returns to wherever you came from — the gap hub,
// the landscape, etc.) instead of hard-linking to one page. Falls back to a
// given href when there's no history to pop (e.g. opened via a direct link).
export function BackButton({
  label,
  fallbackHref,
  className,
}: {
  label: string;
  fallbackHref: string;
  className?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={goBack}
      className={cn("gap-1.5", className)}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
