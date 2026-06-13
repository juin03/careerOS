import { LayoutDashboard, Map, Briefcase, FileText, UserCircle, Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureSeed } from "@/lib/seed-db";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/candidate", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/candidate/landscape", label: "Landscape Map", icon: <Map className="h-4 w-4" /> },
  { href: "/candidate/jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/candidate/applications", label: "Applications", icon: <FileText className="h-4 w-4" /> },
  { href: "/candidate/signals", label: "Quiet Signals", icon: <Inbox className="h-4 w-4" /> },
  { href: "/candidate/profile", label: "Profile", icon: <UserCircle className="h-4 w-4" /> },
];

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("candidate");
  await ensureSeed();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell
      nav={nav}
      name={profile.full_name ?? "Candidate"}
      email={user?.email ?? ""}
      roleLabel="Candidate"
    >
      {children}
    </AppShell>
  );
}
