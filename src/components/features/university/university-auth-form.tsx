import Link from "next/link";
import { ArrowRight, Check, Lock, Mail, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UniversityAuthForm() {
  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      <aside className="hidden flex-col justify-between rounded-2xl border bg-foreground p-8 text-background lg:flex">
        <div className="space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">CareerOS</h2>
          <p className="text-base text-background/70">
            Connect graduate outcomes, credential trust, and curriculum insight.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-background/85">
          {[
            "Track graduate outcomes with confidence",
            "Review academic evidence in one place",
            "Turn hiring demand into curriculum insight",
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background/15">
                <Check className="h-3 w-3" aria-hidden />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <p className="text-xs text-background/55">
          Built for university teams that support every graduate journey.
        </p>
      </aside>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle>
                <h1>Welcome back</h1>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Log in to continue your institution&apos;s work.
              </p>
            </div>
            <Badge variant="secondary">University</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="institution-email" className="block text-sm font-medium">
              Institution email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="institution-email"
                type="email"
                placeholder="you@university.edu"
                autoComplete="email"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="university-password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="university-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pl-9"
                required
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-foreground"
            />
            Keep me signed in
          </label>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button asChild size="lg">
            <Link href="/university/dashboard">
              Log in
              <ArrowRight aria-hidden />
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
