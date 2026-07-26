import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { InterviewOverview } from "./interview-overview";

function renderOverview() {
  return render(
    <ToastProvider>
      <InterviewOverview />
    </ToastProvider>,
  );
}

describe("InterviewOverview", () => {
  it("shows a priority section with a dedicated complete-management route", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Priority interviews" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "View all interviews" }),
    ).toHaveProperty(
      "href",
      "http://localhost:3000/employer/interviews/all",
    );
    expect(
      screen.getByRole("link", { name: "Scheduled calendar" }),
    ).toHaveProperty(
      "href",
      "http://localhost:3000/employer/interviews/calendar",
    );
    expect(
      screen.queryByRole("button", { name: "Schedule interview" }),
    ).toBeNull();
    expect(
      screen.queryByRole("textbox", { name: "Search interviews" }),
    ).toBeNull();
  });

  it("keeps destructive management actions out of priority rows", () => {
    renderOverview();

    expect(screen.queryAllByText("Cancel")).toHaveLength(0);
    expect(screen.getAllByText("Join").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reschedule").length).toBeGreaterThan(0);
  });
});
