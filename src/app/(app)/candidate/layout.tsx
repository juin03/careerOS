import {
  LayoutDashboard,
  Map,
  Briefcase,
  FileText,
  Users,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureSeed } from "@/lib/seed-db";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { href: "/candidate", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  {
    href: "/candidate/landscape",
    label: "Navigate",
    icon: <Map className="h-4 w-4" />,
    match: ["/candidate/roadmaps", "/candidate/coach", "/candidate/path"],
  },
  { href: "/candidate/jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  {
    href: "/candidate/meetings",
    label: "Meetings",
    icon: <Users className="h-4 w-4" />,
    match: ["/candidate/sessions"],
  },
  {
    href: "/candidate/applications",
    label: "Applications",
    icon: <FileText className="h-4 w-4" />,
    match: ["/candidate/signals"],
  },
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
      profileHref="/candidate/profile"
    >
      {children}
    </AppShell>
  );
}
