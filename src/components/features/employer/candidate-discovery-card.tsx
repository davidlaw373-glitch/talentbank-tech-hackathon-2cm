"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";

import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { JobCandidateMatchScore } from "@/types/match-score";
import { STAGE_VARIANT } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildCandidateInsight,
  getCandidateAchievement,
} from "./candidate-discovery";

type CandidateDiscoveryCardProps = {
  row: EmployerCandidateRow;
  match: JobCandidateMatchScore | undefined;
  starred: boolean;
  onToggleStar: () => void;
};

const SIGNAL_SCROLL_CLASSES =
  "[scrollbar-width:thin] [scrollbar-color:var(--primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 [&::-webkit-scrollbar-thumb:hover]:bg-primary/70";

export function CandidateDiscoveryCard({
  row,
  match,
  starred,
  onToggleStar,
}: CandidateDiscoveryCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [signalExpanded, setSignalExpanded] = useState(false);
  const { candidate, job, app, matchScore, verification } = row;
  const insight = buildCandidateInsight(row, match);
  const latestExperience = candidate.experience[0];
  const scoreWidth = Math.min(100, Math.max(0, matchScore));
  const handleFlipKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    nextFlipped: boolean,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setFlipped(nextFlipped);
  };

  return (
    <article
      className="h-[33rem] min-w-0 animate-reveal [perspective:1200px]"
      aria-label={`${candidate.name}, ${candidate.title}`}
    >
      <div className="lift-on-hover relative h-full w-full">
        <div
          className={cn(
            "relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500 motion-reduce:transition-none",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
        <section
          className="surface-card absolute inset-0 flex h-full flex-col overflow-hidden rounded-xl border-2 border-border shadow-[5px_6px_0_0_var(--border)] [backface-visibility:hidden]"
          aria-hidden={flipped}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label={`Show AI insight for ${candidate.name}`}
            aria-pressed={flipped}
            tabIndex={flipped ? -1 : 0}
            onClick={() => {
              setSignalExpanded(false);
              setFlipped(true);
            }}
            onKeyDown={(event) => handleFlipKeyDown(event, true)}
          />
          <div className="h-1.5 shrink-0 bg-primary" aria-hidden />

          <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-accent-soft text-subheading text-accent-foreground"
                >
                  {candidate.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-caption">Candidate</p>
                  <h2 className="truncate text-subheading">{candidate.name}</h2>
                  <p className="truncate text-meta">{candidate.title}</p>
                </div>
              </div>
              <Button
                type="button"
                variant={starred ? "secondary" : "outline"}
                size="icon"
                className="pointer-events-auto relative z-20 shrink-0"
                aria-label={
                  starred
                    ? `Remove ${candidate.name} from saved`
                    : `Save ${candidate.name}`
                }
                aria-pressed={starred}
                title={
                  starred
                    ? `Remove ${candidate.name} from saved`
                    : `Save ${candidate.name}`
                }
                tabIndex={flipped ? -1 : 0}
                onClick={onToggleStar}
              >
                <Star className={cn(starred && "fill-current")} aria-hidden />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={app.rejected ? "destructive" : STAGE_VARIANT[app.stage]}>
                {app.rejected ? "Rejected" : app.stage}
              </Badge>
              <Badge variant="outline">
                {verification === "Verified" ? (
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden />
                )}
                {verification}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-caption">Applied for</p>
                <p className="mt-1 flex items-center gap-2 text-body font-medium">
                  <BriefcaseBusiness
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="line-clamp-1">{job.title}</span>
                </p>
              </div>
              <p className="flex items-center gap-2 text-meta">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{candidate.location}</span>
              </p>
            </div>

            <div className="relative mt-5 h-36 shrink-0 overflow-hidden rounded-lg border bg-surface-2 p-4 pr-14">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto absolute right-2.5 top-2.5 z-20"
                aria-label={`Expand recent signal for ${candidate.name}`}
                aria-expanded={signalExpanded}
                title={`Expand recent signal for ${candidate.name}`}
                tabIndex={flipped ? -1 : 0}
                onClick={() => setSignalExpanded(true)}
              >
                <Maximize2 aria-hidden />
              </Button>
              <p className="text-caption">Recent signal</p>
              <p className="mt-1.5 line-clamp-1 text-body font-medium leading-snug">
                {latestExperience
                  ? `${latestExperience.role} at ${latestExperience.company}`
                  : "No recent role provided"}
              </p>
              <div
                role="region"
                aria-label={`Recent signal details for ${candidate.name}`}
                className={cn(
                  "mt-2 h-14 overflow-y-auto pr-2 text-meta leading-relaxed",
                  SIGNAL_SCROLL_CLASSES,
                )}
              >
                {getCandidateAchievement(row)}
              </div>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-caption">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    AI Match
                  </p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
                    {matchScore}
                    <span className="ml-0.5 text-base text-muted-foreground">
                      %
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="pointer-events-auto relative z-20 mb-0.5"
                  aria-label={`View AI insight for ${candidate.name}`}
                  tabIndex={flipped ? -1 : 0}
                  onClick={() => setFlipped(true)}
                >
                  <RotateCw className="h-3.5 w-3.5" aria-hidden />
                  View AI insight
                </Button>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-inset"
                role="progressbar"
                aria-label={`${candidate.name} AI Match`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={scoreWidth}
              >
                <span
                  className="animate-progress-x block h-full rounded-full bg-primary"
                  style={{ width: `${scoreWidth}%` }}
                />
              </div>
            </div>
          </div>

          {signalExpanded ? (
            <section
              role="region"
              aria-label={`Full recent signal for ${candidate.name}`}
              className="pointer-events-auto absolute inset-4 z-40 flex flex-col rounded-xl border-2 bg-surface-1 p-5 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-caption">Recent signal</p>
                  <h3 className="mt-1 text-subheading">
                    {latestExperience
                      ? `${latestExperience.role} at ${latestExperience.company}`
                      : "No recent role provided"}
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label={`Close recent signal for ${candidate.name}`}
                  title={`Close recent signal for ${candidate.name}`}
                  onClick={() => setSignalExpanded(false)}
                >
                  <Minimize2 aria-hidden />
                </Button>
              </div>
              <div
                className={cn(
                  "mt-5 min-h-0 flex-1 overflow-y-auto rounded-lg border bg-surface-2 p-4 pr-3 text-body leading-relaxed",
                  SIGNAL_SCROLL_CLASSES,
                )}
              >
                {getCandidateAchievement(row)}
              </div>
            </section>
          ) : null}
        </section>

        <section
          className="surface-card absolute inset-0 flex h-full flex-col overflow-hidden rounded-xl border-2 border-border bg-accent-soft shadow-[5px_6px_0_0_var(--border)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          aria-hidden={!flipped}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label={`Show profile summary for ${candidate.name}`}
            aria-pressed={flipped}
            tabIndex={flipped ? 0 : -1}
            onClick={() => setFlipped(false)}
            onKeyDown={(event) => handleFlipKeyDown(event, false)}
          />
          <div className="h-1.5 shrink-0 bg-primary" aria-hidden />

          <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-caption">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  AI Match insight
                </p>
                <h2 className="mt-2 text-card-title">{insight.verdict}</h2>
              </div>
              <span className="rounded-full border bg-highlight-soft px-3 py-1 text-sm font-semibold tabular-nums text-foreground">
                {matchScore}%
              </span>
            </div>

            <div className="mt-5">
              <p className="text-caption">Why this match</p>
              <ul className="mt-3 space-y-3">
                {insight.reasons.map((reason, index) => (
                  <li key={`${index}-${reason}`} className="flex gap-2.5 text-meta">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="line-clamp-2">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-lg border bg-surface-2 p-3.5">
              <p className="flex items-center gap-2 text-caption">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                Screening note
              </p>
              <p className="mt-1.5 text-meta leading-relaxed">
                {insight.caution}
              </p>
            </div>

            {insight.skills.length ? (
              <div className="mt-4">
                <p className="text-caption">Matched strengths</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {insight.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto flex justify-center pb-3 pt-5">
              <Button
                asChild
                size="sm"
                className="pointer-events-auto relative z-20"
              >
                <Link
                  href={`/employer/candidates/${candidate.id}`}
                  aria-label={`View ${candidate.name}'s full profile`}
                  tabIndex={flipped ? 0 : -1}
                >
                  View full profile
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        </div>
      </div>
    </article>
  );
}
