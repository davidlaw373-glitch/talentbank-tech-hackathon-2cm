import type { Application } from "@/types/candidate";
import { cn } from "@/lib/utils";

/** Compact segmented progress bar for an application's stage timeline.
 *  Used by both the tracker list and the dashboard pipeline cards. */
export function ApplicationProgress({
  application,
}: {
  application: Application;
}) {
  const completed = application.timeline.filter((t) => t.complete).length;
  const total = application.timeline.length;
  const pct = Math.round((completed / total) * 100);
  const currentIndex = application.timeline.findIndex((t) => !t.complete);
  const hasActive = currentIndex >= 0;

  return (
    <div
      className="space-y-2"
      role="img"
      aria-label={`${completed} of ${total} stages complete${hasActive ? `, ${application.timeline[currentIndex].label} in progress` : ""}`}
    >
      <div className="flex items-center justify-between text-xs" aria-hidden>
        <span className="text-muted-foreground">
          {completed} of {total} stages
          {hasActive && (
            <>
              {" · "}
              <span className="font-medium text-primary">
                Stage {currentIndex + 1} active
              </span>
            </>
          )}
        </span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="flex items-center gap-1" aria-hidden>
        {application.timeline.map((step, i) => {
          const isComplete = step.complete;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              {isComplete && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-full rounded-full bg-primary",
                    i <= completed && "animate-progress"
                  )}
                  style={
                    i > completed
                      ? { width: 0 }
                      : { animationDelay: `${i * 80}ms` }
                  }
                />
              )}
              {isCurrent && (
                <>
                  <span className="absolute inset-y-0 left-0 w-full rounded-full bg-primary/30" />
                  <span className="animate-shimmer-bar pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-background/60 to-transparent" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
