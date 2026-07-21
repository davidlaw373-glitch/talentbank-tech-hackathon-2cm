"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  FileBarChart,
  LayoutDashboard,
  Lightbulb,
  UsersRound,
} from "lucide-react";

import { universityProfile } from "@/data/university";
import {
  UniversityRoleProvider,
  useUniversityRole,
} from "@/components/features/university/university-role-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { UniversityRole } from "@/types/university";

const links = [
  ["/university/dashboard", "Dashboard", LayoutDashboard],
  ["/university/graduates", "Graduates", UsersRound],
  ["/university/verification", "Verification", BadgeCheck],
  ["/university/employment", "Employment", BriefcaseBusiness],
  ["/university/insights", "Insights", Lightbulb],
  ["/university/reports", "Reports", FileBarChart],
] as const;

function UniversityRoleSelect() {
  const { role, setRole } = useUniversityRole();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="university-role" className="sr-only">
        University team role
      </label>
      <Select value={role} onValueChange={(value) => setRole(value as UniversityRole)}>
        <SelectTrigger id="university-role" className="w-[154px]" aria-label="University team role">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="careers">Career Services</SelectItem>
          <SelectItem value="registry">Registry</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function UniversityShellContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home">
            <h2>CareerOS</h2>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            {links.map(([href, label, Icon]) => (
              <Button key={href} asChild variant="ghost">
                <Link href={href}>
                  <Icon aria-hidden />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <UniversityRoleSelect />
            <Button asChild variant="ghost" size="icon" aria-label="View notifications">
              <Link href="/university/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <Link
              href="/university/profile"
              aria-label={`Open ${universityProfile.name} profile`}
              className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Badge variant="secondary" aria-hidden>
                {universityProfile.initials}
              </Badge>
              <span className="text-left">
                <span className="block text-sm font-medium leading-tight">
                  {universityProfile.name}
                </span>
                <small className="block leading-tight">University</small>
              </span>
            </Link>
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

export function UniversityShell({ children }: { children: React.ReactNode }) {
  return (
    <UniversityRoleProvider>
      <UniversityShellContent>{children}</UniversityShellContent>
    </UniversityRoleProvider>
  );
}
