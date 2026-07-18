import Link from "next/link";
import { Bell } from "lucide-react";
import { candidateProfile } from "@/data/candidate";
import { notifications } from "@/data/notifications";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { CandidateNav } from "@/components/layout/candidate-nav";
import { CandidateUserMenu } from "@/components/layout/candidate-user-menu";

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
          <Logo size="md" href="/candidate/dashboard" ariaLabel="CareerOS dashboard" />
          <CandidateNav />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label={`View notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`} className="relative">
              <Link href="/candidate/notifications">
                <Bell aria-hidden />
                {unreadCount > 0 && (
                  <span
                    aria-hidden
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary"
                  />
                )}
              </Link>
            </Button>
            <CandidateUserMenu
              name={candidateProfile.name}
              initials={candidateProfile.initials}
            />
          </div>
        </div>
      </header>
      <main id="main-content" className="container mx-auto p-4 pb-24 sm:p-6 md:pb-6">
        {children}
      </main>
    </div>
  );
}
