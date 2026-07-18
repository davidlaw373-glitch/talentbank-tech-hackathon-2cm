"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Defined here (in the client module) so the icon components stay on the
// client side of the RSC boundary — passing React components from a Server
// Component into a Client Component is not allowed.
const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: ClipboardList },
  { href: "/candidate/profile", label: "Profile", icon: UserRound },
] as const;

// Match the link's exact route or any nested route beneath it,
// so e.g. /candidate/jobs/frontend-developer highlights "Find jobs".
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
}

export function CandidateNav() {
  const isActive = useIsActive();

  return (
    <>
      {/* Desktop / tablet — pill nav in the header */}
      <nav
        className="hidden items-center gap-1 md:flex"
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
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile — fixed bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
        aria-label="Main navigation"
      >
        <div className="grid grid-cols-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
        {/* iOS home-indicator safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" aria-hidden />
      </nav>
    </>
  );
}
