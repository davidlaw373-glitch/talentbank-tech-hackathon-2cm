import assert from "node:assert/strict";
import test from "node:test";

import { getLeadingIndustrySummary } from "../src/lib/employment-industry.ts";

test("reports every leader when industries share the highest employed count", () => {
  const summary = getLeadingIndustrySummary([
    { label: "Technology", count: 2 },
    { label: "Financial services", count: 2 },
    { label: "Consulting", count: 1 },
  ]);

  assert.deepEqual(summary, {
    value: "2 industries tied",
    detail: "Financial services and Technology — 2 graduates each",
  });
});

test("reports one industry only when it has a unique highest employed count", () => {
  const summary = getLeadingIndustrySummary([
    { label: "Technology", count: 3 },
    { label: "Financial services", count: 2 },
  ]);

  assert.deepEqual(summary, {
    value: "Technology",
    detail: "3 confirmed employed graduates",
  });
});
