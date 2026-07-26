"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Pause,
  Play,
  Search,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getByEmployer as getJobsByEmployer } from "@/data/jobs";
import type { Job, JobStatus } from "@/types/job";
import styles from "./all-jobs-management.module.css";

const STATUS_OPTIONS: Array<{ value: JobStatus | "All"; label: string }> = [
  { value: "All", label: "All statuses" },
  { value: "Live", label: "Live" },
  { value: "Draft", label: "Draft" },
  { value: "Paused", label: "Paused" },
  { value: "Closed", label: "Closed" },
];

const EMPLOYER_JOBS = getJobsByEmployer(1);

export function AllJobsManagement() {
  const [jobs, setJobs] = useState<Job[]>(EMPLOYER_JOBS);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const [location, setLocation] = useState("All");
  const [pendingPause, setPendingPause] = useState<Job | null>(null);
  const [pendingClose, setPendingClose] = useState<Job | null>(null);

  const locations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.location))).sort(),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (!normalizedQuery ||
          job.title.toLowerCase().includes(normalizedQuery) ||
          job.department.toLowerCase().includes(normalizedQuery)) &&
        (status === "All" || job.status === status) &&
        (location === "All" || job.location === location),
    );
  }, [jobs, location, query, status]);

  const togglePause = (job: Job) => {
    setJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: item.status === "Paused" ? "Live" : "Paused",
            }
          : item,
      ),
    );
  };

  const closeJob = (job: Job) => {
    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, status: "Closed" } : item,
      ),
    );
  };

  return (
    <div className="space-y-8">
      <div className={`${styles.toolbar} border-b pb-6`}>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-surface-1 hover:bg-surface-2"
        >
          <Link href="/employer/jobs" aria-label="Back to job overview">
            <ArrowLeft />
          </Link>
        </Button>

        <section
          aria-label="Job filters"
          className={styles.filters}
        >
          <div>
            <label htmlFor="all-job-search" className="sr-only">
              Search jobs
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="all-job-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by job title"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="all-job-status" className="sr-only">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as JobStatus | "All")}
            >
              <SelectTrigger id="all-job-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="all-job-location" className="sr-only">
              Location
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="all-job-location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All locations</SelectItem>
                {locations.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </div>

      <section aria-label="All jobs" className="space-y-4">
        <div>
          <h2>Job postings</h2>
          <p className="text-meta text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <p className="py-16 text-center text-body text-muted-foreground">
            No jobs match the current search and filters.
          </p>
        ) : (
          <div aria-label="Complete job list" className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="group relative border-2 border-foreground lift-on-hover"
              >
                <Link
                  href={`/employer/jobs/${job.id}`}
                  aria-label={`Open ${job.title}`}
                  className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <CardContent
                  className={`pointer-events-none relative z-10 gap-5 p-6 ${styles.jobRowContent}`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted"
                    >
                      <Briefcase className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-subheading">{job.title}</h3>
                      <p className="mt-1 text-meta text-muted-foreground">
                        {job.department} · {job.location}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge>{job.status}</Badge>
                        <Badge variant="outline">{job.employmentType}</Badge>
                        <Badge variant="outline">{job.workMode}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className={styles.jobMetrics}>
                    <div>
                      <p className="text-caption">Salary</p>
                      <p className="mt-1 text-body font-medium">{job.salary}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-caption">
                        <Users className="h-4 w-4" aria-hidden />
                        Applicants
                      </p>
                      <p className="mt-1 text-body font-medium tabular-nums">
                        {job.applicants}
                      </p>
                    </div>
                    <div
                      aria-label={`Actions for ${job.title}`}
                      className="pointer-events-auto flex flex-col gap-1"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 min-h-9 w-9 min-w-9"
                        onClick={() => setPendingPause(job)}
                        disabled={
                          job.status === "Closed" || job.status === "Draft"
                        }
                        aria-label={
                          job.status === "Paused"
                            ? `Resume ${job.title}`
                            : `Pause ${job.title}`
                        }
                      >
                        {job.status === "Paused" ? <Play /> : <Pause />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 min-h-9 w-9 min-w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendingClose(job)}
                        disabled={job.status === "Closed"}
                        aria-label={`Close ${job.title}`}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pendingPause !== null}
        onOpenChange={(open) => !open && setPendingPause(null)}
        title={`${pendingPause?.status === "Paused" ? "Resume" : "Pause"} ${pendingPause?.title ?? "this job"}?`}
        description={
          pendingPause?.status === "Paused"
            ? "This job will become active and visible to candidates again."
            : "This job will stop appearing in candidate searches until it is resumed."
        }
        confirmLabel={
          pendingPause?.status === "Paused" ? "Resume job" : "Pause job"
        }
        onConfirm={() => {
          if (pendingPause) togglePause(pendingPause);
          setPendingPause(null);
        }}
      />
      <ConfirmDialog
        open={pendingClose !== null}
        onOpenChange={(open) => !open && setPendingClose(null)}
        title={`Close ${pendingClose?.title ?? "this job"}?`}
        description="This job will stop accepting new applicants."
        confirmLabel="Close job"
        destructive
        onConfirm={() => {
          if (pendingClose) closeJob(pendingClose);
          setPendingClose(null);
        }}
      />
    </div>
  );
}
