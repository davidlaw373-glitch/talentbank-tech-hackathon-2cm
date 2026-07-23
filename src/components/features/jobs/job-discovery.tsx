"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
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
import { jobs } from "@/data/jobs";
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

export function JobDiscovery() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortKey>("match");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const toggleSaved = (jobId: string) => {
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
    const list = jobs.filter((job) => {
      const matchesQuery =
        !q ||
        `${job.title} ${job.company} ${job.location}`
          .toLowerCase()
          .includes(q);
      const matchesMode = mode === "all" || job.workMode === mode;
      return matchesQuery && matchesMode;
    });
    if (sort === "match") {
      return [...list].sort((a, b) => b.matchScore - a.matchScore);
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
            <h2>
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
            {filteredJobs.map((job) => {
              const tone = matchTone(job.matchScore);
              return (
                <article
                  key={job.id}
                  className="lift-on-hover block rounded-xl border border-border/20 bg-card p-5 text-card-foreground transition-colors hover:bg-accent-soft"
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
                        <Badge variant={tone.variant}>{tone.label}</Badge>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                        {job.company}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.summary}
                      </p>
                      <JobMatchBreakdown
                        matchingSkills={job.matchingSkills}
                        missingSkills={job.missingSkills}
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
                        onClick={() => toggleSaved(job.id)}
                      >
                        {savedJobIds.has(job.id) ? (
                          <BookmarkCheck aria-hidden />
                        ) : (
                          <Bookmark aria-hidden />
                        )}
                        {savedJobIds.has(job.id) ? "Saved" : "Save"}
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/candidate/jobs/${job.id}`}>
                          View
                          <ArrowRight aria-hidden />
                        </Link>
                      </Button>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-3xl font-semibold tabular-nums leading-none">
                          {job.matchScore}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Match
                        </span>
                        <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-1"
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
