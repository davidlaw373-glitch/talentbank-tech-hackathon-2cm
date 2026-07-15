"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

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

function Field({
  id,
  label,
  type = "text",
  placeholder,
  helper,
  defaultValue,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  defaultValue?: string;
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
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required
        aria-describedby={helper ? `${id}-help` : undefined}
      />
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

const REGISTER_BENEFITS = [
  "Job matches refreshed every 24 hours",
  "Verified credentials (degrees, work history)",
  "Shared interview scorecards for fairness",
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo only: no real authentication or data is saved — this just simulates
  // the interaction so the flow feels responsive before navigating.
  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      router.push(
        registering ? "/candidate/onboarding" : "/candidate/dashboard"
      );
    }, 900);
  };

  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between rounded-2xl border bg-primary p-8 text-primary-foreground lg:flex">
        <div className="space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground">
            CareerOS
          </h2>
          <p className="text-base text-primary-foreground/75">
            {registering
              ? "Start with a profile that proves itself."
              : "Welcome back. Your career journey continues here."}
          </p>
        </div>

        <ul className="space-y-3 text-sm text-primary-foreground/90">
          {REGISTER_BENEFITS.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background/20">
                <Check className="h-3 w-3" aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h1>
                  {registering ? "Create your account" : "Welcome back"}
                </h1>
              </CardTitle>
              <CardDescription>
                {registering
                  ? "Build a verified profile and discover relevant roles."
                  : "Log in to continue your CareerOS journey."}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {registering ? "Candidate" : "Login"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {registering && (
            <Field
              id="name"
              label="Full name"
              placeholder="Alex Morgan"
              helper="Use the name you go by professionally."
              autoComplete="name"
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            helper={registering ? "Use 8+ characters with a number." : undefined}
            autoComplete={
              registering ? "new-password" : "current-password"
            }
          />
          {registering && (
            <Field
              id="goal"
              label="Career goal"
              placeholder="e.g. Find my first product role"
              helper="We'll use this to personalize your matches."
            />
          )}
          {!registering && (
            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {registering ? "Creating account…" : "Logging in…"}
              </>
            ) : (
              <>
                {registering ? "Create account" : "Log in"}
                <ArrowRight />
              </>
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href={registering ? "/login" : "/register"}>
              {registering
                ? "Already registered? Log in"
                : "New to CareerOS? Register"}
            </Link>
          </Button>
          <Link
            href="/"
            className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
