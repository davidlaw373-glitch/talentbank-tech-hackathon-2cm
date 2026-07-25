import type { ApplicationStage } from "@/types/application";
import type { CredentialStatus } from "@/types/credential";

/**
 * New clean Candidate — the person seeking a job. Profile-only fields.
 * Employer-side application context (which job they applied to, what
 * stage they are at, whether they were rejected) lives on `Application`,
 * not on the candidate record. Verifications live on `Credential`.
 *
 * Sub-entity lists (experience, education, projects) keep stable
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

  // Skills
  skills: Skill[];
  /** Three highest-priority skills — IDs into `skills`. Reference by id
   *  so renames in `skills` keep their priority without churn. */
  topSkills: number[];

  // Sub-records
  experience: Experience[];
  education: Education[];
  projects: Project[];

  /**
   * Setup-wizard completion flag. `false` for new registrations; flipped
   * to `true` once the candidate finishes the onboarding flow. Backed by
   * `src/lib/onboarding-store.ts` at runtime — the value returned from
   * `data/candidates.ts#get` is overlaid with `false` for any record that
   * predates the wizard, so the field is always present on returned
   * candidates.
   */
  onboardingComplete: boolean;
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
  /** Whether this education entry has been verified by the issuer. */
  status: CredentialStatus;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  skills: string[];
  /** Whether this project has been verified (e.g. a Capstone or Portfolio credential). */
  status: CredentialStatus;
};

/**
 * A single skill on a candidate profile. Each entry carries its own
 * `status` (same `CredentialStatus` as Education / Project), so the
 * verified / self-reported split is derivable from the data instead of
 * needing a separate `verifiedSkills` projection. Ids are unique within
 * one `Candidate.skills` array — used for React list keys and the
 * `topSkills` id reference.
 */
export type Skill = {
  id: number;
  name: string;
  /** Whether this skill has been verified by the university / issuer. */
  status: CredentialStatus;
};

/**
 * Resolve `topSkills` (id references) against `skills` and return the
 * matching `Skill` objects. Tolerant of stale ids — entries that no
 * longer exist are silently dropped so a render never sees `undefined`.
 */
export function resolveTopSkills(
  skills: Skill[],
  topSkillIds: number[],
): Skill[] {
  const byId = new Map(skills.map((s) => [s.id, s]));
  return topSkillIds
    .map((id) => byId.get(id))
    .filter((s): s is Skill => Boolean(s));
}

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
