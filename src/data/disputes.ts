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
