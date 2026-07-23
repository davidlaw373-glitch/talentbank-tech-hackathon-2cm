import talentPoolJson from "./talent-pool.json";
import type { TalentPoolEntry } from "@/types/talent-pool";

const byId = new Map<number, TalentPoolEntry>();
for (const entry of talentPoolJson as TalentPoolEntry[]) {
  byId.set(entry.id, entry);
}

export const list: TalentPoolEntry[] = talentPoolJson as TalentPoolEntry[];

export function get(id: number): TalentPoolEntry | undefined {
  return byId.get(id);
}

export function getByEmployer(employerId: number): TalentPoolEntry[] {
  return list.filter((e) => e.employerId === employerId);
}

export function getByCandidate(candidateId: number): TalentPoolEntry[] {
  return list.filter((e) => e.candidateId === candidateId);
}
