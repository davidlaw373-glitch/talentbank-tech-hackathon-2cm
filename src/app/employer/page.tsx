"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import {
  getEmployerCandidateRows,
  getEmployerInterviewRows,
  getEmployerStats,
} from "@/lib/data-helpers";
import { get as getEmployer } from "@/data/employers";
import { getByEmployer as getJobsByEmployer, getApplicantCount } from "@/data/jobs";
import {
  APPLICATION_STAGES,
  NEXT_STAGE,
  type ApplicationStage,
} from "@/types/application";
import type { EmployerInterviewRow } from "@/lib/data-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import { cn } from "@/lib/utils";

const DEMO_EMPLOYER_ID = 1;

function stageTone(stage: ApplicationStage) {
  switch (stage) {
    case "Applied":
      return { variant: "outline" as const };
    case "Screening":
    case "Interview":
      return { variant: "secondary" as const };
    case "Offer":
    case "Hired":
      return { variant: "default" as const };
  }
}

function interviewActionLabel(
  status: EmployerInterviewRow["interview"]["status"],
) {
  switch (status) {
    case "Scheduled":
      return "Join";
    case "Pending confirmation":
      return "Confirm";
    case "Reschedule requested":
      return "Reschedule";
    case "Completed":
      return "Notes";
    case "Cancelled":
      return "View";
  }
}

function priorityOrder(
  status: EmployerInterviewRow["interview"]["status"],
) {
  if (status === "Pending confirmation") return 0;
  if (status === "Reschedule requested") return 1;
  if (status === "Scheduled") return 2;
  if (status === "Completed") return 3;
  return 4;
}

export default function EmployerDashboardPage() {
  const { push } = useToast();

  const employer = getEmployer(DEMO_EMPLOYER_ID);
  const candidateRows = getEmployerCandidateRows(DEMO_EMPLOYER_ID);
  const interviewRows = getEmployerInterviewRows(DEMO_EMPLOYER_ID);
  const stats = getEmployerStats(DEMO_EMPLOYER_ID);
  const jobs = getJobsByEmployer(DEMO_EMPLOYER_ID);

  const liveJobs = jobs.filter((j) => j.status === "Live");
  const totalCandidates = candidateRows.filter((r) => !r.app.rejected).length;

  const recentApplicants = candidateRows
    .slice()
    .sort((a, b) => (a.app.appliedDate < b.app.appliedDate ? 1 : -1))
    .slice(0, 5);

  const upcomingInterviews = interviewRows
    .slice()
    .sort(
      (a, b) =>
        priorityOrder(a.interview.status) - priorityOrder(b.interview.status),
    )
    .slice(0, 3);

  const pipelineCounts = APPLICATION_STAGES.map((stage) => ({
    stage,
    count: candidateRows.filter((r) => r.app.stage === stage).length,
  }));

  const largestPipelineCount = Math.max(
    ...pipelineCounts.map((row) => row.count),
  );

  const onPostJob = () => {
    push({
      title: "New job draft opened",
      description: "Fill in the basics and publish when you're ready.",
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Employer dashboard
        </p>
        <PageHeading
          title={`Welcome back, ${employer?.companyName ?? "there"}`}
          description="A snapshot of your hiring funnel today, the candidates moving, and what to do next."
          action={
            <Button onClick={onPostJob}>
              <Plus />
              Post a job
            </Button>
          }
        />
      </section>

      {/* Next-action prompt */}
      {recentApplicants[0] ? (
        <Card className="lift-on-hover">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-sm font-medium">
                Review {recentApplicants[0].candidate.name}&apos;s application for{" "}
                {recentApplicants[0].job.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {recentApplicants[0].matchScore}% match · just applied
              </p>
            </div>
            <Button asChild>
              <Link
                href={`/employer/candidates/${recentApplicants[0].candidate.id}`}
              >
                Review application
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats */}
      <section
        aria-label="Hiring metrics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {[
          {
            label: "Open roles",
            value: stats.openRoles,
            icon: Briefcase,
            delta: "Live postings",
            swatch: "bg-accent-soft text-foreground",
          },
          {
            label: "Active candidates",
            value: stats.activeCandidates,
            icon: Users,
            delta: "Across all roles",
            swatch: "bg-chart-1/20 text-foreground",
          },
          {
            label: "Hires this quarter",
            value: stats.hiresThisQuarter,
            icon: Sparkles,
            delta: "Q3 2026",
            swatch: "bg-chart-2/20 text-foreground",
          },
          {
            label: "Avg days to hire",
            value: stats.avgTimeToHire,
            icon: Clock,
            delta: "Days, last 90 days",
            swatch: "bg-highlight-soft text-foreground",
          },
        ].map((s) => {
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

      {/* Pipeline */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Target className="h-4 w-4" aria-hidden />
                Hiring pipeline
              </h2>
            </CardTitle>
            <CardDescription>
              Where candidates sit across {totalCandidates} active
              applications.
            </CardDescription>
          </div>
          <Badge variant="secondary">{totalCandidates} active</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipelineCounts.map((row) => {
            const pct =
              largestPipelineCount === 0
                ? 0
                : Math.round((row.count / largestPipelineCount) * 100);
            return (
              <div key={row.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.stage}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.count} candidates
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    aria-hidden
                    className="h-full rounded-full bg-foreground/80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Lists */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent applicants */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden />
                  Recent applicants
                </h2>
              </CardTitle>
              <CardDescription>
                The five most recent candidates across all live roles.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/employer/candidates">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplicants.map((r) => (
              <RecentApplicantRow key={r.candidate.id} row={r} />
            ))}
          </CardContent>
        </Card>

        {/* Upcoming interviews */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Upcoming interviews
                </h2>
              </CardTitle>
              <CardDescription>
                Next three sessions, prioritised by status.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/employer/interviews">
                All interviews
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.map((r) => (
              <UpcomingInterviewRow key={r.interview.id} row={r} />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Open roles */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden />
                Open roles
              </h2>
            </CardTitle>
            <CardDescription>
              Live roles only — draft and paused jobs live in job management.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/jobs">
              Manage jobs
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {liveJobs.map((job) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}`}
              className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent-soft"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{job.title}</p>
                <small className="block truncate text-muted-foreground">
                  {job.department} · {job.location}
                </small>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-base font-semibold tabular-nums">
                    {getApplicantCount(job.id)}
                  </span>
                  <small className="text-muted-foreground">applicants</small>
                </div>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentApplicantRow({
  row,
}: {
  row: ReturnType<typeof getEmployerCandidateRows>[number];
}) {
  const { push } = useToast();
  const [stage, setStage] = useState<ApplicationStage>(row.app.stage);
  const next = NEXT_STAGE[stage];

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!next) return;
    setStage(next);
    push({
      title: `Moved ${row.candidate.name} to ${next}`,
      description: `Pipeline updated for ${row.job.title}.`,
      tone: "success",
    });
  };

  return (
    <Link
      href={`/employer/candidates/${row.candidate.id}`}
      className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent-soft"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {row.candidate.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.candidate.name}</p>
          <small className="block truncate text-muted-foreground">
            {row.job.title}
          </small>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline">{row.matchScore}% match</Badge>
        <Badge variant={stageTone(stage).variant}>{stage}</Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          disabled={!next || row.app.rejected}
          aria-label={
            next ? `Move ${row.candidate.name} to ${next}` : "Already at final stage"
          }
        >
          Move
          <ArrowRight />
        </Button>
      </div>
    </Link>
  );
}

function UpcomingInterviewRow({ row }: { row: EmployerInterviewRow }) {
  const { push } = useToast();
  const [status, setStatus] = useState(row.interview.status);

  const onAction = () => {
    push({
      title: `${interviewActionLabel(status)} ${row.candidate.name}`,
      description:
        status === "Scheduled"
          ? "Joining link will open in a new tab."
          : status === "Reschedule requested"
            ? "Pick a new slot to propose to the candidate."
            : status === "Pending confirmation"
              ? "A confirmation email will be sent."
              : status === "Completed"
                ? "Opening the scorecard for this interview."
                : "Opening interview details.",
      tone: "info",
    });
  };

  const onReschedule = () => {
    setStatus("Scheduled");
    push({
      title: `Rescheduled ${row.candidate.name}`,
      description: "New slot proposed — candidate will be notified.",
      tone: "success",
    });
  };

  const isJoin = status === "Scheduled";
  const isReschedule = status === "Reschedule requested";

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {row.candidate.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.candidate.name}</p>
          <small className="block truncate text-muted-foreground">
            {row.job.title} · {row.interview.type}
          </small>
          <small className="block truncate text-muted-foreground">
            {row.interview.scheduledFor} · {row.interview.duration} min
          </small>
        </div>
      </div>
      {isReschedule ? (
        <Button variant="outline" size="sm" onClick={onReschedule}>
          <RefreshCcw />
          Reschedule
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onAction}>
          {isJoin ? <Play /> : null}
          {interviewActionLabel(status)}
        </Button>
      )}
    </div>
  );
}
