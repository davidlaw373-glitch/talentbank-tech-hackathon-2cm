import { describe, expect, it } from "vitest";

import { getEmployerInterviewSeedRows } from "./interview-data";
import {
  getCalendarDateKey,
  getMonthDays,
  getScheduledRowsByDate,
  toSingaporeIso,
} from "./interview-calendar-data";

describe("interview calendar data", () => {
  it("groups an offset timestamp by its Singapore calendar date", () => {
    expect(getCalendarDateKey("2026-07-26T18:30:00Z")).toBe("2026-07-27");
    expect(toSingaporeIso("2026-07-27T10:00")).toBe(
      "2026-07-27T10:00:00+08:00",
    );
  });

  it("builds a Monday-first six-week grid for July 2026", () => {
    const days = getMonthDays(2026, 6, "2026-07-26");

    expect(days).toHaveLength(42);
    expect(days[0]?.key).toBe("2026-06-29");
    expect(days[41]?.key).toBe("2026-08-09");
    expect(days.find((day) => day.key === "2026-07-26")?.isToday).toBe(
      true,
    );
  });

  it("excludes non-Scheduled interviews and sorts each day by time", () => {
    const grouped = getScheduledRowsByDate(getEmployerInterviewSeedRows());
    const july27 = grouped.get("2026-07-27") ?? [];

    expect(july27.map((row) => row.candidate.name)).toEqual(["Aisha Khan"]);
    expect(
      [...grouped.values()].flat().every(
        (row) => row.interview.status === "Scheduled",
      ),
    ).toBe(true);
  });
});
