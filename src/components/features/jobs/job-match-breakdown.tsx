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
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:rounded-sm",
            )}
          >
            <span>
              {open
                ? "Hide breakdown"
                : `Show all (${remaining} more skill${remaining === 1 ? "" : "s"})`}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
        </Collapsible>
      ) : null}
    </div>
  );
}
