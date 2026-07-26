/**
 * Denormalized views on top of the new accessors, used by the university
 * pages. Each shape here matches what `src/data/university.ts` (the
 * back-compat shim) used to export, so migrating a page is a one-line
 * import swap. Unlike the shim, this module is the long-term home —
 * once the shim is deleted these helpers stay.
 */

import type {
  LegacyEmploymentRecord,
  LegacyGraduateRecord,
  LegacySkillDemand,
  LegacyUniversityDispute,
  VerificationRecordStatus,
} from "@/types/university";
import type { Credential, EmploymentOutcome } from "@/types/credential";

import { get as getUniversity } from "@/data/universities";
import { getForUniversity as getCredentialsForUniversity } from "@/data/credentials";
import {
  getForUniversity as getDisputesForUniversity,
  getClaim as getDisputeClaim,
  getLatestCounter as getDisputeLatestCounter,
} from "@/data/disputes";
import { getForUniversity as getCohortOutcomesForUniversity } from "@/data/cohort-outcomes";
import { list as marketSignalList } from "@/data/market-signals";
import { get as getEmployer } from "@/data/employers";
import { get as getCandidate } from "@/data/candidates";
import { list as applicationList } from "@/data/applications";

import type { University } from "@/types/university";

const DEMO_UNIVERSITY_ID = 1;

export function getUniversityProfile(id: number = DEMO_UNIVERSITY_ID): University {
  const u = getUniversity(id);
  if (!u) {
    throw new Error(`University ${id} missing from universities.json`);
  }
  return u;
}

export const universityProfile: University = getUniversityProfile();

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function parseNameAndProgram(credentialName: string): {
  name: string;
  program: string;
} {
  // Non-candidate credentials have names like "Priya Ramasamy · BSc Software Engineering".
  const [namePart, programPart] = credentialName
    .split("·")
    .map((s) => s.trim());
  return { name: namePart ?? credentialName, program: programPart ?? "" };
}

function mapCredentialStatusToVerification(
  status: Credential["status"],
): VerificationRecordStatus {
  switch (status) {
    case "Verified":
      return "Verified";
    case "Pending":
    case "Pending review":
      return "Pending review";
    case "Not started":
      return "Action required";
    case "Rejected":
      return "Rejected";
    default:
      return "Pending review";
  }
}

export function getGraduateRecords(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyGraduateRecord[] {
  const credentials = getCredentialsForUniversity(universityId);
  const result: LegacyGraduateRecord[] = [];

  for (const cred of credentials) {
    let name: string;
    let initials: string;
    let program: string;
    if (cred.candidateId !== null) {
      const candidate = getCandidate(cred.candidateId);
      if (!candidate) continue;
      name = candidate.name;
      initials = candidate.initials;
      program = cred.name;
    } else {
      const parsed = parseNameAndProgram(cred.name);
      name = parsed.name;
      initials = initialsFromName(parsed.name);
      program = parsed.program;
    }

    const company = cred.employerId
      ? getEmployer(cred.employerId)?.companyName
      : undefined;

    result.push({
      id: cred.id,
      name,
      initials,
      program,
      graduationYear: cred.graduationYear ?? 0,
      gpa: cred.gpa ?? "",
      status: mapCredentialStatusToVerification(cred.status),
      skills: cred.skills,
      capstone: cred.capstone,
      employment: cred.employment as EmploymentOutcome,
      company,
      role: cred.role,
    });
  }
  return result;
}

export const graduateRecords: LegacyGraduateRecord[] = getGraduateRecords();

/**
 * Academic-record-only view of graduateRecords, for the Graduates directory.
 * A candidate can hold several credentials (degree, internship, portfolio),
 * but the directory should show one row per graduate's academic record —
 * not a duplicate row per piece of evidence they've submitted.
 */
export function getAcademicGraduateRecords(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyGraduateRecord[] {
  const credentials = getCredentialsForUniversity(universityId).filter(
    (cred) => cred.type === "Education",
  );
  const result: LegacyGraduateRecord[] = [];

  for (const cred of credentials) {
    let name: string;
    let initials: string;
    let program: string;
    if (cred.candidateId !== null) {
      const candidate = getCandidate(cred.candidateId);
      if (!candidate) continue;
      name = candidate.name;
      initials = candidate.initials;
      program = cred.name;
    } else {
      const parsed = parseNameAndProgram(cred.name);
      name = parsed.name;
      initials = initialsFromName(parsed.name);
      program = parsed.program;
    }

    const company = cred.employerId
      ? getEmployer(cred.employerId)?.companyName
      : undefined;

    result.push({
      id: cred.id,
      name,
      initials,
      program,
      graduationYear: cred.graduationYear ?? 0,
      gpa: cred.gpa ?? "",
      status: mapCredentialStatusToVerification(cred.status),
      skills: cred.skills,
      capstone: cred.capstone,
      employment: cred.employment as EmploymentOutcome,
      company,
      role: cred.role,
    });
  }
  return result;
}

export const academicGraduateRecords: LegacyGraduateRecord[] =
  getAcademicGraduateRecords();

export function getUniversityDisputes(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyUniversityDispute[] {
  const disputes = getDisputesForUniversity(universityId);
  const credentials = getCredentialsForUniversity(universityId);
  return disputes.map((dispute) => {
    const cred = credentials.find((c) => c.id === dispute.credentialId);
    let name = "";
    let initials = "";
    if (cred) {
      if (cred.candidateId !== null) {
        const candidate = getCandidate(cred.candidateId);
        if (candidate) {
          name = candidate.name;
          initials = candidate.initials;
        }
      } else {
        const parsed = parseNameAndProgram(cred.name);
        name = parsed.name;
        initials = initialsFromName(parsed.name);
      }
    }
    return {
      id: dispute.id,
      graduateName: name,
      graduateInitials: initials,
      field: dispute.field,
      claim: getDisputeClaim(dispute),
      counter: getDisputeLatestCounter(dispute),
      filedDate: dispute.filedDate,
      status: dispute.status,
      acceptedBy: dispute.acceptedBy ?? null,
      messages: dispute.messages,
    };
  });
}

export const universityDisputes: LegacyUniversityDispute[] =
  getUniversityDisputes();

export function getEmploymentOutcomes(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyEmploymentRecord[] {
  return getCohortOutcomesForUniversity(universityId).map(
    ({ universityId: _u, ...rest }) => {
      void _u;
      return rest;
    },
  );
}

export const employmentOutcomes: LegacyEmploymentRecord[] =
  getEmploymentOutcomes();

export function getSkillDemand(): LegacySkillDemand[] {
  return marketSignalList.map(({ id: _id, ...rest }) => {
    void _id;
    return rest;
  });
}

export const skillDemand: LegacySkillDemand[] = getSkillDemand();

/* ------------------------------------------------------------------ */
/*  Advanced analytics selectors — power the "Advanced analytics" tab */
/*  on /university/analytics. Derived purely from existing fixtures;  */
/*  no backend.                                                       */
/* ------------------------------------------------------------------ */

export type MarketSignalWithTrend = {
  skill: string;
  openings: number;
  delta: number;
  history: number[];
  trend: "up" | "down" | "flat";
};

/** All market signals with a 4-class trend (up / down / flat / ramp). */
export function getMarketSignalHistory(): MarketSignalWithTrend[] {
  return marketSignalList.map((signal) => {
    const first = signal.history[0] ?? 0;
    const last = signal.history[signal.history.length - 1] ?? signal.openings;
    let trend: MarketSignalWithTrend["trend"] = "flat";
    if (last > first * 1.2) trend = "up";
    else if (last < first * 0.8) trend = "down";
    return {
      skill: signal.skill,
      openings: signal.openings,
      delta: signal.delta,
      history: signal.history,
      trend,
    };
  });
}

export type SkillGap = {
  skill: string;
  /** Current job openings in the market. */
  demandOpenings: number;
  /** % of this university's graduates whose credentials include this skill. */
  graduateCoverage: number;
  /** 0-100; how short we are of employer demand. */
  gapPct: number;
  /**
   * Suggested syllabus action: "Add" when almost no grads have it,
   * "Deepen" when some have it but demand outstrips supply,
   * "Maintain" when coverage roughly matches demand.
   */
  recommendation: "Add to syllabus" | "Deepen coverage" | "Maintain";
};

const GAP_RECOMMENDATIONS = {
  ADD: "Add to syllabus",
  DEEPEN: "Deepen coverage",
  MAINTAIN: "Maintain",
} as const;

/**
 * Compare in-demand skills (from market signals) against the credentials
 * our graduates actually hold. The primary "syllabus change" surface —
 * tells the admin which topics deserve new electives vs deeper coverage.
 */
export function getSkillGapAnalysis(
  universityId: number = DEMO_UNIVERSITY_ID,
  limit: number = 8,
): SkillGap[] {
  const credentials = getCredentialsForUniversity(universityId).filter(
    (c) => c.type === "Education",
  );
  const total = credentials.length || 1;
  const coverage = new Map<string, number>();
  for (const cred of credentials) {
    for (const skill of cred.skills) {
      coverage.set(skill, (coverage.get(skill) ?? 0) + 1);
    }
  }

  return [...marketSignalList]
    .sort((a, b) => b.openings - a.openings)
    .slice(0, limit)
    .map((signal) => {
      const gradsWithSkill = coverage.get(signal.skill) ?? 0;
      const graduateCoverage = Math.round((gradsWithSkill / total) * 100);
      const gapPct = Math.max(0, 100 - graduateCoverage);
      let recommendation: SkillGap["recommendation"];
      if (graduateCoverage <= 15) recommendation = GAP_RECOMMENDATIONS.ADD;
      else if (graduateCoverage <= 45) recommendation = GAP_RECOMMENDATIONS.DEEPEN;
      else recommendation = GAP_RECOMMENDATIONS.MAINTAIN;
      return {
        skill: signal.skill,
        demandOpenings: signal.openings,
        graduateCoverage,
        gapPct,
        recommendation,
      };
    });
}

export type CohortComparisonRow = {
  cohort: string;
  total: number;
  employed: number;
  employmentRate: number;
  avgSalary: string;
  topEmployer: string;
  topRole: string;
  medianTimeToHire: number;
  avgGpa: string;
};

/** Parse a "3.78 / 4.00" GPA string to a 0-100 scale. */
function gpaToPct(gpa: string): number | null {
  const match = gpa.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return null;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Per-cohort comparison table — combines cohort-outcomes.json with
 * credential-level GPA data so admins can see if quality is rising.
 */
export function getCohortComparison(
  universityId: number = DEMO_UNIVERSITY_ID,
): CohortComparisonRow[] {
  const outcomes = getCohortOutcomesForUniversity(universityId);
  const credentials = getCredentialsForUniversity(universityId).filter(
    (c) => c.type === "Education" && c.graduationYear !== undefined,
  );

  return outcomes
    .map((outcome) => {
      const year = Number(outcome.cohort.match(/\d{4}/)?.[0] ?? 0);
      const cohortCreds = credentials.filter(
        (c) => c.graduationYear === year,
      );
      const gpaValues = cohortCreds
        .map((c) => (c.gpa ? gpaToPct(c.gpa) : null))
        .filter((v): v is number => v !== null);
      const avgGpa = gpaValues.length
        ? `${Math.round(
            gpaValues.reduce((sum, v) => sum + v, 0) / gpaValues.length,
          )}%`
        : "—";
      return {
        cohort: outcome.cohort,
        total: outcome.total,
        employed: outcome.employed,
        employmentRate: Math.round((outcome.employed / outcome.total) * 100),
        avgSalary: outcome.avgSalary,
        topEmployer: outcome.topEmployer,
        topRole: outcome.topRole,
        medianTimeToHire: getUniversityProfile(universityId).medianTimeToHire,
        avgGpa,
      };
    })
    .sort((a, b) => a.cohort.localeCompare(b.cohort));
}

export type ApplicationFunnelData = {
  applied: number;
  screened: number;
  interviewed: number;
  offered: number;
  hired: number;
  /** Offer rate as a percentage of applications. */
  conversionRate: number;
};

/**
 * Applications funnel: applied → screened → interviewed → offered → hired.
 * Stages are derived from each application's timeline completion flags.
 */
export function getApplicationFunnel(): ApplicationFunnelData {
  const apps = applicationList;
  const at = (i: number) =>
    apps.filter((a) => a.timeline[i]?.complete === true).length;
  const applied = apps.length;
  const screened = at(1);
  const interviewed = at(2);
  const offered = at(3);
  const hired = at(4);
  return {
    applied,
    screened,
    interviewed,
    offered,
    hired,
    conversionRate: applied ? Math.round((offered / applied) * 100) : 0,
  };
}

export type VerificationAnalytics = {
  totalCredentials: number;
  verified: number;
  pending: number;
  actionRequired: number;
  rejected: number;
  /** Verified ÷ total. 0-100. */
  passRate: number;
  /** Synthesized from credential id; deterministic, demo-grade. */
  avgDaysToVerify: number;
  /** Dispute volume grouped by dispute `field` category. */
  disputeByCategory: Array<{ category: string; count: number }>;
};

/**
 * Verification pipeline health — throughput, pass rate, dispute topics.
 * Pass rate is the share of credentials that have cleared review.
 */
export function getVerificationAnalytics(
  universityId: number = DEMO_UNIVERSITY_ID,
): VerificationAnalytics {
  const credentials = getCredentialsForUniversity(universityId);
  const disputes = getDisputesForUniversity(universityId);

  const verified = credentials.filter((c) => c.status === "Verified").length;
  const pending = credentials.filter(
    (c) => c.status === "Pending" || c.status === "Pending review",
  ).length;
  const actionRequired = credentials.filter(
    (c) => c.status === "Not started",
  ).length;
  const rejected = credentials.filter((c) => c.status === "Rejected").length;
  const total = credentials.length;

  // Deterministic demo metric — keeps the page stable between renders.
  const seedSum = credentials.reduce((sum, c) => sum + c.id, 0);
  const avgDaysToVerify = 3 + (seedSum % 7);

  const categoryCounts = new Map<string, number>();
  for (const dispute of disputes) {
    categoryCounts.set(
      dispute.field,
      (categoryCounts.get(dispute.field) ?? 0) + 1,
    );
  }
  const disputeByCategory = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCredentials: total,
    verified,
    pending,
    actionRequired,
    rejected,
    passRate: total ? Math.round((verified / total) * 100) : 0,
    avgDaysToVerify,
    disputeByCategory,
  };
}

export type TimeToEmploymentBand = {
  /** Display label, e.g. "<4 weeks". */
  band: string;
  /** Number of graduates in this band. */
  count: number;
  /** Width percentage relative to the largest band. 0-100. */
  widthPct: number;
};

const TIME_BANDS: ReadonlyArray<{ band: string; max: number }> = [
  { band: "<4 weeks", max: 4 },
  { band: "4–8 weeks", max: 8 },
  { band: "8–12 weeks", max: 12 },
  { band: "12–24 weeks", max: 24 },
  { band: ">24 weeks", max: Number.POSITIVE_INFINITY },
];

/**
 * Distribution of weeks from graduation to first employment. Synthesized
 * deterministically from each credential's id + graduationYear so the
 * histogram is stable between renders and reflects a believable spread
 * (newer grads cluster fast; older grads took longer).
 */
export function getTimeToEmploymentDistribution(
  universityId: number = DEMO_UNIVERSITY_ID,
): TimeToEmploymentBand[] {
  const employed = getCredentialsForUniversity(universityId).filter(
    (c) => c.type === "Education" && c.employment === "Employed",
  );
  const counts = TIME_BANDS.map(() => 0);
  const thisYear = 2026;
  for (const cred of employed) {
    const baseYear = cred.graduationYear ?? thisYear;
    const yearsSince = Math.max(0, thisYear - baseYear);
    const weeks = 2 + ((cred.id * 7) % 18) + yearsSince * 0.6;
    for (let i = 0; i < TIME_BANDS.length; i++) {
      if (weeks <= TIME_BANDS[i].max) {
        counts[i]++;
        break;
      }
    }
  }
  const max = Math.max(...counts, 1);
  return TIME_BANDS.map((b, i) => ({
    band: b.band,
    count: counts[i],
    widthPct: Math.round((counts[i] / max) * 100),
  }));
}

export type IndustryDistributionRow = {
  industry: string;
  count: number;
  /** 0-100. */
  pct: number;
};

/** Where our employed graduates went, grouped by hiring-employer industry. */
export function getIndustryDistribution(
  universityId: number = DEMO_UNIVERSITY_ID,
): IndustryDistributionRow[] {
  const employed = getCredentialsForUniversity(universityId).filter(
    (c) => c.employment === "Employed" && c.employerId !== undefined,
  );
  const counts = new Map<string, number>();
  for (const cred of employed) {
    const employer = cred.employerId !== undefined && getEmployer(cred.employerId);
    if (!employer) continue;
    counts.set(employer.industry, (counts.get(employer.industry) ?? 0) + 1);
  }
  const total = employed.length || 1;
  return Array.from(counts.entries())
    .map(([industry, count]) => ({
      industry,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export type TopEmployerRow = {
  employerId: number;
  employer: string;
  initials: string;
  hires: number;
  topRole: string;
  industry: string;
};

/** Top hiring companies of our graduates. */
export function getTopEmployers(
  universityId: number = DEMO_UNIVERSITY_ID,
  limit: number = 5,
): TopEmployerRow[] {
  const employed = getCredentialsForUniversity(universityId).filter(
    (c) => c.employment === "Employed" && c.employerId !== undefined,
  );
  const buckets = new Map<
    number,
    { count: number; roles: Map<string, number> }
  >();
  for (const cred of employed) {
    if (cred.employerId === undefined) continue;
    const bucket = buckets.get(cred.employerId) ?? { count: 0, roles: new Map() };
    bucket.count += 1;
    if (cred.role) {
      bucket.roles.set(cred.role, (bucket.roles.get(cred.role) ?? 0) + 1);
    }
    buckets.set(cred.employerId, bucket);
  }
  return Array.from(buckets.entries())
    .map(([employerId, bucket]) => {
      const employer = getEmployer(employerId);
      const topRoleEntry = Array.from(bucket.roles.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      return {
        employerId,
        employer: employer?.companyName ?? `Employer ${employerId}`,
        initials: employer?.initials ?? "?",
        hires: bucket.count,
        topRole: topRoleEntry?.[0] ?? "—",
        industry: employer?.industry ?? "—",
      };
    })
    .sort((a, b) => b.hires - a.hires)
    .slice(0, limit);
}
