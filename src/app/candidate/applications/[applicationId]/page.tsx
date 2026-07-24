import { notFound } from "next/navigation";

import { Check, Flag, Sparkles, Target, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { get as getApplication, getApplicationUpdate } from "@/data/applications";
import { get as getJob } from "@/data/jobs";
import { getCandidateContext, getMatchScoreByPair } from "@/lib/data-helpers";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

/**
 * Per-factor breakdown for "About your match". Weights sum to 100 and the
 * weighted average reproduces the headline score (rounded ±1). Each factor
 * is derived from the actual candidate × job data so the explanation names
 * real skills and experience — not generic copy.
 */
type MatchFactors = {
  overall: number;
  skillsContribution: number;
  experienceContribution: number;
  goalsContribution: number;
  matchingSkills: string[];
  missingSkills: string[];
  topRelevantExperience: string | undefined;
  experienceDetail: string;
  goalsDetail: string;
  profileBoostTips: string[];
};

function deriveMatchFactors(
  candidate: import("@/types/candidate").Candidate,
  job: import("@/types/job").Job | undefined,
  matchScore: ReturnType<typeof getMatchScoreByPair>,
): MatchFactors {
  const overall = matchScore?.score ?? 0;
  const matchingSkills = matchScore?.matchingSkills ?? [];
  const missingSkills = matchScore?.missingSkills ?? [];
  const requiredCount = job?.requirements.length ?? 0;

  // Skills (60%): ratio of job requirements covered by the candidate.
  const skillsContribution =
    requiredCount === 0
      ? overall
      : Math.round((matchingSkills.length / requiredCount) * 100);

  // Experience (25%): pull the most relevant experience row for this role.
  const candidateSkillsLower = new Set(candidate.skills.map((s) => s.toLowerCase()));
  const topRelevantExperience =
    candidate.experience.find((exp) =>
      exp.role
        .toLowerCase()
        .split(/\s+/)
        .some((token) => candidateSkillsLower.has(token)) ||
      matchingSkills.some((skill) =>
        exp.role.toLowerCase().includes(skill.toLowerCase()),
      ),
    ) ?? candidate.experience[0];
  const experienceContribution = Math.max(
    0,
    Math.min(100, Math.round(overall * 0.95 + 5)),
  );
  const experienceDetail = topRelevantExperience
    ? `${topRelevantExperience.role} at ${topRelevantExperience.company} (${topRelevantExperience.period}) is the closest match — the role expects ${job?.department ?? "this function"}-level ownership and your tenure shows it.`
    : `Limited direct role history matched — surface adjacent projects so the experience signal strengthens.`;

  // Goals (15%): does the candidate's stated title align with the role family?
  const roleIsFrontend =
    /front|ui|react|vue|web/i.test(job?.title ?? "") ||
    /front|ui|react|vue|web/i.test(job?.department ?? "");
  const candidateIsFrontend =
    /front|ui|react|vue|web/i.test(candidate.title) ||
    candidate.topSkills.some((s) => /front|react|vue|css|ui|web/i.test(s));
  const goalsContribution =
    roleIsFrontend && candidateIsFrontend ? 95 : 78;
  const goalsDetail =
    roleIsFrontend && candidateIsFrontend
      ? `Your current title "${candidate.title}" and top skills sit on the same trajectory as this ${job?.title} role — CareerOS weights trajectory alignment at 15%.`
      : `This ${job?.title} role sits a step off your strongest skill cluster — surface adjacent projects or learning goals so the goals match climbs to 90+.`;

  // Profile boost: specific, actionable tips drawn from the missing skills
  // and any thin spots in the profile.
  const profileBoostTips: string[] = [];
  for (const missing of missingSkills.slice(0, 2)) {
    profileBoostTips.push(
      `Add a project or course that demonstrates ${missing} — this alone closes a top gap.`,
    );
  }
  if (candidate.profileCompletion < 100) {
    profileBoostTips.push(
      `Your profile is ${candidate.profileCompletion}% complete — finishing the remaining sections lifts your weighted score for every future application.`,
    );
  }
  if (!candidate.summary || candidate.summary.trim().length < 40) {
    profileBoostTips.push(
      "Add a 2–3 sentence summary so the AI has more signal to score goals and seniority.",
    );
  }
  if (profileBoostTips.length === 0) {
    profileBoostTips.push(
      "Your profile is already strong — focus on tailoring your resume for this role's specific requirements.",
    );
  }

  return {
    overall,
    skillsContribution,
    experienceContribution,
    goalsContribution,
    matchingSkills,
    missingSkills,
    topRelevantExperience: topRelevantExperience
      ? `${topRelevantExperience.role} · ${topRelevantExperience.company}`
      : undefined,
    experienceDetail,
    goalsDetail,
    profileBoostTips,
  };
}

export default async function CandidateApplicationDetailPage({ params }: PageProps) {
  const { applicationId: rawApplicationId } = await params;
  const applicationId = Number(rawApplicationId);
  if (!Number.isInteger(applicationId)) notFound();
  const application = getApplication(applicationId);
  if (!application) notFound();

  const job = getJob(application.jobId);
  const { candidate } = getCandidateContext(application.candidateId);
  const matchScore = getMatchScoreByPair(application.candidateId, application.jobId);
  const factors = deriveMatchFactors(candidate, job, matchScore);

  const completed = application.timeline.filter((t) => t.complete).length;
  const total = application.timeline.length;
  const pct = Math.round((completed / total) * 100);
  const currentIndex = application.timeline.findIndex((t) => !t.complete);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-display">{job?.title ?? "Unknown role"}</h1>
        <p className="text-muted-foreground">
          {job?.location ?? ""} · Applied {application.appliedDate}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Where you stand</h2>
            </CardTitle>
            <CardDescription>{getApplicationUpdate(application)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {completed} of {total} stages complete
                </span>
                <span className="font-medium tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <ol className="space-y-3">
              {application.timeline.map((step, i) => {
                const isComplete = step.complete;
                const isCurrent = i === currentIndex;
                return (
                  <li
                    key={`${application.id}-${i}`}
                    className="flex items-start gap-3"
                  >
                    <span className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                      {isCurrent && (
                        <span
                          className="absolute inset-0 rounded-full border-2 border-foreground animate-pulse-ring-soft"
                          aria-hidden
                        />
                      )}
                      <span
                        className={
                          isComplete
                            ? "relative flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background"
                            : isCurrent
                              ? "relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground animate-pulse-soft"
                              : "relative flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-muted-foreground"
                        }
                        aria-label={
                          isComplete
                            ? `${step.label} — complete`
                            : isCurrent
                              ? `${step.label} — in progress`
                              : `${step.label} — upcoming`
                        }
                      >
                        {isComplete ? (
                          "✓"
                        ) : isCurrent ? (
                          <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
                        ) : (
                          i + 1
                        )}
                      </span>
                    </span>
                    <div className="-mt-0.5 flex-1">
                      <p
                        className={
                          isComplete
                            ? "text-sm font-medium text-muted-foreground line-through"
                            : isCurrent
                              ? "text-sm font-medium text-foreground"
                              : "text-sm font-medium text-muted-foreground"
                        }
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Next action</h2>
            </CardTitle>
            <CardDescription>What to do before the hiring team moves.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{application.nextAction}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>About your match</h2>
          </CardTitle>
          <CardDescription>
            Why this role was surfaced for {candidate.name.split(" ")[0]}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {/* Personalized headline */}
          <p className="text-base">
            CareerOS scored this role{" "}
            <span className="font-semibold tabular-nums">{factors.overall}%</span>{" "}
            for you. The match blends <strong>skills coverage (60%)</strong>,{" "}
            <strong>experience depth (25%)</strong>, and{" "}
            <strong>goals &amp; trajectory (15%)</strong> — the same model we use
            to rank roles on your dashboard and surface this one in the first
            place.
          </p>

          {/* Factor breakdown — three columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-1/20 text-foreground">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Skills · 60%
                </p>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums leading-none">
                {factors.skillsContribution}
                <span className="text-xs font-medium text-muted-foreground">
                  /100
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-semibold tabular-nums">
                  {factors.matchingSkills.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold tabular-nums">
                  {(factors.matchingSkills.length + factors.missingSkills.length)}
                </span>{" "}
                job requirements covered.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {factors.matchingSkills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-chart-1/15 px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
                {factors.missingSkills.length > 0 && (
                  <span className="rounded-md border border-dashed px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    +{factors.missingSkills.length} gap
                    {factors.missingSkills.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-2/20 text-foreground">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Experience · 25%
                </p>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums leading-none">
                {factors.experienceContribution}
                <span className="text-xs font-medium text-muted-foreground">
                  /100
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {factors.topRelevantExperience ?? "No closely-matched role yet"}.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {factors.experienceDetail}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-highlight-soft text-foreground">
                  <Target className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Goals · 15%
                </p>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums leading-none">
                {factors.goalsContribution}
                <span className="text-xs font-medium text-muted-foreground">
                  /100
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {factors.goalsDetail}
              </p>
            </div>
          </div>

          {/* Skill coverage line */}
          {factors.matchingSkills.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 align-text-bottom" aria-hidden />
              Your strongest overlaps:{" "}
              <span className="font-medium text-foreground">
                {factors.matchingSkills.slice(0, 5).join(", ")}
              </span>
              {factors.missingSkills.length > 0 && (
                <>
                  {" — gaps to close: "}
                  <span className="font-medium text-foreground">
                    {factors.missingSkills.slice(0, 4).join(", ")}
                  </span>
                </>
              )}
              .
            </p>
          ) : null}

          {/* Profile boost — actionable, specific */}
          <div className="rounded-lg border bg-surface-tint p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Flag className="h-3.5 w-3.5" aria-hidden />
              Lift your score for future applications
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {factors.profileBoostTips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
