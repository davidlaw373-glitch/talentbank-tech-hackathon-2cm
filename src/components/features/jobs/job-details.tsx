"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Flag,
  MapPin,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import type { Job } from "@/types/job";
import type { JobCandidateMatchScore } from "@/types/match-score";
import type { Employer } from "@/types/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Candidate-facing view of a job. Combines the Job record, the candidate's
 * match score for that job, and the employer record so the UI can show
 * company name + benefits inline.
 */
export type CandidateJobView = Job & {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  company: string;
  benefits: string[];
};

function matchTone(score: number) {
  if (score >= 90) return { label: "Strong fit", variant: "default" as const };
  if (score >= 75)
    return { label: "Good fit", variant: "secondary" as const };
  if (score >= 60)
    return { label: "Stretch role", variant: "outline" as const };
  return { label: "Exploratory", variant: "outline" as const };
}

export function JobDetails({
  job,
  matchScore,
  employer,
}: {
  job: Job;
  matchScore?: JobCandidateMatchScore;
  employer?: Employer;
}) {
  const { push } = useToast();
  const [saved, setSaved] = useState(false);
  const score = matchScore?.score ?? 0;
  const tone = matchTone(score);
  const companyName = employer?.companyName ?? "Unknown company";
  const matchingSkills = matchScore?.matchingSkills ?? [];
  const missingSkills = matchScore?.missingSkills ?? [];
  const benefits = employer?.benefits ?? [];

  const toggleSaved = () => {
    setSaved((s) => !s);
    push({
      title: saved
        ? `Removed ${job.title} from saved jobs`
        : `Saved ${job.title} for later`,
      description: saved
        ? "We won't surface it on your dashboard."
        : "We'll keep it in your shortlist and remind you to apply.",
      tone: "info",
    });
  };

  const onApply = () => {
    push({
      title: saved
        ? `Your tailored resume was sent to ${companyName}.`
        : `Your profile was sent to ${companyName}.`,
      description: `Applied to ${job.title} — track it on the applications page.`,
      tone: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/candidate/jobs">
            <ArrowLeft />
            Back to jobs
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 />
            Share
          </Button>
          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            onClick={toggleSaved}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save for later"}
          >
            {saved ? <BookmarkCheck /> : <Bookmark />}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button onClick={onApply} size="sm">
            Apply now
            <ArrowRight />
          </Button>
        </div>
      </div>

      {/* Heading */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-base font-semibold"
          >
            <Building2 className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {job.department}
            </p>
            <h1>{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                {companyName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" aria-hidden />
                {job.employmentType}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {job.workMode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{job.salary}</Badge>
          <Badge variant="outline">
            <Calendar className="h-3 w-3" aria-hidden />
            Posted {job.posted}
          </Badge>
          <Badge variant={tone.variant}>
            <Sparkles className="h-3 w-3" aria-hidden />
            {tone.label} · {score}%
          </Badge>
        </div>
      </header>

      {/* Match overview */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden />
              Match overview
            </h2>
          </CardTitle>
          <CardDescription>
            CareerOS compared your profile with this role — here&apos;s what
            surfaced.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              aria-label={`Match score ${score} out of 100`}
              role="img"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-8 border-muted"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-semibold tabular-nums leading-none">
                  {score}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  / 100
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div
                aria-hidden
                className="h-3 w-full overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full rounded-full bg-chart-1"
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {matchingSkills.length} of your skills overlap with{" "}
                {matchingSkills.length + missingSkills.length} job requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Skill breakdown</h2>
          </CardTitle>
          <CardDescription>
            Your strongest matches and the gaps to close before interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Check className="h-4 w-4 text-foreground" aria-hidden />
              You match
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {matchingSkills.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No overlapping skills yet — update your profile to surface
                  stronger matches.
                </p>
              ) : (
                matchingSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Flag className="h-4 w-4 text-muted-foreground" aria-hidden />
              To develop
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingSkills.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You cover everything they ask for. Apply with confidence.
                </p>
              ) : (
                missingSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role details */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Role details</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{job.summary}</p>
          <Separator />
          <div>
            <h3 className="text-base font-semibold">Responsibilities</h3>
            <ul className="mt-2 space-y-1.5">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                  />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="text-base font-semibold">Requirements</h3>
            <ul className="mt-2 space-y-1.5">
              {job.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                  />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Match score trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden />
              Why this score
            </h2>
          </CardTitle>
          <CardDescription>
            CareerOS weighs skills, experience depth, and goals. Tailoring your
            resume lifts the score for every future application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <small className="text-muted-foreground">Overall fit</small>
              <small className="font-medium tabular-nums">{score}%</small>
            </div>
            <div
              aria-hidden
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full bg-chart-1"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About the company */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>About {companyName}</h2>
          </CardTitle>
          {employer?.about ? (
            <CardDescription>{employer.about}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {benefits.length > 0 ? (
            <div>
              <h3 className="text-base font-semibold">Benefits</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {benefits.map((benefit) => (
                  <Badge key={benefit} variant="outline">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          <Separator />
          <Button asChild variant="outline" size="sm">
            <Link href="#">Visit company</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}