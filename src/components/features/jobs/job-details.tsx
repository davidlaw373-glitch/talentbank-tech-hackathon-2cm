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
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { Job } from "@/types/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function matchTone(score: number) {
  if (score >= 90) return { label: "Strong fit", variant: "default" as const };
  if (score >= 80) return { label: "Good fit", variant: "secondary" as const };
  if (score >= 70) return { label: "Possible", variant: "outline" as const };
  return { label: "Stretch", variant: "outline" as const };
}

export function JobDetails({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);
  const tone = matchTone(job.matchScore);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/candidate/jobs">
            <ArrowLeft />
            Back to jobs
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
          >
            {saved ? (
              <>
                <BookmarkCheck />
                Saved
              </>
            ) : (
              <>
                <Bookmark />
                Save job
              </>
            )}
          </Button>
          <Button asChild size="sm">
            <Link href={`/candidate/jobs/${job.id}/apply`}>
              Apply now
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Briefcase className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Job listing
            </p>
            <h1>{job.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" aria-hidden />
            {job.company}
          </span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden />
            {job.location}
          </span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden />
            {job.posted}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.workMode}</Badge>
          <Badge variant="outline">{job.employmentType}</Badge>
          <Badge variant={tone.variant}>
            {tone.label} · {job.matchScore}%
          </Badge>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>About the role</h2>
              </CardTitle>
              <CardDescription>{job.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 border-t pt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Match breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Your matching capabilities
                  </h2>
                </CardTitle>
                <CardDescription>
                  {job.matchingSkills.length} of your skills overlap with
                  this role.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {job.matchingSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" aria-hidden />
                    Skills to develop
                  </h2>
                </CardTitle>
                <CardDescription>
                  These are nice-to-haves, not automatic blockers.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="opacity-80"
                  >
                    + {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Your AI match</h2>
              </CardTitle>
              <CardDescription>
                Scored against 200+ signals from your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight tabular-nums leading-none">
                  {job.matchScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground animate-progress-x"
                  style={{ width: `${job.matchScore}%` }}
                />
              </div>
              <Badge variant={tone.variant} className="w-fit">
                {tone.label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Job information</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Employment
                </p>
                <p className="mt-1 font-medium">{job.employmentType}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Work mode
                </p>
                <p className="mt-1 font-medium">{job.workMode}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Salary
                </p>
                <p className="mt-1 font-medium">{job.salary}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Posted
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {job.posted}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>About {job.company}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                A growing product organization hiring through CareerOS.
              </p>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="#">
                  Visit company
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA footer */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <p className="text-sm font-medium">Ready to apply?</p>
            <p className="text-xs text-muted-foreground">
              CareerOS will pre-fill your verified profile and tailor your
              answers for this role.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/candidate/jobs">Back to jobs</Link>
            </Button>
            <Button asChild>
              <Link href={`/candidate/jobs/${job.id}/apply`}>
                Continue to application
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
