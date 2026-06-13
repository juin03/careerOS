import Link from "next/link";
import { User, Building2, GraduationCap, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-2xl text-center">
          {/* Hero */}
          <p className="text-sm font-medium text-primary">
            A navigation tool, not a prediction tool
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            See the paths ahead.
            <br />
            <span className="text-primary">Choose your own.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-pretty text-muted-foreground">
            Career OS maps where people like you actually went next — the pay, the
            timing, the trade-offs — so you navigate with real data, not guesses.
          </p>

          {/* Path selection — the front door */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <PathCard
              href="/signup?role=candidate"
              icon={<User className="h-5 w-5" />}
              label="I'm navigating"
              sub="Candidate"
            />
            <PathCard
              href="/signup?role=employer"
              icon={<Building2 className="h-5 w-5" />}
              label="I'm hiring"
              sub="Employer"
            />
            <PathCard
              href="/university"
              icon={<GraduationCap className="h-5 w-5" />}
              label="I track outcomes"
              sub="University"
            />
          </div>

          {/* Secondary: public exploration views */}
          <p className="mt-6 text-sm text-muted-foreground">
            Just exploring?{" "}
            <Link
              href="/careers"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse all careers
            </Link>{" "}
            or see the{" "}
            <Link
              href="/demand"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Skills Demand Map
            </Link>
            .
          </p>

          {/* Demo hint */}
          <p className="mt-6 text-xs text-muted-foreground">
            Reviewing the demo?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>{" "}
            with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
              candidate@careeros.demo
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
              employer@careeros.demo
            </code>{" "}
            · password{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">demo1234</code>
          </p>
        </div>
      </main>
    </div>
  );
}

function PathCard({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border bg-card p-5 transition-colors duration-200 hover:border-primary/50 hover:bg-accent"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <span className="mt-1 font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
      <span className="mt-1 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Enter <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
