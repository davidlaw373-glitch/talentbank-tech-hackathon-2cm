"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  ClipboardList,
  Clock,
  Eye,
  ExternalLink,
  MapPin,
  Pause,
  Pencil,
  Play,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

import type { Job, JobStatus } from "@/types/job";
import type { EmployerCandidateRow } from "@/lib/data-helpers";
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
import { CandidateDiscoveryCard } from "@/components/features/employer/candidate-discovery-card";
import styles from "./job-detail-view.module.css";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [applicantStart, setApplicantStart] = useState(0);
  const visibleApplicantCount = Math.min(4, applicants.length);
  const maxApplicantStart = Math.max(
    0,
    applicants.length - visibleApplicantCount,
  );
  const visibleApplicants = applicants.slice(
    applicantStart,
    applicantStart + visibleApplicantCount,
  );
  const applicantProgressWidth =
    applicants.length > 0
      ? (visibleApplicantCount / applicants.length) * 100
      : 100;
  const applicantProgressOffset =
    applicants.length > 0 ? (applicantStart / applicants.length) * 100 : 0;

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

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-surface-1 hover:bg-surface-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft />
          Back
        </Button>
      </div>

      {/* Heading */}
      <header className="flex flex-wrap items-center gap-5 rounded-xl border-2 bg-surface-1 p-5 shadow-sm">
        <div className="space-y-3">
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
        </div>
        <Button
          type="button"
          className="ml-auto bg-highlight-soft text-foreground hover:bg-highlight-soft/80"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye />
          Preview
        </Button>
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

          <div className="flex flex-col gap-2" aria-label="Job actions">
            <Button className="w-full justify-start" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
            <Button
              className="w-full justify-start"
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
              className="w-full justify-start"
              onClick={() => setClosePromptOpen(true)}
              disabled={status === "Closed"}
            >
              <X />
              Close
            </Button>
          </div>
        </div>
      </section>

      {/* Applicants for this job */}
      <Card
        id="applicants"
        className="scroll-mt-6 overflow-hidden rounded-tl-3xl rounded-tr-3xl border-2"
      >
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 space-y-0 border-b bg-surface-inset">
          <div>
            <CardTitle>
              <h2 className="text-heading">Top applicants</h2>
            </CardTitle>
            <p className="text-meta">
              Explore all {applicants.length} matches for {activeJob.title}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="default" size="sm">
              <Link href="/employer/applicants">
                <ExternalLink />
                View all applications
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-5">
          {applicants.length === 0 ? (
            <p className="rounded-xl border bg-surface-1 p-6 text-sm text-muted-foreground">
              No applicants yet for this role.
            </p>
          ) : (
            <div className={`relative sm:px-12 ${styles.carousel}`}>
              <ul
                aria-label={`Applicants for ${activeJob.title}`}
                className="flex gap-4 overflow-hidden"
              >
                {visibleApplicants.map((r) => (
                  <li
                    key={r.app.id}
                    className={`shrink-0 snap-start ${styles.applicantCard}`}
                  >
                    <CandidateDiscoveryCard
                      row={r}
                      enableInsightFlip={false}
                      linkWholeCard
                      showMatchScore={false}
                      showRecentSignal={false}
                      showStar={false}
                    />
                  </li>
                ))}
              </ul>

              {applicants.length > visibleApplicantCount ? (
                <>
                  <Button
                    type="button"
                    variant={applicantStart === 0 ? "outline" : "default"}
                    size="icon"
                    className={
                      applicantStart === 0
                        ? "bg-surface-1 shadow-lg"
                        : "shadow-lg"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "0.5rem",
                      zIndex: 30,
                      transform: "translateY(-50%)",
                    }}
                    aria-label="Previous candidates"
                    disabled={applicantStart === 0}
                    onClick={() =>
                      setApplicantStart((current) => Math.max(0, current - 1))
                    }
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    variant={
                      applicantStart >= maxApplicantStart ? "outline" : "default"
                    }
                    size="icon"
                    className={
                      applicantStart >= maxApplicantStart
                        ? "bg-surface-1 shadow-lg"
                        : "shadow-lg"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "0.5rem",
                      zIndex: 30,
                      transform: "translateY(-50%)",
                    }}
                    aria-label="Next candidates"
                    disabled={applicantStart >= maxApplicantStart}
                    onClick={() =>
                      setApplicantStart((current) =>
                        Math.min(maxApplicantStart, current + 1),
                      )
                    }
                  >
                    <ArrowRight />
                  </Button>
                </>
              ) : null}

              <div
                role="progressbar"
                aria-label="Applicant carousel position"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                  applicantProgressOffset + applicantProgressWidth,
                )}
                className={`relative h-2 overflow-hidden rounded-full bg-surface-inset opacity-0 shadow-sm ${styles.carouselProgress}`}
                style={{
                  marginTop: "1.25rem",
                  marginRight: "4rem",
                  marginLeft: "4rem",
                }}
              >
                <span
                  className="absolute inset-y-0 rounded-full bg-primary transition-[left,width] duration-300"
                  style={{
                    left: `${applicantProgressOffset}%`,
                    width: `${applicantProgressWidth}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <JobPreviewDialog
        jobId={activeJob.id}
        jobTitle={activeJob.title}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
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

function JobPreviewDialog({
  jobId,
  jobTitle,
  open,
  onOpenChange,
}: {
  jobId: number;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Candidate preview for ${jobTitle}`}
      className="overflow-hidden bg-transparent text-foreground backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        maxWidth: "none",
        maxHeight: "none",
        margin: 0,
        padding: "clamp(0.5rem, 1.25vw, 1rem)",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border-2 bg-surface-1 shadow-2xl"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "90rem",
          margin: "0 auto",
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-30 shrink-0 rounded-none border-0 bg-transparent shadow-none hover:bg-transparent"
          aria-label="Close job preview"
          onClick={() => onOpenChange(false)}
        >
          <X />
        </Button>
        {open ? (
          <iframe
            title={`Candidate job page for ${jobTitle}`}
            src={`/job-preview/${jobId}`}
            className="h-full min-h-0 w-full flex-1 bg-background"
          />
        ) : null}
      </div>
    </dialog>
  );
}
