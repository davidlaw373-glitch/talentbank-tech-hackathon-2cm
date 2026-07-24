"use client";

/**
 * SetupWizard — presentational shell reused by all three role flows.
 *
 * The orchestrator (Candidate/Employer/University) owns the typed draft,
 * validation, and step navigation. The shell owns presentation: the
 * stepper, the active step heading (with Required/Optional badge), the
 * children slot, and the action row (Back / Continue / Skip / Finish /
 * Finish later).
 *
 * Behavior:
 *  - Wraps content in `<form onSubmit={onContinue}>` so Enter advances.
 *  - Moves focus to the active step heading after navigation.
 *  - Announces step changes via `aria-live="polite"` on the heading.
 *  - `animate-reveal` on step transitions; respects `prefers-reduced-motion`
 *    via globals.css.
 */

import * as React from "react";
import Link from "next/link";

import { Stepper, type StepperStep } from "@/components/common/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SetupWizardProps = {
  steps: StepperStep[];
  currentIndex: number;
  /** Whether the active step is optional (Skip becomes available). */
  optional: boolean;
  /** Whether the active step is the last one — switches Continue → Finish. */
  isLastStep: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  onFinish: () => void;
  /** Optional low-emphasis "Finish later" link target — leaves the wizard. */
  exitHref?: string;
  /** Optional eyebrow + title shown above the stepper. */
  eyebrow?: string;
  title?: string;
  /** Optional description under the title — set the tone of the wizard. */
  description?: string;
  children: React.ReactNode;
};

export function SetupWizard({
  steps,
  currentIndex,
  optional,
  isLastStep,
  onBack,
  onContinue,
  onSkip,
  onFinish,
  exitHref,
  eyebrow,
  title,
  description,
  children,
}: SetupWizardProps) {
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const activeStep = steps[currentIndex];

  // Move focus to the new step heading after navigation. We use the
  // `currentIndex` value as the dependency so focus follows the active step.
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [currentIndex]);

  const primaryLabel = isLastStep ? "Finish setup" : "Continue";
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLastStep) onFinish();
    else onContinue();
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    else if (!isLastStep) onContinue();
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Profile setup"
      className="w-full max-w-3xl space-y-4 lg:max-w-5xl lg:space-y-3"
    >
      {(eyebrow || title || description) && (
        <header className="space-y-1.5">
          {eyebrow ? (
            <p className="text-caption text-muted-foreground">{eyebrow}</p>
          ) : null}
          {title ? <h1 className="text-heading">{title}</h1> : null}
          {description ? (
            <p className="text-body text-muted-foreground">{description}</p>
          ) : null}
        </header>
      )}

      <Stepper
        steps={steps}
        currentIndex={currentIndex}
        ariaLabel="Setup progress"
      />

      <section
        aria-labelledby="setup-step-heading"
        className="space-y-4 rounded-xl border bg-card p-5 shadow-sm animate-reveal sm:p-6 lg:space-y-3 lg:p-5"
        key={currentIndex}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="setup-step-heading"
            ref={headingRef}
            tabIndex={-1}
            aria-live="polite"
            className="text-subheading focus:outline-none"
          >
            {activeStep?.label ?? ""}
          </h2>
          <Badge variant={optional ? "outline" : "default"}>
            {optional ? "Optional — skip for now" : "Required"}
          </Badge>
        </div>

        <div className="space-y-3">{children}</div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={currentIndex === 0}
              aria-label="Go to previous step"
            >
              Back
            </Button>
            {exitHref ? (
              <Button asChild variant="link" size="sm">
                <Link href={exitHref}>Finish later</Link>
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {optional && !isLastStep ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                aria-label="Skip this step for now"
              >
                Skip for now
              </Button>
            ) : null}
            <Button type="submit" aria-label={primaryLabel}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}