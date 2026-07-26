import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { AllInterviewsManagement } from "./all-interviews-management";

function renderManagement() {
  return render(
    <ToastProvider>
      <AllInterviewsManagement />
    </ToastProvider>,
  );
}

describe("AllInterviewsManagement", () => {
  it("filters the complete list by candidate search", async () => {
    const user = userEvent.setup();
    renderManagement();

    await user.type(
      screen.getByRole("textbox", { name: "Search interviews" }),
      "Aisha",
    );

    expect(screen.getAllByText("Aisha Khan")).toHaveLength(2);
    expect(screen.queryByText("Marco Okafor")).toBeNull();
    expect(screen.getByText("2 interviews")).toBeTruthy();
  });

  it("exposes complete management actions for scheduled interviews", () => {
    renderManagement();

    expect(screen.getAllByText("Join").length).toBeGreaterThan(0);
    expect(screen.getAllByText("View notes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cancel").length).toBeGreaterThan(0);
  });
});
