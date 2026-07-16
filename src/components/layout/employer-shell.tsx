import Link from "next/link";
import { Bell, LayoutDashboard } from "lucide-react";
import { employerCompany } from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function EmployerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home">
            <h2>CareerOS</h2>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            <Button asChild variant="ghost">
              <Link href="/employer/dashboard">
                <LayoutDashboard aria-hidden />
                Dashboard
              </Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled
              aria-describedby="employer-notifications-unavailable"
            >
              <Bell aria-hidden />
              <span className="sr-only">Notifications unavailable</span>
            </Button>
            <p id="employer-notifications-unavailable" className="sr-only">
              Notifications are not available in this dashboard preview.
            </p>
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <Badge variant="secondary" aria-hidden>
                {employerCompany.initials}
              </Badge>
              <span className="text-left">
                <span className="block text-sm font-medium leading-tight">
                  {employerCompany.name}
                </span>
                <small className="block leading-tight">Employer</small>
              </span>
            </div>
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
