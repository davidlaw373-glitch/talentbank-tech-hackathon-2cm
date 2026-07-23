/**
 * New clean University — the institution that issues credentials. Cohort
 * outcomes, graduates, and disputes live in their own tables
 * (`cohort-outcomes.json`, `credentials.json`, `disputes.json`).
 */
export type University = {
  id: number;
  institutionName: string;
  initials: string;
  type: "Public" | "Private";
  city: string;
  country: string;
  founded: number;
  totalStudents: number;
  activeCohorts: number;
  employmentRate: number;
  medianTimeToHire: number;
  tagline: string;
  about: string;
  topPrograms: string[];
  partnerEmployers: number;
  verifiedCredentials: number;
};

/* ------------------------------------------------------------------ */
/*  Legacy types kept for the back-compat shim in src/data/university.ts */
/* ------------------------------------------------------------------ */

export type LegacyUniversityProfile = {
  institutionName: string;
  initials: string;
  type: "Public" | "Private";
  city: string;
  country: string;
  founded: number;
  totalStudents: number;
  activeCohorts: number;
  employmentRate: number;
  medianTimeToHire: number;
  tagline: string;
  about: string;
  topPrograms: string[];
  partnerEmployers: number;
  verifiedCredentials: number;
};

export type VerificationRecordStatus =
  | "Verified"
  | "Pending review"
  | "Action required"
  | "Disputed";

export type LegacyGraduateRecord = {
  id: number;
  name: string;
  initials: string;
  program: string;
  graduationYear: number;
  gpa: string;
  status: VerificationRecordStatus;
  skills: string[];
  capstone: string;
  employment: "Employed" | "Open to work" | "In grad school" | "Unknown";
  company?: string;
  role?: string;
};

export type DisputeStatus = "Open" | "In review" | "Resolved" | "Rejected";

export type LegacyUniversityDispute = {
  id: number;
  graduateName: string;
  graduateInitials: string;
  field: string;
  claim: string;
  counter: string;
  filedDate: string;
  status: DisputeStatus;
};

export type LegacyEmploymentRecord = {
  id: number;
  cohort: string;
  total: number;
  employed: number;
  inGradSchool: number;
  seeking: number;
  avgSalary: string;
  topEmployer: string;
  topRole: string;
};

export type LegacySkillDemand = {
  skill: string;
  openings: number;
  delta: number;
};

/* ------------------------------------------------------------------ */
/*  Back-compat aliases for the old `University*` / `*Record` names. */
/* ------------------------------------------------------------------ */

/** @deprecated Prefer `LegacyUniversityProfile` (or `University`). */
export type UniversityProfile = LegacyUniversityProfile;
/** @deprecated Prefer `LegacyGraduateRecord`. */
export type GraduateRecord = LegacyGraduateRecord;
/** @deprecated Prefer `LegacyUniversityDispute`. */
export type UniversityDispute = LegacyUniversityDispute;
/** @deprecated Prefer `LegacyEmploymentRecord`. */
export type EmploymentRecord = LegacyEmploymentRecord;
/** @deprecated Prefer `LegacySkillDemand`. */
export type SkillDemand = LegacySkillDemand;
