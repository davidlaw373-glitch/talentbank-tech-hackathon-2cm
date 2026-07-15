import Link from "next/link";
import { Bell } from "lucide-react";
import { candidateProfile } from "@/data/candidate";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { CandidateUserMenu } from "@/components/layout/candidate-user-menu";

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
          <CandidateNav />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="View notifications">
              <Link href="/candidate/notifications">
                <Bell aria-hidden />
              </Link>
            </Button>
            <CandidateUserMenu
              name={candidateProfile.name}
              initials={candidateProfile.initials}
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
