"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type JobMatchBreakdownProps = {
  matchingSkills: string[];
  missingSkills: string[];
  /** How many matching skills to show before the "Show all" toggle appears. */
  visibleCount?: number;
  /** How many missing skills to show before the "Show all" toggle appears. */
  missingVisibleCount?: number;
};

export function JobMatchBreakdown({
  matchingSkills,
  missingSkills,
  visibleCount = 3,
  missingVisibleCount = 0,
}: JobMatchBreakdownProps) {
  const [open, setOpen] = useState(false);
  const visibleMatching = matchingSkills.slice(0, visibleCount);
  const hiddenMatching = matchingSkills.slice(visibleCount);
  const visibleMissing = missingSkills.slice(0, missingVisibleCount);
  const hiddenMissing = missingSkills.slice(missingVisibleCount);
  const remaining = hiddenMatching.length + hiddenMissing.length;
  const hasHidden = remaining > 0;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleMatching.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-[10px]">
            {skill}
          </Badge>
        ))}
        {visibleMissing.map((skill) => (
          <Badge
            key={skill}
            variant="outline"
            className="text-[10px]"
          >
            + {skill}
          </Badge>
        ))}
      </div>

      {hasHidden ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {hiddenMatching.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {skill}
                </Badge>
              ))}
              {hiddenMissing.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-[10px]"
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
          <CollapsibleTrigger
            aria-expanded={open}
            aria-label={
              open
                ? "Hide additional skills"
                : `Show ${remaining} more skill${remaining === 1 ? "" : "s"}`
            }
            className={cn(
              "group/more mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/60 bg-accent-soft/50 py-0.5 pl-1 pr-2 text-[10px] font-semibold text-foreground/75 transition-all duration-200",
              "hover:border-solid hover:border-highlight/50 hover:bg-accent-soft hover:text-foreground hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card",
              "active:scale-[0.97]",
              "data-[state=open]:border-solid data-[state=open]:border-border data-[state=open]:bg-accent-soft data-[state=open]:text-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight-soft px-1.5 text-[9px] font-bold tabular-nums leading-none text-foreground transition-colors duration-200",
                "group-hover/more:bg-highlight group-hover/more:text-highlight-foreground",
                "group-data-[state=open]/more:bg-highlight group-data-[state=open]/more:text-highlight-foreground",
              )}
            >
              {open ? remaining : `+${remaining}`}
            </span>
            <span>
              {open ? "Hide" : `more skill${remaining === 1 ? "" : "s"}`}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                "group-data-[state=open]/more:rotate-180",
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
        </Collapsible>
      ) : null}
    </div>
  );
}
