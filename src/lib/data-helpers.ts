/**
 * High-level joins on top of the raw accessors. Each helper builds the
 * denormalized views that pages used to get from the legacy `employer.ts` /
 * `university.ts` / `candidate.ts` shims, so consumers can read from
 * relations without re-implementing the same joins in every page.
 *
 * Every helper is pure: same input, same output. Internal maps are built
 * once at module load, lookups are O(1).
 */

import { get as getCandidate, list as candidateList } from "@/data/candidates";
import { get as getEmployer } from "@/data/employers";
import { get as getJob, list as jobList, getApplicantCount } from "@/data/jobs";
import {
  get as getApplication,
  getByCandidate as getAppsByCandidate,
  getByJob as getAppsByJob,
  list as applicationList,
} from "@/data/applications";
import { getForPair as getMatchScoreByPair, getForCandidate as getMatchScoresForCandidate } from "@/data/match-scores";
import { getByApplication as getInterviewsByApplication } from "@/data/interviews";
import { getByApplication as getOfferByApplication } from "@/data/offers";
import { getByEmployer as getTalentPoolByEmployer } from "@/data/talent-pool";
import { getForCandidate as getCredentialsForCandidate } from "@/data/credentials";

import type { Candidate } from "@/types/candidate";
import type { Employer } from "@/types/employer";
import type { Job } from "@/types/job";
import type { Application } from "@/types/candidate";
import type { Interview } from "@/types/interview";
import type { Offer } from "@/types/offer";
import type { TalentPoolEntry } from "@/types/talent-pool";

/* ----------------------------------------------------------------- */
/*  Candidate-side context (used by /candidate/dashboard, profile,    */
/*  application detail, resume, jobs)                                  */
/* ----------------------------------------------------------------- */

export type CandidateContext = {
  candidate: Candidate;
  currentApplication: Application | undefined;
  currentJob: Job | undefined;
};

/**
 * The candidate's view of "the job I applied to" — used for the dashboard
 * "next action" prompt, the profile header, and the resume preview.
 * Returns the most recent active application as the "current" one.
 */
export function getCandidateContext(candidateId: number): CandidateContext {
  const candidate = getCandidate(candidateId);
  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found in dataset`);
  }
  const activeApps = getAppsByCandidate(candidateId).filter((a) => !a.rejected);
  const currentApplication = activeApps[0];
  const currentJob = currentApplication
    ? getJob(currentApplication.jobId)
    : undefined;
  return { candidate, currentApplication, currentJob };
}

/* ----------------------------------------------------------------- */
/*  Employer-side: candidate row (one row per application, joined)     */
/* ----------------------------------------------------------------- */

export type EmployerCandidateRow = {
  app: Application;
  candidate: Candidate;
  job: Job;
  matchScore: number;
  verification: "Verified" | "Pending" | "None";
};

function verificationFor(candidateId: number): "Verified" | "Pending" | "None" {
  const credentials = getCredentialsForCandidate(candidateId);
  if (credentials.some((c) => c.status === "Verified")) return "Verified";
  if (credentials.some((c) => c.status === "Pending")) return "Pending";
  return "None";
}

/**
 * Every application for the given employer, joined with candidate, job,
 * and match score. Used by the candidates list, the job detail "applicants"
 * section, the talent pool picker, and the candidate detail page.
 */
export function getEmployerCandidateRows(
  employerId: number,
): EmployerCandidateRow[] {
  const myJobs = jobList.filter((j) => j.employerId === employerId);
  const out: EmployerCandidateRow[] = [];
  for (const job of myJobs) {
    for (const app of getAppsByJob(job.id)) {
      const candidate = getCandidate(app.candidateId);
      if (!candidate) continue;
      const score = getMatchScoreByPair(candidate.id, job.id);
      out.push({
        app,
        candidate,
        job,
        matchScore: score?.score ?? 0,
        verification: verificationFor(candidate.id),
      });
    }
  }
  return out;
}

/* ----------------------------------------------------------------- */
/*  Employer-side: interviews, offers                                 */
/* ----------------------------------------------------------------- */

export type EmployerInterviewRow = {
  interview: Interview;
  application: Application;
  candidate: Candidate;
  job: Job;
};

export function getEmployerInterviewRows(
  employerId: number,
): EmployerInterviewRow[] {
  const out: EmployerInterviewRow[] = [];
  for (const job of jobList.filter((j) => j.employerId === employerId)) {
    for (const app of getAppsByJob(job.id)) {
      const candidate = getCandidate(app.candidateId);
      if (!candidate) continue;
      for (const interview of getInterviewsByApplication(app.id)) {
        out.push({ interview, application: app, candidate, job });
      }
    }
  }
  return out;
}

export type EmployerOfferRow = {
  offer: Offer;
  application: Application;
  candidate: Candidate;
  job: Job;
};

export function getEmployerOfferRows(employerId: number): EmployerOfferRow[] {
  const out: EmployerOfferRow[] = [];
  for (const job of jobList.filter((j) => j.employerId === employerId)) {
    for (const app of getAppsByJob(job.id)) {
      const candidate = getCandidate(app.candidateId);
      if (!candidate) continue;
      const offer = getOfferByApplication(app.id);
      if (!offer) continue;
      out.push({ offer, application: app, candidate, job });
    }
  }
  return out;
}

/* ----------------------------------------------------------------- */
/*  Employer-side: talent pool                                         */
/* ----------------------------------------------------------------- */

export type TalentPoolRow = {
  entry: TalentPoolEntry;
  candidate: Candidate;
  job: Job | undefined;
};

export function getTalentPoolRows(employerId: number): TalentPoolRow[] {
  const out: TalentPoolRow[] = [];
  for (const entry of getTalentPoolByEmployer(employerId)) {
    const candidate = getCandidate(entry.candidateId);
    if (!candidate) continue;
    // The talent-pool "sourceDetail" carries the job title at save time
    // (e.g. "Senior Frontend Engineer · Aug 2026"). We don't have a
    // permanent FK from entry to job, so the job slot is best-effort.
    const job = jobList.find((j) => j.employerId === employerId);
    out.push({ entry, candidate, job });
  }
  return out;
}

/* ----------------------------------------------------------------- */
/*  Employer-side: aggregate stats (live, derived)                     */
/* ----------------------------------------------------------------- */

export type EmployerStats = {
  openRoles: number;
  activeCandidates: number;
  hiresThisQuarter: number;
  avgTimeToHire: number;
};

export function getEmployerStats(employerId: number): EmployerStats {
  const myJobs = jobList.filter((j) => j.employerId === employerId);
  const myApplications = myJobs.flatMap((j) => getAppsByJob(j.id));
  const activeCandidateIds = new Set(
    myApplications.filter((a) => !a.rejected).map((a) => a.candidateId),
  );
  const hiresThisQuarter = myApplications.filter(
    (a) => getOfferByApplication(a.id)?.decision === "Accepted",
  ).length;
  return {
    openRoles: myJobs.filter((j) => j.status === "Live").length,
    activeCandidates: activeCandidateIds.size,
    hiresThisQuarter,
    // Under-specified by the demo dataset; carry the prototype's default.
    avgTimeToHire: 18,
  };
}

/* ----------------------------------------------------------------- */
/*  Re-exports of common accessors for ergonomic imports               */
/* ----------------------------------------------------------------- */

export {
  getCandidate,
  getEmployer,
  getJob,
  getApplication,
  candidateList,
  jobList,
  applicationList,
  getApplicantCount,
  getMatchScoreByPair,
  getMatchScoresForCandidate,
};
export type { Candidate, Employer, Job, Application, Interview, Offer, TalentPoolEntry };
