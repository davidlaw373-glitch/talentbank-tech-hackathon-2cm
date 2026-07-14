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
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { jobs } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchTone } from "@/lib/status";

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
            Explore opportunities matched to your skills, goals, and live
            market data.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/candidate/applications">
            Track applications
            <ArrowRight />
          </Link>
        </Button>
      </header>

      {/* Stat row */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Open roles",
            value: stats.total,
            icon: Briefcase,
            delta: "Across all filters",
          },
          {
            label: "Average match",
            value: `${stats.avg}%`,
            icon: Sparkles,
            delta: "Based on your profile",
          },
          {
            label: "Strong fits",
            value: stats.strong,
            icon: TrendingUp,
            delta: "Match score 90+",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="lift-on-hover">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.delta}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="work-mode-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Filter
                  className="h-5 w-5 text-primary"
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
                <Link
                  key={job.id}
                  href={`/candidate/jobs/${job.id}`}
                  className="lift-on-hover block rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:bg-accent"
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
                        <Badge variant={tone.variant}>{tone.label}</Badge>
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
                            className="text-[10px]"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.missingSkills.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px] opacity-70"
                          >
                            + {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden />
                            {job.posted}
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <span>
                            View
                            <ArrowRight />
                          </span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-3xl font-semibold tabular-nums leading-none">
                        {job.matchScore}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Match
                      </span>
                      <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${job.matchScore}%` }}
                        />
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
