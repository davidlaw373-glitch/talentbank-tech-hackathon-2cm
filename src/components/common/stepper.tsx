"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  label: string;
  /** Optional second line shown beneath the label, e.g. a date. */
  meta?: string;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Index of the current step (0-based). All steps before are complete. */
  currentIndex: number;
  /** Accessible label for the whole stepper. */
  ariaLabel?: string;
  className?: string;
};

export function Stepper({
  steps,
  currentIndex,
  ariaLabel,
  className,
}: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol
        aria-label={ariaLabel}
        className="flex w-full items-start"
      >
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <Fragment key={step.id}>
              {/* Step column: dot + label share the same flex item so widths stay even */}
              <li className="flex w-0 min-w-0 flex-1 flex-col items-center gap-2 text-center">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring-soft"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold sm:h-12 sm:w-12",
                      isComplete && "bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-2 border-primary bg-background text-primary animate-pulse-soft",
                      !isComplete &&
                        !isCurrent &&
                        "border border-border bg-background text-muted-foreground"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : isCurrent ? (
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : (
                      i + 1
                    )}
                  </span>
                </span>
              </li>
              {/* Connector: visible sibling, takes equal flex-1 width */}
              {!isLast && (
                <li
                  aria-hidden
                  className="flex w-0 min-w-0 flex-1 items-center self-start pt-5 sm:pt-6"
                >
                  <div className="relative h-1 w-full rounded-full bg-muted">
                    {isComplete && (
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 w-full rounded-full bg-primary",
                          i <= currentIndex - 1 && "animate-progress-x"
                        )}
                        style={
                          i > currentIndex - 1
                            ? { width: 0 }
                            : { animationDelay: `${i * 80}ms` }
                        }
                      />
                    )}
                  </div>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>

      {/* Labels row — shares the same column structure so each label sits under its dot */}
      <ol
        aria-hidden
        className="mt-3 flex w-full items-start"
      >
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <Fragment key={`label-${step.id}`}>
              <li className="flex w-0 min-w-0 flex-1 flex-col items-center px-1 text-center">
                <p
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    isComplete && "text-muted-foreground",
                    isCurrent && "text-primary",
                    !isComplete && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.meta && (
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                    {step.meta}
                  </p>
                )}
              </li>
              {!isLast && (
                <li
                  aria-hidden
                  className="w-0 min-w-0 flex-1 px-2"
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
