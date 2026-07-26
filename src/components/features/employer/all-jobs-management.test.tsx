import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AllJobsManagement } from "./all-jobs-management";

describe("AllJobsManagement", () => {
  it("shows an unrestricted complete list and filters it by search", async () => {
    const user = userEvent.setup();
    render(<AllJobsManagement />);

    const list = screen.getByLabelText("Complete job list");
    expect(list.className).not.toContain("max-h-");
    expect(list.className).not.toContain("overflow-y-auto");
    expect(screen.getByText("Senior Frontend Engineer")).toBeTruthy();
    expect(screen.getByText("Platform Product Manager")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to job overview" }).textContent,
    ).toBe("");
    expect(screen.queryByRole("heading", { name: "All jobs" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Job postings" })).toBeTruthy();
    expect(screen.getByText("6 roles")).toBeTruthy();
    const leadActions = screen.getByLabelText(
      "Actions for Lead Frontend Engineer",
    );
    expect(leadActions.className).toContain("flex-col");
    expect(
      screen.getByRole("button", { name: "Pause Lead Frontend Engineer" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Close Lead Frontend Engineer" }),
    ).toBeTruthy();

    await user.type(
      screen.getByRole("textbox", { name: "Search jobs" }),
      "Platform Product",
    );

    expect(screen.queryByText("Senior Frontend Engineer")).toBeNull();
    expect(screen.getByText("Platform Product Manager")).toBeTruthy();
  });
});
