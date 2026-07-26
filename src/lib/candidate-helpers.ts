/**
 * Candidate-side data helpers — high-level joins that produce the
 * denormalized shapes used by /candidate/* pages.
 */

import { getForCandidate as getCredentialsForCandidate } from "@/data/credentials";
import { getForCredential as getDisputesForCredential } from "@/data/disputes";

import type { CandidateDispute } from "@/components/features/candidate/dispute-tracker";

const DEMO_CANDIDATE_ID = 1;

/**
 * Returns all disputes the demo candidate has filed, enriched with the
 * name of the credential the dispute is about.
 */
export function getCandidateDisputes(
  candidateId: number = DEMO_CANDIDATE_ID,
): CandidateDispute[] {
  const credentials = getCredentialsForCandidate(candidateId);
  const result: CandidateDispute[] = [];

  for (const cred of credentials) {
    const disputes = getDisputesForCredential(cred.id);
    for (const dispute of disputes) {
      result.push({
        ...dispute,
        credentialName: cred.name,
      });
    }
  }

  // Sort newest-first (by id as a proxy for filed order in demo data).
  return result.sort((a, b) => b.id - a.id);
}

export const candidateDisputes: CandidateDispute[] = getCandidateDisputes();

/**
 * The display names of all credentials belonging to the demo candidate —
 * used to populate the "file a dispute" form's credential selector.
 */
export function getCandidateCredentialNames(
  candidateId: number = DEMO_CANDIDATE_ID,
): string[] {
  return getCredentialsForCandidate(candidateId).map((c) => c.name);
}

export const candidateCredentialNames: string[] =
  getCandidateCredentialNames();
