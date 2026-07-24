export type CredentialStatus =
  | "Verified"
  | "Pending"
  | "Not started"
  | "Pending review"
  | "Rejected";

export type EmploymentOutcome =
  | "Employed"
  | "Open to work"
  | "In grad school"
  | "Unknown";

/**
 * A university-issued credential held by a candidate. One row per issued
 * item (degree, certificate, employment verification, capstone). Both the
 * candidate dashboard and the university verification pipeline read from
 * the same table — the data has a single source of truth.
 */
export type Credential = {
  id: number;
  candidateId: number;
  universityId: number;
  /** "Education" | "Experience" | "Portfolio" | "Capstone" — kept open
   *  to match the legacy taxonomy without inventing a new enum yet. */
  type: string;
  name: string;
  status: CredentialStatus;
  /** Skills recorded against this credential (degree skills or employment
   *  skills). Empty for non-skill-bearing entries. */
  skills: string[];
  /** Capstone project name, if the credential is a final-year project. */
  capstone: string;
  /** Reported employment outcome of the graduate holding this credential. */
  employment: EmploymentOutcome;
  /** Verified employer (when `employment === "Employed"`). */
  employerId?: number;
  /** Verified job title (when `employment === "Employed"`). */
  role?: string;
  /** Graduation year for academic credentials. */
  graduationYear?: number;
  /** GPA string for academic credentials, e.g. "3.78 / 4.00". */
  gpa?: string;
};
