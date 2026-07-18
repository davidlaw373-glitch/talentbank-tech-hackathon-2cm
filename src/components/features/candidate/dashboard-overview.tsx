import Link from "next/link";
import {
  Briefcase,
  CalendarClock,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Building2,
  Clock,
  TrendingUp,
} from "lucide-react";

import { applications } from "@/data/applications";
import { candidateProfile } from "@/data/candidate";
import { jobs } from "@/data/jobs";
import { getProfileCompletion } from "@/lib/profile-completion";
import { ApplicationProgress } from "@/components/common/application-progress";
import { ApplicationStatusBadge } from "@/components/common/application-status-badge";
import { MatchBadge } from "@/components/common/match-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { matchTone } from "@/lib/status";

export function DashboardOverview() {
  const completion = getProfileCompletion(candidateProfile);

  // The single most urgent thing: the application furthest along that still
  // needs the candidate's attention (interview-stage beats earlier stages).
  const nextUp =
    applications.find((a) => a.status === "Interview") ?? applications[0];

  const STATS = [
    {
      label: "Active applications",
      value: applications.length,
      icon: Briefcase,
      delta: "+2 this week",
      tone: "positive" as const,
      href: "/candidate/applications",
    },
    {
      label: "Interview pipeline",
      value: applications.filter((a) => a.status === "Interview").length,
      icon: CalendarClock,
      delta: "1 next week",
      tone: "positive" as const,
      href: "/candidate/applications",
    },
    {
      label: "Profile strength",
      value: completion.pct,
      icon: Sparkles,
      suffix: "%",
      delta: "Top 18% of candidates",
      tone: "positive" as const,
      hero: true,
      href: "/candidate/profile",
    },
    {
      label: "Average match",
      value: Math.round(
        jobs.reduce((acc, j) => acc + j.matchScore, 0) / jobs.length
      ),
      icon: TrendingUp,
      suffix: "%",
      delta: `Across ${jobs.length} open roles`,
      tone: "neutral" as const,
      href: "/candidate/jobs",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        aria-labelledby="dashboard-welcome"
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 id="dashboard-welcome">
            Welcome back, {candidateProfile.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in your job search and what to
            do next.
          </p>
        </div>
        <Button asChild>
          <Link href="/candidate/jobs">
            Browse jobs
            <ArrowRight />
          </Link>
        </Button>
      </section>

      {/* Stats row */}
      <section
        aria-label="Career summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          const isPositive = s.tone === "positive";
          return (
            <Link
              key={s.label}
              href={s.href}
              aria-label={`${s.label}: ${s.value}${s.suffix ?? ""}`}
              className={cn(
                "group rounded-xl border bg-card text-card-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                s.hero && "ring-1 ring-primary/20"
              )}
            >
              <div className="space-y-3 p-5 sm:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {s.value}
                  {s.suffix ?? ""}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 flex items-center gap-1 text-xs",
                      isPositive
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {isPositive && (
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    )}
                    {s.delta}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Next up + profile completion */}
      <section
        aria-label="Next actions"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Next up — the one thing to do right now */}
        {nextUp && (
          <Card className="border-primary/30 bg-primary/5 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle>
                  <h2>Next up for you</h2>
                </CardTitle>
              </div>
              <CardDescription>
                The most important thing in your search right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{nextUp.jobTitle}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {nextUp.company} · {nextUp.stage}
                    </p>
                  </div>
                </div>
                <ApplicationStatusBadge status={nextUp.status} />
              </div>
              <p className="rounded-lg border bg-background p-3 text-sm">
                {nextUp.nextAction}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/candidate/applications/${nextUp.id}`}>
                    Review application
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/candidate/jobs/${nextUp.jobId}`}>
                    Re-read the role
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile completion — slim, links to profile for the real work */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Profile strength
              </h2>
            </CardTitle>
            <CardDescription>
              {completion.done} of {completion.total} sections complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium tabular-nums">
                  {completion.pct}%
                </span>
                <span className="text-muted-foreground">
                  {completion.total - completion.done} to go
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary animate-progress"
                  style={{ width: `${completion.pct}%` }}
                />
              </div>
            </div>
            {completion.next && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  Next: {completion.next.label.toLowerCase()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {completion.next.hint}
                </p>
              </div>
            )}
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/candidate/profile">
                Continue profile
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Application pipeline — compact segmented bars */}
      <section aria-labelledby="pipeline-heading" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="pipeline-heading">Your application pipeline</h2>
            <p className="text-sm text-muted-foreground">
              {applications.length} active · track each stage in one place.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/candidate/applications">
              View all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-sm font-medium">No active applications yet</p>
              <p className="text-sm text-muted-foreground">
                Browse open roles and apply to start tracking your progress
                here.
              </p>
              <Button asChild size="sm">
                <Link href="/candidate/jobs">
                  Find jobs
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/candidate/applications/${app.id}`}
                className="lift-on-hover block rounded-xl border bg-card text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`${app.jobTitle} at ${app.company}, ${app.status}`}
              >
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-4 w-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {app.jobTitle}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {app.company}
                        </p>
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {app.stage}
                    </span>
                    {" · "}
                    {app.nextAction}
                  </p>
                  <ApplicationProgress application={app} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recommended jobs */}
      <section aria-labelledby="recommended-heading" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="recommended-heading">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">
              Based on your skills, goals, and live market data.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/candidate/jobs">
              See all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {jobs.slice(0, 3).map((job) => {
            const tone = matchTone(job.matchScore);
            return (
              <Link
                key={job.id}
                href={`/candidate/jobs/${job.id}`}
                aria-label={`${job.title} at ${job.company}, ${tone.label}, ${job.matchScore} percent match`}
                className="lift-on-hover block rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {job.title}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {job.company} · {job.workMode}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {job.posted}
                      </span>
                    </div>
                    <div className="mt-3">
                      <MatchBadge score={job.matchScore} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
