"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/common/brand-mark";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { CoverAnchorLink } from "@/components/features/cover/cover-anchor-link";
import { activateCoverRole } from "@/components/features/cover/cover-roles";

type NavLink = {
  label: string;
  href: `#${string}`;
  roleId?: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "Candidates", href: "#roles", roleId: "candidates" },
  { label: "Employers", href: "#roles", roleId: "employers" },
  { label: "Universities", href: "#roles", roleId: "universities" },
  { label: "Features", href: "#features" },
];

export function CoverNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <CoverAnchorLink
          href="#top"
          aria-label="CareerOS home"
          className="flex items-center gap-2"
        >
          <BrandMark />
          <small className="font-semibold tracking-tight md:hidden lg:inline">
            CareerOS
          </small>
        </CoverAnchorLink>

        <nav
          className="hidden items-center gap-3 md:flex lg:gap-8"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <CoverAnchorLink
              key={link.label}
              href={link.href}
              onNavigate={
                link.roleId ? () => activateCoverRole(link.roleId!) : undefined
              }
              className="text-xs text-muted-foreground transition-colors hover:text-foreground lg:text-sm"
            >
              {link.label}
            </CoverAnchorLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <nav
            className="container mx-auto flex flex-col gap-1 px-6 py-4"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <CoverAnchorLink
                key={link.label}
                href={link.href}
                onNavigate={() => {
                  if (link.roleId) activateCoverRole(link.roleId);
                  setOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent-soft"
              >
                {link.label}
              </CoverAnchorLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2 border-t">
              <Button asChild variant="outline">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
