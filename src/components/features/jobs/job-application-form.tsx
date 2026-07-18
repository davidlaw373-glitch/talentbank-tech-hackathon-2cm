"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { candidateProfile } from "@/data/candidate";
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

// Demo AI suggestions — a real build would generate these from the profile
// and the job description. Tailored per question, written in the
// candidate's voice.
const AI_SUGGESTIONS = {
  interest:
    "I'm excited about this role because it combines accessible product work with a collaborative team culture. My experience building responsive interfaces with React and TypeScript maps directly to what you're building, and the hybrid setup in Kuala Lumpur fits how I do my best work.",
  example:
    "I recently built a responsive community platform with Next.js and TypeScript, focusing on accessibility and clear user flows. I owned the component library, raised our Lighthouse accessibility score to 100, and shipped weekly with a small cross-functional team.",
} as const;

type AnswerField = keyof typeof AI_SUGGESTIONS;

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
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<AnswerField, string>>({
    interest: "",
    example: "",
  });
  const [generating, setGenerating] = useState<AnswerField | null>(null);
  const intervalRef = useRef<number | null>(null);
  const submitted = stepIndex === STEPS.length;

  // Clear any in-flight typewriter interval on unmount.
  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  // Demo "AI generation" — types the suggestion into the field character by
  // character (instantly when reduced motion is preferred).
  const generateAnswer = (field: AnswerField) => {
    if (generating) return;
    const text = AI_SUGGESTIONS[field];
    if (reducedMotion) {
      setAnswers((a) => ({ ...a, [field]: text }));
      return;
    }
    setGenerating(field);
    setAnswers((a) => ({ ...a, [field]: "" }));
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 3;
      const next = text.slice(0, i);
      setAnswers((a) => ({ ...a, [field]: next }));
      if (i >= text.length) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setGenerating(null);
      }
    }, 18);
  };

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

  const answerFields: {
    id: AnswerField;
    label: string;
    placeholder: string;
  }[] = [
    {
      id: "interest",
      label: "Why are you interested in this role?",
      placeholder: "Tell the hiring team what draws you to this role…",
    },
    {
      id: "example",
      label: "Share one relevant example",
      placeholder: "A project, feature, or result you're proud of…",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Apply
        </p>
        <h1>Apply for this role</h1>
        <p className="text-muted-foreground">
          {job.title} at {job.company}
        </p>
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                      className="text-[11px]"
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
              {answerFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={field.id}
                      className="block text-sm font-medium text-foreground"
                    >
                      {field.label}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateAnswer(field.id)}
                      disabled={generating !== null}
                      aria-busy={generating === field.id}
                      className="h-7 gap-1.5 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3" aria-hidden />
                      {generating === field.id ? "Writing…" : "Generate with AI"}
                    </Button>
                  </div>
                  <Textarea
                    id={field.id}
                    rows={4}
                    value={answers[field.id]}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [field.id]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}
              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                AI drafts from your verified profile — always review and edit
                before sending.
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
                  {
                    label: "Why this role",
                    value: answers.interest,
                  },
                  {
                    label: "Example",
                    value: answers.example,
                  },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium">
                        {row.value}
                      </p>
                    </div>
                    <Check
                      aria-hidden
                      className="mt-1 h-4 w-4 shrink-0 text-primary"
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
          <Button type="submit" disabled={generating !== null}>
            {stepIndex === STEPS.length - 1 ? "Submit application" : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      </form>
    </div>
  );
}
