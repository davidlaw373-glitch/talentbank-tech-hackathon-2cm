"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  Lock,
  Mail,
  School,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Role = "candidate" | "employer" | "university";

const ROLES: {
  id: Role;
  label: string;
  icon: LucideIcon;
  tagline: string;
  redirect: { register: string; login: string };
  registerGoal: { label: string; placeholder: string };
}[] = [
  {
    id: "candidate",
    label: "Candidate",
    icon: User,
    tagline:
      "Build a verified profile, see your match score for every role, and track applications.",
    redirect: { register: "/candidate/onboarding", login: "/candidate/dashboard" },
    registerGoal: {
      label: "Career goal",
      placeholder: "e.g. Find my first product role",
    },
  },
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    tagline:
      "Post roles, see ranked candidates with AI summaries, and run structured interviews.",
    redirect: { register: "/employer", login: "/employer" },
    registerGoal: {
      label: "Company name",
      placeholder: "e.g. Northstar Labs",
    },
  },
  {
    id: "university",
    label: "University",
    icon: GraduationCap,
    tagline:
      "Verify student credentials in bulk and track graduate employment outcomes.",
    redirect: { register: "/university", login: "/university" },
    registerGoal: {
      label: "Institution name",
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
        className="block text-sm font-medium text-foreground"
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
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between rounded-2xl border bg-foreground p-8 text-background lg:flex">
        <div className="space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-background">
            CareerOS
          </h2>
          <p className="text-base text-background/70">
            {registering
              ? "Pick your role and start in under a minute."
              : "Welcome back. Your career journey continues here."}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/55">
            One platform, three roles
          </p>
          <ul className="space-y-3 text-sm text-background/85">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <li key={r.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                      r.id === role
                        ? "bg-background text-foreground"
                        : "bg-background/15 text-background"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-background/65">{r.tagline}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-xs text-background/55">
          Trusted by 180+ universities and 4,000+ hiring teams.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h1>
                  {registering ? "Create your account" : "Welcome back"}
                </h1>
              </CardTitle>
              <CardDescription>
                {registering
                  ? "Choose your role to get started."
                  : "Log in to continue your CareerOS journey."}
              </CardDescription>
            </div>
            <Badge variant="secondary">{activeRole.label}</Badge>
          </div>

          <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
            <TabsList
              className="grid h-auto w-full grid-cols-3 gap-1 bg-transparent p-0"
              aria-label="Choose role"
            >
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <TabsTrigger
                    key={r.id}
                    value={r.id}
                    className="flex flex-col items-center gap-1 rounded-md border bg-background px-3 py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="text-xs font-medium">{r.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          {registering && (
            <Field
              id="name"
              label={
                role === "candidate" ? "Full name" : `Your name (${activeRole.label})`
              }
              placeholder="Alex Morgan"
              helper="Use the name you go by professionally."
              icon={User}
              autoComplete="name"
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            autoComplete="email"
          />
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
              helper={
                role === "candidate"
                  ? "We'll use this to personalize your matches."
                  : role === "employer"
                    ? "We'll prefill your company workspace."
                    : "We'll match your credential sync settings."
              }
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
          <Button asChild variant="ghost">
            <Link href="/">Back to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}