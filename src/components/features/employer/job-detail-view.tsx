"use client";

import { useRef, useState } from "react";
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

import type { Job, JobStatus } from "@/types/job";
import type { EmployerCandidateRow } from "@/lib/data-helpers";
import {
  APPLICATION_STAGES,
  STAGE_LABEL,
  STAGE_VARIANT,
} from "@/types/application";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/common/toast";
import {
  JobEditorDialog,
  type JobEditorValues,
} from "@/components/features/employer/job-editor-dialog";

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

export function JobDetailView({
  job,
  applicants,
}: {
  job: Job;
  applicants: EmployerCandidateRow[];
}) {
  const { push } = useToast();
  const [activeJob, setActiveJob] = useState(job);
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [editorOpen, setEditorOpen] = useState(false);
  const [closePromptOpen, setClosePromptOpen] = useState(false);
  const [finalCloseOpen, setFinalCloseOpen] = useState(false);
  const [showAllApplicants, setShowAllApplicants] = useState(false);
  const applicantsRef = useRef<HTMLDivElement>(null);

  const onEdit = () => {
    setEditorOpen(true);
  };

  const onSaveEdit = (values: JobEditorValues) => {
    setActiveJob((current) => ({ ...current, ...values }));
    push({
      title: `${values.title} updated`,
      description: "Your job posting changes have been saved.",
      tone: "success",
    });
  };

  const onTogglePause = () => {
    setStatus((prev) => {
      if (prev === "Closed" || prev === "Draft") return prev;
      if (prev === "Paused") {
        push({
          title: `${activeJob.title} resumed`,
          description: "Accepting applicants again.",
          tone: "success",
        });
        return "Live";
      }
      push({
        title: `${activeJob.title} paused`,
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
      title: `${activeJob.title} closed`,
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
    setShowAllApplicants(true);
    requestAnimationFrame(() =>
      applicantsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
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
            onClick={() => setClosePromptOpen(true)}
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
            <h1>{activeJob.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(status)}>{status}</Badge>
          <Badge variant="outline">{activeJob.department}</Badge>
          <Badge variant="outline">{activeJob.workMode}</Badge>
          <Badge variant="outline">{activeJob.employmentType}</Badge>
          <small className="text-muted-foreground">Posted {activeJob.posted}</small>
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
              <p className="text-muted-foreground">{activeJob.description}</p>
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
                {activeJob.responsibilities.map((item) => (
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
                {activeJob.requirements.map((item) => (
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
                  {activeJob.mustHave.map((s) => (
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
                  {activeJob.niceToHave.map((s) => (
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
                { label: "Applied", value: activeJob.applicants },
                ...APPLICATION_STAGES.filter((s) => s !== "Applied").map(
                  (stage) => ({
                    label: STAGE_LABEL[stage],
                    value: applicants.filter(
                      (a) => !a.app.rejected && a.app.stage === stage,
                    ).length,
                  }),
                ),
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
                  <small className="font-medium tabular-nums">{activeJob.filledScore}%</small>
                </div>
                <div
                  aria-hidden
                  className="h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-chart-1"
                    style={{ width: `${activeJob.filledScore}%` }}
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
                    {activeJob.salary}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Work mode</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {activeJob.workMode}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Employment type</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {activeJob.employmentType}
                  </dd>
                </div>
                <div>
                  <dt>
                    <small className="text-muted-foreground">Location</small>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {activeJob.location}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Applicants for this job */}
      <Card ref={applicantsRef} className="scroll-mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              <h2>Top applicants</h2>
            </CardTitle>
            <CardDescription>
              {showAllApplicants
                ? `All ${applicants.length} matches for ${activeJob.title}.`
                : `The strongest matches so far for ${activeJob.title}.`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCopyLink}>
              <Copy />
              Copy link
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={
                showAllApplicants
                  ? () => setShowAllApplicants(false)
                  : onViewApplicants
              }
            >
              <ExternalLink />
              {showAllApplicants ? "Show top applicants" : "View all applications"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {applicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applicants yet for this role.
            </p>
          ) : (
            (showAllApplicants ? applicants : applicants.slice(0, 3)).map((r) => (
              <Link
                key={r.candidate.id}
                href={`/employer/candidates/${r.candidate.id}`}
                className="grid gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-accent-soft sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                  >
                    {r.candidate.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.candidate.name}</p>
                    <small className="block truncate text-muted-foreground">
                      {r.candidate.title}
                    </small>
                    {showAllApplicants && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {r.candidate.location}
                        </span>
                        <span>Applied {r.app.appliedDate}</span>
                        <span>{r.verification} credentials</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.matchScore}% match</Badge>
                    <Badge variant={STAGE_VARIANT[r.app.stage]}>{r.app.stage}</Badge>
                  </div>
                  {showAllApplicants && (
                    <>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:w-36">
                        <span
                          className="block h-full rounded-full bg-chart-1"
                          style={{ width: `${r.matchScore}%` }}
                        />
                      </div>
                      <div className="flex max-w-sm flex-wrap justify-end gap-1">
                        {r.candidate.topSkills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <JobEditorDialog
        open={editorOpen}
        job={activeJob}
        onOpenChange={setEditorOpen}
        onSave={onSaveEdit}
      />
      <ConfirmDialog
        open={closePromptOpen}
        onOpenChange={setClosePromptOpen}
        title={`Close ${activeJob.title}?`}
        description="This role will stop accepting new applicants. Existing applicants will keep their current status."
        confirmLabel="Close job"
        destructive
        onConfirm={() => setFinalCloseOpen(true)}
      />
      <ConfirmDialog
        open={finalCloseOpen}
        onOpenChange={setFinalCloseOpen}
        title="Confirm closing this job"
        description={
          <>
            Are you sure you want to close{" "}
            <strong className="text-foreground">{activeJob.title}</strong>? This
            is your final confirmation.
          </>
        }
        confirmLabel="Yes, close job"
        destructive
        onConfirm={() => {
          onClose();
          setFinalCloseOpen(false);
        }}
      />
    </div>
  );
}
