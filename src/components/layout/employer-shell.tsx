"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  CircleCheck,
  LayoutDashboard,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { employerProfile } from "@/data/employer";
import { employerNotifications } from "@/data/notifications";
import { useNotificationReadState } from "@/hooks/use-notification-read-state";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/common/notification-bell";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/profile", label: "Company", icon: Building2 },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/candidates", label: "Candidates", icon: Users },
  { href: "/employer/interviews", label: "Interviews", icon: Calendar },
  { href: "/employer/offers", label: "Offers", icon: CircleCheck },
  { href: "/employer/talent-pool", label: "Talent pool", icon: Sparkles },
];

export function EmployerShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Shared with the notifications page — same source data, same storage key.
  const { unreadCount: employerUnread } = useNotificationReadState(employerNotifications, {
    storageKey: "careeros.notifications.employer",
  });
  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Section roots like /employer must not match nested routes, otherwise
    // /employer/jobs would keep the Dashboard indicator lit.
    if (href.split("/").filter(Boolean).length <= 1) return false;
    return pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-full">
      <header className="border-b bg-background">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
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
              Employer
            </Badge>
          </div>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Employer navigation"
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
            <ThemeToggle />
            <NotificationBell href="/employer/notifications" unreadCount={employerUnread} />
            <UserMenu
              name={employerProfile.companyName}
              initials={employerProfile.initials}
              subtitle="Employer workspace"
              role="Employer"
              profileHref="/employer/profile"
            />
            <Button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-employer"
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
              id="mobile-nav-employer"
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
