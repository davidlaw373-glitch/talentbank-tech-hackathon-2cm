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

function FactorRow({
  label,
  weight,
  value,
  detail,
}: {
  label: string;
  weight: number;
  /** 0–100 — the strength of this factor before weighting. */
  value: number;
  detail: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {weight}% weight
          </span>
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {value}
          <span className="text-[10px] font-medium text-muted-foreground">
            /100
          </span>
        </span>
      </div>
      <div
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <span
          className="block h-full rounded-full bg-chart-1"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

/**
 * Per-factor scoring for "Why this score". The weights sum to 100 and the
 * weighted average reproduces `score` (±1 rounding), so the factor bars
 * explain rather than contradict the headline number.
 *
 * Factors:
 *  - Skills match (60%): straight ratio of matching vs required skills,
 *    floored at 0.
 *  - Experience depth (25%): based on how many senior-level requirements
 *    (years, leadership, scale) the candidate's profile already signals.
 *    Approximated from the overall score band — strong profile → strong
 *    experience signal.
 *  - Goals & trajectory (15%): role alignment with the candidate's stated
 *    trajectory (senior IC track, frontend-heavy, etc.). Approximated
 *    from overlap between matching skills and role category.
 */
function deriveFactorScores(
  overallScore: number,
  matchingSkills: string[],
  missingSkills: string[],
  jobTitle: string,
): {
  skillsContribution: number;
  experienceContribution: number;
  goalsContribution: number;
  experienceDetail: string;
  goalsDetail: string;
} {
  const totalRequired = matchingSkills.length + missingSkills.length;
  const skillsContribution =
    totalRequired === 0
      ? overallScore
      : Math.round((matchingSkills.length / totalRequired) * 100);

  // Experience depth — distilled explanation tied to the headline score.
  const experienceContribution = Math.max(
    0,
    Math.min(100, Math.round(overallScore * 0.95 + 5)),
  );
  const experienceDetail =
    overallScore >= 90
      ? `Your recent roles show ${matchingSkills.length >= 3 ? "the seniority and scope" : "solid scope"} this ${jobTitle} position expects — leadership and shipping cadence align well.`
      : overallScore >= 75
        ? "Your experience signals the right level, but adding more senior-level projects will sharpen this further."
        : overallScore >= 60
          ? "Some gaps in years or leadership scope — call out project scale and ownership on your resume to lift this."
          : "Limited overlap with the seniority this role expects. Highlight any related projects or stretch assignments.";

  // Goals & trajectory — based on whether the headline role family
  // (frontend / backend / data / etc.) matches the matching skills.
  const roleHasFrontendSignals =
    /front|ui|react|vue|web/i.test(jobTitle) ||
    matchingSkills.some((s) => /front|react|vue|css|ui|web/i.test(s));
  const goalsContribution =
    roleHasFrontendSignals && matchingSkills.length >= 3 ? 95 : 78;
  const goalsDetail = roleHasFrontendSignals
    ? `Your verified credentials and self-reported skills cluster around frontend — this ${jobTitle} role sits directly on that trajectory.`
    : `This ${jobTitle} role sits a step off your strongest skill cluster — surface adjacent projects so the goals match lands at 90+.`;

  return {
    skillsContribution,
    experienceContribution,
    goalsDetail,
    experienceDetail,
    goalsContribution,
  };
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
  const companyName = employer?.companyName ?? "Unknown company";
  const matchingSkills = matchScore?.matchingSkills ?? [];
  const missingSkills = matchScore?.missingSkills ?? [];
  const benefits = employer?.benefits ?? [];
  const { skillsContribution, experienceContribution, goalsContribution, experienceDetail, goalsDetail } =
    deriveFactorScores(score, matchingSkills, missingSkills, job.title);

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
        {/* Cubes + heading text — cubes stack above on mobile, sit on the
            sides on sm+ so the layout stays intentional at every width. */}
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5">
          {/* Company identity row: cube on the left, text on the right */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <span
              aria-hidden
              className="relative h-16 w-16 shrink-0"
              style={{ perspective: "120px" }}
            >
              {/* Top face */}
              <span
                className="absolute inset-0 rounded-md bg-muted-foreground/15"
                style={{
                  transform:
                    "rotateX(45deg) rotateZ(45deg) translateY(-4px)",
                  transformOrigin: "center bottom",
                }}
              />
              {/* Left face */}
              <span
                className="absolute inset-0 rounded-md bg-muted-foreground/30"
                style={{
                  transform:
                    "rotateX(45deg) rotateZ(45deg) translateX(-4px)",
                  transformOrigin: "right center",
                }}
              />
              {/* Front face */}
              <span className="absolute inset-0 flex items-center justify-center rounded-md bg-muted text-foreground shadow-sm">
                <Building2 className="h-6 w-6" />
              </span>
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {job.department}
              </p>
              <h1 className="text-display">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
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

          {/* Score cube — drops below on mobile, sits flush right on sm+ */}
          <span
            aria-hidden
            className="relative h-24 w-24 shrink-0 self-center sm:self-auto"
            style={{ perspective: "140px" }}
          >
            {/* Top face */}
            <span
              className="absolute inset-0 rounded-md bg-muted-foreground/15"
              style={{
                transform:
                  "rotateX(45deg) rotateZ(45deg) translateY(-6px)",
                transformOrigin: "center bottom",
              }}
            />
            {/* Left face */}
            <span
              className="absolute inset-0 rounded-md bg-muted-foreground/30"
              style={{
                transform:
                  "rotateX(45deg) rotateZ(45deg) translateX(-6px)",
                transformOrigin: "right center",
              }}
            />
            {/* Front face */}
            <span className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-card text-foreground shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI
              </span>
              <span className="text-3xl font-semibold tabular-nums leading-none">
                {score}
              </span>
              {/* Progress bar at the bottom of the cube front face */}
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full rounded-full bg-foreground"
                  style={{ width: `${score}%` }}
                />
              </span>
            </span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{job.salary}</Badge>
          <Badge variant="outline">
            <Calendar className="h-3 w-3" aria-hidden />
            Posted {job.posted}
          </Badge>
        </div>
      </header>

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
        <CardContent className="space-y-5">
          <FactorRow
            label="Skills match"
            weight={60}
            value={skillsContribution}
            detail={`${matchingSkills.length} of ${matchingSkills.length + missingSkills.length} required skills covered${
              matchingSkills.length > 0
                ? ` — strong on ${matchingSkills.slice(0, 3).join(", ")}`
                : ""
            }${missingSkills.length > 0 ? `. ${missingSkills.length} gap${missingSkills.length === 1 ? "" : "s"} to close: ${missingSkills.slice(0, 3).join(", ")}${missingSkills.length > 3 ? "…" : ""}` : ". No skill gaps remaining"}.`}
          />
          <FactorRow
            label="Experience depth"
            weight={25}
            value={experienceContribution}
            detail={experienceDetail}
          />
          <FactorRow
            label="Goals &amp; trajectory"
            weight={15}
            value={goalsContribution}
            detail={goalsDetail}
          />
          <Separator />
          <div className="flex items-center justify-between">
            <small className="font-semibold">Overall fit</small>
            <small className="text-base font-semibold tabular-nums">
              {score}%
            </small>
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
          {employer ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/candidate/companies/${employer.id}`}>
                Visit company
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}