import Link from "next/link";
import { Bell, BriefcaseBusiness, Home, LayoutDashboard, UserRound } from "lucide-react";
import { candidateProfile } from "@/data/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: UserRound },
  { href: "/candidate/jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { href: "/candidate/applications", label: "Applications", icon: Home },
];

export function CandidateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/"><h2>CareerOS</h2></Link>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Candidate navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost"><Link href={href}><Icon />{label}</Link></Button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" aria-label="Notifications">
              <Link href="/candidate/notifications">
                <Bell />
              </Link>
            </Button>
            <Badge variant="secondary">{candidateProfile.initials}</Badge>
            <div><p>{candidateProfile.name}</p><small>Candidate</small></div>
          </div>
        </div>
      </header>
      <Separator />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
