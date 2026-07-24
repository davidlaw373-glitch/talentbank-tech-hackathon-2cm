/**
 * Candidate-owned derivations that turn the immutable match-score / job /
 * market datasets into the Career Path Navigator's view model. Pure and
 * React-free so it can be imported anywhere.
 *
 * Everything here is grounded in real data: target roles come from the
 * candidate's actual match scores, strengths/gaps come from the match record,
 * "verified strengths" are the subset backed by a verified credential, and
 * every roadmap milestone maps to one real skill gap. No numbers are invented.
 */
import type { Job } from "@/types/job";
import type { JobCandidateMatchScore } from "@/types/match-score";
import type { MarketSignal } from "@/types/market-signal";
import {
  dedupe,
  intersect,
  normalize,
} from "@/components/features/candidate/credential-derivations";

export type SkillDemand = { openings: number; delta: number } | null;

export type RoadmapMilestone = {
  step: number;
  skill: string;
  kind: "must-have" | "nice-to-have";
  course: string;
  project: string;
  completionEvidence: string;
  demand: SkillDemand;
};

export type TargetRole = {
  jobId: number;
  title: string;
  department: string;
  location: string;
  score: number;
  /** Matching skills backed by a verified credential. */
  verifiedStrengths: string[];
  /** Matching skills that are self-reported only. */
  otherStrengths: string[];
  /** Exact skill gaps, ordered must-have → nice-to-have → other. */
  gaps: string[];
  roadmap: RoadmapMilestone[];
  /** Market signals biased toward this role's gaps. */
  marketSignals: MarketSignal[];
};

function findSignal(
  skill: string,
  marketSignals: MarketSignal[],
): MarketSignal | undefined {
  const key = normalize(skill);
  return marketSignals.find((signal) => normalize(signal.skill) === key);
}

/** Rank gaps: job must-haves first, then nice-to-haves, then anything else. */
function orderGaps(missingSkills: string[], job: Job): string[] {
  const mustHave = new Set(job.mustHave.map(normalize));
  const niceToHave = new Set(job.niceToHave.map(normalize));
  const rank = (skill: string) => {
    const key = normalize(skill);
    if (mustHave.has(key)) return 0;
    if (niceToHave.has(key)) return 1;
    return 2;
  };
  // Stable sort preserving original order within a rank band.
  return dedupe(
    missingSkills
      .map((skill, index) => ({ skill, index, rank: rank(skill) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map((entry) => entry.skill),
  );
}

function classifyGap(skill: string, job: Job): RoadmapMilestone["kind"] {
  return job.niceToHave.map(normalize).includes(normalize(skill)) &&
    !job.mustHave.map(normalize).includes(normalize(skill))
    ? "nice-to-have"
    : "must-have";
}

/** One ordered milestone per gap skill, with deterministic guidance. */
export function buildRoadmap(
  gaps: string[],
  job: Job,
  marketSignals: MarketSignal[],
): RoadmapMilestone[] {
  return gaps.map((skill, index) => {
    const signal = findSignal(skill, marketSignals);
    return {
      step: index + 1,
      skill,
      kind: classifyGap(skill, job),
      course: `Take a structured ${skill} course and finish its graded project.`,
      project: `Ship a ${job.title}-relevant project that demonstrates ${skill}.`,
      completionEvidence: `Publish the repo or demo, then tag it with ${skill} on your profile.`,
      demand: signal
        ? { openings: signal.openings, delta: signal.delta }
        : null,
    };
  });
}

/** Gap-matching signals first, then fill from highest-demand remainder. */
export function biasMarketSignals(
  gapSkills: string[],
  marketSignals: MarketSignal[],
  limit = 3,
): MarketSignal[] {
  const chosen: MarketSignal[] = [];
  const usedIds = new Set<number>();

  for (const skill of gapSkills) {
    const signal = findSignal(skill, marketSignals);
    if (signal && !usedIds.has(signal.id)) {
      usedIds.add(signal.id);
      chosen.push(signal);
    }
    if (chosen.length >= limit) return chosen;
  }

  const byDemand = [...marketSignals].sort(
    (a, b) => b.delta - a.delta || a.skill.localeCompare(b.skill),
  );
  for (const signal of byDemand) {
    if (chosen.length >= limit) break;
    if (!usedIds.has(signal.id)) {
      usedIds.add(signal.id);
      chosen.push(signal);
    }
  }
  return chosen;
}

/**
 * Build the candidate's target roles from their real match scores. Roles are
 * sorted by score (desc), then title, then job id, for a stable default.
 */
export function deriveTargetRoles({
  matchScores,
  getJob,
  verifiedSkills,
  marketSignals,
}: {
  matchScores: JobCandidateMatchScore[];
  getJob: (id: number) => Job | undefined;
  verifiedSkills: string[];
  marketSignals: MarketSignal[];
}): TargetRole[] {
  const roles: TargetRole[] = [];

  for (const match of matchScores) {
    const job = getJob(match.jobId);
    if (!job) continue; // drop unresolved joins safely

    const verifiedStrengths = intersect(match.matchingSkills, verifiedSkills);
    const verifiedKeys = new Set(verifiedStrengths.map(normalize));
    const otherStrengths = match.matchingSkills.filter(
      (skill) => !verifiedKeys.has(normalize(skill)),
    );
    const gaps = orderGaps(match.missingSkills, job);

    roles.push({
      jobId: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      score: match.score,
      verifiedStrengths,
      otherStrengths,
      gaps,
      roadmap: buildRoadmap(gaps, job, marketSignals),
      marketSignals: biasMarketSignals(gaps, marketSignals),
    });
  }

  return roles.sort(
    (a, b) =>
      b.score - a.score ||
      a.title.localeCompare(b.title) ||
      a.jobId - b.jobId,
  );
}
