import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Lock,
  Mail,
  User,
  Target,
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
  icon: Icon,
  defaultValue,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  icon?: typeof Mail;
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
          defaultValue={defaultValue}
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

const REGISTER_BENEFITS = [
  "Job matches refreshed every 24 hours",
  "Verified credentials (degrees, work history)",
  "Shared interview scorecards for fairness",
];

const EMPLOYER_REGISTER_BENEFITS = [
  "A structured pipeline for every open role",
  "Candidate shortlists with consistent hiring signals",
  "One shared view for interviews and offers",
];

export function AuthForm({
  mode,
  audience = "candidate",
}: {
  mode: "login" | "register";
  audience?: "candidate" | "employer";
}) {
  const registering = mode === "register";
  const employer = audience === "employer";
  const dashboardHref = employer ? "/employer/dashboard" : "/candidate/dashboard";
  const loginHref = employer ? "/employer/login" : "/login";
  const registerHref = employer ? "/employer/register" : "/register";
  const benefits = employer ? EMPLOYER_REGISTER_BENEFITS : REGISTER_BENEFITS;

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
              ? employer
                ? "Build a hiring workspace your team can trust."
                : "Start with a profile that proves itself."
              : employer
                ? "Welcome back. Your hiring work continues here."
                : "Welcome back. Your career journey continues here."}
          </p>
        </div>

        <ul className="space-y-3 text-sm text-background/85">
          {benefits.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background/15">
                <Check className="h-3 w-3" aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>

        <p className="text-xs text-background/55">
          {employer
            ? "Built for thoughtful hiring teams across Malaysia."
            : "Trusted by candidates across 14 countries, 6 industries."}
        </p>
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
                  ? employer
                    ? "Set up your team workspace and start hiring with structure."
                    : "Build a verified profile and discover relevant roles."
                  : employer
                    ? "Log in to continue your hiring work."
                    : "Log in to continue your CareerOS journey."}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {employer ? "Employer" : registering ? "Candidate" : "Login"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {registering && (
            <Field
              id={employer ? "company-name" : "name"}
              label={employer ? "Company name" : "Full name"}
              placeholder={employer ? "Meridian Byte Labs" : "Alex Morgan"}
              helper={
                employer
                  ? "Use the organization name candidates will recognize."
                  : "Use the name you go by professionally."
              }
              icon={employer ? Building2 : User}
              autoComplete={employer ? "organization" : "name"}
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
            autoComplete={
              registering ? "new-password" : "current-password"
            }
          />
          {registering && (
            <Field
              id={employer ? "website" : "goal"}
              label={employer ? "Company website" : "Career goal"}
              type={employer ? "url" : "text"}
              placeholder={
                employer ? "https://meridianbyte.my" : "e.g. Find my first product role"
              }
              helper={
                employer
                  ? "This helps candidates recognize your organization."
                  : "We'll use this to personalize your matches."
              }
              icon={employer ? Globe2 : Target}
              autoComplete={employer ? "url" : undefined}
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
            <Link
              href={
                registering && !employer ? "/candidate/onboarding" : dashboardHref
              }
            >
              {registering
                ? employer
                  ? "Create employer account"
                  : "Create account"
                : "Log in"}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={registering ? loginHref : registerHref}>
              {registering
                ? "Already registered? Log in"
                : employer
                  ? "New employer? Register"
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
