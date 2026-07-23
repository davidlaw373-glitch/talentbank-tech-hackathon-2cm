"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarClock,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  Check,
  Building2,
  TrendingUp,
  GraduationCap,
  FolderGit2,
  FileText,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { getCandidateContext, getMatchScoresForCandidate } from "@/lib/data-helpers";
import { getActiveByCandidate } from "@/data/applications";
import { get as getJob } from "@/data/jobs";
import { getForCandidate as getActivityForCandidate } from "@/data/activity";
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

export function DashboardOverview() {
  const { push } = useToast();
  const [progressItems, setProgressItems] = useState(PROGRESS_ITEMS);

  // All derived from JSON at module load — single source of truth.
  const { candidate } = getCandidateContext(1);
  const applications = getActiveByCandidate(1);
  const allMatchScores = getMatchScoresForCandidate(1);
  const recentActivity = getActivityForCandidate(1);

  const STATS = [
    {
      label: "Active applications",
      value: applications.length,
      icon: Briefcase,
      delta: "+2 this week",
      swatch: "bg-accent-soft text-foreground",
    },
    {
      label: "Interview pipeline",
      value: applications.filter((a) => a.stage === "Interview").length,
      icon: CalendarClock,
      delta: "1 next week",
      swatch: "bg-highlight-soft text-foreground",
    },
    {
      label: "Profile strength",
      value: candidate.profileCompletion,
      icon: Sparkles,
      suffix: "%",
      delta: "Top 18% of candidates",
      swatch: "bg-chart-1/20 text-foreground",
    },
    {
      label: "Average match",
      value: (() => {
        if (allMatchScores.length === 0) return 0;
        const total = allMatchScores.reduce<number>(
          (acc, s) => acc + s.score,
          0,
        );
        return Math.round(total / allMatchScores.length);
      })(),
      icon: TrendingUp,
      suffix: "%",
      delta: `Across ${allMatchScores.length} open roles`,
      swatch: "bg-chart-2/20 text-foreground",
    },
  ];

  const total = progressItems.length;
  const done = progressItems.filter((item) => item.done).length;

  // Highest priority next-action: any application waiting on the user.
  const interview = applications.find((a) => a.stage === "Interview");
  const interviewJob = interview ? getJob(interview.jobId) : undefined;

  const toggleProgressItem = (id: string) => {
    const item = progressItems.find((progressItem) => progressItem.id === id);
    if (!item) return;
    setProgressItems((current) =>
      current.map((progressItem) =>
        progressItem.id === id
          ? { ...progressItem, done: !progressItem.done }
          : progressItem
      )
    );
    push({
      title: item.done ? "Checklist item reopened" : "Checklist item completed",
      description: item.label,
      tone: item.done ? "info" : "success",
    });
  };

  return (
    <div className="space-y-8">
      {/* Next-action prompt */}
      {interview ? (
        <Card className="lift-on-hover">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-sm font-medium">
                Prepare for your {interviewJob?.title ?? "upcoming"} interview
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {interview.stage} · {interview.nextAction}
              </p>
            </div>
            <Button asChild>
              <Link href={`/candidate/applications/${interview.id}`}>
                Open application
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="lift-on-hover">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-sm font-medium">
                Match your profile to 6 open roles
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Browse jobs that CareerOS scored against your skills.
              </p>
            </div>
            <Button asChild>
              <Link href="/candidate/jobs">
                Browse jobs
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="lift-on-hover">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    s.swatch,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {s.value}
                  {s.suffix ?? ""}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.delta}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Profile progress + Verification */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile progress — spans 2 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-card-title">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Profile progress
                </h2>
              </CardTitle>
              <CardDescription>
                Complete each section to keep your profile accurate and your
                matches strong.
              </CardDescription>
            </div>
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
                  key={done}
                  className="h-full rounded-full bg-chart-1 animate-progress-x"
                  style={{
                    width: `${Math.round((done / total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist — matches the actual profile page sections */}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {progressItems.filter((item) => !item.done).map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent-soft",
                      item.done && "opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        item.done
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground"
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
                    <Button
                      size="sm"
                      variant={item.done ? "secondary" : "outline"}
                      aria-pressed={item.done}
                      onClick={() => toggleProgressItem(item.id)}
                    >
                      {item.done ? "Completed" : "Mark complete"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-card-title">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Verification
                </h2>
              </CardTitle>
              <CardDescription>
                Credentials issued by your universities.
              </CardDescription>
            </div>
            <Badge variant="outline">{candidate.verificationStatus}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidate.evidence.map((e) => (
              <div
                key={e.name}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.type}</p>
                </div>
                <Badge variant={e.status === "Verified" ? "secondary" : "outline"}>
                  {e.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Application pipeline */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2>Your application pipeline</h2>
            <p className="text-sm text-muted-foreground">
              {applications.length} active · track each stage in one place.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/candidate/applications">
              View all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {applications.map((app) => {
            const job = getJob(app.jobId);
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
                            {job?.title ?? "Unknown role"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {job?.location ?? ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        app.stage === "Interview" ? "secondary" : "outline"
                      }
                    >
                      {app.stage}
                    </Badge>
                  </div>

                  {/* Stage + next action */}
                  <div className="rounded-lg border bg-surface-tint p-3">
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
                                  className="absolute inset-0 rounded-full border-2 border-foreground animate-pulse-ring-soft"
                                  aria-hidden
                                />
                              )}
                              <span
                                className={cn(
                                  "relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                                  step.complete &&
                                    "bg-foreground text-background",
                                  isCurrent &&
                                    "border-2 border-foreground bg-background text-foreground animate-pulse-soft",
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
                                  <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
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
                                  isCurrent && "text-foreground",
                                  !step.complete &&
                                    !isCurrent &&
                                    "text-muted-foreground"
                                )}
                              >
                                {step.label}
                                {isCurrent && (
                                  <span className="ml-2 text-xs font-medium text-foreground">
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
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/candidate/applications/${app.id}`}>
                      View application
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Recent activity</h2>
            </CardTitle>
            <CardDescription>Your latest CareerOS updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-3">
              {recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="relative flex items-start gap-3"
                >
                  <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-foreground/60" />
                  <div>
                    <p className="text-sm">{entry.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
