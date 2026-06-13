import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-6">
          <Logo />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden border-l bg-muted/30 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,theme(colors.primary/10%),transparent_70%)]" />
        <div className="relative mx-auto max-w-md px-12">
          <Compass className="h-10 w-10 text-primary" />
          <blockquote className="mt-6 text-2xl font-medium leading-snug tracking-tight text-foreground">
            &ldquo;A career isn&apos;t a sequence of job applications. It&apos;s
            a 40-year arc with phases, plateaus, and pivots.&rdquo;
          </blockquote>
          <p className="mt-4 text-base text-foreground/70">
            Career OS holds that long view — so you can see the landscape, not
            just the next vacancy.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block text-sm font-medium text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
