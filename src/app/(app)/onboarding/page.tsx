import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureSeed } from "@/lib/seed-db";
import { ROLES } from "@/lib/career-graph/seed-data";
import { OnboardingFlow } from "./onboarding-flow";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function OnboardingPage() {
  const profile = await requireProfile("candidate");
  await ensureSeed();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Logo href="/candidate" />
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-start justify-center p-6">
        <OnboardingFlow
          roles={ROLES.map((r) => ({ id: r.id, title: r.title, family: r.family }))}
          defaultName={profile.full_name ?? user?.user_metadata?.full_name ?? ""}
        />
      </div>
    </div>
  );
}
