import employersJson from "./employers.json";
import type { Employer } from "@/types/employer";
import { getForCandidate } from "./credentials";

const byId = new Map<number, Employer>();
for (const employer of employersJson as Employer[]) {
  byId.set(employer.id, employer);
}

export const list: Employer[] = employersJson as Employer[];

export function get(id: number): Employer | undefined {
  return byId.get(id);
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
  return byId.get(employmentCred.employerId);
}
