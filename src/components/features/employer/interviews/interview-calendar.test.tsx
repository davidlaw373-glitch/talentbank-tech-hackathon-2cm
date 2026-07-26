import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InterviewCalendar } from "./interview-calendar";

describe("InterviewCalendar", () => {
  it("uses compact calendar chrome without the removed title and Today action", () => {
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    const calendarRegion = screen.getByRole("region", {
      name: "Scheduled interview calendar",
    });

    expect(
      within(calendarRegion).getByRole("button", {
        name: "Previous month",
      }),
    ).toBeTruthy();
    expect(
      within(calendarRegion).getByRole("button", {
        name: "Next month",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
    expect(
      screen.queryByText(
        "Browse confirmed interview dates, candidates, and panels.",
      ),
    ).toBeNull();
    expect(screen.queryByText("Scheduled interviews")).toBeNull();
  });

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

  it("keeps the selected day when moving to the next month", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    await user.click(screen.getByRole("button", { name: "Next month" }));

    const selectedDate = screen.getByRole("gridcell", {
      name: "Wednesday, August 26, 2026, 0 scheduled interviews",
    });
    expect(selectedDate.getAttribute("aria-selected")).toBe("true");
  });

  it("clamps the selected day when the target month is shorter", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

    await user.click(
      screen.getByRole("gridcell", {
        name: "Friday, July 31, 2026, 1 scheduled interview",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Next month" }));
    await user.click(screen.getByRole("button", { name: "Next month" }));

    expect(
      screen
        .getByRole("gridcell", {
          name: "Wednesday, September 30, 2026, 0 scheduled interviews",
        })
        .getAttribute("aria-selected"),
    ).toBe("true");
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
