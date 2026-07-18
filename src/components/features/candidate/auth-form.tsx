"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Lock,
  Mail,
  School,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Role = "candidate" | "employer" | "university";

const ROLES: {
  id: Role;
  label: string;
  icon: LucideIcon;
  /**
   * Punchy one-liner shown big on the role card. Reads like a promise,
   * not a feature list. Voice shifts per role so the three feel like
   * three different products, not three variants of the same one.
   */
  hook: string;
  /** Small descriptor shown underneath the hook. */
  descriptor: string;
  /** Accent token used for decorative elements on this role's card. */
  accent: "chart-1" | "chart-2" | "chart-4";
  redirect: { register: string; login: string };
  registerGoal: { label: string; placeholder: string };
}[] = [
  {
    id: "candidate",
    label: "Candidate",
    icon: User,
    hook: "Find work that fits how you actually work.",
    descriptor:
      "Skills translated from real projects. Matches that explain themselves.",
    accent: "chart-1",
    redirect: { register: "/candidate/profile", login: "/candidate/dashboard" },
    registerGoal: {
      label: "What are you looking for?",
      placeholder: "e.g. A senior frontend role in climate tech",
    },
  },
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    hook: "Hire the person, not the keyword soup.",
    descriptor:
      "Ranked shortlists with AI summaries. Structured interviews, no gut calls.",
    accent: "chart-2",
    redirect: { register: "/employer", login: "/employer" },
    registerGoal: {
      label: "Your company",
      placeholder: "e.g. Northstar Labs",
    },
  },
  {
    id: "university",
    label: "University",
    icon: GraduationCap,
    hook: "Show what your grads are actually building.",
    descriptor:
      "Verified credentials by the thousands. Outcomes you can stand behind.",
    accent: "chart-4",
    redirect: { register: "/university", login: "/university" },
    registerGoal: {
      label: "Your institution",
      placeholder: "e.g. University of Malaya",
    },
  },
];

function Field({
  id,
  label,
  type = "text",
  placeholder,
  helper,
  icon: Icon,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  icon?: LucideIcon;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-base font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={Icon ? "pl-9" : undefined}
          required
          aria-describedby={helper ? `${id}-help` : undefined}
        />
      </div>
      {helper && (
        <p
          id={`${id}-help`}
          className="text-xs text-muted-foreground"
        >
          {helper}
        </p>
      )}
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const params = useSearchParams();
  const next = params.get("next");
  const initialRole: Role = (() => {
    if (!next) return "candidate";
    if (next.startsWith("/employer")) return "employer";
    if (next.startsWith("/university")) return "university";
    return "candidate";
  })();
  const [role, setRole] = useState<Role>(initialRole);
  const activeRole = ROLES.find((r) => r.id === role)!;
  const targetRedirect = next
    ? next
    : registering
      ? activeRole.redirect.register
      : activeRole.redirect.login;

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Brand header — compact, single row */}
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight tracking-tight">
            CareerOS
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {registering
              ? "Pick your role and start in under a minute."
              : "Welcome back. Your career journey continues here."}
          </p>
        </div>
      </header>

      {/* Role selection — each card has its own accent and personality */}
      {registering && (
        <section aria-label="Choose your role">
          <div
            role="radiogroup"
            aria-label="Audience"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = r.id === role;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border-2 px-4 py-3 text-left transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "border-foreground bg-foreground text-background shadow-md"
                      : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm",
                  )}
                >
                  {/* Accent stripe — uses per-role chart color so each
                      card reads as distinct at a glance. The active
                      state covers it with the inverted bg so the
                      contrast stays high; otherwise the stripe is the
                      card's identity marker. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 origin-left transition-transform",
                      `bg-${r.accent}`,
                      isActive ? "scale-x-100" : "scale-x-50 opacity-60",
                    )}
                  />
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-background text-foreground"
                        : `bg-${r.accent}/15 text-foreground group-hover:bg-${r.accent}/25`,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                    {r.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {r.hook}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] leading-snug",
                      isActive
                        ? "text-background/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {r.descriptor}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Form — single column, compact spacing */}
      <Card className="w-full">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle>
            <h2>
              {registering ? "Create your account" : "Welcome back"}
            </h2>
          </CardTitle>
          <CardDescription>
            {registering
              ? "A few quick details to get you started."
              : "Log in to continue your CareerOS journey."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {registering && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                id="name"
                label={
                  role === "candidate"
                    ? "Full name"
                    : `Your name (${activeRole.label})`
                }
                placeholder="Alex Morgan"
                icon={User}
                autoComplete="name"
              />
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                autoComplete="email"
              />
            </div>
          )}
          {!registering && (
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              autoComplete="email"
            />
          )}
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            helper={registering ? "Use 8+ characters with a number." : undefined}
            icon={Lock}
            autoComplete={registering ? "new-password" : "current-password"}
          />
          {registering && (
            <Field
              id="goal"
              label={activeRole.registerGoal.label}
              placeholder={activeRole.registerGoal.placeholder}
              icon={
                role === "candidate"
                  ? Sparkles
                  : role === "employer"
                    ? Building2
                    : School
              }
            />
          )}
          {!registering && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-foreground"
                />
                Keep me signed in
              </label>
              <Link
                href="#"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button asChild size="lg">
            <Link href={targetRedirect}>
              {registering ? `Create ${activeRole.label.toLowerCase()} account` : "Log in"}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={registering ? "/login" : "/register"}>
              {registering
                ? "Already registered? Log in"
                : "New to CareerOS? Register"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}