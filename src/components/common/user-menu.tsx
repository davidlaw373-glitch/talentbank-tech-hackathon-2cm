"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/common/toast";
import { cn } from "@/lib/utils";

export type UserMenuRole = "Candidate" | "Employer" | "University";

export type UserMenuProps = {
  /** Display name shown in the trigger and menu header. */
  name: string;
  /** 1–3 character initials shown in the avatar. */
  initials: string;
  /** Sub-label below the name (e.g. "Candidate", "Northstar Labs"). */
  subtitle: string;
  /** Role badge label. */
  role: UserMenuRole;
  /** Profile page href. */
  profileHref: string;
  /** Optional href for a settings page (omit to hide). */
  settingsHref?: string;
  /** Optional href for a billing page (omit to hide). */
  billingHref?: string;
  /** Where to send the user when they click "Sign out". Defaults to `/`. */
  signOutRedirect?: string;
};

export function UserMenu({
  name,
  initials,
  subtitle,
  role,
  profileHref,
  settingsHref,
  billingHref,
  signOutRedirect = "/",
}: UserMenuProps) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = () => {
    setOpen(false);
    push({
      title: `Signed out`,
      description: `See you soon, ${name.split(" ")[0]}.`,
      tone: "info",
    });
    router.push(signOutRedirect);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Open user menu for ${name}`}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
          open && "bg-accent",
        )}
      >
        <Badge
          variant="secondary"
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-xs font-semibold"
          aria-hidden
        >
          {initials}
        </Badge>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">
            {name}
          </span>
          <small className="block leading-tight text-muted-foreground">
            {subtitle}
          </small>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-lg border bg-card p-2 text-card-foreground shadow-lg"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="text-sm font-semibold leading-tight">{name}</p>
            <small className="block text-muted-foreground">{subtitle}</small>
            <Badge variant="outline" className="mt-2">
              {role}
            </Badge>
          </div>
          <div className="my-1 h-px bg-border" />
          <UserMenuLink
            href={profileHref}
            icon={<UserIcon className="h-4 w-4" aria-hidden />}
            label="Profile"
            onSelect={() => setOpen(false)}
          />
          {settingsHref ? (
            <UserMenuLink
              href={settingsHref}
              icon={<Settings className="h-4 w-4" aria-hidden />}
              label="Settings"
              onSelect={() => setOpen(false)}
            />
          ) : null}
          {billingHref ? (
            <UserMenuLink
              href={billingHref}
              icon={<CreditCard className="h-4 w-4" aria-hidden />}
              label="Billing"
              onSelect={() => setOpen(false)}
            />
          ) : null}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function UserMenuLink({
  href,
  icon,
  label,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
    >
      {icon}
      {label}
    </Link>
  );
}