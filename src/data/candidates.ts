import candidatesJson from "./candidates.json";
import type { Candidate } from "@/types/candidate";

/**
 * Source-of-truth candidate dataset. Stored as a JSON array, exposed as a
 * typed list and an internal `Map<number, Candidate>` for O(1) lookup.
 */
const byId = new Map<number, Candidate>();
for (const candidate of candidatesJson as Candidate[]) {
  byId.set(candidate.id, candidate);
}

export const list: Candidate[] = candidatesJson as Candidate[];

export function get(id: number): Candidate | undefined {
  return byId.get(id);
}

export function getMany(ids: number[]): Candidate[] {
  const out: Candidate[] = [];
  for (const id of ids) {
    const c = byId.get(id);
    if (c) out.push(c);
  }
  return out;
}
