import employersJson from "./employers.json";
import type { Employer } from "@/types/employer";
import { getForCandidate } from "./credentials";

/**
 * `onboardingComplete` was added to the `Employer` type after the JSON
 * fixtures were authored. The accessor overlays `false` for any record
 * that does not already declare the field — see `src/data/candidates.ts`
 * for the same rationale.
 */
type StoredEmployer = Omit<Employer, "onboardingComplete"> & {
  onboardingComplete?: boolean;
};

function withOnboardingFlag(record: StoredEmployer): Employer {
  return { ...record, onboardingComplete: record.onboardingComplete ?? false };
}

const byId = new Map<number, Employer>();
for (const employer of employersJson as StoredEmployer[]) {
  byId.set(employer.id, withOnboardingFlag(employer));
}

export const list: Employer[] = (employersJson as StoredEmployer[]).map(
  withOnboardingFlag,
);

export function get(id: number): Employer | undefined {
  const found = byId.get(id);
  return found ? withOnboardingFlag(found) : undefined;
}

/**
 * Look up a candidate's current employer — the employer they were last
 * verified employed by, derived from `credentials.json`. Returns undefined
 * if the candidate has no verified employment credential.
 */
export function getCandidateEmployer(
  candidateId: number,
): Employer | undefined {
  const employmentCred = getForCandidate(candidateId).find(
    (c) => c.employment === "Employed" && c.employerId !== undefined,
  );
  if (!employmentCred || !employmentCred.employerId) return undefined;
  return get(employmentCred.employerId);
}