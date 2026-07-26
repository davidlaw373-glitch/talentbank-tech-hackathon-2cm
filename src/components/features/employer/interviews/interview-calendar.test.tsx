import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InterviewCalendar } from "./interview-calendar";

describe("InterviewCalendar", () => {
  it("shows scheduled candidate, role, and time on the matching date", () => {
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    expect(screen.getByRole("grid", { name: "July 2026 calendar" })).toBeTruthy();
    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
    expect(screen.getAllByText("Aisha Khan").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Senior Frontend Engineer").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("10:00").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sara Park")).toBeNull();
  });

  it("moves to the next month and updates the month selector", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    await user.click(screen.getByRole("button", { name: "Next month" }));

    expect(
      (screen.getByRole("combobox", {
        name: "Month",
      }) as HTMLSelectElement).value,
    ).toBe("7");
  });

  it("selects a date and exposes its complete daily agenda", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    await user.click(
      screen.getByRole("gridcell", {
        name: "Monday, July 27, 2026, 1 scheduled interview",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Monday, July 27" }),
    ).toBeTruthy();
    expect(screen.getAllByText("Aisha Khan").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sara Park")).toBeNull();
  });
});
