"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  // Extra path prefixes that should also mark this item active (for grouped
  // sections reached via sub-tabs, e.g. Navigate covers roadmaps + coach).
  match?: string[];
}

export function AppShell({
  nav,
  name,
  email,
  roleLabel,
  profileHref,
  children,
}: {
  nav: NavItem[];
  name: string;
  email: string;
  roleLabel: string;
  profileHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav nav={nav} />
          <Logo href={nav[0]?.href ?? "/"} />
          <span className="hidden rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground sm:inline">
            {roleLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu name={name} email={email} profileHref={profileHref} />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r p-4 md:block">
          <SideNav nav={nav} />
        </aside>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function SideNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {nav.map((item, i) => {
        // The first item is the section index (e.g. /candidate). It must match
        // EXACTLY, otherwise it stays highlighted on every sub-page since they
        // all start with its href. Deeper items use prefix matching.
        const active =
          i === 0
            ? pathname === item.href
            : pathname === item.href ||
              pathname.startsWith(item.href + "/") ||
              (item.match?.some(
                (m) => pathname === m || pathname.startsWith(m + "/"),
              ) ??
                false);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ nav }: { nav: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="mb-6 mt-2">
          <Logo />
        </div>
        <SideNav nav={nav} />
      </SheetContent>
    </Sheet>
  );
}

function UserMenu({
  name,
  email,
  profileHref,
}: {
  name: string;
  email: string;
  profileHref?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileHref && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={profileHref}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        )}
        <form action={signOut}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
