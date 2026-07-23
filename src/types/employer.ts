/**
 * New clean Employer — the company that owns jobs and hires candidates.
 * `openRoles`, `activeCandidates`, `hiresThisQuarter`, `avgTimeToHire`
 * are derived at render time from `jobs.json` / `applications.json` /
 * `offers.json` — they are not stored on the employer.
 */
export type Employer = {
  id: number;
  companyName: string;
  initials: string;
  tagline: string;
  industry: EmployerIndustry;
  size: CompanySize;
  founded: number;
  website: string;
  hq: string;
  about: string;
  culture: string[];
  benefits: string[];
};

export type EmployerIndustry =
  | "Software & Internet"
  | "Financial Services"
  | "Education"
  | "Healthcare"
  | "Manufacturing"
  | "Public Sector";

export type CompanySize = "1–10" | "11–50" | "51–200" | "201–500" | "500+";

/** @deprecated Import `JobStatus` from `@/types/job` instead. */
export type JobStatus = "Live" | "Draft" | "Paused" | "Closed";

/* ------------------------------------------------------------------ */
/*  Legacy types kept for the back-compat shim in src/data/employer.ts  */
/*  These are deleted once consumer pages migrate to the new accessors. */
/* ------------------------------------------------------------------ */

import type { ApplicationStage } from "@/types/application";

export type LegacyEmployerProfile = {
  companyName: string;
  initials: string;
  tagline: string;
  industry: EmployerIndustry;
  size: CompanySize;
  founded: number;
  website: string;
  hq: string;
  about: string;
  openRoles: number;
  activeCandidates: number;
  hiresThisQuarter: number;
  avgTimeToHire: number;
  culture: string[];
  benefits: string[];
};

export type LegacyEmployerJob = {
  id: number;
  title: string;
  department: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Internship" | "Contract";
  salary: string;
  status: "Live" | "Draft" | "Paused" | "Closed";
  posted: string;
  applicants: number;
  filledScore: number;
  mustHave: string[];
  niceToHave: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
};

export type LegacyEmployerCandidate = {
  id: number;
  name: string;
  initials: string;
  title: string;
  location: string;
  appliedFor: string;
  appliedDate: string;
  stage: ApplicationStage;
  rejected: boolean;
  matchScore: number;
  topSkills: string[];
  summary: string;
  verification: "Verified" | "Pending" | "None";
  starred: boolean;
  timeline: Array<{ label: string; date: string; complete: boolean }>;
};

export type LegacyEmployerInterview = {
  id: number;
  candidateName: string;
  candidateInitials: string;
  role: string;
  type: "Phone screen" | "Technical" | "System design" | "Behavioural" | "Final";
  interviewers: string[];
  scheduledFor: string;
  duration: number;
  status:
    | "Scheduled"
    | "Pending confirmation"
    | "Reschedule requested"
    | "Completed"
    | "Cancelled";
  scorecardItems: number;
};

export type LegacyEmployerOffer = {
  id: number;
  candidateName: string;
  candidateInitials: string;
  role: string;
  baseSalary: string;
  startDate: string;
  sentDate: string;
  decision: "Pending" | "Accepted" | "Declined" | "Expired";
  matchScore: number;
};

export type LegacyTalentPoolEntry = {
  id: number;
  candidateId: number;
  status: TalentPoolStatus;
  savedAt: string;
  lastContactedAt: string | null;
  notes: string;
  tags: TalentPoolTag[];
  source: TalentPoolSource;
  sourceDetail: string;
  reEngagementScore: number;
};

export type TalentPoolStatus =
  | "Active"
  | "Contacted"
  | "Re-engaging"
  | "Stale";

export type TalentPoolTag =
  | "Silver medalist"
  | "Future role"
  | "Referral"
  | "Conference"
  | "Open to work"
  | "Senior IC"
  | "Specialist";

export type TalentPoolSource =
  | "Application"
  | "Referral"
  | "Open application"
  | "Conference";

/* ------------------------------------------------------------------ */
/*  Back-compat aliases — re-export legacy type names so existing    */
/*  consumers (`EmployerCandidate`, `EmployerJob`, etc.) keep working*/
/*  until they migrate to the new accessors.                        */
/* ------------------------------------------------------------------ */

/** @deprecated Prefer `LegacyEmployerProfile` (or `Employer`). */
export type EmployerProfile = LegacyEmployerProfile;
/** @deprecated Prefer `LegacyEmployerJob`. */
export type EmployerJob = LegacyEmployerJob;
/** @deprecated Prefer `LegacyEmployerCandidate`. */
export type EmployerCandidate = LegacyEmployerCandidate;
/** @deprecated Prefer `LegacyEmployerInterview`. */
export type EmployerInterview = LegacyEmployerInterview;
export type InterviewStatus = LegacyEmployerInterview["status"];
/** @deprecated Prefer `LegacyEmployerOffer`. */
export type EmployerOffer = LegacyEmployerOffer;
export type OfferDecision = LegacyEmployerOffer["decision"];
/** @deprecated Prefer `LegacyTalentPoolEntry`. */
export type TalentPoolEntry = LegacyTalentPoolEntry;
