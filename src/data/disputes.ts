import disputesJson from "./disputes.json";
import type { Dispute } from "@/types/dispute";
import { getForUniversity as getCredentialsForUniversity } from "./credentials";

const byId = new Map<number, Dispute>();
for (const dispute of disputesJson as Dispute[]) {
  byId.set(dispute.id, dispute);
}

export const list: Dispute[] = disputesJson as Dispute[];

export function get(id: number): Dispute | undefined {
  return byId.get(id);
}

export function getForCredential(credentialId: number): Dispute[] {
  return list.filter((d) => d.credentialId === credentialId);
}

export function getForUniversity(universityId: number): Dispute[] {
  // Disputes aren't tied to a university directly; look them up via credentials.
  const credentialIds = new Set(
    getCredentialsForUniversity(universityId).map((c) => c.id),
  );
  return list.filter((d) => credentialIds.has(d.credentialId));
}

/** The candidate's original claim — always the first message in the thread. */
export function getClaim(dispute: Dispute): string {
  return dispute.messages.find((m) => m.author === "candidate")?.body ?? "";
}

/**
 * Faculty's most recent response, for list-view summaries. Empty when
 * faculty hasn't replied yet (dispute is still awaiting a first review).
 */
export function getLatestCounter(dispute: Dispute): string {
  const facultyMessages = dispute.messages.filter((m) => m.author === "faculty");
  return facultyMessages.length > 0
    ? facultyMessages[facultyMessages.length - 1].body
    : "";
}
