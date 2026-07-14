import Link from "next/link";
import {
  Briefcase,
  CalendarClock,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Building2,
  Clock,
  TrendingUp,
  GraduationCap,
  FolderGit2,
  FileText,
} from "lucide-react";

import { applications } from "@/data/applications";
import { candidateProfile, recentActivity } from "@/data/candidate";
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
import { cn } from "@/lib/utils";
import { matchTone, VERIFICATION_TONE } from "@/lib/status";

type ProgressItem = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const PROGRESS_ITEMS: ProgressItem[] = [
  {
    id: "basics",
    label: "Basic info",
    hint: "Name, summary and contact details",
    done: true,
    icon: FileText,
  },
  {
    id: "skills",
    label: "Skills",
    hint: "5 skills added",
    done: true,
    icon: Sparkles,
  },
  {
    id: "experience",
    label: "Work experience",
    hint: "1 role on file",
    done: true,
    icon: Briefcase,
  },
  {
    id: "education",
    label: "Education",
    hint: "University of Malaya · BSc CS",
    done: true,
    icon: GraduationCap,
  },
  {
    id: "projects",
    label: "Projects & portfolio",
    hint: "Add a project to lift your match scores",
    done: false,
    icon: FolderGit2,
  },
  {
    id: "verification",
    label: "Verified credentials",
    hint: "1 document pending review",
    done: false,
    icon: BadgeCheck,
  },
];

const STATS = [
  {
    label: "Active applications",
    value: applications.length,
    icon: Briefcase,
    delta: "+2 this week",
    tone: "positive" as const,
  },
  {
    label: "Interview pipeline",
    value: applications.filter((a) => a.status === "Interview").length,
    icon: CalendarClock,
    delta: "1 next week",
    tone: "positive" as const,
  },
  {
    label: "Profile strength",
    value: candidateProfile.profileCompletion,
    icon: Sparkles,
    suffix: "%",
    delta: "Top 18% of candidates",
    tone: "positive" as const,
    hero: true,
  },
  {
    label: "Average match",
    value: Math.round(
      jobs.reduce((acc, j) => acc + j.matchScore, 0) / jobs.length
    ),
    icon: TrendingUp,
    suffix: "%",
    delta: "Across 3 open roles",
    tone: "neutral" as const,
  },
];

export function DashboardOverview() {
  const total = PROGRESS_ITEMS.length;
  const done = PROGRESS_ITEMS.filter((i) => i.done).length;
  const remaining = PROGRESS_ITEMS.filter((i) => !i.done);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        aria-labelledby="dashboard-welcome"
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="space-y-2">
          <p
            id="dashboard-eyebrow"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
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
            <Card
              key={s.label}
              className={cn(
                "lift-on-hover",
                s.hero && "ring-1 ring-primary/20"
              )}
            >
              <CardContent className="space-y-3 p-5 sm:p-6">
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
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Profile progress + Verification */}
      <section
        aria-label="Profile and verification status"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Profile progress — spans 2 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Profile progress
                </h2>
              </CardTitle>
              <CardDescription>
                Complete each section to keep your profile accurate and your
                matches strong.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {done} of {total} · {Math.round((done / total) * 100)}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {Math.round((done / total) * 100)}% complete
                </span>
                <span className="text-muted-foreground">
                  {total - done} section{total - done === 1 ? "" : "s"} to go
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary animate-progress"
                  style={{
                    width: `${Math.round((done / total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist — matches the actual profile page sections */}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROGRESS_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent",
                      item.done && "opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        item.done
                          ? "bg-primary text-primary-foreground"
                          : "border border-foreground/30 text-foreground/50"
                      )}
                      aria-hidden
                    >
                      {item.done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          item.done && "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {remaining.length > 0 && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    Next: add {remaining[0].label.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {remaining[0].hint}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/candidate/profile">
                    Continue
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Verification
                </h2>
              </CardTitle>
              <CardDescription>
                Credentials issued by your universities.
              </CardDescription>
            </div>
            {(() => {
              const v = VERIFICATION_TONE[candidateProfile.verificationStatus];
              const VIcon = v.icon;
              return (
                <Badge variant={v.variant} className="gap-1">
                  <VIcon className="h-3 w-3" aria-hidden />
                  {v.label}
                </Badge>
              );
            })()}
          </CardHeader>
          <CardContent className="space-y-3">
            {candidateProfile.evidence.map((e) => {
              const ev = VERIFICATION_TONE[e.status];
              const EIcon = ev.icon;
              return (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.type}</p>
                  </div>
                  <Badge variant={ev.variant} className="gap-1">
                    <EIcon className="h-3 w-3" aria-hidden />
                    {ev.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Application pipeline */}
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {applications.map((app) => {
            const completed = app.timeline.filter((t) => t.complete).length;
            const totalSteps = app.timeline.length;
            const pct = Math.round((completed / totalSteps) * 100);
            // First index with complete=false is the "current" stage
            const currentIndex = app.timeline.findIndex((t) => !t.complete);
            return (
              <Card key={app.id} className="lift-on-hover">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Building2
                            className="h-4 w-4"
                            aria-hidden
                          />
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
                    </div>
                    <Badge
                      variant={
                        app.status === "Interview" ? "secondary" : "outline"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>

                  {/* Stage + next action */}
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Current stage
                    </p>
                    <p className="mt-1 text-sm font-medium">{app.stage}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {app.nextAction}
                    </p>
                  </div>

                  {/* Timeline stepper */}
                  <div>
                    <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {completed}/{totalSteps} stages
                      </span>
                      <span className="font-medium tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <ol className="space-y-2.5">
                      {app.timeline.map((step, i) => {
                        const isCurrent = i === currentIndex;
                        return (
                          <li
                            key={`${app.id}-${i}`}
                            className="flex items-start gap-3"
                          >
                            <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                              {isCurrent && (
                                <span
                                  className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring-soft"
                                  aria-hidden
                                />
                              )}
                              <span
                                className={cn(
                                  "relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                                  step.complete &&
                                    "bg-primary text-primary-foreground",
                                  isCurrent &&
                                    "border-2 border-primary bg-background text-primary animate-pulse-soft",
                                  !step.complete &&
                                    !isCurrent &&
                                    "border border-border bg-background text-muted-foreground"
                                )}
                                aria-label={
                                  step.complete
                                    ? `${step.label} — complete`
                                    : isCurrent
                                      ? `${step.label} — in progress`
                                      : `${step.label} — upcoming`
                                }
                              >
                                {step.complete ? (
                                  <Check className="h-3 w-3" />
                                ) : isCurrent ? (
                                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                                ) : (
                                  i + 1
                                )}
                              </span>
                            </span>
                            <div className="-mt-0.5 flex-1">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  step.complete && "text-muted-foreground line-through",
                                  isCurrent && "text-primary",
                                  !step.complete &&
                                    !isCurrent &&
                                    "text-muted-foreground"
                                )}
                              >
                                {step.label}
                                {isCurrent && (
                                  <span className="ml-2 text-xs font-medium text-primary">
                                    · In progress
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {step.date}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </section>

      {/* Recommended jobs + recent activity */}
      <section
        aria-label="Recommended jobs and recent activity"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Recommended jobs — spans 2 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2>Recommended for you</h2>
              </CardTitle>
              <CardDescription>
                Based on your skills, goals, and live market data.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/candidate/jobs">
                See all
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.slice(0, 3).map((job) => {
              const tone = matchTone(job.matchScore);
              return (
                <Link
                  key={job.id}
                  href={`/candidate/jobs/${job.id}`}
                  aria-label={`${job.title} at ${job.company}, ${tone.label}, ${job.matchScore} percent match`}
                  className="lift-on-hover block cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Briefcase className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {job.title}
                        </p>
                        <Badge variant={tone.variant} className="shrink-0">
                          {tone.label}
                        </Badge>
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
                      {/* Match breakdown */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {job.matchingSkills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                        {job.matchingSkills.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{job.matchingSkills.length - 4} more
                          </span>
                        )}
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
                    </div>
                    <div
                      className="flex flex-col items-end gap-0"
                      aria-label={`Match score ${job.matchScore} percent`}
                    >
                      <span
                        aria-hidden
                        className="text-3xl font-semibold tabular-nums leading-none"
                      >
                        {job.matchScore}
                      </span>
                      <span
                        aria-hidden
                        className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Match
                      </span>
                      {/* Tiny bar */}
                      <div
                        aria-hidden
                        className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted"
                      >
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
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Recent activity</h2>
            </CardTitle>
            <CardDescription>Your latest CareerOS updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="relative space-y-4">
              {recentActivity.map((activity, i) => {
                const isLatest = i === 0;
                const isLast = i === recentActivity.length - 1;
                return (
                  <li
                    key={activity.message}
                    className="relative flex items-start gap-3"
                  >
                    {/* Connector line */}
                    {!isLast && (
                      <span
                        aria-hidden
                        className="absolute left-[3px] top-3 h-full w-px bg-border"
                      />
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 mt-1.5 flex h-2 w-2 shrink-0 rounded-full",
                        isLatest ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    <div>
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
