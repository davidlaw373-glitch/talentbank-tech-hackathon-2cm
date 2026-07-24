/**
 * Candidate-owned derivations over university-issued credentials.
 *
 * These helpers are the single place the candidate surface (profile,
 * dashboard, navigator, résumé) turns the immutable `@/data/credentials`
 * dataset into view models and verified-skill sets. Kept pure and free of
 * React / `"use client"` so both server and client components can import it.
 *
 * Trust rule enforced here: a skill or credential is only ever "verified"
 * when it comes from a credential whose `status === "Verified"`. Nothing is
 * inferred from candidate-managed `skills` or legacy `evidence`.
 */
import type { Credential } from "@/types/credential";
import type { University } from "@/types/university";

/** Normalise a skill/label for case-insensitive comparison. */
export function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase();
}

/**
 * Items from `source` whose normalized form also appears in `against`.
 * Display casing is preserved from `source`; order is preserved; the
 * result is de-duplicated case-insensitively.
 */
export function intersect(source: string[], against: string[]): string[] {
  const targets = new Set(against.map(normalize));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of source) {
    const key = normalize(item);
    if (targets.has(key) && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/** De-duplicate a list case-insensitively, preserving first-seen casing. */
export function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = normalize(value);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

/** Only credentials the institution has actually confirmed. */
export function getVerifiedCredentials(credentials: Credential[]): Credential[] {
  return credentials.filter((c) => c.status === "Verified");
}

/**
 * Union of every skill recorded against a *verified* credential. This is the
 * authoritative "institution-backed" skill set for a candidate.
 */
export function getVerifiedSkillSet(credentials: Credential[]): string[] {
  return dedupe(
    getVerifiedCredentials(credentials).flatMap((c) => c.skills),
  );
}

/**
 * View model for rendering a university credential as an immutable
 * institutional record. `institutionName` is null when the issuing
 * university can't be resolved (render a neutral fallback, never imply the
 * candidate authored it).
 */
export type CredentialView = {
  id: number;
  name: string;
  type: string;
  status: Credential["status"];
  institutionName: string | null;
  institutionInitials: string | null;
  capstone: string;
  gpa: string | null;
  graduationYear: number | null;
  role: string | null;
  skills: string[];
  /** University records are always read-only on the candidate surface. */
  isLocked: true;
};

/**
 * Build a credential view model. Pass the resolved `University` (or
 * undefined) so this stays a pure function with no data-layer access.
 */
export function toCredentialView(
  credential: Credential,
  university: University | undefined,
): CredentialView {
  return {
    id: credential.id,
    name: credential.name,
    type: credential.type,
    status: credential.status,
    institutionName: university?.institutionName ?? null,
    institutionInitials: university?.initials ?? null,
    capstone: credential.capstone,
    gpa: credential.gpa ?? null,
    graduationYear: credential.graduationYear ?? null,
    role: credential.role ?? null,
    skills: credential.skills,
    isLocked: true,
  };
}

/** Verified / pending counts for summary copy. */
export function summarizeCredentials(credentials: Credential[]): {
  verified: number;
  pending: number;
  total: number;
} {
  let verified = 0;
  let pending = 0;
  for (const c of credentials) {
    if (c.status === "Verified") verified += 1;
    else if (c.status === "Pending") pending += 1;
  }
  return { verified, pending, total: credentials.length };
}
