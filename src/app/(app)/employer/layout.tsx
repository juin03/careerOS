import { LayoutDashboard, Users, Briefcase, Inbox, Send } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureSeed } from "@/lib/seed-db";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/employer", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/employer/talent", label: "Find talent", icon: <Users className="h-4 w-4" /> },
  { href: "/employer/jobs", label: "My jobs", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/employer/applicants", label: "Applicants", icon: <Inbox className="h-4 w-4" /> },
  { href: "/employer/signals", label: "Sent signals", icon: <Send className="h-4 w-4" /> },
];

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("employer");
  await ensureSeed();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell
      nav={nav}
      name={profile.full_name ?? "Employer"}
      email={user?.email ?? ""}
      roleLabel="Employer"
    >
      {children}
    </AppShell>
  );
}
