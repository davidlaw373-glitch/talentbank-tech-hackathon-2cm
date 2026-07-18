"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Who it's for", href: "#roles" },
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how" },
  { label: "Career paths", href: "#paths" },
  { label: "Features", href: "#features" },
];

export function CoverNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on Escape and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Logo size="md" href="#top" ariaLabel="CareerOS home" />

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
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-cover-nav"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div id="mobile-cover-nav" className="md:hidden border-t">
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
