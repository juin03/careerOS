"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Building2, Loader2 } from "lucide-react";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const params = useSearchParams();
  const initialRole = params.get("role") === "employer" ? "employer" : "candidate";
  const [role, setRole] = useState<"candidate" | "employer">(initialRole);
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Two minutes to start mapping your career.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="accountRole" value={role} />

        <div>
          <Label className="mb-2 block">I&apos;m here as a…</Label>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === "candidate"}
              onClick={() => setRole("candidate")}
              icon={<User className="h-5 w-5" />}
              label="Candidate"
              sub="Navigate my career"
            />
            <RoleCard
              active={role === "employer"}
              onClick={() => setRole("employer")}
              icon={<Building2 className="h-5 w-5" />}
              label="Employer"
              sub="Find talent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" placeholder="Aisyah Rahman" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            required
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-primary/40",
      )}
    >
      <span className={cn("text-primary", !active && "text-muted-foreground")}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </button>
  );
}
