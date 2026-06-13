import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Deterministic colored avatar — same name always gets the same hue, so the
// talent pool feels like distinct people rather than identical gray circles.
const PALETTE = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
];

function hueFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function PersonAvatar({
  name,
  seed,
  className,
}: {
  name: string | null | undefined;
  seed?: string;
  className?: string;
}) {
  const color = hueFor(seed || name || "?");
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarFallback className={cn("text-sm font-medium", color)}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
