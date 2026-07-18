import Link from "next/link";

import { Logo } from "@/components/common/logo";
import { Separator } from "@/components/ui/separator";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Who it's for", href: "#roles" },
      { label: "Platform", href: "#platform" },
      { label: "How it works", href: "#how" },
      { label: "Features", href: "#features" },
    ],
  },
  {
    heading: "Candidates",
    links: [
      { label: "Create profile", href: "/register" },
      { label: "Log in", href: "/login" },
      { label: "View demo dashboard", href: "/candidate/dashboard" },
    ],
  },
];

export function CoverFooter() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Logo size="md" href="#top" ariaLabel="CareerOS home" />
            <p className="mt-3 max-w-[240px] text-sm text-muted-foreground">
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
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <small>© {new Date().getFullYear()} CareerOS. All rights reserved.</small>
          <small>Demo build — content is illustrative.</small>
        </div>
      </div>
    </footer>
  );
}
