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
  X,
} from "lucide-react";

import { get as getCandidate } from "@/data/candidates";
import { getCandidateNotifications } from "@/data/notifications";
import { useNotificationReadState } from "@/hooks/use-notification-read-state";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/common/notification-bell";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: ClipboardList },
  { href: "/candidate/resume", label: "Resume", icon: FileText },
  { href: "/candidate/interviews", label: "Interviews", icon: Calendar },
  { href: "/candidate/path-navigator", label: "Path finder", icon: RouteIcon },
];

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Use the same hook + storage key as the notifications page so the bell
  // badge and the "Mark read" toggles share one source of truth.
  const candidate = getCandidate(1);
  const { unreadCount: candidateUnread } = useNotificationReadState(getCandidateNotifications(), {
    storageKey: "careeros.notifications.candidate",
  });
  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href.split("/").filter(Boolean).length <= 1) return false;
    return pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 bg-white border-b border-border/20">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-2">
          <Link href="/" aria-label="CareerOS home" className="flex items-center gap-2">
            <BrandMark />
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
                    "relative flex flex-col items-center justify-center gap-0.5 rounded-md px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active
                      ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
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
            <ThemeToggle />
            <NotificationBell href="/candidate/notifications" unreadCount={candidateUnread} />
            <UserMenu
              name={candidate?.name ?? "Candidate"}
              initials={candidate?.initials ?? "?"}
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
      <main id="main-content" tabIndex={-1} className="container mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
