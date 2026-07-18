"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Route as RouteIcon,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { candidateProfile } from "@/data/candidate";
import { notifications } from "@/data/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/common/notification-bell";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/common/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: UserRound },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: ClipboardList },
  { href: "/candidate/resume", label: "Resume", icon: FileText },
  { href: "/candidate/interviews", label: "Interviews", icon: Calendar },
  { href: "/candidate/path-navigator", label: "Path finder", icon: RouteIcon },
];

const candidateUnread = notifications.filter((n) => !n.read).length;

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-full">
      <header className="border-b bg-background">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <small className="font-semibold tracking-tight">CareerOS</small>
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
              Candidate
            </Badge>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "bg-primary/10 font-semibold text-foreground"
                      : "text-foreground hover:bg-accent-soft hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell href="/candidate/notifications" unreadCount={candidateUnread} />
            <UserMenu
              name={candidateProfile.name}
              initials={candidateProfile.initials}
              subtitle="Candidate"
              role="Candidate"
              profileHref="/candidate/profile"
            />
            <Button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-candidate"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t bg-background">
            <nav
              id="mobile-nav-candidate"
              className="container mx-auto flex flex-col gap-1 px-6 py-3"
              aria-label="Mobile navigation"
            >
              {links.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "bg-primary/10 font-semibold text-foreground"
                        : "text-foreground hover:bg-accent-soft",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
      <Separator />
      <main id="main-content" tabIndex={-1} className="container mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
