import cohortOutcomesJson from "./cohort-outcomes.json";
import type { CohortOutcome } from "@/types/cohort-outcome";

const byId = new Map<number, CohortOutcome>();
for (const outcome of cohortOutcomesJson as CohortOutcome[]) {
  byId.set(outcome.id, outcome);
}

export const list: CohortOutcome[] = cohortOutcomesJson as CohortOutcome[];

export function get(id: number): CohortOutcome | undefined {
  return byId.get(id);
}

export function getForUniversity(universityId: number): CohortOutcome[] {
  return list.filter((c) => c.universityId === universityId);
}
