"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Pause,
  Pencil,
  Play,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";

import type {
  CandidateStage,
  EmployerCandidate,
  EmployerJob,
  JobStatus,
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/common/toast";

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

function stageVariant(stage: CandidateStage) {
  switch (stage) {
    case "New":
      return "outline" as const;
    case "Screening":
      return "secondary" as const;
    case "Shortlisted":
      return "secondary" as const;
    case "Interviewing":
      return "default" as const;
    case "Offer":
      return "default" as const;
    case "Hired":
      return "default" as const;
    case "Rejected":
      return "destructive" as const;
  }
}

export function JobDetailView({
  job,
  applicants,
}: {
  job: EmployerJob;
  applicants: EmployerCandidate[];
}) {
  const { push } = useToast();
  const [status, setStatus] = useState<JobStatus>(job.status);

  const onEdit = () => {
    push({
      title: `Editing ${job.title}`,
      description: "Job editor would open here (demo).",
      tone: "info",
    });
  };

  const onTogglePause = () => {
    setStatus((prev) => {
      if (prev === "Closed" || prev === "Draft") return prev;
      if (prev === "Paused") {
        push({
          title: `${job.title} resumed`,
          description: "Accepting applicants again.",
          tone: "success",
        });
        return "Live";
      }
      push({
        title: `${job.title} paused`,
        description: "It will stop appearing in candidate searches.",
        tone: "info",
      });
      return "Paused";
    });
  };

  const onClose = () => {
    setStatus((prev) => {
      if (prev === "Closed") return prev;
      push({
        title: `${job.title} closed`,
        description: "No new applicants will be accepted.",
        tone: "info",
      });
      return "Closed";
    });
  };

  const onCopyLink = () => {
    push({
      title: "Job link copied",
      description: "Share it on LinkedIn or via email.",
      tone: "success",
    });
  };

  const onViewApplicants = () => {
    push({
      title: `Opening applicants for ${job.title}`,
      description: "Filtered list would open here (demo).",
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/employer/jobs">
            <ArrowLeft />
            Back to jobs
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePause}
            aria-pressed={status === "Paused"}
            aria-label={status === "Paused" ? "Resume job" : "Pause job"}
            disabled={status === "Closed" || status === "Draft"}
          >
            {status === "Paused" ? <Play /> : <Pause />}
            {status === "Paused" ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClose}
            disabled={status === "Closed"}
          >
            <X />
            Close
          </Button>
        </div>
      </div>

      {/* Heading */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"
          >
            <Briefcase className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Job posting
            </p>
            <h1>{job.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(status)}>{status}</Badge>
          <Badge variant="outline">{job.department}</Badge>
          <Badge variant="outline">{job.workMode}</Badge>
          <Badge variant="outline">{job.employmentType}</Badge>
          <small className="text-muted-foreground">Posted {job.posted}</small>
        </div>
      </header>

      {/* Two-column body */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Description</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" aria-hidden />
                  Responsibilities
                </h2>
              </CardTitle>
              <CardDescription>What success looks like in the first 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Requirements</h2>
              </CardTitle>
              <CardDescription>What we&apos;re screening for.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Skills
                </h2>
              </CardTitle>
              <CardDescription>Must-haves and nice-to-haves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Must have</h3>
                <div className="flex flex-wrap gap-2">
                  {job.mustHave.map((s) => (
                    <Badge key={s} variant="default">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Nice to have</h3>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHave.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden />
                  Pipeline
                </h2>
              </CardTitle>
              <CardDescription>Where applicants are right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Applicants", value: job.applicants },
                { label: "Shortlisted", value: job.shortlisted },
                { label: "Interviewing", value: job.interviewing },
                { label: "Offered", value: job.offered },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                >
                  <small className="text-muted-foreground">{row.label}</small>
                  <span className="text-base font-semibold tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <small className="text-muted-foreground">Funnel filled</small>
                  <small className="font-medium tabular-nums">{job.filledScore}%</small>
                </div>
                <div
                  aria-hidden
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-chart-1"
                    style={{ width: `${job.filledScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Job details</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt>
                    <small className="text-muted-foreground">Salary</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {job.salary}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Work mode</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {job.workMode}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Employment type</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {job.employmentType}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Location</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {job.location}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Applicants for this job */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              <h2>Top applicants</h2>
            </CardTitle>
            <CardDescription>
              The strongest matches so far for {job.title}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCopyLink}>
              <Copy />
              Copy link
            </Button>
            <Button variant="default" size="sm" onClick={onViewApplicants}>
              <ExternalLink />
              View applicants
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {applicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applicants yet for this role.
            </p>
          ) : (
            applicants.map((c) => (
              <Link
                key={c.id}
                href={`/employer/candidates/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent-soft"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                  >
                    {c.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <small className="block truncate text-muted-foreground">
                      {c.title}
                    </small>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{c.matchScore}% match</Badge>
                  <Badge variant={stageVariant(c.stage)}>{c.stage}</Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
