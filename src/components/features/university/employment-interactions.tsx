"use client";

import { useState } from "react";
import { ArrowUpRight, Download, Pin, PinOff, TrendingUp } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SkillDemand } from "@/types/university";

export function EmploymentExportButton() {
  const { push } = useToast();

  return (
    <Button
      onClick={() =>
        push({
          title: "Employment report export started",
          description: "The cohort report will download when it is ready.",
          tone: "success",
        })
      }
    >
      <Download aria-hidden />
      Export report
    </Button>
  );
}

export function SkillDemandRows({ skills }: { skills: SkillDemand[] }) {
  const { push } = useToast();
  const [pinnedSkills, setPinnedSkills] = useState<Set<string>>(
    () => new Set(),
  );

  function togglePin(skill: string) {
    const isPinned = pinnedSkills.has(skill);
    setPinnedSkills((current) => {
      const next = new Set(current);
      if (isPinned) next.delete(skill);
      else next.add(skill);
      return next;
    });
    push({
      title: `${skill} ${isPinned ? "unpinned" : "pinned"}`,
      description: isPinned
        ? "Removed from the cohort watchlist."
        : "Added to the cohort watchlist.",
      tone: "info",
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {skills.map((skill) => {
            const isPinned = pinnedSkills.has(skill.skill);
            return (
              <li
                key={skill.skill}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <TrendingUp className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p>{skill.skill}</p>
                    <p className="text-muted-foreground">
                      {skill.openings} openings
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <ArrowUpRight className="h-3 w-3" aria-hidden />+
                    {skill.delta}%
                  </Badge>
                  <Button
                    type="button"
                    variant={isPinned ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={isPinned}
                    onClick={() => togglePin(skill.skill)}
                  >
                    {isPinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}
                    {isPinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
