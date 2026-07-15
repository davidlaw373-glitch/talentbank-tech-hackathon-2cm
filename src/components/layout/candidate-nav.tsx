"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, ClipboardList, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

// Defined here (in the client module) so the icon components stay on the
// client side of the RSC boundary — passing React components from a Server
// Component into a Client Component is not allowed.
const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: ClipboardList },
] as const;

export function CandidateNav() {
  const pathname = usePathname();

  // Match the link's exact route or any nested route beneath it,
  // so e.g. /candidate/jobs/frontend-developer highlights "Find jobs".
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="flex flex-wrap items-center gap-1"
      aria-label="Main navigation"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Button
            key={href}
            asChild
            variant={active ? "default" : "ghost"}
            aria-current={active ? "page" : undefined}
          >
            <Link href={href}>
              <Icon />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
