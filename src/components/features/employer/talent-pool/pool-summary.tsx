import type { LucideIcon } from "lucide-react";
import { Mail, Sparkles, Users, Clock } from "lucide-react";

import type { TalentPoolEntry } from "@/types/employer";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type PoolSummaryProps = {
  entries: TalentPoolEntry[];
};

/**
 * Top-line numbers for the talent pool workspace — total saved, average
 * re-engagement likelihood, candidates you can act on this week, and
 * staleness backlog. Pure presentational; the page owns the data.
 */
export function PoolSummary({ entries }: PoolSummaryProps) {
  const total = entries.length;
  const avgScore =
    total === 0
      ? 0
      : Math.round(
          entries.reduce((acc, e) => acc + e.reEngagementScore, 0) / total,
        );
  const neverContacted = entries.filter((e) => e.lastContactedAt === null).length;
  const stale = entries.filter((e) => e.status === "Stale").length;

  const stats: Array<{
    label: string;
    value: string | number;
    icon: LucideIcon;
    delta: string;
  }> = [
    {
      label: "Saved candidates",
      value: total,
      icon: Users,
      delta: "Across all sources",
    },
    {
      label: "Avg re-engagement",
      value: `${avgScore}%`,
      icon: Sparkles,
      delta: "Model signal",
    },
    {
      label: "Never contacted",
      value: neverContacted,
      icon: Mail,
      delta: "Awaiting first touch",
    },
    {
      label: "Stale entries",
      value: stale,
      icon: Clock,
      delta: "Re-evaluate or archive",
    },
  ];

  return (
    <section
      aria-label="Talent pool metrics"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="lift-on-hover">
            <CardContent className="space-y-3 p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                {s.value}
              </div>
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.delta}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}