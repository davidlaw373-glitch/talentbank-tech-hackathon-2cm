import assert from "node:assert/strict";
import test from "node:test";

import { getIndustryInsight } from "../src/lib/employment-industry.ts";

test("retains every tied industry for the summary while limiting visible bars to five", () => {
  const insight = getIndustryInsight([
    "Technology", "Technology",
    "Financial services", "Financial services",
    "Consulting", "Consulting",
    "Education", "Education",
    "Healthcare", "Healthcare",
    "Public sector", "Public sector",
  ]);

  assert.equal(insight.visibleDistribution.length, 5);
  assert.deepEqual(insight.leadingIndustry, {
    value: "6 industries tied",
    detail: "Consulting, Education, Financial services, Healthcare, Public sector, and Technology — 2 graduates each",
  });
});
