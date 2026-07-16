import Link from "next/link";
import { Bell, BriefcaseBusiness, Home, LayoutDashboard } from "lucide-react";
import { candidateProfile } from "@/data/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: Home },
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
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home"><h2>CareerOS</h2></Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost"><Link href={href}><Icon />{label}</Link></Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="View notifications">
              <Link href="/candidate/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <Link
              href="/candidate/profile"
              aria-label={`Open ${candidateProfile.name}'s profile`}
              className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent focus-visible:bg-accent"
            >
              <Badge variant="secondary" aria-hidden>
                {candidateProfile.initials}
              </Badge>
              <span className="text-left">
                <span className="block text-sm font-medium leading-tight">
                  {candidateProfile.name}
                </span>
                <small className="block leading-tight">Candidate</small>
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
