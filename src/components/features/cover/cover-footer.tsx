import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: "Candidates",
    links: ["Find jobs", "Build profile", "Career path", "Interview prep"],
  },
  {
    heading: "Employers",
    links: ["Post a job", "Search talent", "Pricing", "Enterprise"],
  },
  {
    heading: "Universities",
    links: ["Issue credentials", "Outcomes", "Curriculum tools"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
];

export function CoverFooter() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="#top"
              aria-label="CareerOS home"
              className="flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              </span>
              <small className="font-semibold tracking-tight">CareerOS</small>
            </Link>
            <p className="mt-3 max-w-[200px] text-sm text-muted-foreground">
              The career operating system connecting candidates, employers,
              and universities.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {link}
                    </span>
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 text-[10px] font-normal"
                    >
                      Soon
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <small>© {new Date().getFullYear()} CareerOS. All rights reserved.</small>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
