"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CandidateIcon,
  EmployerIcon,
  UniversityIcon,
} from "@/components/features/cover/role-icons";
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
  /**
   * Punchy one-liner shown big on the register role card. Reads like a
   * promise, not a feature list. Voice shifts per role so the three
   * feel like three different products, not three variants of the same one.
   */
  hook: string;
  /** Small descriptor shown underneath the hook. */
  descriptor: string;
  /** Accent token used for decorative elements on this role's card. */
  accent: "chart-1" | "chart-2" | "chart-4";
  /** Standalone role icon — same shape used inside the cover-manifesto
   *  constellation. Used on the simplified /login role card. */
  Icon: (props: { className?: string }) => React.JSX.Element;
  redirect: { register: string; login: string };
  registerGoal: { label: string };
}[] = [
  {
    id: "candidate",
    label: "Candidate",
    hook: "Find work that fits how you actually work.",
    descriptor:
      "Skills translated from real projects. Matches that explain themselves.",
    accent: "chart-1",
    Icon: CandidateIcon,
    redirect: { register: "/candidate/profile", login: "/candidate/dashboard" },
    registerGoal: {
      label: "What are you looking for?",
    },
  },
  {
    id: "employer",
    label: "Employer",
    hook: "Hire the person, not the keyword soup.",
    descriptor:
      "Ranked shortlists with AI summaries. Structured interviews, no gut calls.",
    accent: "chart-2",
    Icon: EmployerIcon,
    redirect: { register: "/employer", login: "/employer" },
    registerGoal: {
      label: "Your company",
    },
  },
  {
    id: "university",
    label: "University",
    hook: "Show what your grads are actually building.",
    descriptor:
      "Verified credentials by the thousands. Outcomes you can stand behind.",
    accent: "chart-4",
    Icon: UniversityIcon,
    redirect: { register: "/university", login: "/university" },
    registerGoal: {
      label: "Your institution",
    },
  },
];

function Field({
  id,
  label,
  type = "text",
  helper,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  helper?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder=" "
          autoComplete={autoComplete}
          required
          aria-describedby={helper ? `${id}-help` : undefined}
          className="peer h-14 border border-border bg-card px-3 pb-2 pt-6 text-base shadow-none transition-colors"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-[16px] text-base text-muted-foreground transition-[top,font-size,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>
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
  // Both /login and /register start with all three role cards deselected.
  // The visitor picks one first, and only then does the auth form expand
  // below — same pattern on both pages so the choice is deliberate.
  const [role, setRole] = useState<Role | null>(null);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const activeRole =
    ROLES.find((r) => r.id === role) ?? ROLES[0];
  const targetRedirect = next
    ? next
    : registering
      ? activeRole.redirect.register
      : activeRole.redirect.login;

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Role selection — each card has its own accent and personality.
          Shown on both /login and /register; the form below is gated
          until the visitor picks a role (see `hasSelectedRole`).
          /login uses a simplified icon + name only; /register keeps
          the fuller card with hook + descriptor. */}
      <section aria-label="Choose your role">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {registering ? "Register As" : "Log in As"}
        </h2>
        <div
          role="radiogroup"
          aria-label="Audience"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
            {ROLES.map((r) => {
              const isActive = r.id === role;
              const Icon = r.Icon;
              /* /login — icon above name only, no descriptor. */
              if (!registering) {
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                      setRole(r.id);
                      setHasSelectedRole(true);
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 px-4 py-5 text-center transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "border-foreground bg-foreground text-background shadow-md"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-10 w-10",
                        isActive ? "text-background" : "text-secondary",
                      )}
                    />
                    <span className="text-base font-semibold tracking-tight">
                      {r.label}
                    </span>
                  </button>
                );
              }
              /* /register — fuller card with hook + descriptor. */
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    setRole(r.id);
                    setHasSelectedRole(true);
                  }}
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

      {/* Form — single column, compact spacing.
          On both /login and /register the form only expands once a role
          card has been picked. */}
      {hasSelectedRole && (
        <Card className={cn("w-full animate-reveal")}>
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
                autoComplete="name"
              />
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
              />
            </div>
          )}
          {!registering && (
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
          )}
          <Field
            id="password"
            label="Password"
            type="password"
            helper={registering ? "Use 8+ characters with a number." : undefined}
            autoComplete={registering ? "new-password" : "current-password"}
          />
          {registering && (
            <Field
              id="goal"
              label={activeRole.registerGoal.label}
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
            </Link>
          </Button>
        </CardFooter>
      </Card>
      )}

      {/* Cross-link between login ↔ register — always visible, sits below
          the role cards AND below the form Card once it expands. */}
      <p className="text-center text-sm text-muted-foreground">
        {registering ? (
          <>
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            New to CareerOS?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </>
        )}
      </p>
    </div>
  );
}