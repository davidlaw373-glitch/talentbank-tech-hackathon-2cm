"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  Circle,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { applications } from "@/data/applications";
import type { Application } from "@/types/candidate";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPLICATION_STATUS_TONE } from "@/lib/status";
import { cn } from "@/lib/utils";

function ApplicationProgress({ application }: { application: Application }) {
  const completed = application.timeline.filter((t) => t.complete).length;
  const total = application.timeline.length;
  const pct = Math.round((completed / total) * 100);
  const currentIndex = application.timeline.findIndex((t) => !t.complete);
  const hasActive = currentIndex >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {completed} of {total} stages
          {hasActive && (
            <>
              {" · "}
              <span className="font-medium text-primary">
                Stage {currentIndex + 1} active
              </span>
            </>
          )}
        </span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="flex items-center gap-1">
        {application.timeline.map((step, i) => {
          const isComplete = step.complete;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              aria-label={
                isComplete
                  ? `${step.label} complete`
                  : isCurrent
                    ? `${step.label} in progress`
                    : `${step.label} upcoming`
              }
            >
              {isComplete && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-full rounded-full bg-primary",
                    i <= completed && "animate-progress-x"
                  )}
                  style={
                    i > completed
                      ? { width: 0 }
                      : { animationDelay: `${i * 80}ms` }
                  }
                />
              )}
              {isCurrent && (
                <>
                  <span className="absolute inset-y-0 left-0 w-full rounded-full bg-primary/30" />
                  <span className="animate-shimmer-bar pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-background/60 to-transparent" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ApplicationTracker() {
  const [tab, setTab] = useState<"active" | "all" | "archived">("active");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const active = applications.filter((a) => a.status !== "Offer").length;
    const interviews = applications.filter(
      (a) => a.status === "Interview"
    ).length;
    const offers = applications.filter((a) => a.status === "Offer").length;
    return { active, interviews, offers };
  }, []);

  const filtered = useMemo(() => {
    let list = applications;
    if (tab === "active") {
      list = list.filter((a) => a.status !== "Offer");
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tab, query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Applications
          </p>
          <h1>Your applications</h1>
          <p className="text-muted-foreground">
            See every job you&apos;ve applied to, where each one stands, and
            what to do next.
          </p>
        </div>
        <Button asChild>
          <Link href="/candidate/jobs">
            Find more jobs
            <ArrowRight />
          </Link>
        </Button>
      </header>

      {/* Stat row */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Active",
            value: stats.active,
            icon: Briefcase,
            tone: "secondary" as const,
          },
          {
            label: "Interviews",
            value: stats.interviews,
            icon: CalendarClock,
            tone: "secondary" as const,
          },
          {
            label: "Offers",
            value: stats.offers,
            icon: Sparkles,
            tone: "default" as const,
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
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role or company"
                className="pl-9"
                aria-label="Search applications"
              />
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Filter className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium">No applications match</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search or tab.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((app) => {
                const tone = APPLICATION_STATUS_TONE[app.status];
                const StatusIcon = tone.icon;
                return (
                  <li key={app.id}>
                    <Link
                      href={`/candidate/applications/${app.id}`}
                      className="lift-on-hover block rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2
                            className="h-5 w-5"
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold">
                              {app.jobTitle}
                            </p>
                            <Badge variant={tone.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" aria-hidden />
                              {tone.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2
                                className="h-3 w-3"
                                aria-hidden
                              />
                              {app.company}
                            </span>
                            <span>Applied {app.appliedDate}</span>
                            <span>· {app.stage}</span>
                          </div>
                          <div className="rounded-md border-l-2 border-primary/50 bg-muted/40 p-2.5 text-xs leading-relaxed">
                            <span className="font-semibold">Update: </span>
                            {app.update}
                          </div>
                          <ApplicationProgress application={app} />
                        </div>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
