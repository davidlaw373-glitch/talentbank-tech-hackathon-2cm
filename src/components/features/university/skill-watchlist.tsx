"use client";

import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Pin,
  PinOff,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSkillWatchlist } from "@/hooks/use-skill-watchlist";
import type { SkillDemand } from "@/types/university";

/**
 * Skill demand list with a persistent watchlist. The original
 * `/university/employment` page had a pin/unpin affordance but the state
 * was local — it vanished on refresh and the "Added to the watchlist"
 * toast was a lie. This component persists the pin set to localStorage so
 * the watchlist semantics hold across visits.
 *
 * Sorted by openings (most in-demand first) so the analytic value isn't
 * sacrificed to the watchlist. Pinned skills stay in their analytic
 * position and just show a "Watching" pin state — so the list remains
 * comparable at a glance.
 */
export function SkillWatchlist({ skills }: { skills: SkillDemand[] }) {
  const { push } = useToast();
  const { isPinned, toggle, pinned } = useSkillWatchlist({
    storageKey: "careeros.skillWatchlist.university.1",
  });

  const sorted = useMemo(
    () => [...skills].sort((a, b) => b.openings - a.openings),
    [skills],
  );
  const maxOpenings = Math.max(...sorted.map((s) => s.openings), 1);

  return (
    <div className="space-y-3">
      {pinned.length > 0 ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Watching {pinned.length} {pinned.length === 1 ? "skill" : "skills"}
        </p>
      ) : null}
      <ul className="space-y-3">
        {sorted.map((s, i) => {
          const width = Math.max(
            8,
            Math.round((s.openings / maxOpenings) * 100),
          );
          const positive = s.delta >= 0;
          const watched = isPinned(s.skill);
          return (
            <li key={s.skill} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <small className="w-6 text-sm text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </small>
                  <p className="text-base">{s.skill}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {s.openings} openings
                  </span>
                  <Badge
                    variant={positive ? "secondary" : "outline"}
                    className="gap-1"
                  >
                    {positive ? (
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" aria-hidden />
                    )}
                    {positive ? "+" : ""}
                    {s.delta}%
                  </Badge>
                  <Button
                    type="button"
                    variant={watched ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={watched}
                    onClick={() => {
                      toggle(s.skill);
                      push({
                        title: `${s.skill} ${
                          watched ? "removed from" : "added to"
                        } watchlist`,
                        description: watched
                          ? "You won't see this skill highlighted on the dashboard."
                          : "This skill will stay highlighted on the dashboard.",
                        tone: "info",
                      });
                    }}
                  >
                    {watched ? (
                      <PinOff aria-hidden />
                    ) : (
                      <Pin aria-hidden />
                    )}
                    {watched ? "Unpin" : "Pin"}
                  </Button>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground animate-progress-x"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}