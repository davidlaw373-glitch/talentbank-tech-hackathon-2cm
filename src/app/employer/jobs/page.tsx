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
  const [pendingClose, setPendingClose] = useState<Job | null>(null);

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

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      live: jobs.filter((j) => j.status === "Live").length,
      draft: jobs.filter((j) => j.status === "Draft").length,
      paused: jobs.filter((j) => j.status === "Paused").length,
    };
  }, [jobs]);

  const onNewJob = () => {
    push({
      title: "New job draft opened",
      description: "Add the basics and publish when ready.",
      tone: "info",
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
          <Button onClick={onNewJob}>
            <Plus />
            New job
          </Button>
        }
      />

      {/* Stats */}
      <section
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
      </section>

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_14rem_14rem] sm:items-end">
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
      </Card>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2>
              {filtered.length} job{filtered.length === 1 ? "" : "s"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Showing {statusFilter === "All" ? "all statuses" : statusFilter.toLowerCase()}
              {locationFilter === "All" ? "" : ` in ${locationFilter}`}
              {query.trim() ? ` matching "${query.trim()}"` : ""}.
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
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
          <div className="space-y-3">
            {filtered.map((job: Job) => (
              <JobRow
                key={job.id}
                job={job}
                onTogglePause={() => onTogglePause(job)}
                onRequestClose={setPendingClose}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingClose !== null}
        onOpenChange={(open) => !open && setPendingClose(null)}
        title={`Close ${pendingClose?.title ?? "this job posting"}?`}
        description="It will stop accepting new applicants. Existing applicants will keep their status."
        confirmLabel="Close job"
        destructive
        requireTyping="CLOSE"
        onConfirm={() => {
          if (pendingClose) onClose(pendingClose);
          setPendingClose(null);
        }}
      />
    </div>
  );
}

function JobRow({
  job,
  onTogglePause,
  onRequestClose,
}: {
  job: Job;
  onTogglePause: () => void;
  onRequestClose: (job: Job) => void;
}) {
  return (
    <Card className="lift-on-hover">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
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
              className="text-sm font-medium hover:underline"
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
          <div className="hidden w-32 sm:block">
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
          <div className="flex items-center gap-2">
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
