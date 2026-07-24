import candidatesJson from "./candidates.json";
import type { Candidate } from "@/types/candidate";

/**
 * Source-of-truth candidate dataset. Stored as a JSON array, exposed as a
 * typed list and an internal `Map<number, Candidate>` for O(1) lookup.
 *
 * `onboardingComplete` was added to the `Candidate` type after the JSON
 * fixtures were authored. To keep the type contract clean without editing
 * every record, the accessor overlays `false` for any record that does
 * not already declare the field. New registrations are expected to seed
 * with `false` and flip to `true` via `useOnboardingStatus`.
 */
type StoredCandidate = Omit<Candidate, "onboardingComplete"> & {
  onboardingComplete?: boolean;
};

function withOnboardingFlag(record: StoredCandidate): Candidate {
  return { ...record, onboardingComplete: record.onboardingComplete ?? false };
}

const byId = new Map<number, Candidate>();
for (const candidate of candidatesJson as StoredCandidate[]) {
  byId.set(candidate.id, withOnboardingFlag(candidate));
}

export const list: Candidate[] = (candidatesJson as StoredCandidate[]).map(
  withOnboardingFlag,
);

export function get(id: number): Candidate | undefined {
  const found = byId.get(id);
  return found ? withOnboardingFlag(found) : undefined;
}

export function getMany(ids: number[]): Candidate[] {
  const out: Candidate[] = [];
  for (const id of ids) {
    const c = byId.get(id);
    if (c) out.push(withOnboardingFlag(c));
  }
  return out;
}