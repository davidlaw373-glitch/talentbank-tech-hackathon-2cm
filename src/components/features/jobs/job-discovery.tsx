"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Clock,
  Filter,
  MapPin,
  Search,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { list as jobRows } from "@/data/jobs";
import { getForCandidate as getMatchScoresForCandidate } from "@/data/match-scores";
import { get as getEmployer } from "@/data/employers";
import { JobMatchBreakdown } from "@/components/features/jobs/job-match-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function matchTone(score: number) {
  if (score >= 90) return { label: "Strong fit", variant: "default" as const };
  if (score >= 80) return { label: "Good fit", variant: "secondary" as const };
  if (score >= 70) return { label: "Possible", variant: "outline" as const };
  return { label: "Stretch", variant: "outline" as const };
}

type SortKey = "match" | "recent";

const DEMO_CANDIDATE_ID = 1;

export function JobDiscovery() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortKey>("match");
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  const toggleSaved = (jobId: number) => {
    const isSaved = savedJobIds.has(jobId);
    setSavedJobIds((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    push({
      title: isSaved ? "Removed from saved" : "Saved",
      tone: isSaved ? "info" : "success",
    });
  };

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesByJobId = new Map(
      getMatchScoresForCandidate(DEMO_CANDIDATE_ID).map((s) => [
        s.jobId,
        s,
      ]),
    );
    const list = jobRows.flatMap((job) => {
      const score = matchesByJobId.get(job.id);
      const employer = getEmployer(job.employerId);
      const haystack =
        `${job.title} ${employer?.companyName ?? ""} ${job.location}`.toLowerCase();
      if (q && !haystack.includes(q)) return [];
      if (mode !== "all" && job.workMode !== mode) return [];
      return [{ job, score, employer }];
    });
    if (sort === "match") {
      return [...list].sort(
        (a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0),
      );
    }
    return list;
  }, [query, mode, sort]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label
                htmlFor="job-search"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="job-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Role, company, or location"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:w-[12rem]">
              <label
                htmlFor="work-mode-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Work mode
              </label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="work-mode-filter" className="w-full sm:w-[12rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All work modes</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="On-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:w-[12rem]">
              <label
                htmlFor="sort"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Sort by
              </label>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortKey)}
              >
                <SelectTrigger id="sort" className="w-full sm:w-[12rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best match</SelectItem>
                  <SelectItem value="recent">Most recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-card-title">
              {filteredJobs.length} role
              {filteredJobs.length === 1 ? "" : "s"} match
            </h2>
            <p className="text-sm text-muted-foreground">
              Ranked by AI match score for your profile.
            </p>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Filter
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-sm font-medium">No roles match those filters</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a broader search or change the work mode.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredJobs.map(({ job, score, employer }) => {
              const displayScore = score?.score ?? 0;
              const tone = matchTone(displayScore);
              return (
                <Link
                  key={job.id}
                  href={`/candidate/jobs/${job.id}`}
                  aria-label={`View ${job.title} at ${employer?.companyName ?? "Unknown company"}`}
                  className="group block rounded-xl border border-border/20 bg-card p-5 text-card-foreground outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Briefcase className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold tracking-tight">
                          {job.title}
                        </h3>
                        <Badge
                          variant={tone.variant}
                          // The default + secondary variants bake in a
                          // hover dim, which makes the informational
                          // "Strong fit" / "Good fit" pill look like a
                          // button. Cancel the hover so the colour is
                          // stable. Outline has no hover so it stays as
                          // the empty fallback.
                          className={
                            tone.variant === "default"
                              ? "hover:bg-primary"
                              : tone.variant === "secondary"
                                ? "hover:bg-secondary"
                                : undefined
                          }
                        >
                          {tone.label}
                        </Badge>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                        {employer?.companyName ?? "Unknown company"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.summary}
                      </p>
                      <JobMatchBreakdown
                        matchingSkills={score?.matchingSkills ?? []}
                        missingSkills={score?.missingSkills ?? []}
                        visibleCount={3}
                        missingVisibleCount={0}
                      />
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <Button
                        size="sm"
                        variant={savedJobIds.has(job.id) ? "default" : "outline"}
                        aria-pressed={savedJobIds.has(job.id)}
                        onClick={(e) => {
                          // The whole card is a link; keep the Save action independent.
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSaved(job.id);
                        }}
                      >
                        {savedJobIds.has(job.id) ? (
                          <BookmarkCheck aria-hidden />
                        ) : (
                          <Bookmark aria-hidden />
                        )}
                        {savedJobIds.has(job.id) ? "Saved" : "Save"}
                      </Button>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-4xl font-semibold tabular-nums leading-none">
                          {displayScore}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Match
                        </span>
                        <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-1"
                            style={{ width: `${displayScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
