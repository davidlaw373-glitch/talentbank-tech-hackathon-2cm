import { describe, expect, it } from "vitest";

import {
  filterOfferRows,
  getEmployerOfferSeedRows,
  sortOfferRowsByPriority,
} from "./offer-data";

describe("employer offer data", () => {
  it("places pending offers before resolved offers and uses match score within a decision", () => {
    const rows = sortOfferRowsByPriority(getEmployerOfferSeedRows());

    expect(rows.slice(0, 2).map((row) => row.offer.decision)).toEqual([
      "Pending",
      "Pending",
    ]);
    expect(rows[0]!.offer.matchScore).toBeGreaterThanOrEqual(
      rows[1]!.offer.matchScore,
    );
  });

  it("combines candidate search, decision, and role filters", () => {
    const rows = filterOfferRows(getEmployerOfferSeedRows(), {
      query: "aisha",
      decision: "Pending",
      role: "Senior Frontend Engineer",
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]!.candidate.name).toBe("Aisha Khan");
  });
});
