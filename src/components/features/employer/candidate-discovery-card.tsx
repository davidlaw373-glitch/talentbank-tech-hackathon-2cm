"use client";

import { useState, type KeyboardEvent, type UIEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Maximize2,
  Minimize2,
  Sparkles,
  Star,
} from "lucide-react";

import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { JobCandidateMatchScore } from "@/types/match-score";
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
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function CandidateDiscoveryCard({
  row,
  match,
  starred,
  onToggleStar,
}: CandidateDiscoveryCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [signalExpanded, setSignalExpanded] = useState(false);
  const [signalScrollProgress, setSignalScrollProgress] = useState(0);
  const { candidate, job, matchScore, verification } = row;
  const displayedVerification =
    verification === "Verified" ? "Verified" : "None";
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
  const handleSignalScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollRange = scrollHeight - clientHeight;
    setSignalScrollProgress(
      scrollRange > 0 ? Math.round((scrollTop / scrollRange) * 100) : 0,
    );
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
          className="surface-card absolute inset-0 flex h-full flex-col overflow-hidden rounded-xl rounded-tl-3xl rounded-tr-3xl border-2 border-border shadow-[5px_6px_0_0_var(--border)] [backface-visibility:hidden]"
          aria-hidden={flipped}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-xl rounded-tl-3xl rounded-tr-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label={`Show AI insight for ${candidate.name}`}
            aria-pressed={flipped}
            tabIndex={flipped ? -1 : 0}
            onClick={() => {
              setSignalExpanded(false);
              setFlipped(true);
            }}
            onKeyDown={(event) => handleFlipKeyDown(event, true)}
          />
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
                  <Link
                    href={`/employer/candidates/${candidate.id}`}
                    aria-label={`View ${candidate.name}'s full profile`}
                    tabIndex={flipped ? -1 : 0}
                    className="group/profile pointer-events-auto relative z-20 block min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h2 className="truncate text-subheading underline-offset-4 group-hover/profile:underline group-focus-visible/profile:underline">
                        {candidate.name}
                      </h2>
                      {displayedVerification === "Verified" ? (
                        <span
                          role="img"
                          aria-label={`Verified verification for ${candidate.name}`}
                          title="Verified"
                          className="relative h-5 w-5 shrink-0"
                        >
                          <Image
                            src="/images/verified-badge-clean.png"
                            alt=""
                            width={20}
                            height={20}
                            unoptimized
                            className="block h-5 w-5"
                          />
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-meta underline-offset-4 group-hover/profile:underline group-focus-visible/profile:underline">
                      {candidate.title}
                    </p>
                  </Link>
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

            <div className="group relative mt-5 h-36 shrink-0 overflow-hidden rounded-lg border bg-surface-2 p-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto absolute right-2.5 top-2.5 z-20 h-8 w-8 min-h-8 min-w-8 rounded-md [&_svg]:size-3.5"
                aria-label={`Expand recent signal for ${candidate.name}`}
                aria-expanded={signalExpanded}
                title={`Expand recent signal for ${candidate.name}`}
                tabIndex={flipped ? -1 : 0}
                onClick={() => setSignalExpanded(true)}
              >
                <Maximize2 aria-hidden />
              </Button>
              <p className="pr-10 text-caption">Recent signal</p>
              <div
                role="region"
                aria-label={`Recent signal details for ${candidate.name}`}
                tabIndex={flipped ? -1 : 0}
                onScroll={handleSignalScroll}
                className={cn(
                  "pointer-events-auto mt-1.5 h-[5.25rem] overflow-y-auto pr-1 text-meta leading-relaxed focus-visible:outline-none",
                  SIGNAL_SCROLL_CLASSES,
                )}
              >
                <p className="pr-9 text-body font-medium leading-snug">
                  {latestExperience
                    ? `${latestExperience.role} at ${latestExperience.company}`
                    : "No recent role provided"}
                </p>
                <p className="mt-2">{getCandidateAchievement(row)}</p>
              </div>
              <div
                role="progressbar"
                aria-label={`${candidate.name} recent signal scroll position`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={signalScrollProgress}
                className="pointer-events-none absolute inset-x-3 bottom-2 h-2 overflow-hidden rounded-full bg-primary/20 opacity-0 shadow-inner transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                <span
                  className="block h-full rounded-r-full bg-primary transition-[width] duration-150"
                  style={{ width: `${Math.max(12, signalScrollProgress)}%` }}
                />
              </div>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-end">
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
          className="absolute inset-0 flex h-full flex-col overflow-hidden rounded-xl rounded-tl-3xl rounded-tr-3xl border-2 border-border bg-surface-tint text-card-foreground shadow-[5px_6px_0_0_var(--border)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          aria-hidden={!flipped}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-xl rounded-tl-3xl rounded-tr-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            aria-label={`Show profile summary for ${candidate.name}`}
            aria-pressed={flipped}
            tabIndex={flipped ? 0 : -1}
            onClick={() => setFlipped(false)}
            onKeyDown={(event) => handleFlipKeyDown(event, false)}
          />
          <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col p-5">
            <div className="flex min-h-16 shrink-0 items-start justify-between gap-4">
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

            <div className="mt-4 shrink-0">
              <p className="text-caption">Why this match</p>
              <ul className="mt-3 space-y-3">
                {insight.reasons.map((reason, index) => (
                  <li key={`${index}-${reason}`} className="flex gap-2.5 text-meta">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span data-slot="match-reason">{reason}</span>
                  </li>
                ))}
              </ul>
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

            <div className="mt-auto flex justify-center pb-5 pt-4">
              <Button
                asChild
                size="sm"
                className="pointer-events-auto relative z-20 w-full"
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
