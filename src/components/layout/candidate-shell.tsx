import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  FileText,
  Home,
  LayoutDashboard,
  Route as RouteIcon,
  Sparkles,
  UserRound,
} from "lucide-react";

import { candidateProfile } from "@/data/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/common/user-menu";

const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: UserRound },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: Home },
  { href: "/candidate/resume", label: "Resume", icon: FileText },
  { href: "/candidate/interviews", label: "Interviews", icon: Calendar },
  { href: "/candidate/path-navigator", label: "Path finder", icon: RouteIcon },
];

export function CandidateShell({ children }: { children: React.ReactNode }) {
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
            className="flex flex-wrap items-center gap-1"
            aria-label="Main navigation"
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
            <Button asChild variant="ghost" size="icon" aria-label="View notifications">
              <Link href="/candidate/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <UserMenu
              name={candidateProfile.name}
              initials={candidateProfile.initials}
              subtitle="Candidate"
              role="Candidate"
              profileHref="/candidate/profile"
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