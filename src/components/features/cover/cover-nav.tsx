"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Candidates", href: "#candidates" },
  { label: "Employers", href: "/employer/login" },
  { label: "Universities", href: "#universities" },
  { label: "Features", href: "#features" },
];

export function CoverNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="#top"
          aria-label="CareerOS home"
          className="flex items-center gap-2"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <line
                x1="6"
                y1="18"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <line
                x1="6"
                y1="18"
                x2="12"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <line
                x1="18"
                y1="18"
                x2="12"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="6" cy="18" r="2.4" fill="currentColor" />
              <circle cx="18" cy="18" r="2.4" fill="currentColor" />
              <circle cx="12" cy="6" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <small className="font-semibold tracking-tight">CareerOS</small>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm"><Link href="/register">Register</Link></Button>
        </div>

        <Button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <nav
            className="container mx-auto flex flex-col gap-1 px-6 py-4"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2 border-t">
              <Button asChild variant="outline"><Link href="/login" onClick={() => setOpen(false)}>Log in</Link></Button>
              <Button asChild><Link href="/register" onClick={() => setOpen(false)}>Register</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
