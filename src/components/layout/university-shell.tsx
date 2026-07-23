"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Menu,
  School,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { universityProfile } from "@/data/university";
import { universityNotifications } from "@/data/notifications";
import { useNotificationReadState } from "@/hooks/use-notification-read-state";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/common/notification-bell";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/university", label: "Dashboard", icon: LayoutDashboard },
  { href: "/university/profile", label: "Institution", icon: School },
  { href: "/university/graduates", label: "Graduates", icon: Users },
  { href: "/university/verification", label: "Verification", icon: ShieldCheck },
  { href: "/university/disputes", label: "Disputes", icon: CheckCircle2 },
  {
    href: "/university/employment",
    label: "Employment",
    icon: GraduationCap,
  },
  { href: "/university/analytics", label: "Analytics", icon: LineChart },
];

export function UniversityShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Shared with the notifications page — same source data, same storage key.
  const { unreadCount: universityUnread } = useNotificationReadState(universityNotifications, {
    storageKey: "careeros.notifications.university",
  });
  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Section roots like /university must not match nested routes, otherwise
    // /university/profile would keep the Dashboard indicator lit.
    if (href.split("/").filter(Boolean).length <= 1) return false;
    return pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 bg-white border-b border-border/20">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="CareerOS home"
              className="flex items-center gap-2"
            >
              <BrandMark />
              <small className="font-semibold tracking-tight">CareerOS</small>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              University
            </Badge>
          </div>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="University navigation"
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
            <NotificationBell href="/university/notifications" unreadCount={universityUnread} />
            <UserMenu
              name={universityProfile.institutionName}
              initials={universityProfile.initials}
              subtitle="University workspace"
              role="University"
              profileHref="/university/profile"
            />
            <Button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-university"
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
              id="mobile-nav-university"
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
