"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Sparkles,
} from "lucide-react";

import { Stepper, type StepperStep } from "@/components/common/stepper";
import { candidateProfile } from "@/data/candidate";
import type { Job } from "@/types/candidate";
import { MatchBadge } from "@/components/common/match-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const STEPS: StepperStep[] = [
  { id: "review", label: "Review profile" },
  { id: "questions", label: "Your answers" },
  { id: "submit", label: "Submit" },
];

export function JobApplicationForm({
  job,
}: {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    workMode: string;
    matchScore: number;
  };
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const submitted = stepIndex === STEPS.length;

  const handleNext = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setStepIndex((i) => Math.min(i + 1, STEPS.length));
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else router.back();
  };

  const pct = Math.round(
    (Math.min(stepIndex, STEPS.length - 1) / (STEPS.length - 1)) * 100
  );

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <h2>Application submitted</h2>
              <p className="mt-2 text-muted-foreground">
                Your application for {job.title} at {job.company} is in.
                We&apos;ll send updates as it moves through the pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/candidate/jobs">Find more jobs</Link>
              </Button>
              <Button asChild>
                <Link href={`/candidate/applications/app-${job.id}`}>
                  Track application
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Apply
          </p>
          <h1>Apply for this role</h1>
          <p className="text-muted-foreground">
            {job.title} at {job.company}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" onClick={handleBack}>
          <span>
            <ArrowLeft />
            {stepIndex === 0 ? "Back" : "Previous"}
          </span>
        </Button>
      </header>

      {/* Stepper */}
      <Stepper
        steps={STEPS}
        currentIndex={stepIndex}
        ariaLabel="Application steps"
      />

      {/* Progress note */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Step {Math.min(stepIndex + 1, STEPS.length)} of {STEPS.length}
        </span>
        <span className="font-semibold tabular-nums">{pct}% complete</span>
      </div>

      {/* Step content */}
      <form onSubmit={handleNext}>
        {stepIndex === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Review your profile</h2>
              </CardTitle>
              <CardDescription>
                We&apos;ll pre-fill your verified profile with this
                application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h3>{job.title}</h3>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" aria-hidden />
                      {job.company} · {job.location} · {job.workMode}
                    </p>
                  </div>
                  <MatchBadge score={job.matchScore} />
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Applicant
                </p>
                <h3 className="mt-1">{candidateProfile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {candidateProfile.title} · {candidateProfile.location}
                </p>
                <p className="mt-3 text-sm">{candidateProfile.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidateProfile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stepIndex === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Application questions</h2>
              </CardTitle>
              <CardDescription>
                Tell the hiring team what makes this opportunity relevant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="interest"
                  className="block text-sm font-medium text-foreground"
                >
                  Why are you interested in this role?
                </label>
                <Textarea
                  id="interest"
                  rows={4}
                  defaultValue="I am excited to contribute my frontend experience while learning from a collaborative product team."
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="example"
                  className="block text-sm font-medium text-foreground"
                >
                  Share one relevant example
                </label>
                <Textarea
                  id="example"
                  rows={4}
                  defaultValue="I recently built a responsive community platform with Next.js and TypeScript, focusing on accessibility and clear user flows."
                  required
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                AI suggestions are available for each question based on your
                profile.
              </div>
            </CardContent>
          </Card>
        )}

        {stepIndex === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden />
                  Ready to submit
                </h2>
              </CardTitle>
              <CardDescription>
                A short summary of what will be sent to {job.company}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {[
                  {
                    label: "Profile",
                    value: `${candidateProfile.name} · ${candidateProfile.title}`,
                  },
                  {
                    label: "Skills",
                    value: `${candidateProfile.skills.length} listed`,
                  },
                  { label: "Why this role", value: "Your answer (filled)" },
                  { label: "Example", value: "Your answer (filled)" },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="mt-1 text-sm font-medium">{row.value}</p>
                    </div>
                    <Check
                      aria-hidden
                      className="h-4 w-4 text-primary"
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={handleBack}>
            <ArrowLeft />
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button type="submit">
            {stepIndex === STEPS.length - 1 ? "Submit application" : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      </form>
    </div>
  );
}
