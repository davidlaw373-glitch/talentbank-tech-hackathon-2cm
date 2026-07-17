import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { universityProfile } from "@/data/university";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/common/user-menu";

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
  return (
    <div className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className="border-b bg-background">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="CareerOS home"
              className="flex items-center gap-2"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <small className="font-semibold tracking-tight">CareerOS</small>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              University
            </Badge>
          </div>

          <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="University navigation"
          >
            {links.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" size="sm">
                <Link href={href}>
                  <Icon />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="View notifications"
            >
              <Link href="/university/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <UserMenu
              name={universityProfile.institutionName}
              initials={universityProfile.initials}
              subtitle="University workspace"
              role="University"
              profileHref="/university/profile"
            />
          </div>
        </div>
      </header>
      <Separator />
      <main id="main-content" className="container mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}