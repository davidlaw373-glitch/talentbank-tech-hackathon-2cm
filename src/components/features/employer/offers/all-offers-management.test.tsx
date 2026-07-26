import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { AllOffersManagement } from "./all-offers-management";
import {
  OfferWorkflowProvider,
  useOfferWorkflow,
} from "./offer-workflow-provider";

function SharedOfferHarness() {
  const { rows, sendOffer } = useOfferWorkflow();
  const aishaOffer = rows.find((row) => row.candidate.name === "Aisha Khan");

  return (
    <button
      type="button"
      onClick={() => aishaOffer && sendOffer(aishaOffer.offer.id)}
    >
      Update shared Aisha
    </button>
  );
}

function renderManagement() {
  return render(
    <ToastProvider>
      <OfferWorkflowProvider>
        <SharedOfferHarness />
        <AllOffersManagement />
      </OfferWorkflowProvider>
    </ToastProvider>,
  );
}

describe("AllOffersManagement", () => {
  it("filters complete offers by candidate search", async () => {
    const user = userEvent.setup();
    renderManagement();

    await user.type(
      screen.getByRole("textbox", { name: "Search offers" }),
      "Aisha",
    );

    expect(
      screen.getByRole("heading", { name: "Aisha Khan" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Tomoko Yamamoto" }),
    ).toBeNull();
    expect(screen.getByText("1 offer")).toBeTruthy();
  });

  it("exposes complete pending-offer actions", () => {
    renderManagement();

    expect(
      screen.getAllByRole("button", { name: /Withdraw offer/ }).length,
    ).toBe(2);
    expect(
      screen.getAllByRole("button", { name: /Open offer details/ }).length,
    ).toBe(5);
  });

  it("removes a withdrawn pending offer from the complete history", async () => {
    const user = userEvent.setup();
    renderManagement();

    await user.click(
      screen.getByRole("button", {
        name: "Withdraw offer for Aisha Khan",
      }),
    );

    expect(
      screen.queryByRole("heading", { name: "Aisha Khan" }),
    ).toBeNull();
    expect(screen.getByText("4 offers")).toBeTruthy();
  });

  it("renders updates from the shared offers workflow", async () => {
    const user = userEvent.setup();
    renderManagement();

    await user.click(
      screen.getByRole("button", { name: "Update shared Aisha" }),
    );

    expect(
      screen.queryByRole("button", { name: "Send offer to Aisha Khan" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Remind Aisha Khan about offer",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Sent: Just now")).toBeTruthy();
  });
});
