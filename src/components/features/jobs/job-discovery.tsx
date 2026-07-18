"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  Filter,
  MapPin,
  Search,
} from "lucide-react";

import { jobs } from "@/data/jobs";
import { EmptyState } from "@/components/common/empty-state";
import { MatchBadge } from "@/components/common/match-badge";
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

type SortKey = "match" | "recent";

export function JobDiscovery() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [sort, setSort] = useState<SortKey>("match");

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

  const stats = useMemo(() => {
    const avg = Math.round(
      jobs.reduce((acc, j) => acc + j.matchScore, 0) / jobs.length
    );
    const strong = jobs.filter((j) => j.matchScore >= 90).length;
    return { total: jobs.length, avg, strong };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Job discovery
          </p>
          <h1>Discover jobs</h1>
          <p className="text-muted-foreground">
            {stats.total} open roles · {stats.avg}% average match ·{" "}
            {stats.strong} strong fit{stats.strong === 1 ? "" : "s"} for your
            profile
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/candidate/applications">
            Track applications
            <ArrowRight />
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="job-search"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="work-mode-filter"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Work mode
              </label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="work-mode-filter" className="w-44">
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sort"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Sort by
              </label>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortKey)}
              >
                <SelectTrigger id="sort" className="w-44">
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
          <EmptyState
            icon={Filter}
            title="No roles match those filters"
            description="Try a broader search or change the work mode."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredJobs.map((job) => {
              return (
                <Link
                  key={job.id}
                  href={`/candidate/jobs/${job.id}`}
                  aria-label={`${job.title} at ${job.company}, ${job.matchScore} percent match`}
                  className="lift-on-hover block rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold tracking-tight">
                          {job.title}
                        </h3>
                        <MatchBadge score={job.matchScore} showScore={false} />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                        {job.company}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {job.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {job.matchingSkills.slice(0, 4).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-[11px]"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.missingSkills.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[11px] opacity-70"
                          >
                            + {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {job.posted}
                        </span>
                        <span className="flex items-center gap-1 text-foreground/70">
                          View role
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </span>
                      </div>
                    </div>
                    {/* Single score readout — the badge above carries the
                        fit label, this carries the number. */}
                    <div
                      className="flex flex-col items-end gap-1"
                      aria-hidden
                    >
                      <span className="text-3xl font-semibold tabular-nums leading-none">
                        {job.matchScore}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Match
                      </span>
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
