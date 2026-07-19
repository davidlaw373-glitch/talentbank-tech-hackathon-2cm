import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  LayoutDashboard,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { employerCompany } from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/employer/candidates", label: "Candidates", icon: UsersRound },
  { href: "/employer/interviews", label: "Interviews", icon: CalendarClock },
  { href: "/employer/offers", label: "Offers", icon: FileCheck2 },
  { href: "/employer/talent", label: "Talent", icon: Sparkles },
];

export function EmployerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home">
            <h2>CareerOS</h2>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost">
                <Link href={href}>
                  <Icon aria-hidden />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="View notifications">
              <Link href="/employer/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <Link
              href="/employer/company"
              aria-label={`Open ${employerCompany.name} company profile`}
              className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Badge variant="secondary" aria-hidden>
                {employerCompany.initials}
              </Badge>
              <span className="text-left">
                <span className="block text-sm font-medium leading-tight">
                  {employerCompany.name}
                </span>
                <small className="block leading-tight">Employer</small>
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
