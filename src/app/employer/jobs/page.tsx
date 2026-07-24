"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Filter,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
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
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import {
  JobEditorDialog,
  type JobEditorValues,
} from "@/components/features/employer/job-editor-dialog";

const STATUS_OPTIONS: Array<{ value: JobStatus | "All"; label: string }> = [
  { value: "All", label: "All statuses" },
  { value: "Live", label: "Live" },
  { value: "Draft", label: "Draft" },
  { value: "Paused", label: "Paused" },
  { value: "Closed", label: "Closed" },
];

function getLocationArea(job: Job) {
  const workModeSuffix = ` · ${job.workMode}`;
  return job.location.endsWith(workModeSuffix)
    ? job.location.slice(0, -workModeSuffix.length)
    : job.location;
}

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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [pendingClose, setPendingClose] = useState<Job | null>(null);
  const [finalClose, setFinalClose] = useState<Job | null>(null);

  const locationOptions = useMemo(
    () =>
      Array.from(new Set(jobs.map(getLocationArea))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery = !q || job.title.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;
      const matchesLocation =
        locationFilter === "All" || getLocationArea(job) === locationFilter;
      return matchesQuery && matchesStatus && matchesLocation;
    });
  }, [jobs, locationFilter, query, statusFilter]);

  const displayedJobs = useMemo(
    () =>
      showAllJobs
        ? filtered
        : [...jobs].sort((a, b) => b.filledScore - a.filledScore),
    [filtered, jobs, showAllJobs],
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
      <PageHeading
        title="Job management"
        description="All your open, draft, and paused roles — search, filter, and jump into a posting."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {showAllJobs && (
              <Button variant="outline" onClick={() => setShowAllJobs(false)}>
                Show priority jobs
              </Button>
            )}
            <Button onClick={onNewJob}>
              <Plus />
              New job
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {!showAllJobs && <section
        aria-label="Job status counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {[
          { label: "Total jobs", value: stats.total, icon: Briefcase },
          { label: "Live", value: stats.live, icon: Briefcase },
          { label: "Drafts", value: stats.draft, icon: Pencil },
          { label: "Paused", value: stats.paused, icon: Pause },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>}

      {/* Filters */}
      {showAllJobs && (
        <Card className="overflow-hidden">
          <CardContent className="grid gap-3 bg-surface-inset p-5 sm:grid-cols-[minmax(0,1fr)_14rem_14rem] sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="job-search"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search jobs
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
                  placeholder="Filter by job title"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:w-56">
              <label
                htmlFor="status-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as JobStatus | "All")}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="location-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Location
              </label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger id="location-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All locations</SelectItem>
                  {locationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <div className="border-t bg-surface-inset p-3">
            {displayedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                >
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    No jobs match those filters
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try a broader search or change the status or location.
                  </p>
                </div>
              </div>
            ) : (
              <div
                aria-label="All jobs"
                className="max-h-[32rem] space-y-3 overflow-y-auto pr-1"
              >
                {displayedJobs.map((job: Job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    showActions
                    onTogglePause={() => onTogglePause(job)}
                    onRequestClose={setPendingClose}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      {!showAllJobs && <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Priority jobs</h2>
            <p className="text-sm text-muted-foreground">
              Roles ordered by highest funnel completion.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAllJobs(true)}
          >
            View all jobs
          </Button>
        </div>

        {displayedJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">No jobs match those filters</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a broader search or change the status or location.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            aria-label={showAllJobs ? "All jobs" : "Priority jobs"}
            className="max-h-[32rem] space-y-3 overflow-y-auto rounded-xl border bg-surface-inset p-3 pr-2"
          >
            {displayedJobs.map((job: Job) => (
              <JobRow
                key={job.id}
                job={job}
                showActions={showAllJobs}
                onTogglePause={() => onTogglePause(job)}
                onRequestClose={setPendingClose}
              />
            ))}
          </div>
        )}
      </section>}

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

function JobRow({
  job,
  showActions,
  onTogglePause,
  onRequestClose,
}: {
  job: Job;
  showActions: boolean;
  onTogglePause: () => void;
  onRequestClose: (job: Job) => void;
}) {
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

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
              <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              {job.applicants}
            </span>
            <small className="text-muted-foreground">applicants</small>
          </div>
          <div className="hidden w-32 sm:mt-3 sm:block">
            <div
              aria-hidden
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-chart-1"
                style={{ width: `${job.filledScore}%` }}
              />
            </div>
            <small className="mt-1 block text-right text-muted-foreground">
              {job.filledScore}% filled
            </small>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            {showActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTogglePause}
                  disabled={job.status === "Closed" || job.status === "Draft"}
                  aria-pressed={job.status === "Paused"}
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
                  variant="destructive"
                  size="sm"
                  onClick={() => onRequestClose(job)}
                  disabled={job.status === "Closed"}
                  aria-label={`Close ${job.title}`}
                >
                  <X />
                  Close
                </Button>
              </>
            )}
            <Button asChild variant="ghost" size="icon" aria-label={`Open ${job.title}`}>
              <Link href={`/employer/jobs/${job.id}`}>
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
