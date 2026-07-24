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
    hint: "Add skills to strengthen your matches",
    done: false,
    icon: Sparkles,
  },
  {
    id: "experience",
    label: "Work experience",
    hint: "Add a role to lift your match scores",
    done: false,
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
  const isProfileComplete = total > 0 && done === total;
  const progressPct = Math.round((done / total) * 100);
  // Red → orange → green as the profile fills up, drawn from the chart
  // palette so it matches the segmented bars in "Your application pipeline"
  // (chart-1 for complete, chart-2 for the active stage, chart-4 for low).
  const progressFillClass =
    progressPct < 33
      ? "bg-chart-4"
      : progressPct < 66
        ? "bg-chart-2"
        : "bg-chart-1";

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
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-base font-semibold">
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
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-base font-semibold">
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
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="space-y-3 p-5 sm:p-6">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    s.swatch,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {s.value}
                  {s.suffix ?? ""}
                </div>
                <div>
                  <p className="text-base font-semibold tracking-tight">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.delta}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Recent activity — placed directly after the stats so it is visible the moment the candidate signs in */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-card-title">Recent activity</h2>
            <p className="text-sm text-muted-foreground">
              Your latest CareerOS updates, in one feed.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/candidate/notifications">
              View all
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <ol className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="relative flex items-start gap-3"
                >
                  <span
                    className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-foreground/60"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-snug">
                      {entry.body}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Profile progress + Verification */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-x-0">
        {/* Profile progress — smoothly collapses once the checklist hits 100% */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-700 ease-out",
            isProfileComplete
              ? "pointer-events-none max-h-0 -translate-y-2 opacity-0 lg:mr-0 lg:flex-[0_1_0px]"
              : "max-h-[2000px] translate-y-0 opacity-100 lg:mr-4 lg:flex-[2_1_0%]"
          )}
          aria-hidden={isProfileComplete}
        >
          <Card className="h-full">
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
                    {progressPct}% complete
                  </span>
                  <span className="text-muted-foreground">
                    {total - done} section{total - done === 1 ? "" : "s"} to go
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width,background-color] duration-700 ease-out",
                      progressFillClass,
                    )}
                    style={{
                      width: `${progressPct}%`,
                    }}
                    aria-label={`${progressPct}% complete`}
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
                        "flex items-center gap-3 rounded-lg border bg-card p-3",
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
                            "truncate text-base font-semibold",
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
        </div>

        {/* Verification — naturally expands to fill the row as Profile progress collapses */}
        <Card className="lg:flex-1">
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
                  <p className="truncate text-base font-semibold">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.type}</p>
                </div>
                <Badge
                  variant={e.status === "Verified" ? "secondary" : "outline"}
                  className={
                    // The secondary variant bakes in `hover:bg-secondary/80`,
                    // which makes the Verified badge look interactive when
                    // it isn't. Override the hover so the colour is stable.
                    e.status === "Verified" ? "hover:bg-secondary" : undefined
                  }
                >
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
            <h2 className="text-card-title">Your application pipeline</h2>
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
            return (
              <Card key={app.id}>
                <CardContent className="space-y-4 p-5 sm:p-6">
                  {/* Header — job identity and current stage at a glance. */}
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
                          <p className="truncate text-base font-semibold">
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
                      // The secondary variant bakes in `hover:bg-secondary/80`,
                      // which makes the "Interview" stage pill look
                      // interactive when it isn't. Override the hover so
                      // the colour is stable.
                      className={
                        app.stage === "Interview"
                          ? "hover:bg-secondary"
                          : undefined
                      }
                    >
                      {app.stage}
                    </Badge>
                  </div>

                  {/* Next action + view — paired so the user has the
                      what-to-do hint and the deep-link in one row. The
                      per-stage progress strip lives on the full
                      /candidate/applications page; we deliberately omit
                      it here to avoid duplicating that view. */}
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-surface-tint p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Next
                      </p>
                      <p className="mt-0.5 truncate text-sm">
                        {app.nextAction}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/candidate/applications/${app.id}`}>
                        View
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      </div>
  );
}
