import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <Compass className="h-10 w-10 text-primary" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Off the map</h1>
        <p className="mt-1 text-muted-foreground">
          This page isn&apos;t on any of the paths we know. Let&apos;s reroute.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
