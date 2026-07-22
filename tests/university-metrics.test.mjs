import assert from "node:assert/strict";
import test from "node:test";

import * as employmentMetrics from "../src/lib/university-demo-state.ts";

test("normalizes missing graduate outcomes to Unknown before calculating coverage", () => {
  assert.equal(
    typeof employmentMetrics.normalizeEmploymentOutcomes,
    "function",
    "employment metrics must expose graduate-aware outcome normalization"
  );

  const normalized = employmentMetrics.normalizeEmploymentOutcomes(
    [{ id: "graduate-a" }, { id: "graduate-b" }],
    [{ graduateId: "graduate-a", status: "Employed", daysToEmployment: 14 }]
  );

  assert.deepEqual(normalized, [
    { graduateId: "graduate-a", status: "Employed", daysToEmployment: 14 },
    { graduateId: "graduate-b", status: "Unknown" },
  ]);
  assert.deepEqual(employmentMetrics.calculateEmploymentMetrics(normalized), {
    employed: 1,
    seeking: 0,
    unknown: 1,
    knownOutcomes: 1,
    laborForce: 1,
    employmentRate: 100,
    coverageRate: 50,
    averageDaysToEmployment: 14,
  });
});
