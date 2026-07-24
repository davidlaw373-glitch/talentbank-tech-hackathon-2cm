/**
 * Onboarding wizard — shared types and step metadata.
 *
 * The setup flow lives at /onboarding/[role] for each of the three roles.
 * Each role orchestrator owns a typed draft shape (one of the Draft
 * unions below), persists it to `careeros.onboarding.<role>` via
 * `src/lib/onboarding-store.ts`, and on completion routes the user to the
 * destination returned by `dashboardFor`.
 */

import type { CompanySize, EmployerIndustry } from "@/types/employer";

export type OnboardingRole = "candidate" | "employer" | "university";

export const ONBOARDING_ROLES: OnboardingRole[] = [
  "candidate",
  "employer",
  "university",
];

export function isOnboardingRole(value: string): value is OnboardingRole {
  return (ONBOARDING_ROLES as string[]).includes(value);
}

/** Where the wizard lands when the user finishes setup for a given role. */
export function dashboardFor(role: OnboardingRole): string {
  switch (role) {
    case "candidate":
      return "/candidate/dashboard";
    case "employer":
      return "/employer";
    case "university":
      return "/university";
  }
}

/** Display copy for the role — used by the wizard shell and the banner. */
export function roleLabel(role: OnboardingRole): string {
  switch (role) {
    case "candidate":
      return "Candidate";
    case "employer":
      return "Employer";
    case "university":
      return "University";
  }
}

/** Short setup-window copy shown at the top of the wizard. */
export function rolePitch(role: OnboardingRole): string {
  switch (role) {
    case "candidate":
      return "A few quick details so employers can find you — and so we can show you jobs that fit.";
    case "employer":
      return "Tell candidates who you are and what you're hiring for. You can edit anything later.";
    case "university":
      return "Help employers verify your graduates and surface outcomes. You can adjust these any time.";
  }
}

/* ------------------------------------------------------------------ */
/* Candidate draft                                                     */
/* ------------------------------------------------------------------ */

export const CANDIDATE_ROLE_TYPES = [
  "Frontend",
  "Backend",
  "Full-stack",
  "Mobile",
  "Data / ML",
  "DevOps / SRE",
  "Security",
  "Design (product)",
  "Product management",
  "Engineering management",
  "QA / Test",
  "Solutions / Pre-sales",
] as const;
export type CandidateRoleType = (typeof CANDIDATE_ROLE_TYPES)[number];

export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const AVAILABILITY_OPTIONS = [
  "Immediately",
  "Within 2 weeks",
  "Within a month",
  "Within 3 months",
  "Open to opportunities",
] as const;
export type Availability = (typeof AVAILABILITY_OPTIONS)[number];

export type CandidateProjectDraft = {
  id: number;
  name: string;
  description: string;
  skills: string[];
};

export type CandidateDraft = {
  // Step 1 — basics (required subset, optional rest)
  name: string;
  email: string;
  title: string;
  location: string;
  phone: string;
  summary: string;

  // Step 2 — job preferences (required subset, optional rest)
  roleTypes: CandidateRoleType[];
  workModes: WorkMode[];
  salaryExpectation: string;
  /** Empty string when unset; one of `AVAILABILITY_OPTIONS` once picked. */
  availability: Availability | "";

  // Step 3 — skills (optional)
  skills: string[];

  // Step 4 — projects (optional)
  projects: CandidateProjectDraft[];
};

/* ------------------------------------------------------------------ */
/* Employer draft                                                      */
/* ------------------------------------------------------------------ */

export const EMPLOYER_INDUSTRIES: EmployerIndustry[] = [
  "Software & Internet",
  "Financial Services",
  "Education",
  "Healthcare",
  "Manufacturing",
  "Public Sector",
];

export const COMPANY_SIZES: CompanySize[] = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "500+",
];

export const EMPLOYER_HIRING_ROLES = [
  "Engineering",
  "Product",
  "Design",
  "Data",
  "Operations",
  "Sales",
  "Marketing",
  "Customer success",
  "People & talent",
] as const;
export type EmployerHiringRole = (typeof EMPLOYER_HIRING_ROLES)[number];

export type EmployerDraft = {
  // Step 1 — company (required subset, optional rest)
  companyName: string;
  industry: EmployerIndustry;
  size: CompanySize;
  hq: string;
  founded: string; // string to allow empty input; parse on submit
  website: string;
  tagline: string;
  about: string;

  // Step 2 — hiring plan (required subset, optional rest)
  hiringRoles: EmployerHiringRole[];
  hiringVolume: string; // numeric string; required > 0
  workModes: WorkMode[];
  salaryBands: string[];

  // Step 3 — culture + benefits (optional)
  culture: string[];
  benefits: string[];
};

/* ------------------------------------------------------------------ */
/* University draft                                                    */
/* ------------------------------------------------------------------ */

export const UNIVERSITY_TYPES = ["Public", "Private"] as const;
export type UniversityType = (typeof UNIVERSITY_TYPES)[number];

export const CREDENTIAL_TYPES = [
  "Diploma",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
  "Professional certificate",
  "Bootcamp certificate",
  "Capstone project",
  "Internship completion",
] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];

export const VERIFICATION_TURNAROUNDS = [
  "Within 24 hours",
  "Within 3 days",
  "Within a week",
  "Within 2 weeks",
  "Within a month",
] as const;
export type VerificationTurnaround = (typeof VERIFICATION_TURNAROUNDS)[number];

export type UniversityDraft = {
  // Step 1 — institution (required subset, optional rest)
  institutionName: string;
  type: UniversityType;
  city: string;
  country: string;
  founded: string; // numeric string
  tagline: string;
  about: string;

  // Step 2 — programs + cohorts (required subset, optional rest)
  topPrograms: string[];
  activeCohorts: string; // numeric string; required >= 1
  totalStudents: string; // numeric string; optional

  // Step 3 — verification preferences (optional)
  credentialTypes: CredentialType[];
  verificationTurnaround: VerificationTurnaround | "";
};

/* ------------------------------------------------------------------ */
/* Storage shape                                                       */
/* ------------------------------------------------------------------ */

export type StoredOnboarding<Draft> = {
  version: 1;
  complete: boolean;
  currentStep: number;
  draft: Draft;
};

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

export type ValidationIssue = Record<string, string | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

export function isPresent(value: string): boolean {
  return value.trim().length > 0;
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isUrl(value: string): boolean {
  return URL_RE.test(value.trim());
}

/** Year between 1700 and current year + 1. Returns false for non-numeric. */
export function isPlausibleYear(value: string): boolean {
  if (!/^\d{4}$/.test(value.trim())) return false;
  const n = Number(value);
  return n >= 1700 && n <= new Date().getFullYear() + 1;
}

/** Non-negative integer string. Empty allowed (treated as missing). */
export function isNonNegativeInt(value: string): boolean {
  if (value.trim() === "") return true;
  return /^\d+$/.test(value.trim());
}

/** Positive integer string. Empty returns false. */
export function isPositiveInt(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

/** Derive initials (2 chars) from a name, company, or institution label. */
export function initialsFrom(label: string, fallback = ""): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length === 1) {
    const only = words[0]!;
    return (only.slice(0, 2) || fallback).toUpperCase();
  }
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}