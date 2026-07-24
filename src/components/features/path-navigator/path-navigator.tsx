"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Flag,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useToast } from "@/components/common/toast";
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
import { getMatchScoresForCandidate } from "@/lib/data-helpers";
import { get as getJob } from "@/data/jobs";
import { getForCandidate as getCredentialsForCandidate } from "@/data/credentials";
import { list as marketSignals } from "@/data/market-signals";
import { getVerifiedSkillSet } from "@/components/features/candidate/credential-derivations";
import {
  deriveTargetRoles,
  type TargetRole,
} from "@/components/features/path-navigator/path-derivations";

const DEMO_CANDIDATE_ID = 1;

// Derived once from real data — target roles are the candidate's actual
// matched jobs, ranked by real match score.
const VERIFIED_SKILLS = getVerifiedSkillSet(
  getCredentialsForCandidate(DEMO_CANDIDATE_ID),
);
const TARGET_ROLES = deriveTargetRoles({
  matchScores: getMatchScoresForCandidate(DEMO_CANDIDATE_ID),
  getJob,
  verifiedSkills: VERIFIED_SKILLS,
  marketSignals,
});

function SummaryStat({
  label,
  value,
  suffix,
  icon: Icon,
  swatch,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  swatch: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            swatch,
          )}
        >
          <Icon aria-hidden className="h-5 w-5" />
        </div>
        <p className="text-4xl font-semibold tabular-nums leading-none lg:text-5xl">
          {value}
          {suffix ? (
            <span className="ml-0.5 text-base font-medium text-muted-foreground lg:text-lg">
              {suffix}
            </span>
          ) : null}
        </p>
        <p className="text-base font-semibold tracking-tight">{label}</p>
      </CardContent>
    </Card>
  );
}

function deltaLabel(delta: number): string {
  return delta >= 0 ? `up ${delta} percent` : `down ${Math.abs(delta)} percent`;
}

function RolePanel({
  role,
  isGoal,
  showRoadmap,
  onToggleGoal,
  onToggleRoadmap,
}: {
  role: TargetRole;
  isGoal: boolean;
  showRoadmap: boolean;
  onToggleGoal: () => void;
  onToggleRoadmap: () => void;
}) {
  const roadmapId = `roadmap-${role.jobId}`;
  const hasGaps = role.gaps.length > 0;

  return (
    <div className="space-y-4">
      {/* The bridge: where you are → target role */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              <h3 className="flex items-center gap-2">
                <Target aria-hidden className="h-4 w-4" />
                The bridge
              </h3>
            </CardTitle>
            <CardDescription>
              From your verified profile to {role.title}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Where you are
                </p>
                <p className="mt-1.5 text-sm font-medium">
                  {role.verifiedStrengths.length} verified ·{" "}
                  {role.otherStrengths.length} self-reported strengths
                </p>
              </div>
              <div
                className="flex items-center justify-center sm:px-2"
                aria-hidden
              >
                <ArrowRight className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="rounded-lg border bg-foreground p-4 text-background">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Target role
                </p>
                <p className="mt-1.5 text-sm font-medium">{role.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-background/80">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" aria-hidden />
                    {role.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {role.location}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI match — real score */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h3>AI match for you</h3>
            </CardTitle>
            <CardDescription>
              Scored from your verified skills against this role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums leading-none">
                {role.score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={role.score}
              aria-label={`Match score for ${role.title}`}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-chart-1"
                style={{ width: `${role.score}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3>Skill breakdown</h3>
          </CardTitle>
          <CardDescription>
            Institution-verified strengths, other matches, and the exact gaps
            to close.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Verified strengths
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {role.verifiedStrengths.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No verified skills match yet.
                </p>
              ) : (
                role.verifiedStrengths.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 hover:bg-secondary"
                  >
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" aria-hidden />
              Other matches
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {role.otherStrengths.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nothing self-reported here.
                </p>
              ) : (
                role.otherStrengths.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Flag className="h-4 w-4 text-muted-foreground" aria-hidden />
              Exact gaps
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {hasGaps ? (
                role.gaps.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  You cover every recorded requirement.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap CTA + revealable milestone list */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 sm:flex-1">
            <p className="text-sm font-semibold">
              {hasGaps
                ? "Ready to close these gaps?"
                : "You're interview-ready for this role"}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasGaps
                ? `A step-by-step roadmap of ${role.gaps.length} milestone${role.gaps.length === 1 ? "" : "s"} — courses and projects.`
                : "No skill gaps to bridge. Focus on applying and interview prep."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0 sm:items-center">
            <Button
              variant={isGoal ? "secondary" : "outline"}
              aria-pressed={isGoal}
              onClick={onToggleGoal}
              className="w-full sm:w-auto"
            >
              {isGoal ? "Following this goal" : "Mark as my goal"}
            </Button>
            {hasGaps ? (
              <Button
                onClick={onToggleRoadmap}
                aria-expanded={showRoadmap}
                aria-controls={roadmapId}
                className="w-full sm:w-auto"
              >
                {showRoadmap ? "Hide roadmap" : "Get my roadmap"}
                <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/candidate/jobs/${role.jobId}`}>
                  View role
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {hasGaps ? (
        <div
          id={roadmapId}
          className={cn(
            "overflow-hidden transition-all duration-700 ease-out",
            showRoadmap
              ? "max-h-[4000px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
          )}
          aria-hidden={!showRoadmap}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                <h3 className="flex items-center gap-2">
                  <Rocket aria-hidden className="h-4 w-4" />
                  Your roadmap to {role.title}
                </h3>
              </CardTitle>
              <CardDescription>
                One milestone per gap, ordered by what the role needs most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {role.roadmap.map((milestone) => (
                  <li
                    key={milestone.skill}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums"
                      aria-hidden
                    >
                      {milestone.step}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold">
                          {milestone.skill}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {milestone.kind === "must-have"
                            ? "Must-have"
                            : "Nice-to-have"}
                        </Badge>
                        {milestone.demand ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" aria-hidden />
                            {milestone.demand.openings} open roles ·{" "}
                            <span aria-label={deltaLabel(milestone.demand.delta)}>
                              +{milestone.demand.delta}%
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No market signal in current data
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                        <p className="flex items-start gap-2">
                          <BookOpen
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          {milestone.course}
                        </p>
                        <p className="flex items-start gap-2">
                          <Rocket
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          {milestone.project}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Done when: {milestone.completionEvidence}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Live market signals biased to this role's gaps */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="flex items-center gap-2">
              <TrendingUp aria-hidden className="h-4 w-4" />
              Market signals for this path
            </h3>
          </CardTitle>
          <CardDescription>
            Demand from the CareerOS dataset, weighted toward your gaps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {role.marketSignals.map((trend) => (
              <div
                key={trend.skill}
                className="rounded-lg border bg-card p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {trend.skill}
                </p>
                <p
                  className="mt-1 text-2xl font-semibold tabular-nums leading-none"
                  aria-label={deltaLabel(trend.delta)}
                >
                  +{trend.delta}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trend.openings} open roles this quarter
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PathNavigator() {
  const { push } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    TARGET_ROLES[0]?.jobId ?? null,
  );
  const [goalJobId, setGoalJobId] = useState<number | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const selectedRole =
    TARGET_ROLES.find((role) => role.jobId === selectedJobId) ??
    TARGET_ROLES[0] ??
    null;

  const selectRole = (jobId: number) => {
    setSelectedJobId(jobId);
    setShowRoadmap(false);
  };

  const toggleGoal = (role: TargetRole) => {
    const willFollow = goalJobId !== role.jobId;
    setGoalJobId(willFollow ? role.jobId : null);
    push({
      title: willFollow
        ? `Following ${role.title}`
        : `Stopped following ${role.title}`,
      tone: willFollow ? "success" : "info",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="sr-only">Career Path Navigator</h1>

      {selectedRole === null ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-sm font-medium">No matched roles yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add skills and browse jobs so CareerOS can score roles for you.
            </p>
            <Button asChild className="mt-4">
              <Link href="/candidate/jobs">Browse jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
          {/* Target-role selector — sticky sidebar on lg+, full-width grid on mobile */}
          <aside
            aria-label="Choose a target role"
            className="w-full shrink-0 space-y-3 lg:sticky lg:top-4 lg:w-72 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 xl:w-80"
          >
            <h2 className="text-card-title">Choose a target role</h2>
            <div
              role="radiogroup"
              aria-label="Target role"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1"
            >
              {TARGET_ROLES.map((role) => {
                const active = role.jobId === selectedRole.jobId;
                return (
                  <button
                    key={role.jobId}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectRole(role.jobId)}
                    className={cn(
                      "rounded-lg border bg-card p-4 text-left transition-colors lift-on-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active
                        ? "border-foreground ring-1 ring-foreground"
                        : "hover:bg-accent-soft",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{role.title}</p>
                      <span className="text-lg font-semibold tabular-nums leading-none">
                        {role.score}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.department}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {role.gaps.length === 0
                        ? "No gaps — interview-ready"
                        : `${role.gaps.length} gap${role.gaps.length === 1 ? "" : "s"} to close`}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right column: stats + role panel */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Summary stats for the selected role */}
            <section
              aria-label="Selected role summary"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            >
              <SummaryStat
                label="AI match"
                value={selectedRole.score}
                suffix="/100"
                icon={Sparkles}
                swatch="bg-highlight-soft text-foreground"
              />
              <SummaryStat
                label="Verified strengths"
                value={selectedRole.verifiedStrengths.length}
                icon={ShieldCheck}
                swatch="bg-chart-1/20 text-foreground"
              />
              <SummaryStat
                label="Exact gaps"
                value={selectedRole.gaps.length}
                icon={Flag}
                swatch="bg-accent-soft text-foreground"
              />
              <SummaryStat
                label="Roadmap steps"
                value={selectedRole.roadmap.length}
                icon={Rocket}
                swatch="bg-chart-2/20 text-foreground"
              />
            </section>

            <RolePanel
              role={selectedRole}
              isGoal={goalJobId === selectedRole.jobId}
              showRoadmap={showRoadmap}
              onToggleGoal={() => toggleGoal(selectedRole)}
              onToggleRoadmap={() => setShowRoadmap((open) => !open)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
