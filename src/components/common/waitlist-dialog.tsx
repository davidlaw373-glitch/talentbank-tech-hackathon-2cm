"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AUDIENCE_COPY = {
  employer: {
    title: "Hire with CareerOS",
    description:
      "We're onboarding employers in batches. Leave your work email and we'll reach out when your cohort opens.",
    success: "You're on the employer waitlist.",
  },
  university: {
    title: "Partner with CareerOS",
    description:
      "We onboard universities each semester. Leave your institutional email and we'll schedule a walkthrough.",
    success: "You're on the university waitlist.",
  },
} as const;

export type WaitlistAudience = keyof typeof AUDIENCE_COPY;

export function WaitlistDialog({
  audience,
  children,
}: {
  audience: WaitlistAudience;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const copy = AUDIENCE_COPY[audience];

  // Demo only: nothing is sent anywhere — simulate a request so the
  // interaction has a realistic pending state before the success view.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 900);
  };

  const reset = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Let the close animation finish before resetting the form state.
      window.setTimeout(() => {
        setDone(false);
        setSubmitting(false);
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-6 w-6" aria-hidden />
            </div>
            <DialogHeader className="items-center text-center">
              <DialogTitle>{copy.success}</DialogTitle>
              <DialogDescription>
                Thanks for your interest — we&apos;ll be in touch soon. In the
                meantime, you can explore the candidate experience.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => reset(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor={`waitlist-email-${audience}`}
                  className="block text-sm font-medium text-foreground"
                >
                  Work email
                </label>
                <Input
                  id={`waitlist-email-${audience}`}
                  type="email"
                  required
                  placeholder="you@organization.com"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" disabled={submitting} aria-busy={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Joining…
                  </>
                ) : (
                  <>
                    Join the waitlist
                    <ArrowRight aria-hidden />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
