import type { ApplicationStage } from "@/types/application";

/**
 * New clean Candidate — the person seeking a job. Profile-only fields.
 * Employer-side application context (which job they applied to, what
 * stage they are at, whether they were rejected) lives on `Application`,
 * not on the candidate record. Verifications live on `Credential`.
 *
 * Sub-entity lists (experience, education, projects, evidence) keep stable
 * integer ids so React list keys stay stable across edits and so we can
 * reference them by id from elsewhere (e.g. a credential that points to
 * a specific project).
 */
export type Candidate = {
  id: number;

  // Basic identity
  name: string;
  initials: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;

  // Profile completion + verification posture
  /** 0–100 completion score shown on the candidate dashboard. */
  profileCompletion: number;
  /** Short label rendered next to the verification card. */
  verificationStatus: string;

  // Skills
  skills: string[];
  /** Three highest-priority skills. Subset of `skills`. */
  topSkills: string[];

  // Sub-records
  experience: Experience[];
  education: Education[];
  projects: Project[];
  /** Legacy alias kept for the back-compat shim — prefer `Credential`s. */
  evidence: LegacyEvidence[];
};

export type Experience = {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
};

export type Education = {
  id: number;
  institution: string;
  qualification: string;
  period: string;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  skills: string[];
};

/**
 * Legacy evidence shape — kept around because `data/candidate.ts` builds
 * it from the new credential table for the dashboard verification card.
 * Prefer `Credential` for new code.
 */
export type LegacyEvidence = {
  id: number;
  name: string;
  type: string;
  status: "Verified" | "Pending" | "Not started";
};

/**
 * A candidate's application to a specific job. The "update" field from
 * the legacy shape is dropped — derive the latest activity from the
 * timeline instead (`@/lib/applications#getApplicationUpdate`).
 */
export type Application = {
  id: number;
  candidateId: number;
  jobId: number;
  appliedDate: string;
  /** Current pipeline stage for this application. */
  stage: ApplicationStage;
  /** Side state — `true` means the application has been rejected. */
  rejected: boolean;
  /** Candidate-facing next action copy, e.g. "Prepare your AI summary...". */
  nextAction: string;
  /**
   * Stage history. The last entry is the "in progress" or most recently
   * completed step. The full `update` copy is derived from this list.
   */
  timeline: ApplicationTimelineStep[];
};

export type ApplicationTimelineStep = {
  label: string;
  date: string;
  complete: boolean;
};
