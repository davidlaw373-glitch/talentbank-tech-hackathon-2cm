import credentialsJson from "./credentials.json";
import type { Credential } from "@/types/credential";

const byId = new Map<number, Credential>();
for (const credential of credentialsJson as Credential[]) {
  byId.set(credential.id, credential);
}

export const list: Credential[] = credentialsJson as Credential[];

export function get(id: number): Credential | undefined {
  return byId.get(id);
}

export function getForCandidate(candidateId: number): Credential[] {
  return list.filter((c) => c.candidateId === candidateId);
}

export function getForUniversity(universityId: number): Credential[] {
  return list.filter((c) => c.universityId === universityId);
}

export function getForEmployer(employerId: number): Credential[] {
  return list.filter((c) => c.employerId === employerId);
}
