/**
 * Aggregated employment outcomes for a graduating cohort. Derived from
 * `credentials.json` in principle, but stored here for the prototype so
 * the university analytics page renders without recomputing aggregations
 * on every request.
 */
export type CohortOutcome = {
  id: number;
  universityId: number;
  cohort: string;
  total: number;
  employed: number;
  inGradSchool: number;
  seeking: number;
  avgSalary: string;
  topEmployer: string;
  topRole: string;
};
