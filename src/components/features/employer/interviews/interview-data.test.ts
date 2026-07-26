import { describe, expect, it } from "vitest";

import {
  filterInterviewRows,
  getEmployerInterviewSeedRows,
  sortInterviewRowsByPriority,
} from "./interview-data";

describe("employer interview data", () => {
  it("orders interviews by the status attention sequence", () => {
    const rows = getEmployerInterviewSeedRows();
    const orderedStatuses = sortInterviewRowsByPriority(rows).map(
      (row) => row.interview.status,
    );

    expect(orderedStatuses.indexOf("Scheduled")).toBeLessThan(
      orderedStatuses.indexOf("Pending confirmation"),
    );
    expect(orderedStatuses.indexOf("Pending confirmation")).toBeLessThan(
      orderedStatuses.indexOf("Reschedule requested"),
    );
    expect(orderedStatuses.indexOf("Reschedule requested")).toBeLessThan(
      orderedStatuses.indexOf("Completed"),
    );
  });

  it("filters by searchable identity, status, and type", () => {
    const result = filterInterviewRows(getEmployerInterviewSeedRows(), {
      query: "aisha",
      status: "Scheduled",
      type: "Technical",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.candidate.name).toBe("Aisha Khan");
  });
});
