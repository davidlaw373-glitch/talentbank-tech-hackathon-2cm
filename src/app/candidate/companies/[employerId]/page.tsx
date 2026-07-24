import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  Globe,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { get as getEmployer } from "@/data/employers";
import { getByEmployer as getJobsByEmployer } from "@/data/jobs";
import { getForCandidate as getMatchScoresForCandidate } from "@/data/match-scores";
import { getEmployerStats } from "@/lib/data-helpers";
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

type PageProps = {
  params: Promise<{ employerId: string }>;
};

const DEMO_CANDIDATE_ID = 1;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { employerId } = await params;
  const employer = getEmployer(Number(employerId));
  return {
    title: employer
      ? `${employer.companyName} · CareerOS`
      : "Company · CareerOS",
  };
}

/**
 * Candidate-facing company profile. Reads the same `Employer` record and
 * derived stats that power the employer's own `/employer/profile` page, so
 * what the candidate sees always corresponds to what the company publishes.
 */
export default async function CandidateCompanyPage({ params }: PageProps) {
  const { employerId: rawEmployerId } = await params;
  const employerId = Number(rawEmployerId);
  if (!Number.isInteger(employerId)) notFound();
  const employer = getEmployer(employerId);
  if (!employer) notFound();

  const stats = getEmployerStats(employerId);
  const matchScores = getMatchScoresForCandidate(DEMO_CANDIDATE_ID);
  const openRoles = getJobsByEmployer(employerId)
    .filter((job) => job.status === "Live")
    .map((job) => ({
      job,
      score: matchScores.find((s) => s.jobId === job.id)?.score,
    }));

  const statTiles = [
    {
      label: "Open roles",
      value: String(stats.openRoles),
      icon: Sparkles,
      helper: "Live postings",
    },
    {
      label: "Candidates in process",
      value: String(stats.activeCandidates),
      icon: Users,
      helper: "Across all roles",
    },
    {
      label: "Hires this quarter",
      value: String(stats.hiresThisQuarter),
      icon: Briefcase,
      helper: "Q3 2026",
    },
    {
      label: "Avg time to hire",
      value: `${stats.avgTimeToHire} days`,
      icon: Clock,
      helper: "Last 90 days",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/candidate/jobs">
            <ArrowLeft />
            Back to jobs
          </Link>
        </Button>
      </div>

      {/* Heading */}
      <header className="flex flex-wrap items-start gap-4 animate-reveal">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold"
        >
          {employer.initials}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Company profile
          </p>
          <h1>{employer.companyName}</h1>
          <p className="text-muted-foreground">{employer.tagline}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {employer.industry}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {employer.size} employees
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {employer.hq}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {employer.website}
            </span>
            <Badge variant="outline">Founded {employer.founded}</Badge>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* About */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden />
                About {employer.companyName}
              </h2>
            </CardTitle>
            <CardDescription>
              Published by the company on its CareerOS profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <p className="text-muted-foreground">{employer.about}</p>

            <Separator />
            <div>
              <h3 className="text-base font-semibold">Culture</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {employer.culture.length === 0 ? (
                  <small className="text-muted-foreground">
                    Nothing listed yet.
                  </small>
                ) : (
                  employer.culture.map((value) => (
                    <Badge key={value} variant="secondary">
                      {value}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <Separator />
            <div>
              <h3 className="text-base font-semibold">Benefits</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {employer.benefits.length === 0 ? (
                  <small className="text-muted-foreground">
                    Nothing listed yet.
                  </small>
                ) : (
                  employer.benefits.map((benefit) => (
                    <Badge key={benefit} variant="outline">
                      {benefit}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* At a glance */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>At a glance</h2>
            </CardTitle>
            <CardDescription>
              Live hiring activity across the company.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statTiles.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{stat.label}</p>
                      <small className="text-muted-foreground">
                        {stat.helper}
                      </small>
                    </div>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Open roles */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Open roles at {employer.companyName}</h2>
          </CardTitle>
          <CardDescription>
            Live postings with your AI match score for each role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No live openings right now — save a job from this company to get
              notified when new roles open.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {openRoles.map(({ job, score }) => (
                <li key={job.id}>
                  <Link
                    href={`/candidate/jobs/${job.id}`}
                    className="lift-on-hover group flex h-full flex-col gap-3 rounded-md border bg-background p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {job.department}
                        </p>
                        <p className="font-semibold group-hover:underline">
                          {job.title}
                        </p>
                      </div>
                      {score !== undefined ? (
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Match
                          </p>
                          <p className="text-2xl font-semibold tabular-nums leading-none tracking-tight">
                            {score}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    {score !== undefined ? (
                      <div
                        aria-hidden
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-chart-1"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" aria-hidden />
                        {job.employmentType} · {job.workMode}
                      </span>
                      <span>{job.salary}</span>
                      <span className="ml-auto flex items-center gap-1 font-medium text-foreground">
                        View role
                        <ArrowRight
                          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
