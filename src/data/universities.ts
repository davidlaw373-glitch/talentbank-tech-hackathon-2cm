import universitiesJson from "./universities.json";
import type { University } from "@/types/university";

/**
 * `onboardingComplete` was added to the `University` type after the JSON
 * fixtures were authored. The accessor overlays `false` for any record
 * that does not already declare the field — see `src/data/candidates.ts`
 * for the same rationale.
 */
type StoredUniversity = Omit<University, "onboardingComplete"> & {
  onboardingComplete?: boolean;
};

function withOnboardingFlag(record: StoredUniversity): University {
  return { ...record, onboardingComplete: record.onboardingComplete ?? false };
}

const byId = new Map<number, University>();
for (const university of universitiesJson as StoredUniversity[]) {
  byId.set(university.id, withOnboardingFlag(university));
}

export const list: University[] = (universitiesJson as StoredUniversity[]).map(
  withOnboardingFlag,
);

export function get(id: number): University | undefined {
  const found = byId.get(id);
  return found ? withOnboardingFlag(found) : undefined;
}