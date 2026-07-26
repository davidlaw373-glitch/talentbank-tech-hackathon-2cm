"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Filter,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import { getByEmployer as getJobsByEmployer } from "@/data/jobs";
import type { Job, JobStatus } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import {
  JobEditorDialog,
  type JobEditorValues,
} from "@/components/features/employer/job-editor-dialog";
import { cn } from "@/lib/utils";
import pageStyles from "./page.module.css";

function statusVariant(status: JobStatus) {
  switch (status) {
    case "Live":
      return "default" as const;
    case "Draft":
      return "secondary" as const;
    case "Paused":
      return "outline" as const;
    case "Closed":
      return "destructive" as const;
  }
}

export default function EmployerJobsPage() {
  const { push } = useToast();
  const [jobs, setJobs] = useState<Job[]>(getJobsByEmployer(1));
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [pendingPause, setPendingPause] = useState<Job | null>(null);
  const [finalPause, setFinalPause] = useState<Job | null>(null);
  const [pendingClose, setPendingClose] = useState<Job | null>(null);
  const [finalClose, setFinalClose] = useState<Job | null>(null);

  const displayedJobs = useMemo(
    () => [...jobs].sort((a, b) => b.filledScore - a.filledScore),
    [jobs],
  );

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      live: jobs.filter((j) => j.status === "Live").length,
      draft: jobs.filter((j) => j.status === "Draft").length,
      paused: jobs.filter((j) => j.status === "Paused").length,
    };
  }, [jobs]);

  const onNewJob = () => {
    setNewJobOpen(true);
  };

  const onCreateJob = (values: JobEditorValues) => {
    const nextId = Math.max(0, ...jobs.map((job) => job.id)) + 1;
    const newJob: Job = {
      id: nextId,
      employerId: 1,
      ...values,
      status: "Draft",
      posted: "Just now",
      applicants: 0,
      filledScore: 0,
      responsibilities: [],
      requirements: [],
      mustHave: [],
      niceToHave: [],
      summary: values.description,
      aboutCompany: "",
    };
    setJobs((current) => [newJob, ...current]);
    push({
      title: `${newJob.title} created`,
      description: "The new role has been saved as a draft.",
      tone: "success",
    });
  };

  const onTogglePause = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== job.id) return j;
        if (j.status === "Paused") {
          push({
            title: `${job.title} resumed`,
            description: "Accepting applicants again.",
            tone: "success",
          });
          return { ...j, status: "Live" };
        }
        if (j.status === "Live") {
          push({
            title: `${job.title} paused`,
            description: "It will stop appearing in candidate searches.",
            tone: "info",
          });
          return { ...j, status: "Paused" };
        }
        return j;
      }),
    );
  };

  const onClose = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? { ...j, status: "Closed" as JobStatus }
          : j,
      ),
    );
    push({
      title: `${job.title} closed`,
      description: "No new applicants will be accepted.",
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={onNewJob}>
          <Plus />
          New job
        </Button>
      </div>

      {/* Stats */}
      <section
        aria-label="Job status counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {[
          { label: "Total jobs", value: stats.total, icon: Briefcase, swatch: "bg-accent-soft" },
          { label: "Live", value: stats.live, icon: Briefcase, swatch: "bg-chart-1/20" },
          { label: "Drafts", value: stats.draft, icon: Pencil, swatch: "bg-highlight-soft" },
          { label: "Paused", value: stats.paused, icon: Pause, swatch: "bg-chart-2/20" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    s.swatch,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-stat">
                    {s.value}
                  </p>
                  <p className="text-base font-semibold tracking-tight">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Priority jobs</h2>
            <p className="text-sm text-muted-foreground">
              Roles ordered by highest funnel completion.
            </p>
          </div>
          <Button
            asChild
            className="bg-highlight-soft text-foreground hover:bg-highlight-soft/80"
          >
            <Link href="/employer/jobs/all">View all jobs</Link>
          </Button>
        </div>

        {displayedJobs.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No jobs match those filters"
            description="Try a broader search or change the status or location."
          />
        ) : (
          <div
            aria-label="Priority jobs"
            className="space-y-3"
          >
            {displayedJobs.map((job: Job) => (
              <JobRow
                key={job.id}
                job={job}
                onRequestPause={setPendingPause}
                onRequestClose={setPendingClose}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingPause !== null}
        onOpenChange={(open) => !open && setPendingPause(null)}
        title={`${pendingPause?.status === "Paused" ? "Resume" : "Pause"} ${pendingPause?.title ?? "this job posting"}?`}
        description={
          pendingPause?.status === "Paused"
            ? "This role will become visible to candidates and start accepting applicants again."
            : "This role will stop appearing in candidate searches until it is resumed."
        }
        confirmLabel={
          pendingPause?.status === "Paused" ? "Continue to resume" : "Continue to pause"
        }
        onConfirm={() => {
          setFinalPause(pendingPause);
          setPendingPause(null);
        }}
      />
      <ConfirmDialog
        open={finalPause !== null}
        onOpenChange={(open) => !open && setFinalPause(null)}
        title={`Confirm ${finalPause?.status === "Paused" ? "resuming" : "pausing"} this job`}
        description={`Please confirm that you want to ${finalPause?.status === "Paused" ? "resume" : "pause"} ${finalPause?.title ?? "this job posting"}.`}
        confirmLabel={
          finalPause?.status === "Paused" ? "Yes, resume job" : "Yes, pause job"
        }
        onConfirm={() => {
          if (finalPause) onTogglePause(finalPause);
          setFinalPause(null);
        }}
      />
      <ConfirmDialog
        open={pendingClose !== null}
        onOpenChange={(open) => !open && setPendingClose(null)}
        title={`Close ${pendingClose?.title ?? "this job posting"}?`}
        description="This role will stop accepting new applicants. Existing applicants will keep their current status."
        confirmLabel="Close job"
        destructive
        onConfirm={() => {
          setFinalClose(pendingClose);
          setPendingClose(null);
        }}
      />
      <ConfirmDialog
        open={finalClose !== null}
        onOpenChange={(open) => !open && setFinalClose(null)}
        title="Confirm closing this job"
        description={
          <>
            Are you sure you want to close{" "}
            <strong className="text-foreground">
              {finalClose?.title ?? "this job posting"}
            </strong>
            ? This is your final confirmation.
          </>
        }
        confirmLabel="Yes, close job"
        destructive
        onConfirm={() => {
          if (finalClose) onClose(finalClose);
          setFinalClose(null);
        }}
      />
      <JobEditorDialog
        open={newJobOpen}
        onOpenChange={setNewJobOpen}
        onSave={onCreateJob}
      />
    </div>
  );
}

export function JobRow({
  job,
  onRequestPause,
  onRequestClose,
}: {
  job: Job;
  onRequestPause: (job: Job) => void;
  onRequestClose: (job: Job) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Card className="group relative lift-on-hover">
      <Link
        href={`/employer/jobs/${job.id}`}
        aria-label={`Open ${job.title}`}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <CardContent className="pointer-events-none relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
          >
            <Briefcase className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <Link
              href={`/employer/jobs/${job.id}`}
              className="pointer-events-auto text-sm font-medium hover:underline"
            >
              {job.title}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {job.department} · {job.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
              <Badge variant="outline">{job.workMode}</Badge>
              <small className="text-muted-foreground">Posted {job.posted}</small>
            </div>
          </div>
        </div>

        <div
          className={`${pageStyles.actionPanelShell} pointer-events-auto h-16 w-64 max-w-full shrink-0 [perspective:900px]`}
        >
          <div
            className={`${pageStyles.actionPanel} relative h-full w-full origin-center rounded-lg border border-transparent bg-transparent [transform-style:preserve-3d] ${
              flipped
                ? pageStyles.actionPanelFlipped
                : ""
            }`}
          >
            <button
              type="button"
              aria-label={`Show actions for ${job.title}`}
              aria-pressed={flipped}
              aria-hidden={flipped}
              tabIndex={flipped ? -1 : 0}
              onClick={() => setFlipped(true)}
              className={`${pageStyles.panelFace} absolute inset-0 flex items-center justify-end gap-4 rounded-lg px-3 text-left ${
                flipped
                  ? "pointer-events-none"
                  : ""
              }`}
            >
              <span className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                  <Users
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  {job.applicants}
                </span>
                <small className="text-muted-foreground">applicants</small>
              </span>
              <span className="hidden w-32 sm:mt-3 sm:block">
                <span
                  aria-hidden
                  className="block h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-chart-1"
                    style={{ width: `${job.filledScore}%` }}
                  />
                </span>
                <small className="mt-1 block text-right text-muted-foreground">
                  {job.filledScore}% filled
                </small>
              </span>
            </button>

            <div
              aria-hidden={!flipped}
              className={`${pageStyles.panelFace} ${pageStyles.panelBack} absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-surface-2/70 px-1 ${
                flipped
                  ? ""
                  : "pointer-events-none"
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRequestPause(job)}
                disabled={
                  !flipped || job.status === "Closed" || job.status === "Draft"
                }
                aria-label={
                  job.status === "Paused"
                    ? `Resume ${job.title}`
                    : `Pause ${job.title}`
                }
              >
                {job.status === "Paused" ? <Play /> : <Pause />}
                {job.status === "Paused" ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFlipped(false)}
                disabled={!flipped}
                aria-label={`Show applicants and hiring progress for ${job.title}`}
                className="h-9 min-h-9 w-9 min-w-9 shrink-0 rounded-lg border border-border bg-surface-1/80"
              >
                <RefreshCw />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRequestClose(job)}
                disabled={!flipped || job.status === "Closed"}
                aria-label={`Close ${job.title}`}
              >
                <X />
                Close
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
