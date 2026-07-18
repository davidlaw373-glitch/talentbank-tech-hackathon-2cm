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
  employerCandidates,
  employerInterviews,
  employerJobs,
  employerProfile,
} from "@/data/employer";
import type {
  CandidateStage,
  EmployerCandidate,
  EmployerInterview,
  InterviewStatus,
} from "@/types/employer";
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

const STAGES: CandidateStage[] = [
  "New",
  "Screening",
  "Shortlisted",
  "Interviewing",
  "Offer",
  "Hired",
];

const STAGE_ADVANCE: Record<CandidateStage, CandidateStage | null> = {
  New: "Screening",
  Screening: "Shortlisted",
  Shortlisted: "Interviewing",
  Interviewing: "Offer",
  Offer: "Hired",
  Hired: null,
  Rejected: null,
};

function stageTone(stage: CandidateStage) {
  switch (stage) {
    case "New":
      return { variant: "outline" as const };
    case "Screening":
      return { variant: "secondary" as const };
    case "Shortlisted":
      return { variant: "secondary" as const };
    case "Interviewing":
      return { variant: "default" as const };
    case "Offer":
      return { variant: "default" as const };
    case "Hired":
      return { variant: "default" as const };
    case "Rejected":
      return { variant: "destructive" as const };
  }
}

function interviewActionLabel(status: InterviewStatus) {
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

function priorityOrder(status: InterviewStatus) {
  if (status === "Pending confirmation") return 0;
  if (status === "Reschedule requested") return 1;
  if (status === "Scheduled") return 2;
  if (status === "Completed") return 3;
  return 4;
}

export default function EmployerDashboardPage() {
  const { push } = useToast();

  const liveJobs = employerJobs.filter((j) => j.status === "Live");
  const totalCandidates = employerCandidates.filter(
    (c) => c.stage !== "Rejected",
  ).length;

  const recentApplicants: EmployerCandidate[] = [...employerCandidates]
    .sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1))
    .slice(0, 5);

  const upcomingInterviews: EmployerInterview[] = [...employerInterviews]
    .sort((a, b) => priorityOrder(a.status) - priorityOrder(b.status))
    .slice(0, 3);

  const pipelineCounts = STAGES.map((stage) => ({
    stage,
    count: employerCandidates.filter((c) => c.stage === stage).length,
  }));

  const onPostJob = () => {
    push({
      title: "New job draft opened",
      description: "Fill in the basics and publish when you're ready.",
      tone: "info",
    });
  };

  // Promoted next-action CTAs — these are the highest-priority, time-sensitive
  // items the user should see before scanning stats.
  const recentApplicant = recentApplicants[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Employer dashboard
        </p>
        <PageHeading
          title={`Welcome back, ${employerProfile.companyName}`}
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
      {recentApplicant ? (
        <Card className="lift-on-hover">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-sm font-medium">
                Review {recentApplicant.name}&apos;s application for{" "}
                {recentApplicant.appliedFor}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {recentApplicant.matchScore}% match · just applied
              </p>
            </div>
            <Button asChild>
              <Link href={`/employer/candidates/${recentApplicant.id}`}>
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
            value: liveJobs.length,
            icon: Briefcase,
            delta: "Live postings",
          },
          {
            label: "Active candidates",
            value: employerProfile.activeCandidates,
            icon: Users,
            delta: "Across all roles",
          },
          {
            label: "Hires this quarter",
            value: employerProfile.hiresThisQuarter,
            icon: Sparkles,
            delta: "Q3 2026",
          },
          {
            label: "Avg days to hire",
            value: employerProfile.avgTimeToHire,
            icon: Clock,
            delta: "Days, last 90 days",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="lift-on-hover">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
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
          <div
            aria-label={`Pipeline distribution across ${STAGES.length} stages: ${pipelineCounts
              .map((r) => `${r.stage} ${r.count}`)
              .join(", ")}`}
            className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
          >
            {pipelineCounts.map((row) => {
              const pct =
                totalCandidates === 0
                  ? 0
                  : Math.round((row.count / totalCandidates) * 100);
              return (
                <span
                  key={row.stage}
                  aria-hidden
                  className="h-full bg-chart-1 first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {pipelineCounts.map((row) => (
              <li
                key={row.stage}
                className="flex items-center gap-1.5"
              >
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {row.count}
                </span>
                <span>{row.stage}</span>
              </li>
            ))}
          </ul>
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
            {recentApplicants.map((c) => (
              <RecentApplicantRow key={c.id} candidate={c} />
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
            {upcomingInterviews.map((i) => (
              <UpcomingInterviewRow key={i.id} interview={i} />
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
                    {job.applicants}
                  </span>
                  <small className="text-muted-foreground">applicants</small>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentApplicantRow({ candidate }: { candidate: EmployerCandidate }) {
  const { push } = useToast();
  const [stage, setStage] = useState<CandidateStage>(candidate.stage);
  const next = STAGE_ADVANCE[stage];

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!next) return;
    setStage(next);
    push({
      title: `Moved ${candidate.name} to ${next}`,
      description: `Pipeline updated for ${candidate.appliedFor}.`,
      tone: "success",
    });
  };

  return (
    <Link
      href={`/employer/candidates/${candidate.id}`}
      className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent-soft"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {candidate.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{candidate.name}</p>
          <small className="block truncate text-muted-foreground">
            {candidate.appliedFor}
          </small>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline">{candidate.matchScore}% match</Badge>
        <Badge variant={stageTone(stage).variant}>{stage}</Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          disabled={!next || stage === "Rejected"}
          aria-label={
            next ? `Move ${candidate.name} to ${next}` : "Already at final stage"
          }
        >
          Move
          <ArrowRight />
        </Button>
      </div>
    </Link>
  );
}

function UpcomingInterviewRow({ interview }: { interview: EmployerInterview }) {
  const { push } = useToast();
  const [status, setStatus] = useState<InterviewStatus>(interview.status);

  const onAction = () => {
    push({
      title: `${interviewActionLabel(status)} ${interview.candidateName}`,
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
      title: `Rescheduled ${interview.candidateName}`,
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
          {interview.candidateInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{interview.candidateName}</p>
          <small className="block truncate text-muted-foreground">
            {interview.role} · {interview.type}
          </small>
          <small className="block truncate text-muted-foreground">
            {interview.scheduledFor} · {interview.duration} min
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
