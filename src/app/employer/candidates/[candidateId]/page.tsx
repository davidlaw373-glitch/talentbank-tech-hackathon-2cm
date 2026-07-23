import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  GraduationCap,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { getEmployerCandidateRows, getEmployerInterviewRows } from "@/lib/data-helpers";
import { STAGE_INDEX, STAGE_VARIANT } from "@/types/application";
import { CandidateActions } from "@/components/features/employer/candidate-actions";
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
import { Stepper } from "@/components/common/stepper";

const DEMO_EMPLOYER_ID = 1;

type PageProps = {
  params: Promise<{ candidateId: string }>;
};

export function generateStaticParams() {
  return getEmployerCandidateRows(DEMO_EMPLOYER_ID).map((r) => ({
    candidateId: String(r.candidate.id),
  }));
}

export default async function EmployerCandidateDetailPage({ params }: PageProps) {
  const { candidateId: rawCandidateId } = await params;
  const candidateId = Number(rawCandidateId);
  if (!Number.isInteger(candidateId)) notFound();

  const rows = getEmployerCandidateRows(DEMO_EMPLOYER_ID);
  const row = rows.find((r) => r.candidate.id === candidateId);
  if (!row) notFound();

  const { candidate, app, job, matchScore, verification } = row;
  const stageIndex = app.rejected ? 1 : STAGE_INDEX[app.stage];

  const totalScorecards = getEmployerInterviewRows(DEMO_EMPLOYER_ID)
    .filter((r) => r.candidate.id === candidateId)
    .reduce((acc, r) => acc + r.interview.scorecardItems, 0);

  const timelineSteps = app.timeline.map((entry, idx) => ({
    id: `${idx}-${entry.label}`,
    label: entry.label,
    meta: entry.date,
  }));

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/employer/candidates">
            <ArrowLeft />
            Back to candidates
          </Link>
        </Button>
      </div>

      {/* Heading */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-base font-semibold"
          >
            {candidate.initials}
          </span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Candidate profile
            </p>
            <h1>{candidate.name}</h1>
            <p className="text-muted-foreground">{candidate.title}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STAGE_VARIANT[app.stage]}>{app.stage}</Badge>
          {verification === "Verified" ? (
            <Badge variant="secondary">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              Verified
            </Badge>
          ) : null}
        </div>
      </header>

      {/* Two-column body */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: summary + timeline + education/experience */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Match overview
                </h2>
              </CardTitle>
              <CardDescription>
                How strong a fit this candidate is for the role they applied to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-5xl font-semibold tracking-tight tabular-nums">
                    {matchScore}
                  </p>
                  <small className="text-muted-foreground">
                    Match score out of 100
                  </small>
                </div>
                <div className="flex-1">
                  <div
                    aria-hidden
                    className="h-3 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-chart-1"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Top skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.topSkills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Summary</h3>
                <p className="text-muted-foreground">{candidate.summary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Timeline</h2>
              </CardTitle>
              <CardDescription>
                Where this candidate sits in your hiring flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stepper
                steps={timelineSteps}
                currentIndex={stageIndex}
                ariaLabel={`Hiring progress for ${candidate.name}`}
              />
            </CardContent>
          </Card>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" aria-hidden />
                    Education
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {candidate.education.map((edu) => (
                    <li key={edu.id} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                      />
                      <span>
                        {edu.qualification} · {edu.institution}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <Users className="h-4 w-4" aria-hidden />
                    Experience
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {candidate.experience.map((exp) => (
                    <li key={exp.id}>
                      <p className="text-sm font-medium">
                        {exp.role} · {exp.company}
                      </p>
                      <small className="text-muted-foreground">{exp.period}</small>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right: application sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Application</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <small className="text-muted-foreground">Applied for</small>
                <p className="text-sm font-medium">{job.title}</p>
              </div>
              <Separator />
              <div>
                <small className="text-muted-foreground">Location</small>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {candidate.location}
                </p>
              </div>
              <Separator />
              <div>
                <small className="text-muted-foreground">Applied</small>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {app.appliedDate}
                </p>
              </div>
              <Separator />
              <CandidateActions
                candidateId={candidate.id}
                candidateName={candidate.name}
                appliedFor={job.title}
                initialStarred={false}
                initialStage={app.stage}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom row: interview kit + AI summary */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Interview kit</h2>
            </CardTitle>
            <CardDescription>
              What your interviewers will be scoring against.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border bg-background p-3">
              <div>
                <p className="text-sm font-medium">Scorecard items</p>
                <small className="text-muted-foreground">
                  Across scheduled interviews
                </small>
              </div>
              <span className="text-2xl font-semibold tabular-nums">
                {totalScorecards}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use these structured scorecards during the live interview and the
              AI summary below to compare candidates at the debrief.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                AI summary
              </h2>
            </CardTitle>
            <CardDescription>
              Generated from the candidate&apos;s profile and application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{candidate.summary}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}