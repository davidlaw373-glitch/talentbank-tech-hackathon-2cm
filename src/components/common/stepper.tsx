import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  label: string;
  meta?: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentIndex: number;
  ariaLabel: string;
};

export function Stepper({ steps, currentIndex, ariaLabel }: StepperProps) {
  const safeIndex = Math.max(0, Math.min(currentIndex, steps.length - 1));
  const lastIndex = steps.length - 1;
  const activeStep = steps[safeIndex];

  return (
    <>
      <div className="space-y-2 sm:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            {activeStep?.label}
          </p>
          <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
            Step {safeIndex + 1} of {steps.length}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label={`${ariaLabel}: ${activeStep?.label ?? "Current step"}`}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={safeIndex + 1}
          className="flex h-1.5 gap-1"
        >
          {steps.map((step, i) => (
            <span
              key={step.id}
              aria-hidden
              className={cn(
                "h-full flex-1 rounded-full",
                i <= safeIndex ? "bg-foreground" : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <ol
        aria-label={ariaLabel}
        className="mx-auto hidden w-full max-w-4xl items-start gap-2 sm:flex"
      >
        {steps.map((step, i) => {
          const { id, label, meta } = step;
          const isComplete = i < safeIndex;
          const isCurrent = i === safeIndex;
          return (
            <li
              key={id}
              className="relative flex flex-1 flex-col items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              {i < lastIndex ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[calc(50%+1.625rem)] right-[calc(-50%+1.625rem)] top-[1.3125rem] h-0.5",
                    isComplete ? "bg-foreground/60" : "bg-border",
                  )}
                />
              ) : null}
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center">
                {isCurrent ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-foreground/60 animate-pulse-ring-soft"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                    isComplete && "bg-foreground text-background",
                    isCurrent &&
                      "border-2 border-foreground bg-background text-foreground",
                    !isComplete &&
                      !isCurrent &&
                      "border border-border bg-background text-muted-foreground",
                  )}
                  aria-label={
                    isComplete
                      ? `${label} — complete`
                      : isCurrent
                        ? `${label} — current`
                        : `${label} — upcoming`
                  }
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>
              </span>
              <div className="flex w-full flex-col items-center gap-0.5 text-center">
                {meta ? (
                  <span className="text-xs text-muted-foreground">{meta}</span>
                ) : null}
                <span
                  className={cn(
                    "text-sm",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
