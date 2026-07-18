import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type StepperStep = {
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
  return (
    <ol
      aria-label={ariaLabel}
      className="flex w-full items-start gap-2"
    >
      {steps.map((step, i) => {
        const { id, label, meta } = step;
        const isComplete = i < safeIndex;
        const isCurrent = i === safeIndex;
        return (
          <li
            key={id}
            className="flex flex-1 flex-col items-start gap-2"
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex w-full items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
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
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    isComplete ? "bg-foreground/60" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {meta ? (
                <span className="text-[10px] text-muted-foreground">
                  {meta}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
