/**
 * Single job-posting shape, viewed from both candidate and employer sides.
 *
 * A `Job` is owned by exactly one `Employer` (via `employerId`). Candidate-side
 * fields (`summary`, `aboutCompany`) and employer-side fields (`department`,
 * `mustHave`, `niceToHave`, `applicants`, `filledScore`) all live on the same
 * record so the JSON file is the single source of truth. The dynamic `applicants`
 * count and the matching-skill breakdown are *derived* by accessors
 * (`@/data/jobs`, `@/data/match-scores`) — they are not stored.
 */
export type JobStatus = "Live" | "Draft" | "Paused" | "Closed";

export type JobWorkMode = "Remote" | "Hybrid" | "On-site";

export type JobEmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship";

export type Job = {
  id: number;
  employerId: number;

  // Shared
  title: string;
  location: string;
  workMode: JobWorkMode;
  employmentType: JobEmploymentType;
  salary: string;
  posted: string;
  status: JobStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];

  // Employer-side metadata (always present)
  department: string;
  /** Derived from applications.json at render time — not stored. */
  applicants: number;
  /** % of the hiring funnel filled (employer-reported). */
  filledScore: number;
  mustHave: string[];
  niceToHave: string[];

  // Candidate-side summary (always present)
  summary: string;
  aboutCompany: string;
};
