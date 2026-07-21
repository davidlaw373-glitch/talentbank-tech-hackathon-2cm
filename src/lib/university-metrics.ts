import type { EmploymentOutcome, Graduate } from "@/types/university";

export type EmploymentMetrics = {
  employed: number;
  seeking: number;
  unknown: number;
  knownOutcomes: number;
  laborForce: number;
  employmentRate: number;
  coverageRate: number;
  averageDaysToEmployment: number;
};

export function normalizeEmploymentOutcomes(
  graduateRecords: readonly Pick<Graduate, "id">[],
  outcomes: readonly EmploymentOutcome[]
): EmploymentOutcome[] {
  const outcomesByGraduateId = new Map(
    outcomes.map((outcome) => [outcome.graduateId, outcome])
  );

  return graduateRecords.map(
    (graduate) =>
      outcomesByGraduateId.get(graduate.id) ?? {
        graduateId: graduate.id,
        status: "Unknown",
      }
  );
}

export function calculateEmploymentMetrics(
  outcomes: EmploymentOutcome[]
): EmploymentMetrics {
  const employed = outcomes.filter((outcome) => outcome.status === "Employed");
  const seeking = outcomes.filter((outcome) => outcome.status === "Seeking");
  const unknown = outcomes.filter((outcome) => outcome.status === "Unknown");
  const knownOutcomes = outcomes.length - unknown.length;
  const laborForce = employed.length + seeking.length;
  const timedPlacements = employed.filter(
    (outcome) => outcome.daysToEmployment !== undefined
  );

  return {
    employed: employed.length,
    seeking: seeking.length,
    unknown: unknown.length,
    knownOutcomes,
    laborForce,
    employmentRate:
      laborForce === 0 ? 0 : Math.round((employed.length / laborForce) * 100),
    coverageRate:
      outcomes.length === 0
        ? 0
        : Math.round((knownOutcomes / outcomes.length) * 100),
    averageDaysToEmployment:
      timedPlacements.length === 0
        ? 0
        : Math.round(
            timedPlacements.reduce(
              (sum, outcome) => sum + (outcome.daysToEmployment ?? 0),
              0
            ) / timedPlacements.length
          ),
  };
}
