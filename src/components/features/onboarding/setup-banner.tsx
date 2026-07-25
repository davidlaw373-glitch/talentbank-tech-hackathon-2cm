"use client";

/**
 * SetupBanner — non-blocking reminder shown on every page in a role shell
 * until the user finishes the onboarding wizard. Lives inside the shell,
 * inline at the top of `<main>`, before page children.
 *
 * Renders `null` until `ready` so the server and first client renders
 * match; renders `null` once `complete` is true. The banner link points
 * to `/onboarding/<role>` so a click resumes the wizard.
 */

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { Button } from "@/components/ui/button";
import type { OnboardingRole } from "@/types/onboarding";

type SetupBannerProps = {
  role: OnboardingRole;
};

export function SetupBanner({ role }: SetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { complete, ready } = useOnboardingStatus({
    role,
    defaultComplete: false,
  });

  if (!ready) return null;
  if (complete) return null;
  if (dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Profile setup reminder"
      className="relative mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-amber-50 p-4 sm:p-5 dark:border-amber-200/30 dark:bg-amber-950/30"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-highlight-foreground"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Profile setup
          </p>
          <p className="text-sm font-medium">
            Finish setting up your profile to unlock the rest of CareerOS.
          </p>
          <p className="text-xs text-muted-foreground">
            It only takes a few minutes and you can edit anything later.
          </p>
        </div>
      </div>
      <div className="-mt-2 ml-auto flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          aria-label="Dismiss profile setup reminder"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-highlight-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <Button asChild size="sm">
          <Link href={`/onboarding/${role}`}>
            Continue setup
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
